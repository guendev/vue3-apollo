# Composable: useLazyQuery

## When to use

Use `useLazyQuery` when a query must be user-triggered instead of auto-running on mount:

1. Query should run on click/submit/open action.
2. You need `execute()` to return `Promise<TData>`.
3. You still want reactive `result/loading/error` like `useQuery`.

## Signature

```ts
useLazyQuery(document, variables?, options?)
```

```ts
import { useLazyQuery } from '@vue3-apollo/core'
```

Notes:

1. `options` is based on `useQuery` options, but `enabled` is intentionally omitted.
2. Cache behavior still comes from Apollo options like `fetchPolicy`, `nextFetchPolicy`, and `errorPolicy`.

## Returns

1. All `useQuery` return fields (`result`, `loading`, `error`, `networkStatus`, `refetch`, `fetchMore`, `query`, `start`, `stop`, `onResult`, `onError`).
2. `called: Ref<boolean>` (`false` until first `execute()`).
3. `execute(variables?) => Promise<TData>`.

## Execution flow

Current library flow:

1. `called` becomes `true`.
2. If `execute(variables)` receives variables, they are stored as active execution variables.
3. Internal `enabled` is switched on and watcher is started if needed.
4. `query.reobserve({ variables })` is used to run/re-run and collect current result.
5. With `errorPolicy: 'none'`, GraphQL/network error rejects.
6. If no data is returned, `execute()` rejects.
7. Otherwise it resolves `TData`.

Behavior detail:

1. If `execute()` is called later without variables, it reuses latest active variables.
2. Apollo handles query deduplication for overlapping same-query requests.

## Basic usage

```ts
const vars = ref({ userId: 1, first: 5 })

const { called, execute, loading, result, error } = useLazyQuery(GET_POSTS, vars, {
  fetchPolicy: 'cache-first',
  keepPreviousResult: true,
})

const load = async () => {
  const data = await execute()
  console.log(data.posts)
}
```

## Case examples

### Case 1: Happy path (button-triggered load)

```ts
const { execute, result, loading } = useLazyQuery(GET_USERS)

const onClick = async () => {
  await execute()
}
```

### Case 2: Edge case (execute with per-call variables)

```ts
const { execute } = useLazyQuery(GET_POSTS, () => ({ first: 5 }))

await execute({ userId: 2, first: 10 })
```

### Case 3: Edge case (cache-first manual query)

```ts
const { execute } = useLazyQuery(GET_PROFILE, undefined, {
  fetchPolicy: 'cache-first',
})

// May resolve from cache before network, based on Apollo policy.
await execute()
```

## Verification checklist

1. Query does not run before first `execute()`.
2. `called` flips to `true` on first execute.
3. `execute()` resolves typed data when successful.
4. `execute()` rejects on error paths.
5. `result/loading/error` remain reactive after execute.
6. Cache policy behavior (`cache-first`, `network-only`, etc.) matches expectation.

## Pitfalls

1. Expecting `useLazyQuery` to accept user-controlled `enabled` option (it does not).
2. Expecting `execute()` to bypass cache regardless of `fetchPolicy`.
3. Forgetting to handle rejected `execute()` promise.
4. Assuming variables reset automatically after `execute(variables)` call.

## Cross-reference

1. `references/composables-use-query.md`
2. `references/composables-use-apollo-client.md`
3. `references/caching.md`
4. `references/testing-checklist.md`
