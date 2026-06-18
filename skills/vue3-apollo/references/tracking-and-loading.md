# Tracking and Loading

## When to use

Use tracking helpers when UI needs loading visibility across GraphQL operations:

1. Show global loading indicator for queries/mutations/subscriptions.
2. Lock one feature section while its own operations are running.
3. Debug which owner/component is currently in-flight.

## Available hooks

1. `useApolloTrackingStore()`:
- global store with `activeGlobal`, `activeByOwner`, and `track()`.
2. `useApolloTracking({ id?, state, type })`:
- auto-track a `Ref<boolean>` into store counters.
3. `useGlobalLoading()`:
- app-wide `ComputedRef<{ any, queries, mutations, subscriptions }>` across all owners.
4. `useQueriesLoading(id?)`
5. `useMutationsLoading(id?)`
6. `useSubscriptionsLoading(id?)`
7. Deprecated alias: `useApolloTracker` -> same as `useApolloTrackingStore`.

## Core model

1. Counters are tracked by operation type: `queries`, `mutations`, `subscriptions`.
2. Tracking works at two levels:
- global (`activeGlobal`)
- owner-scoped (`activeByOwner[id]`)
3. Store clamps counters at `0` to avoid negative values.
4. `useApolloTracking` only runs on client and inside active scope.
5. `useQuery({ loadingKey })` uses `loadingKey` as owner id for query counters.
6. Owner ids are namespaced internally: an explicit `id`/`loadingKey` and a component `uid` live in separate buckets, so a numeric `loadingKey` can never collide with a component whose `uid` matches. `useQuery({ loadingKey })` and `useXxxLoading(loadingKey)` still resolve to the same bucket.
7. Owner buckets are pruned once their counters reach `0`, so `activeByOwner` stays bounded across mount/unmount cycles (no leftover empty entries).
8. `loading` from `useQuery`/`useMutation` counts in-flight calls, so overlapping `mutate()`/`refetch()`/`fetchMore()` stay `true` until the last one settles.

## Quick setup

Prefer `useGlobalLoading()` for app-wide indicators:

```ts
import { computed } from 'vue'
import { useGlobalLoading } from '@vue3-apollo/core'

const loading = useGlobalLoading()

const isAnythingLoading = computed(() => loading.value.any)
// Per-type: loading.value.queries / .mutations / .subscriptions
```

Reading raw counters from the store stays available for advanced cases:

```ts
import { computed } from 'vue'
import { useApolloTrackingStore } from '@vue3-apollo/core'

const { activeGlobal } = useApolloTrackingStore()

const isAnythingLoading = computed(() => {
  return (activeGlobal.value.queries ?? 0) > 0
    || (activeGlobal.value.mutations ?? 0) > 0
    || (activeGlobal.value.subscriptions ?? 0) > 0
})
```

## Auto-track a loading ref

```ts
import { ref } from 'vue'
import { useApolloTracking } from '@vue3-apollo/core'

const saving = ref(false)

useApolloTracking({
  id: 'save-item',
  state: saving,
  type: 'mutations',
})

const submit = async () => {
  try {
    saving.value = true
    await doMutation()
  } finally {
    saving.value = false
  }
}
```

## Owner-scoped loading helpers

Without `id`, helpers use current component uid:

```ts
const isQueryLoading = useQueriesLoading()
const isMutationLoading = useMutationsLoading()
const isSubscriptionLoading = useSubscriptionsLoading()
```

With explicit shared id:

```ts
const ownerId = 'dashboard'
const isDashboardBusy = useQueriesLoading(ownerId)
```

With `useQuery` integration:

```ts
const ownerId = 'checkout'

useQuery(GET_CHECKOUT_SUMMARY, undefined, { loadingKey: ownerId })
useQuery(GET_CHECKOUT_DISCOUNTS, undefined, { loadingKey: ownerId })

const isCheckoutBusy = useQueriesLoading(ownerId)
```

## Case examples

### Case 1: Happy path (global page overlay)

Goal: show one loading overlay for all operations.

```ts
const loading = useGlobalLoading()

const showOverlay = computed(() => loading.value.any)
```

### Case 2: Edge case (shared owner id across components)

Goal: track one feature area split across multiple child components.

```ts
const ownerId = 'checkout'

const isCheckoutQueryLoading = useQueriesLoading(ownerId)
const isCheckoutMutationLoading = useMutationsLoading(ownerId)
```

Guideline:

1. Keep owner ids stable and deterministic.
2. Reuse same id only when you intentionally want merged loading state.

### Case 3: Edge case (outside component scope)

Behavior:

1. Owner-scoped helpers without explicit `id` return `false` when no component instance exists.
2. `useApolloTracking` outside active scope does nothing.

Action:

1. Provide explicit id to owner-scoped helpers when used outside component context.
2. Prefer tracking inside composables called from component setup.

### Case 4: Failure case (counter drift)

Symptom: loading appears stuck.

Common causes:

1. `state` toggles to `true` but never returns to `false`.
2. Multiple manual toggles are unbalanced in async flows.

Recovery:

1. Wrap operation in `try/finally` and always set `state.value = false`.
2. Use one source of truth ref per tracked operation.

## Verification checklist

1. Global counters increase/decrease as expected per operation type.
2. Owner-scoped helpers reflect correct owner id.
3. Component unmount clears in-flight state via scope dispose.
4. SSR path does not attempt client tracking logic.
5. Deprecated alias usage is either removed or clearly intentional.

## Pitfalls

1. Tracking with unstable random ids when stable grouping is needed.
2. Using owner-scoped helpers outside component scope without explicit `id`.
3. Forgetting `finally` and leaving tracked ref in `true`.
4. Assuming tracking runs on server.
5. Mixing multiple refs for the same logical operation and double-counting.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/composables-use-query.md`
3. `references/composables-use-mutation.md`
4. `references/composables-use-subscription.md`
5. `references/troubleshooting.md`
6. `references/testing-checklist.md`
