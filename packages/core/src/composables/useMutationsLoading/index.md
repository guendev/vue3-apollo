# useMutationLoading

Composable that returns a **computed ref** representing whether any Apollo **mutations** are currently loading within a specific component or custom owner scope.

It reads from the `activeByOwner` map provided by [`useApolloLoading`](../useApolloTracker) and updates automatically as tracked mutation states change.

## Quick start

```ts
import { useMutationLoading } from 'vue3-apollo'

// Automatically tracks the current component's mutations
const isLoading = useMutationLoading()

watch(isLoading, (value) => {
  if (value) {
    console.log('This component is performing a mutation...')
  }
})
```

## API

```ts
const isLoading = useMutationLoading(id?)
```

### Parameters
- **`id?: ApolloLoadingId`** — Optional unique identifier (string or number).
  - If not provided, uses the current component instance’s `uid`.

### Returns
- **`ComputedRef<boolean>`** — reactive boolean, `true` when one or more mutations are active for the given id.

## Behavior
- Reads from `activeByOwner.value[loadingId].mutation` in the global tracker.
- Automatically determines `loadingId` from the Vue instance when not provided.
- Returns `false` if no id or counters exist.
- Reactively updates as mutations start or complete within the same owner context.

## Example

### Component-level tracking
```vue
<template>
  <button :disabled="isLoading">
    Update Profile
  </button>
</template>

<script setup lang="ts">
import { useMutationLoading } from 'vue3-apollo'

const isLoading = useMutationLoading()
</script>
```

### Custom owner tracking
```ts
const isSaving = useMutationLoading('settings-form')

// Use inside composables or features that share an ID
watch(isSaving, (active) => {
  if (active) {
    console.log('Settings form is saving...')
  }
})
```

---

**See also**
- [`useApolloLoading`](../useApolloTracker) — provides the owner counters.
- [`useGlobalMutationLoading`](../useGlobalMutationLoading) — tracks all mutations globally.
- [`useApolloTracking`](../useApolloTracking) — automatically reports loading states to the tracker.