

# useApolloTracking

Lightweight helper that **binds a loading `Ref<boolean>`** to the global Apollo loading tracker (`useApolloLoading`).

When the `state` ref changes, the corresponding counters (global and per‑owner) are updated for a specific operation `type` (`'query' | 'mutation' | 'subscription'`).

## When to use
- You have a composable or component that exposes a **`loading` ref** and you want to contribute to a **global spinner**.
- You want **owner‑scoped** loading state without manually calling `track()`.

> Works only on the **client** and **inside an active Vue scope** (e.g., setup of a component/composable). It’s a no‑op on the server.

## Quick start

```ts
import { ref } from 'vue'
import { useApolloTracking } from 'vue3-apollo'

const loading = ref(false)

useApolloTracking({
  state: loading,
  type: 'query',
})

// whenever you toggle `loading`, global counters update automatically
loading.value = true
// ... do work
loading.value = false
```

## API

```ts
useApolloTracking(options)
```

### Options
- **`state: Ref<boolean>`** – reactive loading flag you already manage.
- **`type: 'query' | 'mutation' | 'subscription'`** – operation category used in the counters.

## Behavior
- Uses `getCurrentScope()` to ensure it runs **within a Vue scope**. If not, it does nothing (no warning).
- Uses `getCurrentInstance()?.uid` as the **owner id**; falls back to a random id if unavailable.
- Subscribes to `state` via `watch()` and forwards changes to `useApolloLoading().track()`.
- Skips entirely on the **server** (SSR) to avoid Web/API side effects.

## Examples

### Track a custom async action
```ts
import { ref } from 'vue'
import { useApolloTracking } from 'vue3-apollo'

const saving = ref(false)
useApolloTracking({
  state: saving,
  type: 'mutation',
})

async function saveProfile() {
  try {
    saving.value = true
    // await apolloClient.mutate(...)
  } finally {
    saving.value = false
  }
}
```

### Pair with `useSubscription`
```ts
const subLoading = ref(true)
useApolloTracking({
  state: subLoading,
  type: 'subscription',
})
// flip subLoading to false after first message or connection established
```

### Wrap an existing composable
```ts
export function useSaveOrder() {
  const loading = ref(false)
  useApolloTracking({
    state: loading,
    type: 'mutation',
  })

  const run = async (payload) => {
    loading.value = true
    try {
      // ...
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    run,
  }
}
```

---

**See also**
- [`useApolloLoading`](../useApolloLoading) – shared global/owner counters and `track()` API.
- Data composables that already integrate tracking: [`useQuery`](../useQuery), [`useMutation`](../useMutation), [`useSubscription`](../useSubscription).