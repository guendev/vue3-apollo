# Activity Tracking

This page documents the **loading tracker hooks** for Apollo operations:

- **`useApolloTracker`** — global state: counters per owner and aggregated globally.
- **`useApolloTracking`** — bind a `Ref<boolean>` to the tracker automatically.
- **Owner-scoped helpers** (same usage pattern):
  - `useMutationsLoading(id?)`
  - `useQueriesLoading(id?)`
  - `useSubscriptionsLoading(id?)`

All hooks share the same goal: provide **consistent, reactive visibility** into what’s loading in your app.

## When to use
- Show a **global** loading bar/overlay when anything is in-flight.
- Disable **a section/component** while its own requests run.
- Debug **which component** is performing queries/mutations/subscriptions.

## Quick start

### Track a loading ref automatically
```ts
import { ref } from 'vue'
import { useApolloTracking } from 'vue3-apollo'

const loading = ref(false)

useApolloTracking({
    state: loading,
    type: 'queries',
})

// later
loading.value = true
// ... do work
loading.value = false
```

### Check if current component is busy (representative for all owner-scoped hooks)
```ts
import { useQueriesLoading } from 'vue3-apollo'

const isBusy = useQueriesLoading() // also: useMutationsLoading(), useSubscriptionsLoading()
```

## API

| Hook | Purpose | Signature |
|---|---|---|
| `useApolloTracker` | Global counters + per-owner map; manual `track()` | `const { activeGlobal, activeByOwner, track } = useApolloTracker()` |
| `useApolloTracking` | Auto-forward a `Ref<boolean>` into counters | `useApolloTracking({ state, type })` |
| `useMutationsLoading` | Is any mutation active for owner? | `useMutationsLoading(id?) => ComputedRef<boolean>` |
| `useQueriesLoading` | Is any query active for owner? | `useQueriesLoading(id?) => ComputedRef<boolean>` |
| `useSubscriptionsLoading` | Is any subscription active for owner? | `useSubscriptionsLoading(id?) => ComputedRef<boolean>` |

### Types
- **Operation types**: `'queries' | 'mutations' | 'subscriptions'`
- **Owner id**: `number | string` (component `uid`, feature key, etc.)

## Core concepts
- **Global vs owner counters**: `activeGlobal` aggregates across the app; `activeByOwner` tracks per `id`.
- **Owner resolution**: Owner-scoped hooks use the **current component `uid`** unless you pass a custom `id`.
- **Reactivity**: counters update via shallow refs; spreads are used internally to trigger Vue reactivity.
- **Client-only**: `useApolloTracking` is a no-op on the server and also cleans up on scope dispose.

## Examples

### 1) Global indicator (using tracker directly)
```ts
import { computed } from 'vue'
import { useApolloTracker } from 'vue3-apollo'

const { activeGlobal } = useApolloTracker()

const isAnyQueryLoading = computed(() => (activeGlobal.value.queries ?? 0) > 0)
```

```vue
<template>
  <LoadingBar v-if="isAnyQueryLoading" />
</template>
```

### 2) Component-level guard (owner-scoped, representative for all three)
```vue
<script setup lang="ts">
import { useQueriesLoading } from 'vue3-apollo'

// Tracks current component by default; pass an id to share state across pieces
const isLoading = useQueriesLoading()
</script>

<template>
  <button :disabled="isLoading">
    Refresh Data
  </button>
</template>
```

### 3) Composable pattern with auto-tracking
```ts
import { ref } from 'vue'
import { useApolloTracking } from 'vue3-apollo'

export function useSaveItem() {
    const saving = ref(false)

    useApolloTracking({
        state: saving,
        type: 'mutations',
    })

    const run = async (input: any) => {
        try {
            saving.value = true
            // await apolloClient.mutate(...)
        }
        finally {
            saving.value = false
        }
    }

    return {
        run,
        saving,
    }
}
```

## Patterns & tips
- **Choose one source of truth**: Prefer `useApolloTracking` in composables that manage a `loading` ref.
- **Stable owner ids**: For shared sections, pass a custom `id` (e.g., `'dashboard'`) to owner-scoped hooks.
- **Never let counters go negative**: Internals clamp at `0`; ensure each `true` has a matching `false`.
- **SSR**: Tracking only happens on the client; it won’t interfere with SSR.

## Errors & edge cases
- Using owner-scoped hooks **outside a component** without an explicit `id` returns `false` (no `uid`).
- If you unmount mid-load, `useApolloTracking` performs cleanup on dispose to avoid counter leaks.
