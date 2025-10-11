

# useGlobalMutationLoading

Composable that returns a **computed ref** indicating whether **any Apollo mutation** is currently running across the entire app.

It’s a focused variant of [`useGlobalLoading`](../useGlobalLoading) that only tracks mutations.

## Quick start

```ts
import { useGlobalMutationLoading } from 'vue3-apollo'

const isGlobalMutationLoading = useGlobalMutationLoading()

watch(isGlobalMutationLoading, (value) => {
  if (value) {
    console.log('At least one mutation is running...')
  }
})
```

## API

```ts
const isGlobalMutationLoading = useGlobalMutationLoading()
```

### Returns
- **`ComputedRef<boolean>`** — becomes `true` if one or more mutations are active anywhere in the app.

### Behavior
- Reads from `activeGlobal.value.mutation` in the global tracker.
- Automatically updates when mutations start or complete.
- Works globally across all components using Apollo composables like [`useMutation`](../useMutation).

## Example: Disable global actions during mutation
```vue
<template>
  <button :disabled="isGlobalMutationLoading">
    Save All
  </button>
</template>

<script setup lang="ts">
import { useGlobalMutationLoading } from 'vue3-apollo'

const isGlobalMutationLoading = useGlobalMutationLoading()
</script>
```

---

**See also**
- [`useGlobalLoading`](../useGlobalLoading) — tracks all operation types globally.
- [`useApolloLoading`](../useApolloLoading) — provides the global counters.
- [`useMutation`](../useMutation) — automatically integrates with this tracker.