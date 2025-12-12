# useMutation

Composable for executing GraphQL **mutations**.

## Quick start

```ts
import { useMutation } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const CREATE_POST = gql`
  mutation CreatePost($post: CreatePostInput!) {
    createPost(post: $post) { 
      id 
      title 
      body
    }
  }
`

const {
  data,
  error,
  loading,
  mutate,
  onDone,
  onOptimistic,
} = useMutation(CREATE_POST)

async function submit() {
  await mutate({
    post: { 
        title: 'Hello',
        body: 'World',
        userId: 1 
    }
  })
}

onDone((payload) => {
  console.log('Created post:', payload)
})

onOptimistic((payload) => {
  console.log('Optimistic create:', payload)
})
```

## API

```ts
const {
  mutate,
  data,
  loading,
  error,
  called,
  onDone,
  onError,
  onOptimistic,
  reset,
} = useMutation(document, options)
```

### Returns
- **`mutate(variables?, mutateOptions?)`** → `Promise<Result | void>` – execute the mutation. Per‑call options override base options.
  ```ts
  await mutate({ 
      post: { 
        title: 'New title',
        body: '...',
        userId: 1
      }
    })
  ```
- **`data`** – reactive result data (undefined until success).
- **`loading`** – `true` while the mutation is running.
- **`error`** – GraphQL or network error if one occurred.
- **`called`** – `true` after `mutate()` has been called at least once.
- **`onDone((data, context) => {})`** – Fires when the mutation completes successfully. The `context` provides access to the Apollo client.
  ```ts
  onDone((data, context) => {
      toast.success('User created!')
      router.push(`/users/${data.createUser.id}`)
      context.client.cache.evict({ fieldName: 'users' })
  })
  ```

- **`onError((error, context) => {})`** – Fires when the mutation encounters an error (network or GraphQL). The `context` contains the active Apollo client.
  ```ts
  onError((error, context) => {
      toast.error(error.message)
      console.error('Mutation failed:', error)
      context.client.clearStore()
  })
  ```
- **`onOptimistic((optimisticData, context) => {})`** – Fires when an `optimisticResponse` is provided for the mutation (either via base `options` or per‑call `mutateOptions`). Use this to react immediately to optimistic UI updates before the real network response arrives. The `context` contains the active Apollo client.
  ```ts
  const { mutate, onOptimistic } = useMutation(CREATE_POST, {
    optimisticResponse: (vars) => ({
      createPost: {
        __typename: 'Post',
        id: -1,
        ...vars
      }
    })
  })

  onOptimistic((optimisticData, context) => {
    // Example: mark a list item as "pending" using a temporary id
    console.log('Optimistic:', optimisticData)
    // You may also access the client if you need manual cache tweaks
    // context.client.cache.modify(...)
  })
  ```
- **`reset()`** – clear `data`, `error`, `loading`, and `called` back to initial state.

## Options
Pass as the second argument to `useMutation`.

- **`throws`**: `'always' | 'auto' | 'never'` (default: `'auto'`)
  - `'always'`: throw on error (use `try/catch`).
  - `'never'`: never throw; rely on reactive `error` & `onError`.
  - `'auto'`: Apollo default behavior.
- **Apollo mutate options** (except `mutation` & `variables`, which are provided): `refetchQueries`, `awaitRefetchQueries`, `optimisticResponse`, `update`, `context`, etc.
  - When `optimisticResponse` is provided, the `onOptimistic` hook will fire with the optimistic data.
 - **`clientId`** (from `UseBaseOption`) – target a specific Apollo client if you registered multiple.

## Why both `onOptimistic` and `onDone`?

- `onOptimistic` runs as soon as an `optimisticResponse` is applied. Use it to:
  - provide instant feedback (e.g., add a temporary item, disable buttons)
  - annotate UI as pending (temporary ids, spinners)
  - optionally tweak cache immediately if needed
- `onDone` runs after the real network response succeeds. Use it to:
  - finalize UI with authoritative data from the server
  - perform navigation, toasts, or follow‑up actions that should only happen on actual success
  - reconcile or replace any optimistic placeholders (e.g., swap temp id with real id)

These two hooks let you clearly separate the optimistic phase from the confirmed success phase, leading to predictable UI flows.
