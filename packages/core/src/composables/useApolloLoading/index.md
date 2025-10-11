# useApolloLoading

Global loading tracker for Apollo operations (queries, mutations, subscriptions) with **per-owner** and **global** counters.

`useApolloLoading` is built with `@vueuse/core`'s `createGlobalState`, so the state is shared across your app while still being tree‑shakable.

## When to use
- Show a **global progress bar/spinner** while *any* GraphQL request is in flight.
- Drive **per-component/per-feature** loading indicators (e.g., disable a section while its queries run).
- Build dashboards that display how many operations are currently active.

## Quick start

```ts
import { useApolloLoading } from 'vue3-apollo'

const { activeGlobal, track } = useApolloLoading()

// Start tracking a query owned by component uid=42
track({
  id: 42,
  state: true,
  type: 'query',
})

// ...later when it finishes
track({
  id: 42,
  state: false,
  type: 'query',
})
```

## API

`const { activeByOwner, activeGlobal, track } = useApolloLoading()`

### `activeGlobal`
Shallow ref of counters across the whole app.

```ts
activeGlobal.value
// {
//   all?: number,
//   query?: number,
//   mutation?: number,
//   subscription?: number,
// }
```

### `activeByOwner`
Shallow ref map of **owner id → counters**. Owners are whatever id you choose (component uid, feature key, etc.).

```ts
activeByOwner.value
// {
//   [ownerId: number | string]: {
//     all?: number,
//     query?: number,
//     mutation?: number,
//     subscription?: number,
//   },
// }
```

### `track({ id, state, type })`
Increment/decrement counters for an owner and globally.

- `id`: unique owner identifier.
- `state`: `true` to start ( +1 ), `false` to finish ( −1 ).
- `type`: `'query' | 'mutation' | 'subscription'`.

Counters never go below 0, and empty owners are removed automatically.

## Types

```ts
export type ApolloLoadingId = number | string
export type ApolloOperationType = 'all' | 'mutation' | 'query' | 'subscription'
```

## Examples

### Global spinner with any in‑flight operation
```ts
import { computed } from 'vue'
import { useApolloLoading } from 'vue3-apollo'

const { activeGlobal } = useApolloLoading()

const isBusy = computed(() => (activeGlobal.value.all ?? 0) > 0)
```
```vue
<template>
  <GlobalSpinner v-if="isBusy" />
  <router-view />
</template>
```

### Owner‑scoped loading state (component or feature)
```ts
import { getCurrentInstance, computed } from 'vue'
import { useApolloLoading } from 'vue3-apollo'

const { proxy } = getCurrentInstance()!
const ownerId = proxy?.uid ?? 'feature:orders'

const { activeByOwner } = useApolloLoading()

const isOwnerBusy = computed(() => (activeByOwner.value[ownerId]?.all ?? 0) > 0)
```

### Integrating inside a composable
If you build custom composables for network calls, call `track()` when requests start/end.

```ts
import { useApolloLoading } from 'vue3-apollo'

const { track } = useApolloLoading()

async function loadUser(uid: number) {
  track({ id: uid, state: true, type: 'query' })
  try {
    // ...perform query via Apollo
  } finally {
    track({ id: uid, state: false, type: 'query' })
  }
}
```

## Notes
- Uses shallow refs and spreads to trigger reactivity after counter updates.
- Subscriptions/owners are cleaned up when their `all` counter drops to 0.
- Pair nicely with `useApolloTracking` if you already use the provided query/mutation/subscription composables.