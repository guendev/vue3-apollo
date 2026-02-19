# Nuxt Integration

Lightweight Nuxt module for Apollo Client v4 with SSR and optional WebSocket subscriptions.

## Installation

::: code-group

```bash [npm]
npm i @vue3-apollo/nuxt @apollo/client graphql
```

```bash [pnpm]
pnpm add @vue3-apollo/nuxt @apollo/client graphql
```

:::

## Quick start

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://graphqlplaceholder.vercel.app/graphql',
        wsEndpoint: 'wss://graphqlplaceholder.vercel.app/graphql'
      }
    },
    httpLinkOptions: {
      credentials: 'include'
    },
    wsLinkOptions: {
      retryAttempts: 3
    }
  }
})
```

Use in pages/components:

```ts
const { result, loading, error } = useQuery(GET_POSTS)
const { called, execute } = useLazyQuery(GET_POSTS)
const { data: livePost } = useSubscription(POST_ADDED)
```

These composables are auto-imported by default (`apollo.autoImports: true`).
If auto-imports are disabled, import from `#imports`.

## Authentication

Tokens are read from cookies (SSR-safe).

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    auth: {
      authHeader: 'Authorization',
      authType: 'Bearer',
      tokenName: 'auth-token'
    }
  }
})
```

To disable auth injection:

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    auth: false
  }
})
```

## WebSocket subscriptions
Install `graphql-ws` if you configure `wsEndpoint`:

::: code-group

```bash [npm]
npm i graphql-ws
```

```bash [pnpm]
pnpm add graphql-ws
```

:::

## Related
- [`useLazyQuery`](/composables/useLazyQuery)
- [`Nuxt Configuration`](/nuxt/configuration)
- [`useAsyncQuery`](/nuxt/composables/useAsyncQuery)
- [`Custom Apollo Integration`](/advance/nuxt-custom-integration)
