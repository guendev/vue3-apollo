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
| `useMutationsLoading` | Owner-scoped mutation activity | `useMutationsLoading(id?) => ComputedRef<boolean>` |
| `useQueriesLoading` | Owner-scoped query activity | `useQueriesLoading(id?) => ComputedRef<boolean>` |
| `useSubscriptionsLoading` | Owner-scoped subscription activity | `useSubscriptionsLoading(id?) => ComputedRef<boolean>` |

## Types
- Operation type: `'queries' | 'mutations' | 'subscriptions'`
- Owner id: `number | string`

## Backward compatibility
- `useApolloTracker` remains as a deprecated alias of `useApolloTrackingStore`.

## Notes
- `useApolloTracking` is a no-op on the server.
- `useApolloTracking` requires an active Vue scope to auto-clean counters on dispose.
- Owner-scoped helpers without a component instance and without explicit `id` resolve to `false`.

## Examples

```ts
import { computed } from 'vue'
import { useApolloTrackingStore } from '@vue3-apollo/core'

const { activeGlobal } = useApolloTrackingStore()

const isAnyQueryLoading = computed(() => (activeGlobal.value.queries ?? 0) > 0)
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
