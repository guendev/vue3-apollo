# useApolloClient
Useful when you want direct access to a specific Apollo Client (e.g., for advanced cache operations, direct queries, or managing multiple clients).

## Quick start

```ts
import { useApolloClient } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const client = useApolloClient()

const GET_USERS = gql`
  query GetUsers {
    users { 
      id
      name 
      email 
    }
  }
`

const { data, errors } = await client.query({ query: GET_USERS })
```

> Tip: Use `useApolloClients()` to get all registered clients.

### Using a specific client by ID

If you register multiple clients, pass `clientId` to select one:

```ts
import { useApolloClient } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const analytics = useApolloClient({ 
    clientId: 'analytics' 
})

const { data } = await analytics.query({
  query: gql`query {
    posts(first: 3) {
      id
      title
    }
  }`
})
```

## API

### Parameters
- `clientId?: string` – optional ID of the client to retrieve. If omitted, returns the first available client (usually the `default` one).

### Returns
- `ApolloClient` – the Apollo client instance.

If you use TypeScript, see Advanced → TypeScript & Codegen for strongly typed queries.