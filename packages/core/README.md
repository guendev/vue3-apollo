# @vue3-apollo/core

> 🧩 Composable utilities for using [Apollo Client v4](https://www.apollographql.com/docs/react/) with [Vue 3](https://vuejs.org/).

Vue3 Apollo Core provides a **lightweight, composable-first integration** between Vue 3 and Apollo Client, allowing you to perform GraphQL queries, mutations, and subscriptions in a fully reactive way.

## ✨ Features

- 🪶 Minimal and tree-shakeable
- 🔁 Reactive GraphQL queries & mutations via Vue composables
- ⚡ Multiple client support (default + named clients)
- 🧠 TypeScript-first API
- 🧩 Seamless integration with Nuxt via [`@vue3-apollo/nuxt`](https://www.npmjs.com/package/@vue3-apollo/nuxt)
- 📄 Full documentation at [vue3-apollo.guen.dev](https://vue3-apollo.guen.dev/)

## 📦 Installation

You can install using your preferred package manager:

```bash
npm install @vue3-apollo/core @apollo/client graphql
```

## 🚀 Getting Started

### 1. Create an Apollo Client

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export const defaultClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
    // Example public GraphQL API
        uri: 'https://graphqlplaceholder.vercel.app/graphql',
    }),
})
```

### 2. Register the Plugin

```ts
import { apolloPlugin } from '@vue3-apollo/core'
import { createApp } from 'vue'

import { analyticsClient, defaultClient } from './apollo-clients'

const app = createApp(App)

app.use(apolloPlugin, {
    clients: {
        analytics: analyticsClient,
        default: defaultClient,
    },
})
```

This injects Apollo clients into your Vue app, making them available across composables and components.

### 3. Use in a Component

```vue
<script setup lang="ts">
import { useQuery } from '@vue3-apollo/core'
import gql from 'graphql-tag'

const GET_POSTS = gql`
  query Posts {
    posts {
      id
      title
      body
    }
  }
`

const { error, loading, result } = useQuery(GET_POSTS)
</script>

<template>
  <div v-if="loading">
    Loading...
  </div>
  <div v-else-if="error">
    {{ error.message }}
  </div>
  <ul v-else>
    <li v-for="post in result.posts" :key="post.id">
      <strong>{{ post.title }}</strong> — {{ post.body }}
    </li>
  </ul>
</template>
```

## 🧠 Composables Overview

| Composable         | Description                                    |
|--------------------|------------------------------------------------|
| `useQuery`         | Reactive GraphQL query                         |
| `useMutation`      | Execute GraphQL mutations                      |
| `useSubscription`  | Subscribe to GraphQL streams                   |
| `useFragment`      | Retrieve and manage normalized cache fragments |
| `useApolloClient`  | Access current Apollo client                   |
| `useApolloClients` | Access Apollo clients                          |

See the [full API reference](https://vue3-apollo.guen.dev/composables/useQuery) for details.

---

## 🧩 Multi-Client Example

You can register and switch between multiple clients:

```ts
const { result: analyticsData } = useQuery(ANALYTICS_QUERY, null, {
    clientId: 'analytics',
})
```

## 🧰 TypeScript Support

All composables are fully typed, providing autocompletion and inference for query variables and responses.

```ts
const { result } = useQuery<{ posts: { id: string, title: string }[] }>(GET_POSTS)
```

## 🧑‍💻 Contributing

This package is part of the [Vue3 Apollo monorepo](https://github.com/guendev/vue3-apollo).

To develop locally:

```bash
pnpm install
pnpm build
pnpm dev:docs
```

## 📄 License

[MIT](https://github.com/guendev/vue3-apollo/blob/main/LICENSE)

## 🔗 Links

- 🌐 [Documentation](https://vue3-apollo.guen.dev/)
- 💾 [GitHub Repository](https://github.com/guendev/vue3-apollo)
- 📦 [npm - @vue3-apollo/core](https://www.npmjs.com/package/@vue3-apollo/core)
- 🧱 [Nuxt Integration - @vue3-apollo/nuxt](https://www.npmjs.com/package/@vue3-apollo/nuxt)
