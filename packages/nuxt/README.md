# @vue3-apollo/nuxt

> ⚡️ Lightweight Nuxt module for Apollo Client v4 with SSR and WebSocket subscription support.

This package provides a seamless way to integrate Apollo Client into your **Nuxt 4** application using Vue 3’s Composition API — with full support for SSR, multi-client configuration, and GraphQL subscriptions.

## ✨ Features

- 💨 Zero-config setup for Nuxt 4
- 🧩 Built on [`@vue3-apollo/core`](https://www.npmjs.com/package/@vue3-apollo/core)
- 🔁 Supports HTTP & WebSocket links
- 🧠 SSR-safe authentication via cookies
- ⚙️ TypeScript support
- 🔄 Multi-client configuration

## 📦 Installation

You can install using your preferred package manager:

```bash
# npm
npm i @vue3-apollo/nuxt @apollo/client graphql
```

## 🚀 Quick Start

Configure Apollo directly inside your `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        // HTTP link
        httpEndpoint: 'https://graphqlplaceholder.vercel.app/graphql',

        // WebSocket link (optional; install `graphql-ws` in your project)
        wsEndpoint: 'wss://graphqlplaceholder.vercel.app/graphql'
      }
    },

    // Common transport options
    httpLinkOptions: { credentials: 'include' },
    wsLinkOptions: { retryAttempts: 3 }
  }
})
```

Use anywhere in your app:

```ts
// Query
const { result, loading, error } = useQuery(GET_POSTS)

// Subscription
const { result: livePost } = useSubscription(POST_ADDED)
```

> **Note:**  
> 1. To enable WebSocket subscriptions, install [`graphql-ws`](https://github.com/enisdenjo/graphql-ws).  
> 2. WebSocket connections only support the **`graphql-ws`** subprotocol.

### Install `graphql-ws`

```bash
# npm
npm i graphql-ws

# pnpm
pnpm add graphql-ws

# bun
bun add graphql-ws
```

## 🔐 Authentication

Tokens are read from cookies (SSR-safe) by default.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    auth: {
      tokenName: 'auth-token',     // default: apollo:{clientId}:token
      authType: 'Bearer',          // set null to send raw token
      authHeader: 'Authorization'  // custom header name
    }

    // or disable entirely:
    // auth: false
  }
})
```

## 🧠 Multi-Client Usage

Register multiple clients and switch between them dynamically:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: { httpEndpoint: 'https://api.main/graphql' },
      analytics: { httpEndpoint: 'https://api.analytics/graphql' }
    }
  }
})
```

```ts
// Example composable
const { result } = useQuery(GET_ANALYTICS, null, { clientId: 'analytics' })
```

---

## 🧩 Integration with Vue Composables

All core composables (`useQuery`, `useMutation`, `useSubscription`, etc.) are automatically available via `@vue3-apollo/core`.

```ts
const { result, loading } = useQuery(GET_USER)
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
- 📦 [npm - @vue3-apollo/nuxt](https://www.npmjs.com/package/@vue3-apollo/nuxt)
- 🧱 [Core Composables - @vue3-apollo/core](https://www.npmjs.com/package/@vue3-apollo/core)
