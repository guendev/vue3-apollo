# useLazyQuery

`useLazyQuery` is the manual-query variant of `useQuery`.
It does not run on setup, and only executes when you call `execute()`.

## Quick start

```ts
import { gql } from 'graphql-tag'
import { reactive } from 'vue'
import { useLazyQuery } from '@vue3-apollo/core'

const GET_POSTS = gql`
  query GetPosts($userId: Int, $first: Int) {
    posts(userId: $userId, first: $first) {
      id
      title
    }
  }
`

const variables = reactive({
  userId: 1,
  first: 5
})

const { called, execute, loading, result, error } = useLazyQuery(GET_POSTS, variables, {
  fetchPolicy: 'cache-first',
  keepPreviousResult: true
})

const run = async () => {
  const data = await execute()
  console.log('execute() data:', data.posts)
}
```

## Signature

```ts
function useLazyQuery<TData, TVariables>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables> | Ref | Getter,
  variables?: TVariables | Ref | Getter,
  options?: Omit<UseQueryOptions<TData, TVariables>, 'enabled'>
)
```

## Parameters
- `document`: Query document (or reactive ref/getter).
- `variables?`: Default query variables (or reactive ref/getter).
- `options?`: Same options as `useQuery` except `enabled`.

## Returns
- All `useQuery` returns: `result`, `loading`, `error`, `networkStatus`, `refetch`, `fetchMore`, `query`, `start`, `stop`, `onResult`, `onError`.
- `called`: `true` after first `execute()`.
- `execute(variables?) => Promise<TData>`: Runs/re-runs the query and resolves with data.

## Behavior notes
- `execute()` sets `called = true` and starts the underlying observer if needed.
- Per-call variables passed to `execute(variables)` override default variables for that run.
- Cache behavior follows Apollo options (`fetchPolicy`, `nextFetchPolicy`, `errorPolicy`, ...).
- With `errorPolicy: 'none'` (default), `execute()` rejects when Apollo returns an error.

## Examples

### Case 1: Button-triggered fetch

```ts
const { execute, loading, result } = useLazyQuery(GET_USERS)

const loadUsers = async () => {
  await execute()
}
```

### Case 2: Execute with per-call variables

```ts
const { execute } = useLazyQuery(GET_POSTS, () => ({ first: 5 }))

await execute({ userId: 2, first: 10 })
```

### Case 3: Keep cached data while rerunning

```ts
const { execute, result } = useLazyQuery(GET_PROFILE, undefined, {
  fetchPolicy: 'cache-first',
  keepPreviousResult: true
})

await execute()
```

## Related
- [`useQuery`](/composables/useQuery)
- [`useApolloClient`](/composables/useApolloClient)
