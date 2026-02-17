# useApolloClients

`useApolloClients` returns the full Apollo client registry that was provided by `apolloPlugin`.

## Quick start

```ts
import { useApolloClients } from '@vue3-apollo/core'

const clients = useApolloClients()

const defaultClient = clients.default
const analyticsClient = clients.analytics

Object.entries(clients).forEach(([id, client]) => {
  console.log(id, client)
})
```

## Signature

```ts
function useApolloClients(): Record<string, ApolloClient>
```

## Parameters
- None.

## Returns
- `Record<string, ApolloClient>`: All registered clients by id.

## Options
- None.

## Notes
- Throws if Apollo clients were not provided via `apolloPlugin`.

## Examples

### Case 1: Resolve preferred client with fallback

```ts
import { computed } from 'vue'
import { useApolloClients } from '@vue3-apollo/core'

const clients = useApolloClients()

const activeClient = computed(() => {
  return clients.analytics ?? clients.default
})
```

### Case 2: Runtime diagnostics for configured clients

```ts
import { useApolloClients } from '@vue3-apollo/core'

const clients = useApolloClients()

const availableClientIds = Object.keys(clients)
console.log('Apollo clients:', availableClientIds)
```

## Related
- [`useApolloClient`](/composables/useApolloClient)
- [`Apollo Plugin Guide`](/guide/apollo-plugin)
