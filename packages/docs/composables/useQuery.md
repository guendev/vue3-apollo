# useQuery

`useQuery` runs a reactive GraphQL query using Apollo `watchQuery` and Vue reactivity.

## Quick start

```ts
import { gql } from 'graphql-tag'
import { ref } from 'vue'
import { useQuery } from '@vue3-apollo/core'

const GET_USERS = gql`
  query GetUsers($first: Int) {
    users(first: $first) {
      id
      name
      email
    }
  }
`

const first = ref(5)

const { result, loading, error, networkStatus, refetch } = useQuery(
  GET_USERS,
  () => ({ first: first.value }),
  {
    keepPreviousResult: true
  }
)
```

## Signature

```ts
function useQuery<TData, TVariables>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables> | Ref | Getter,
  variables?: TVariables | Ref | Getter,
  options?: UseQueryOptions<TData, TVariables>
)
```

## Parameters
- `document`: Query document (or reactive ref/getter).
- `variables?`: Query variables (or reactive ref/getter).
- `options?`: Query options.

## Returns
- `result`: Reactive query data.
- `loading`: Query loading state.
- `error`: Last query error.
- `networkStatus`: Apollo `NetworkStatus` value.
- `onResult((data, context) => void)`: Fired when data is available.
- `onError((error, context) => void)`: Fired on query errors.
- `refetch(variables?)`: Manually refetch query.
- `fetchMore({ variables, updateQuery })`: Pagination/incremental fetch.
- `query`: Apollo `ObservableQuery` ref for advanced cases (`undefined` before observer starts).
- `start()`: Start query observer.
- `stop()`: Stop query observer.

## Options
- `enabled?: boolean | Ref | Getter` (default: `true`)
- `debounce?: number`
- `throttle?: number`
- `keepPreviousResult?: boolean`
- `prefetch?: boolean` (default: `true`)
- `loadingKey?: string | number` (custom key for grouped loading tracking)
- All Apollo watch options except `query` and `variables`
- `clientId?: string`

## Notes
- On server, data is prefetched via `onServerPrefetch` when `prefetch` is enabled.
- If both `debounce` and `throttle` are set, `debounce` takes priority.
- When `enabled` is `false`, `start`, `refetch`, and `fetchMore` are effectively blocked.
- `query.value` is for advanced control (for example `reobserve`/`setVariables`) after the query is started.

## Examples

### Case 1: Reactive search with debounce

```ts
const search = ref('')

const { result, loading } = useQuery(
  SEARCH_USERS,
  () => ({ q: search.value }),
  {
    debounce: 300,
    keepPreviousResult: true
  }
)
```

### Case 2: Manual enable flow

```ts
const enabled = ref(false)
const filters = ref({ status: 'open' })

const { result, refetch } = useQuery(GET_TICKETS, filters, { enabled })

enabled.value = true
await refetch()
```

### Case 3: Pagination with fetchMore

```ts
const { result, fetchMore } = useQuery(
  LIST_POSTS,
  () => ({ offset: 0, limit: 10 }),
  { keepPreviousResult: true }
)

await fetchMore({
  variables: { offset: result.value?.posts.length ?? 0, limit: 10 },
  updateQuery: (previous, { fetchMoreResult }) => {
    if (!fetchMoreResult) {
      return previous
    }

    return {
      ...previous,
      posts: [...previous.posts, ...fetchMoreResult.posts]
    }
  }
})
```

### Case 4: Shared loading key across components

```ts
import { useQueriesLoading, useQuery } from '@vue3-apollo/core'

const loadingKey = 'users-shared'

// Component A
useQuery(GET_USERS, undefined, { loadingKey })

// Component B
useQuery(GET_USER_STATS, undefined, { loadingKey })
const isAnyLoading = useQueriesLoading(loadingKey)
```

Use this when one place in UI (for example spinner in component B) should react to loading states triggered by multiple query owners (A and B).

## Related
- [`useLazyQuery`](/composables/useLazyQuery)
- [`useMutation`](/composables/useMutation)
- [`useSubscription`](/composables/useSubscription)
