# useQueryLoading

Composable that returns a **computed ref** representing whether any Apollo **queries** are currently loading within a specific component or custom owner scope.

It reads from the `activeByOwner` map provided by [`useApolloLoading`](../useApolloTracker) and updates automatically when the tracked query states change.

## Quick start

```ts
import { useQueryLoading } from 'vue3-apollo'

// Automatically tracks queries for the current component
const isLoading = useQueryLoading()

watch(isLoading, (value) => {
  if (value) {
    console.log('This component is loading data...')
  }
})
```

## API

```ts
const isLoading = useQueryLoading(id?)
```

### Parameters
- **`id?: ApolloLoadingId`** — Optional unique identifier (`string | number`).
  - If omitted, uses the current component instance’s `uid`.

### Returns
- **`ComputedRef<boolean>`** — reactive boolean that is `true` when one or more queries are active for the given id.

## Behavior
- Reads from `activeByOwner.value[loadingId].query` in the global tracker.
- Automatically derives `loadingId` from the Vue instance when not provided.
- Returns `false` if no id or counters exist.
- Updates reactively as queries start or finish within the owner scope.

## Example

### Component-level query tracking
```vue
<template>
  <div v-if="isLoading" class="loading-bar" />
</template>

<script setup lang="ts">
import { useQueryLoading } from 'vue3-apollo'

const isLoading = useQueryLoading()
</script>
```

### Custom owner tracking
```ts
const isFetching = useQueryLoading('dashboard')

watch(isFetching, (active) => {
  if (active) {
    console.log('Dashboard queries are active...')
  }
})
```

---

**See also**
- [`useApolloLoading`](../useApolloTracker) — provides the owner counters.
- [`useGlobalQueryLoading`](../useGlobalQueryLoading) — tracks all queries globally.
- [`useApolloTracking`](../useApolloTracking) — automatically reports loading states to the tracker.