

# useGlobalLoading

Composable that returns a **computed ref** indicating whether **any Apollo operation** (query, mutation, or subscription) is currently loading **anywhere in the app**.

It uses the shared counters from [`useApolloLoading`](../useApolloLoading) to drive global loading indicators such as app overlays or progress bars.

## Quick start

```ts
import { useGlobalLoading } from 'vue3-apollo'

const isGlobalLoading = useGlobalLoading()

watch(isGlobalLoading, (value) => {
  if (value) {
    console.log('Something is loading globally...')
  }
})
```

## API

```ts
const isGlobalLoading = useGlobalLoading()
```

### Returns
- **`ComputedRef<boolean>`** — reactive boolean that becomes `true` if any operation (`query`, `mutation`, or `subscription`) is currently in-flight.

### Behavior
- Reads from `activeGlobal.value.all` in the global tracker.
- Automatically updates when tracked operations start or finish.
- Works across all components and composables that integrate with `useApolloTracking` or built-in `useQuery`, `useMutation`, and `useSubscription`.

## Example: Global overlay
```ts
// layout.ts
import { useGlobalLoading } from 'vue3-apollo'

export function useLayoutLoading() {
  const isGlobalLoading = useGlobalLoading()
  return {
    isGlobalLoading,
  }
}
```

```vue
<!-- App.vue -->
<template>
  <div v-if="isGlobalLoading" class="global-overlay">
    <LoadingSpinner />
  </div>
  <router-view />
</template>

<script setup lang="ts">
import { useGlobalLoading } from 'vue3-apollo'
const isGlobalLoading = useGlobalLoading()
</script>
```

---

**See also**
- [`useApolloLoading`](../useApolloLoading) — provides the global counters this hook depends on.
- [`useApolloTracking`](../useApolloTracking) — connects loading refs to global counters.
- [`useQuery`](../useQuery), [`useMutation`](../useMutation), [`useSubscription`](../useSubscription) — automatically tracked Apollo composables.