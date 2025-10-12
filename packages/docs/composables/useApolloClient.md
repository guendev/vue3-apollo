# useApolloClient
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
