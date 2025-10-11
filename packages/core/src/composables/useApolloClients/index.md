# useApolloClients
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