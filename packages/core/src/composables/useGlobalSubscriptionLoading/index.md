# useGlobalSubscriptionLoading

Composable that returns a **computed ref** indicating whether **any Apollo subscription** is currently loading (connecting) across the entire application.

It’s a focused variant of [`useGlobalLoading`](../useGlobalLoading) that only tracks GraphQL **subscriptions**.

## Quick start

```ts
import { useGlobalSubscriptionLoading } from 'vue3-apollo'

const isGlobalSubscriptionLoading = useGlobalSubscriptionLoading()

watch(isGlobalSubscriptionLoading, (value) => {
  if (value) {
    console.log('A subscription is establishing a connection...')
  }
})
```

## API

```ts
const isGlobalSubscriptionLoading = useGlobalSubscriptionLoading()
```

### Returns
- **`ComputedRef<boolean>`** — becomes `true` while one or more subscriptions are connecting or waiting for first data.

### Behavior
- Reads from `activeGlobal.value.subscription` in the global Apollo loading tracker.
- Automatically updates as subscriptions start or complete.
- Works globally across all composables using [`useSubscription`](../useSubscription) or any Apollo subscription hook integrated with `useApolloTracking`.

## Example: Global connection indicator
```vue
<template>
  <div v-if="isGlobalSubscriptionLoading" class="connecting-indicator">
    Establishing real-time connection...
  </div>
</template>

<script setup lang="ts">
import { useGlobalSubscriptionLoading } from 'vue3-apollo'

const isGlobalSubscriptionLoading = useGlobalSubscriptionLoading()
</script>
```

---

**See also**
- [`useGlobalLoading`](../useGlobalLoading) — tracks all operation types globally.
- [`useApolloLoading`](../useApolloLoading) — provides the global counters.
- [`useSubscription`](../useSubscription) — automatically integrates with this tracker.
