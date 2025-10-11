

# useApolloClient

Composable that returns a single **Apollo Client instance** by its `clientId`.

Useful when you want direct access to a specific Apollo Client (e.g., for advanced cache operations, direct queries, or managing multiple clients).

## Quick start

```ts
import { useApolloClient } from 'vue3-apollo'

// Get the default client
const client = useApolloClient()

// Run a query directly
const result = await client.query({
  query: GET_USERS,
})
```

## API

### Parameters
- **`clientId?: string`** – optional ID of the client to retrieve.
  - If omitted, returns the first available client (usually the `default` one).

### Returns
- **`ApolloClient`** – the Apollo client instance.

### Behavior
- Internally calls [`useApolloClients()`](../useApolloClients) to access the registry.
- If no `clientId` is provided, it uses the first registered client.
- Throws a descriptive error if no clients exist or the requested one is missing.

## Examples

### Accessing a specific client
```ts
const analyticsClient = useApolloClient('analytics')
const result = await analyticsClient.query({
  query: GET_ANALYTICS_DATA,
})
```

### Handling missing clients
```ts
try {
  const customClient = useApolloClient('nonexistent')
} catch (e) {
  console.error(e.message)
  // [useApolloClient] Client "nonexistent" not found. Available clients: default, analytics
}
```

### Running operations with a named client
```ts
const adminClient = useApolloClient('admin')
await adminClient.mutate({
  mutation: CREATE_USER,
  variables: {
    name: 'Alice',
  },
})
```

---

**See also**
- [`useApolloClients`](../useApolloClients) — get all clients at once.
- [`apolloPlugin`](../apolloPlugin) — registers multiple Apollo clients.
- [`useQuery`](../useQuery), [`useMutation`](../useMutation), [`useSubscription`](../useSubscription) — composables that use the active Apollo client.