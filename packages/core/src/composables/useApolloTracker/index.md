# useApolloLoading

Global loading tracker for Apollo operations (queries, mutations, subscriptions) with **per-owner** and **global** counters.

`useApolloLoading` is built with `@vueuse/core`'s `createGlobalState`, so the state is shared across your app while still being tree‑shakable.

## When to use
- Show a **global progress bar/spinner** while *any* GraphQL request is in flight.
- Drive **per-component/per-feature** loading indicators (e.g., disable a section while its queries run).
- Build dashboards that display how many operations are currently active.

## Quick start

```ts
import { useApolloLoading } from 'vue3-apollo'

const { activeGlobal, track } = useApolloLoading()

// Start tracking a query owned by component uid=42
track({
  id: 42,
  state: true,
  type: 'query',
})

// ...later when it finishes
track({
  id: 42,
  state: false,
  type: 'query',
})
```

## API

`const { activeByOwner, activeGlobal, track } = useApolloLoading()`

### `track({ id, state, type })`
Increment/decrement counters for an owner and globally.

- `id`: unique owner identifier.
- `state`: `true` to start ( +1 ), `false` to finish ( −1 ).
- `type`: `'query' | 'mutation' | 'subscription'`.

Counters never go below 0, and empty owners are removed automatically.

## Types

```ts
export type ApolloLoadingId = number | string
export type ApolloOperationType = 'all' | 'mutation' | 'query' | 'subscription'
```