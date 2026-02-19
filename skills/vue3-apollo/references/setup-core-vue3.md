# Setup Core for Vue 3

## When to use

Use this file when the task is a Vue 3 app (non-Nuxt) that needs:

1. Initial Apollo client wiring with `@vue3-apollo/core`.
2. Single or multi-client setup.
3. Baseline validation before implementing queries or mutations.

## Prerequisites

1. Vue 3 application with Composition API.
2. GraphQL endpoint URL(s).
3. Installed packages:

```bash
npm install @vue3-apollo/core @apollo/client graphql graphql-tag
```

## Minimal single-client setup

Create Apollo client:

```ts
// src/apollo/client.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export const defaultClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'https://example.com/graphql',
  }),
})
```

Install plugin in app entry:

```ts
// src/main.ts
import { createApp } from 'vue'
import { apolloPlugin } from '@vue3-apollo/core'
import App from './App.vue'
import { defaultClient } from './apollo/client'

const app = createApp(App)

app.use(apolloPlugin, {
  clients: {
    default: defaultClient,
  },
})

app.mount('#app')
```

## Multi-client setup

Use named clients when different endpoints or auth models are required:

```ts
// src/main.ts
app.use(apolloPlugin, {
  clients: {
    default: defaultClient,
    analytics: analyticsClient,
  },
})
```

Access a specific client:

```ts
import { useApolloClient } from '@vue3-apollo/core'

const defaultClient = useApolloClient()
const analyticsClient = useApolloClient('analytics')
```

## First validation query

Use this check right after setup to confirm registry + transport:

```ts
import { gql } from 'graphql-tag'
import { useApolloClient } from '@vue3-apollo/core'

const HEALTH_QUERY = gql`
  query Health {
    __typename
  }
`

const client = useApolloClient()
await client.query({ query: HEALTH_QUERY })
```

## Case examples

### Case 1: Happy path (single client)

Goal: wire one GraphQL endpoint and use reactive query.

```ts
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
    }
  }
`

const { result, loading, error } = useQuery(GET_POSTS)
```

### Case 2: Edge case (multi client with explicit routing)

Goal: keep feature queries isolated by backend domain.

```ts
import { useQuery } from '@vue3-apollo/core'

const { result } = useQuery(GET_ANALYTICS_DASHBOARD, undefined, {
  clientId: 'analytics',
})
```

### Case 3: Failure case (plugin missing or wrong client id)

Symptoms:

1. Registry not found error.
2. Client id not found error.

Recovery order:

1. Confirm `app.use(apolloPlugin, { clients: ... })` is executed before component mount.
2. Confirm `clients` is non-empty and includes expected ids.
3. Confirm `useApolloClient('id')` uses an existing key.

## Verification checklist

1. `app.use(apolloPlugin, { clients })` exists in app bootstrap.
2. `clients.default` exists.
3. A smoke query succeeds.
4. Named clients are reachable by id where required.
5. Consumer-facing imports use `@vue3-apollo/core` only.

## Pitfalls

1. Calling composables before plugin registration.
2. Registering no clients (plugin install throws).
3. Using wrong `clientId` key in composables.
4. Mixing internal repository imports into consumer snippets.
5. Assuming `useApolloClient` takes an options object instead of a string client id.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/composables-use-query.md`
3. `references/composables-use-lazy-query.md`
4. `references/composables-use-mutation.md`
5. `references/composables-use-subscription.md`
6. `references/composables-use-fragment.md`
7. `references/composables-use-apollo-client.md`
8. `references/troubleshooting.md`
9. `references/testing-checklist.md`
