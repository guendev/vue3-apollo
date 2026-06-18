# Activity Tracking

Tracking helpers expose reactive loading counters across queries, mutations, and subscriptions.

## When to use
- Global loading indicators.
- Owner-scoped loading guards.
- Diagnostics for operation activity by component/composable id.

## Quick start

```ts
import { ref } from 'vue'
import { useApolloTracking } from '@vue3-apollo/core'

const loading = ref(false)

useApolloTracking({
  state: loading,
  type: 'queries'
})
```

```ts
import { useQueriesLoading } from '@vue3-apollo/core'

const isBusy = useQueriesLoading()
```

## API

| Hook | Purpose | Signature |
|---|---|---|
| `useApolloTrackingStore` | Global counters + per-owner map + manual `track` | `const { activeGlobal, activeByOwner, track } = useApolloTrackingStore()` |
| `useApolloTracking` | Forward a `Ref<boolean>` into tracker counters | `useApolloTracking({ id?, state, type })` |
| `useGlobalLoading` | App-wide activity across all owners | `useGlobalLoading() => ComputedRef<GlobalLoadingState>` |
| `useMutationsLoading` | Owner-scoped mutation activity | `useMutationsLoading(id?) => ComputedRef<boolean>` |
| `useQueriesLoading` | Owner-scoped query activity | `useQueriesLoading(id?) => ComputedRef<boolean>` |
| `useSubscriptionsLoading` | Owner-scoped subscription activity | `useSubscriptionsLoading(id?) => ComputedRef<boolean>` |

## Types
- Operation type: `'queries' | 'mutations' | 'subscriptions'`
- Owner id: `number | string`

## Backward compatibility
- `useApolloTracker` remains as a deprecated alias of `useApolloTrackingStore`.

## Notes
- `useApolloTracking` is a no-op on the server. The store is a process-wide singleton (`createGlobalState`), so tracking during SSR would leak loading state across concurrent requests.
- `useApolloTracking` requires an active Vue scope to auto-clean counters on dispose. Owner buckets are pruned once their counters reach zero, so the per-owner map stays bounded across mount/unmount cycles.
- Owner-scoped helpers without a component instance and without explicit `id` resolve to `false`.
- Owner ids are namespaced internally: an explicit `id`/`loadingKey` is bucketed separately from component uids, so a numeric `loadingKey` can never collide with a component whose `uid` happens to match. `useQuery({ loadingKey })` and `useQueriesLoading(loadingKey)` always resolve to the same bucket.

## Examples

```ts
import { computed } from 'vue'
import { useGlobalLoading } from '@vue3-apollo/core'

const loading = useGlobalLoading()

// App-wide spinner while anything is in flight
const isBusy = computed(() => loading.value.any)
// Or only while queries are loading
const isAnyQueryLoading = computed(() => loading.value.queries)
```

```ts
import { ref } from 'vue'
import { useApolloTracking } from '@vue3-apollo/core'

export function useSaveItem() {
  const saving = ref(false)

  useApolloTracking({
    id: 'save-item',
    state: saving,
    type: 'mutations'
  })

  return { saving }
}
```

```ts
import { useQueriesLoading, useQuery } from '@vue3-apollo/core'

const loadingKey = 'users-shared'

// Component A
useQuery(GET_USERS, undefined, { loadingKey })

// Component B
useQuery(GET_USER_STATS, undefined, { loadingKey })
const isAnyLoading = useQueriesLoading(loadingKey)
```

`useQuery({ loadingKey })` maps to the same owner id bucket used by tracking helpers.
