

# useSubscriptionLoading

Composable that returns a **computed ref** representing whether any Apollo **subscriptions** are currently loading (connecting or awaiting first data) within a specific component or custom owner scope.

It reads from the `activeByOwner` map provided by [`useApolloLoading`](../useApolloTracker) and updates automatically as the tracked subscription states change.

## Quick start

```ts
import { useSubscriptionLoading } from 'vue3-apollo'

// Automatically tracks this component's subscriptions
const isLoading = useSubscriptionLoading()

watch(isLoading, (value) => {
  if (value) {
    console.log('This component is waiting for subscription data...')
  }
})
```

## API

```ts
const isLoading = useSubscriptionLoading(id?)
```

### Parameters
- **`id?: ApolloLoadingId`** — Optional unique identifier (`string | number`).
  - If omitted, uses the current component instance’s `uid`.

### Returns
- **`ComputedRef<boolean>`** — reactive boolean that becomes `true` when one or more subscriptions are active for the given id.

## Behavior
- Reads from `activeByOwner.value[loadingId].subscription` in the global Apollo loading tracker.
- Automatically derives `loadingId` from the Vue component instance when not provided.
- Returns `false` if no id or counters exist.
- Updates reactively as subscriptions start or complete within the same owner scope.

## Example

### Component-level tracking
```vue
<template>
  <div v-if="isLoading" class="connecting-indicator">
    Connecting to live updates...
  </div>
</template>

<script setup lang="ts">
import { useSubscriptionLoading } from 'vue3-apollo'

const isLoading = useSubscriptionLoading()
</script>
```

### Custom owner tracking
```ts
const isSyncing = useSubscriptionLoading('live-feed')

watch(isSyncing, (active) => {
  if (active) {
    console.log('Live feed is establishing connection...')
  }
})
```

---

**See also**
- [`useApolloLoading`](../useApolloTracker) — provides the owner counters.
- [`useGlobalSubscriptionLoading`](../useGlobalSubscriptionLoading) — tracks all subscriptions globally.
- [`useApolloTracking`](../useApolloTracking) — automatically reports loading states to the tracker.