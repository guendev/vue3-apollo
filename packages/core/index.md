# Core

Package: `@vue3-apollo/core`

Lightweight Vue 3 composables around Apollo Client v4 with SSR awareness. Below are the primary public APIs.

## useQuery

Reactive wrapper over Apollo Client's ObservableQuery with Vue-first ergonomics.

Basic usage:

```ts
import { useQuery } from '@vue3-apollo/core'
import gql from 'graphql-tag'

const GetUser = gql/* GraphQL */ `
  query GetUser($id: ID!) {
    user(id: $id) { id name }
  }
`

const { data, loading, error, refetch, fetchMore, stop, start } = useQuery(
  GetUser,
  { id: '1' },
  {
    enabled: true, // reactive boolean supported
    debounce: 100, // or throttle
    fetchPolicy: 'cache-first',
  }
)
```

Key features:

- SSR-aware defaults (network-only on server, cache-first on client when using Nuxt module defaults).
- Controls: `start()`, `stop()`, `refetch(variables?)`, `fetchMore(options)`.
- Reactive variables and enable flags.
- Events and error handling integrated.

## useSubscription

Subscribe to real-time updates. Requires `graphql-ws` on the client if using WebSocket transport.

```ts
import { useSubscription } from '@vue3-apollo/core'
import gql from 'graphql-tag'

const OnUserUpdated = gql/* GraphQL */ `
  subscription OnUserUpdated($id: ID!) {
    userUpdated(id: $id) { id name }
  }
`

const { data, loading, error, stop, start } = useSubscription(
  OnUserUpdated,
  { id: '1' },
  {
    enabled: true,
  }
)
```

## useApolloClient

Access a specific ApolloClient instance by id (or first available):

```ts
import { useApolloClient } from '@vue3-apollo/core'

const defaultClient = useApolloClient()
const analyticsClient = useApolloClient('analytics')
```

## useApolloClients

Access the clients registry provided by your app integration (e.g., Nuxt module):

```ts
import { useApolloClients } from '@vue3-apollo/core'

const clients = useApolloClients()
console.log(Object.keys(clients)) // ['default', 'analytics']
```

## Notes

- The core package expects that clients are provided via an integration (e.g., a plugin) that injects a clients registry using a Vue injection key. The Nuxt module in this monorepo provides that by default.
- All composables are fully typed. Prefer `TypedDocumentNode` for end-to-end type safety.
