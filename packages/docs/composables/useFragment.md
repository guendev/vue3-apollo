# useFragment

A reactive composable for **reading and watching GraphQL fragments** from the Apollo cache in **Vue 3**.

## Quick start

```ts
import { useFragment } from 'vue3-apollo'
import { USER_FRAGMENT } from './fragments'

const { result, data, complete, error, onResult } = useFragment(USER_FRAGMENT, {
  from: 'User:1',
  variables: { withPosts: true },
})

onResult(({ data, complete }) => {
  if (complete) console.log('Fragment ready:', data)
})
```

This composable automatically tracks and updates when the underlying cache data changes.

## How it works

- **Cache-driven:** Reads data directly from the Apollo cache and re-renders when it updates.
- **Reactive watching:** Automatically resubscribes when `from` or `variables` (refs or getters) change.
- **Type-safe:** Exposes a full `result` object for advanced TypeScript narrowing.
- **SSR ready:** When `prefetch` is enabled, fragments are resolved during server-side rendering.

## API

### Returns
- **`result`** – Full fragment result including `data`, `complete`, and `missing` information. Ideal for TypeScript narrowing.
  ```ts
  const { result } = useFragment<User>(USER_FRAGMENT, { from: 'User:1' })

  if (result.value?.complete) {
    console.log(result.value.data.name) // ✅ Fully typed
  } else {
    console.log(result.value?.missing) // Partial data info
  }
  ```
- **`data`** – Reactive fragment data (`DeepPartial<TData>`). May be incomplete if fields are missing from cache.
- **`complete`** – Boolean indicating whether the entire fragment is present in the cache.
- **`missing`** – Missing tree info reported by the cache (if any).
- **`error`** – Apollo error object, if an error occurs while reading or watching.
- **`start()` / `stop()`** – Manually control fragment watching lifecycle.
- **`onResult((payload, context) => {})`** – Triggered when fragment data updates.
  ```ts
  onResult(({ data, complete }, { client }) => {
    if (complete) console.log('Updated:', data)
    console.log('Client:', client)
  })
  ```
- **`onError((error, context) => {})`** – Triggered when a cache read or watch error occurs.
  ```ts
  onError((error, { client }) => {
    console.error('Fragment error:', error)
    client.clearStore()
  })
  ```

### Options (new API)
- **`from`** – *string | object | Ref | getter* (**required**). The source entity to read from cache. Accepts:
  - A cache ID string (e.g., `'User:1'`).
  - An entity object with `__typename` and an identifier.
  - A reactive ref or computed getter returning one of the above.
- **`variables`** – *Record<string, any> | Ref | getter*. Fragment variables (for fragments with `@arguments`).
- **`fragmentName`** – *string | Ref | getter*. Required only if the provided document contains multiple fragments.
- **`enabled`** – *boolean | Ref | getter* (default: `true`). Enables or disables fragment watching.
- **`optimistic`** – *boolean* (default: `true`). Include optimistic layer when reading from cache.
- **`prefetch`** – *boolean* (default: `true`). For SSR: prefetch fragment data during server rendering to avoid hydration flicker.
- **`clientId`** – *string*. Apollo client identifier if multiple clients are registered.

#### Overloads
- New (recommended): `useFragment(document, options?)`
- Legacy (deprecated, still supported): `useFragment({ fragment, ...options })`

#### Legacy usage (deprecated)
```ts
// Prefer the new API above. This legacy form remains for backward compatibility.
const { result } = useFragment({
  fragment: USER_FRAGMENT,
  from: { __typename: 'User', id: '123' },
  fragmentName: 'UserFragment'
})
```

## Notes
- Watching is based on **reference equality** of `from` and `variables`. Changing references will re-subscribe.
- When `from` is `null` or `undefined`, no watching occurs and `complete` is `false`.
- `data` is exposed as **`DeepPartial<TData>`** since fragments can be partial.
- Recommended: Use `result` for best TypeScript type narrowing.
- For SSR, keep `prefetch: true` for smoother hydration.

## Types
- `UseFragmentOptions<TData, TVariables>`: Options type for the new API (no `fragment` field).
- `UseLegacyFragmentOptions<TData, TVariables>`: Extends `UseFragmentOptions` and adds `fragment`. Deprecated — prefer the new API.
