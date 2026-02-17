# Composable: useQuery

## When to use

Use `useQuery` when data must stay reactive with Vue state changes:

1. Variables come from `ref`, `computed`, or getter.
2. UI needs `loading`, `error`, and live `result` updates.
3. Query lifecycle should follow component lifecycle (auto cleanup in component scope).

## Signature

```ts
useQuery(document, variables?, options?)
```

```ts
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'
```

`document` accepts `DocumentNode` or `TypedDocumentNode` (and reactive getter/ref).
`variables` accepts plain object, ref, or getter.

## Returns

1. `result`
2. `loading`
3. `error`
4. `networkStatus`
5. `refetch(variables?)`
6. `fetchMore({ variables, updateQuery })`
7. `start()`
8. `stop()`
9. `onResult((data, context) => {})`
10. `onError((error, context) => {})`

Return behavior note:

1. `refetch()` and `fetchMore()` may return `undefined` when query is disabled or not started.
2. Treat manual operations as conditional calls, not always-guaranteed network requests.

## Key options

1. `enabled`: default `true`; when `false`, query is blocked and `start/refetch/fetchMore` become no-op.
2. `debounce`: delay variable-triggered updates.
3. `throttle`: limit variable-triggered update frequency.
4. `keepPreviousResult`: keep stale value while new variables are loading.
5. `prefetch`: default `true`; runs SSR prefetch via `onServerPrefetch`.
6. `clientId`: use a named Apollo client.
7. `loadingKey`: custom loading group key (`string | number`) for tracking across multiple query owners.
8. Standard Apollo watchQuery options are supported (except `query` and `variables`).

Important behavior:

1. If both `debounce` and `throttle` are set, `debounce` wins.
2. `notifyOnNetworkStatusChange` defaults to `keepPreviousResult` when not provided.

## SSR behavior

1. On server with `prefetch: true`, `useQuery` performs `client.query(...)` in `onServerPrefetch`.
2. On client boot, it tries `client.readQuery(...)` before starting watcher to reuse SSR cache.
3. In Nuxt page-level data flow, prefer `useAsyncQuery` for `AsyncData` contract.

## Lifecycle and scope

1. In normal component scope, `useQuery` auto-cleans on scope dispose.
2. Outside component scope, auto-cleanup is not guaranteed and a warning is emitted.
3. In out-of-scope usage, manage `start()`/`stop()` explicitly.

## Basic usage

```ts
import { ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue3-apollo/core'

const GET_USERS = gql`
  query GetUsers($first: Int!) {
    users(first: $first) {
      id
      name
    }
  }
`

const first = ref(10)

const { result, loading, error } = useQuery(
  GET_USERS,
  () => ({ first: first.value }),
  {
    keepPreviousResult: true,
  }
)
```

## Case examples

### Case 1: Happy path (reactive filter query)

Goal: user changes filters and query updates automatically.

```ts
const search = ref('')

const { result, loading } = useQuery(
  SEARCH_USERS,
  () => ({ q: search.value }),
  {
    debounce: 300,
    keepPreviousResult: true,
  }
)
```

### Case 2: Edge case (manual enable flow)

Goal: query should not run until user clicks "Apply".

```ts
import { ref } from 'vue'

const enabled = ref(false)
const filters = ref({ status: 'open' })

const { result } = useQuery(GET_TICKETS, filters, { enabled })

// Later:
enabled.value = true
```

Note:

1. While `enabled` is `false`, `start()`, `refetch()`, and `fetchMore()` are ignored.
2. Toggle `enabled` to `true` before calling manual operations.

### Case 3: Edge case (networkStatus and refetch UX)

Goal: show different UI for initial load vs refetch.

```ts
import { computed } from 'vue'
import { NetworkStatus } from '@apollo/client/core'

const { result, loading, networkStatus, refetch } = useQuery(GET_FEED, undefined, {
  notifyOnNetworkStatusChange: true,
})

const refresh = async () => {
  await refetch()
}

const isRefetching = computed(() => networkStatus.value === NetworkStatus.refetch)
```

### Case 4: Edge case (fetch policy strategy)

Goal: load from network once, then read from cache.

```ts
const { result } = useQuery(GET_PROFILE, undefined, {
  fetchPolicy: 'network-only',
  nextFetchPolicy: 'cache-first',
})
```

### Case 5: Failure case (registry/client issue)

Symptom:

1. Error says Apollo clients registry is not found.
2. Error says named client is not found.

Recovery:

1. Verify plugin/module setup is completed before using composables.
2. Verify `clientId` matches registered key.
3. Fallback to default client first to isolate client routing issues.

### Case 6: Shared loading group (A/B components)

Goal: spinner in component B should react when either A or B is loading.

```ts
import { useQueriesLoading, useQuery } from '@vue3-apollo/core'

const loadingKey = 'shared-users'

// Component A
useQuery(GET_USERS, undefined, { loadingKey })

// Component B
useQuery(GET_USER_STATS, undefined, { loadingKey })
const isAnyLoading = useQueriesLoading(loadingKey)
```

Note:

1. Same `loadingKey` means both queries contribute to the same tracking bucket.
2. Use unique keys when you want isolated loading indicators.

## Verification checklist

1. Query runs and updates when variables change.
2. `loading` toggles correctly during initial and subsequent requests.
3. `error` path is handled in UI.
4. `onResult` and `onError` hooks fire as expected.
5. `enabled` gate and manual flow are tested.
6. `refetch/fetchMore` no-op behavior is handled in guarded flows.
7. If polling is used, `pollInterval` behavior is observed and documented.
8. If Nuxt SSR page flow is needed, decision against `useAsyncQuery` is explicit.
9. If grouped loading is used, verify all intended queries share the same `loadingKey`.

## Pitfalls

1. Assuming `enabled: false` still allows `refetch()` to force execution.
2. Setting both `debounce` and `throttle` and expecting both to apply.
3. Expecting `useQuery({ prefetch: true })` to replace Nuxt `useAsyncData` semantics.
4. Forgetting `keepPreviousResult` then seeing UI flicker on variable changes.
5. Using wrong `clientId` in multi-client setups.
6. Running outside component scope and forgetting manual cleanup concerns.
7. Treating `refetch()` as guaranteed even when query is disabled.
8. Reusing one `loadingKey` accidentally across unrelated screens and coupling loading UX unintentionally.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/setup-core-vue3.md`
3. `references/setup-nuxt4.md`
4. `references/composables-use-apollo-client.md`
5. `references/tracking-and-loading.md`
6. `references/nuxt-custom-integration.md`
7. `references/testing-checklist.md`
