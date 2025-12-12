# useApolloClient
Useful when you want direct access to a specific Apollo Client (e.g., for advanced cache operations, direct queries, or managing multiple clients).

## Quick start

```ts
import { useApolloClient } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

// 1) Get the default client (registered via the plugin)
const client = useApolloClient()

// 2) Define a query
const GET_USERS = gql`
  query GetUsers {
    users { id name email }
  }
`

// 3) Run it imperatively
const { data, errors } = await client.query({ query: GET_USERS })
```

> Tip: Use `useApolloClients()` to get all registered clients.

### Using a specific client by ID

If you register multiple clients, pass `clientId` to select one:

```ts
import { useApolloClient } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const analytics = useApolloClient({ clientId: 'analytics' })
const { data } = await analytics.query({
  query: gql`query { analyticsEvents { id type } }`
})
```

### Where does `import { analyticsClient, defaultClient } from './apollo-clients'` come from?

We recommend creating a local file (e.g., `src/apollo-clients.ts`) that exports your Apollo Client instances. Then import them in `main.ts` to install the plugin:

```ts
// src/apollo-clients.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export const defaultClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: 'https://graphqlplaceholder.vercel.app/graphql' })
})

export const analyticsClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: 'https://example-analytics-graphql.com/graphql' })
})
```

Then in your app entry:

```ts
import { apolloPlugin } from '@vue3-apollo/core'
import { createApp } from 'vue'
import { analyticsClient, defaultClient } from './apollo-clients'

const app = createApp(App)
app.use(apolloPlugin, {
  clients: { default: defaultClient, analytics: analyticsClient }
})
```

## API

### Parameters
- `clientId?: string` – optional ID of the client to retrieve. If omitted, returns the first available client (usually the `default` one).

### Returns
- `ApolloClient` – the Apollo client instance.

If you use TypeScript, see Advanced → TypeScript & Codegen for strongly typed queries.