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

```bash [bun]
bun add @vue3-apollo/core @apollo/client graphql
```

:::

## Creating an Apollo Client

To start, create one or more Apollo Client instances with your desired GraphQL endpoints.

```ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'

const client = new ApolloClient({
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
import { createApp } from 'vue'
import { apolloPlugin } from '@vue3-apollo/core'
import { defaultClient, analyticsClient } from './apollo-clients'

const app = createApp(App)

app.use(apolloPlugin, {
  clients: {
    default: defaultClient,
    analytics: analyticsClient
  }
})
```

The plugin injects all Apollo clients into your app context, allowing you to access them from composables or any Vue component.
