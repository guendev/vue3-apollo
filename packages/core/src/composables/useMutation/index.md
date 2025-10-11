# useMutation

A reactive GraphQL **mutation** composable for **Vue 3** + **Apollo Client**. 

## Quick start

```ts
import { useMutation } from 'vue3-apollo'
import { CREATE_USER_MUTATION } from './gql'

const { mutate, loading, error, data, onDone } = useMutation(CREATE_USER_MUTATION)

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

## How it works
- **Single call API:** `mutate(variables?, options?)` delegates to `client.mutate` under the hood.
- **Reactive state:** `loading` is `true` while in-flight; `data` and `error` update after completion.
- **Events:** `onDone` triggers only when actual data is returned; `onError` for network/GraphQL errors.
- **Tracking:** Integrates with an internal tracking hook to reflect mutation activity (useful for global spinners, etc.).

## API

### Returns
- **`mutate(variables?, mutateOptions?)`** → `Promise<Result | void>`
  - Executes the mutation. Per-call `mutateOptions` override base options.
- **`data`** – Reactive result data (undefined until success).
- **`loading`** – `true` while the mutation is running.
- **`error`** – GraphQL or network error if one occurred.
- **`called`** – `true` after `mutate()` has been called at least once.
- **`onDone(fn)`** – Subscribe to successful completions (fires only when `data` is defined).
- **`onError(fn)`** – Subscribe to mutation errors.
- **`reset()`** – Clear `data`, `error`, `loading`, and `called` back to initial state.

## Options
Pass options as the second argument to `useMutation`.

- **`throws`**: `'always' | 'auto' | 'never'` (default: `'auto'`)
  - Controls whether the composable throws on errors.
  - `'always'`: throw on error (use with `try/catch`).
  - `'never'`: never throw; rely on reactive `error` and `onError`.
  - `'auto'`: Apollo default behavior.
- **Apollo options**: You can pass standard `mutate` options (e.g. `refetchQueries`, `awaitRefetchQueries`, `optimisticResponse`, `update`, `context`), except `mutation` and `variables` which are provided by the composable.
- **Base option**: `clientId` to target a specific Apollo client instance if you have more than one.