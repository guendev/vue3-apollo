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
