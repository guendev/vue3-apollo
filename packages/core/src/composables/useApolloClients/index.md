# useApolloClients

Composable that returns the **registry of all Apollo Client instances** provided by the `apolloPlugin`.

Useful when you need direct access to multiple clients (e.g., switching dynamically or performing custom operations on different clients).

## Quick start

```ts
import { useApolloClients } from 'vue3-apollo'

const clients = useApolloClients()
console.log(Object.keys(clients))
// ['default', 'analytics', 'admin']

const defaultClient = clients.default
const analyticsClient = clients.analytics
```

## API

### Returns
- **`Record<string, ApolloClient>`** — all registered clients, keyed by their `clientId`.
  - The `default` client is always available if properly configured.

### Behavior
- Internally uses Vue’s `inject()` to retrieve the registry under the key `APOLLO_CLIENTS_KEY`.
- Throws an error if the plugin wasn’t installed or no clients were provided.

## Example: dynamic client switching
```ts
import { useApolloClients, useApolloClient } from 'vue3-apollo'

const clients = useApolloClients()

function useDynamicClient(clientId) {
  const selected = clients[clientId] || clients.default
  return selected
}

// Usage
const activeClient = useDynamicClient('analytics')
const { result } = useQuery(
  GET_ANALYTICS_DATA,
  undefined,
  {
    clientId: 'analytics',
  },
)
```

## Error handling
If the plugin was not installed or no clients were provided, calling this composable throws:

```text
[useApolloClients] Apollo clients registry not found. Did you forget to install ApolloPlugin?
```

## See also
- [`apolloPlugin`](../apolloPlugin) — registers Apollo clients.
- [`useApolloClient`](../useApolloClient) — access a single client by `clientId`.
- [`useQuery`](../useQuery), [`useMutation`](../useMutation), [`useSubscription`](../useSubscription) — composables that depend on registered clients.