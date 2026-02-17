# useApolloClient

Use `useApolloClient` when you need direct access to an Apollo Client instance for imperative operations (`client.query`, `client.mutate`, cache APIs).

## Quick start

```ts
import { gql } from 'graphql-tag'
import { useApolloClient } from '@vue3-apollo/core'

const client = useApolloClient()
const analyticsClient = useApolloClient('analytics')

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`

const { data } = await client.query({ query: GET_USERS })
```

## Signature

```ts
function useApolloClient(clientId?: string): ApolloClient
```

## Parameters
- `clientId?: string`: Optional client id. If omitted, the first registered client is returned (usually `default`).

## Returns
- `ApolloClient`: The resolved client instance.

## Options
- None.

## Notes
- Throws if Apollo clients were not provided via `apolloPlugin`.
- Throws if `clientId` is provided but does not exist.
- Throws if no clients are registered.

## Examples

### Case 1: Imperative refresh on user action

```ts
const client = useApolloClient()

const refreshDashboard = async () => {
  const { data } = await client.query({
    query: GET_DASHBOARD,
    fetchPolicy: 'network-only'
  })

  dashboard.value = data.dashboard
}
```

### Case 2: Strict multi-client routing

```ts
import { gql } from 'graphql-tag'
import { useApolloClient, useApolloClients } from '@vue3-apollo/core'

const clients = useApolloClients()
if (!clients.analytics) {
  throw new Error('analytics client is not configured')
}

const analyticsClient = useApolloClient('analytics')

const { data } = await analyticsClient.query({
  query: gql`
    query AnalyticsSummary {
      summary {
        sessions
        users
      }
    }
  `
})
```

### Case 3: Direct cache invalidation

```ts
const client = useApolloClient()

client.cache.evict({ fieldName: 'posts' })
client.cache.gc()
```

## Related
- [`useApolloClients`](/composables/useApolloClients)
- [`Getting Started`](/getting-started)
