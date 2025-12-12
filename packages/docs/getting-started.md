# Getting Started

Vue3 Apollo provides a lightweight integration between **Vue 3** and **Apollo Client v4**, offering a composable-first API for GraphQL queries, mutations, and subscriptions.

## Installation

You can install Vue3 Apollo using your preferred package manager:

::: code-group

```bash [npm]
npm install @vue3-apollo/core @apollo/client graphql
```

```bash [pnpm]
pnpm add @vue3-apollo/core @apollo/client graphql
```

:::

## Creating an Apollo Client

To start, create one or more Apollo Client instances with your desired GraphQL endpoints.

```ts
// src/apollo-clients.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export const defaultClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        // Example public GraphQL API
        uri: 'https://graphqlplaceholder.vercel.app/graphql'
    })
})
```

## Plugin Setup

Vue3 Apollo provides a simple plugin for registering one or multiple Apollo clients.

```ts
import { apolloPlugin } from '@vue3-apollo/core'
import { createApp } from 'vue'

// e.g. src/apollo-clients.ts
import { defaultClient } from './apollo-clients'

const app = createApp(App)

app.use(apolloPlugin, {
    clients: {
        default: defaultClient
    }
})
```

The plugin injects all Apollo clients into your app context, allowing you to access them from composables or any Vue component.

## Your first query

To actually run a query, you first define it using `gql` and then use `useQuery` (reactive) or `client.query` (imperative).

```ts
import { gql } from 'graphql-tag'

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`
```

Using `useQuery` in a Vue component:

```ts
import { useQuery } from '@vue3-apollo/core'
import { GET_USERS } from '@/graphql/queries'

const { result, loading, error } = useQuery(GET_USERS)
```

Or run it directly with a client (imperative):

```ts
import { useApolloClient } from '@vue3-apollo/core'
import { GET_USERS } from '@/graphql/queries'

const client = useApolloClient()
const { data } = await client.query({ query: GET_USERS })
```

If you use TypeScript, check out the Advanced → TypeScript & Codegen page for strongly typed queries and results.
See: /advance/typescript
