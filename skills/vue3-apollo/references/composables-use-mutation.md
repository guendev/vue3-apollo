# Composable: useMutation

## When to use

Use `useMutation` when an operation is user-triggered and writes data:

1. Form submit or button action should execute GraphQL mutation.
2. UI needs reactive mutation state (`loading`, `error`, `data`, `called`).
3. You want success/error side effects via `onDone` and `onError`.

## Signature

```ts
useMutation(document, options?)
```

```ts
import { useMutation } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'
```

`document` accepts `DocumentNode` or `TypedDocumentNode` (including reactive getter/ref).

## Returns

1. `mutate(variables?, mutateOptions?)`
2. `data`
3. `error`
4. `loading`
5. `called`
6. `onDone((data, context) => {})`
7. `onError((error, context) => {})`
8. `reset()`

Return behavior note:

1. `mutate()` sets `called = true` before execution.
2. `mutate()` returns Apollo mutation result on normal path.
3. `mutate()` may resolve `undefined` when error is caught and not re-thrown.

## Key options

1. `clientId`: route mutation to named Apollo client.
2. `throws`: `'always' | 'auto' | 'never'`.
3. Standard Apollo mutate options are supported (except `mutation` and `variables`, which are controlled by the composable and mutate call).
4. Per-call `mutateOptions` override base options for that call.

`throws` behavior in current implementation:

1. `throws: 'always'` re-throws only in the `catch` path.
2. If Apollo returns `result.error` without throwing, error is stored and `onError` fires, but no throw is forced by composable.

## Basic usage

```ts
import { gql } from 'graphql-tag'
import { useMutation } from '@vue3-apollo/core'

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
    }
  }
`

const { mutate, data, loading, error } = useMutation(CREATE_POST)

await mutate({
  input: {
    title: 'Hello',
  },
})
```

## Case examples

### Case 1: Happy path (form submit + onDone)

Goal: submit form, then navigate and update UI on success.

```ts
const { mutate, onDone } = useMutation(CREATE_USER)

onDone((payload, context) => {
  console.log('Created user id:', payload.createUser.id)
  context.client.cache.evict({ fieldName: 'users' })
})

await mutate({
  input: { name: 'Ada' },
})
```

### Case 2: Edge case (per-call overrides)

Goal: keep base mutation options but override per action.

```ts
const { mutate } = useMutation(UPDATE_PROFILE, {
  awaitRefetchQueries: true,
})

await mutate(
  { input: formValue.value },
  {
    refetchQueries: ['GetProfile'],
    optimisticResponse: {
      updateProfile: {
        __typename: 'User',
        id: userId.value,
        name: formValue.value.name,
      },
    },
  }
)
```

### Case 3: Edge case (strict throw flow)

Goal: force exception handling with `try/catch`.

```ts
const { mutate } = useMutation(DELETE_ITEM, {
  throws: 'always',
})

try {
  await mutate({ id: selectedId.value })
} catch (e) {
  console.error('Delete failed:', e)
}
```

### Case 4: Failure case (error handling and reset)

Goal: recover UI after mutation failure.

```ts
const { mutate, error, reset, onError } = useMutation(SAVE_SETTINGS)

onError((err) => {
  console.error(err.message)
})

await mutate({ input: invalidPayload.value })

if (error.value) {
  // clear stale failure state before next attempt
  reset()
}
```

## Cache update patterns

Use these patterns when mutation result alone is not enough to refresh UI:

1. `update` function for precise cache writes.
2. `cache.modify` for list/field edits.
3. `cache.evict` + `cache.gc` for entity removal.

```ts
const { mutate } = useMutation(DELETE_TODO, {
  update(cache, { data }) {
    if (!data?.deleteTodo?.id) return

    cache.evict({
      id: cache.identify({
        __typename: 'Todo',
        id: data.deleteTodo.id,
      }),
    })
    cache.gc()
  },
})
```

Optimistic note:

1. If using `optimisticResponse`, provide a structurally valid mutation response shape.
2. Ensure `__typename` and identity fields exist so cache normalization works.

## Refetch queries patterns

Use `refetchQueries` when cache update logic is expensive or risky:

```ts
const { mutate } = useMutation(CREATE_POST, {
  awaitRefetchQueries: true,
  refetchQueries: ['GetPosts'],
})
```

Tradeoff:

1. `update/cache.modify` is more efficient and immediate when safe.
2. `refetchQueries` is simpler but adds extra network round-trips.

## When to use useApolloClient().mutate

Use `useApolloClient().mutate` instead of `useMutation` when:

1. You only need a one-off promise result.
2. You do not need reactive mutation state (`loading/error/data/called`).
3. You do not need composable hooks (`onDone`, `onError`) or `reset`.

```ts
import { useApolloClient } from '@vue3-apollo/core'

const client = useApolloClient()

const { data } = await client.mutate({
  mutation: CREATE_POST,
  variables: {
    input: { title: 'Quick post' },
  },
})
```

## Verification checklist

1. `called` flips to `true` after first `mutate()`.
2. `loading` wraps full execution window and returns to `false`.
3. `onDone` fires only on successful path.
4. `onError` fires for both returned and thrown mutation errors.
5. Per-call options override base options for that call.
6. `reset()` clears `data`, `error`, `loading`, and `called`.
7. If `throws: 'always'` is used, caller has `try/catch` path.
8. Cache update or refetch strategy is explicit for write-heavy screens.

## Pitfalls

1. Assuming `throws: 'always'` guarantees throw for every `result.error` case.
2. Forgetting `await mutate(...)` and reading stale `data/error`.
3. Expecting `onDone` to fire when mutation fails.
4. Missing `reset()` in retry-heavy forms, causing stale UI error/data state.
5. Using wrong `clientId` in multi-client configuration.
6. Mixing both broad `refetchQueries` and heavy manual cache edits without clear reason.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/setup-core-vue3.md`
3. `references/setup-nuxt4.md`
4. `references/composables-use-query.md`
5. `references/composables-use-apollo-client.md`
6. `references/tracking-and-loading.md`
7. `references/troubleshooting.md`
8. `references/testing-checklist.md`
