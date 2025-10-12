# useMutation

Composable for executing GraphQL **mutations**.

## Quick start

```ts
import { useMutation } from 'vue3-apollo'
import { CREATE_USER } from './gql'

const {
  mutate,
  loading,
  error,
  data,
  onDone,
} = useMutation(
  CREATE_USER,
)

async function submit() {
  await mutate({
    name: 'John',
    email: 'john@example.com',
  })
}

onDone((payload) => {
  console.log('Created:', payload)
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
} = useMutation(document, options?)
```

### Returns
- **`mutate(variables?, mutateOptions?)`** → `Promise<Result | void>` – execute the mutation. Per‑call options override base options.
  ```ts
  await mutate(
    { id: '1', name: 'Jane' },
    {
      refetchQueries: ['GetUserList'],
      optimisticResponse: {
        updateUser: { id: '1', name: 'Jane', __typename: 'User' },
      },
    }
  )
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
- **`clientId`** (from `UseBaseOption`) – target a specific Apollo client if you registered multiple.