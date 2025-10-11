

# useGlobalQueryLoading

Composable that returns a **computed ref** indicating whether **any Apollo query** is currently loading across the application.

This is a specialized version of [`useGlobalLoading`](../useGlobalLoading) that focuses solely on tracking GraphQL **queries**.

## Quick start

```ts
import { useGlobalQueryLoading } from 'vue3-apollo'

const isGlobalQueryLoading = useGlobalQueryLoading()

watch(isGlobalQueryLoading, (value) => {
  if (value) {
    console.log('A query is currently loading...')
  }
})
```

## API

```ts
const isGlobalQueryLoading = useGlobalQueryLoading()
```

### Returns
- **`ComputedRef<boolean>`** — becomes `true` when one or more queries are active anywhere in the app.

### Behavior
- Reads from `activeGlobal.value.query` in the global Apollo loading tracker.
- Automatically updates as queries start or complete.
- Works globally across all composables that integrate with `useApolloTracking` or built-in [`useQuery`](../useQuery).

## Example: Global query indicator
```vue
<template>
  <div v-if="isGlobalQueryLoading" class="global-loading-bar" />
</template>

<script setup lang="ts">
import { useGlobalQueryLoading } from 'vue3-apollo'

const isGlobalQueryLoading = useGlobalQueryLoading()
</script>
```

---

**See also**
- [`useGlobalLoading`](../useGlobalLoading) — tracks all operation types globally.
- [`useApolloLoading`](../useApolloLoading) — provides global counters.
- [`useQuery`](../useQuery) — automatically tracked query composable.