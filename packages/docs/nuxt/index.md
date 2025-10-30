# Nuxt Integration

Lightweight Nuxt module for Apollo Client v4 with SSR and WebSocket subscription support.

## Installation

::: code-group

```bash [npm]
npm i @vue3-apollo/nuxt @apollo/client graphql
```

```bash [pnpm]
pnpm add @vue3-apollo/nuxt @apollo/client graphql
```

```bash [bun]
bun add @vue3-apollo/nuxt @apollo/client graphql
```

:::

## Quick Start

```ts
// nuxt.config.ts
export default defineNuxtConfig({
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
    },
    modules: ['@vue3-apollo/nuxt']
})
```

> 💡 **Tip:** This setup works for most use cases.  
> For advanced customization (e.g., runtime Apollo links, auth flow, or cache policies), see [Nuxt Custom Integration](/advance/nuxt-custom-integration).

Use anywhere in your app:

```ts
// Query
const { error, loading, result } = useQuery(GET_POSTS)

// Subscription
const { result: livePost } = useSubscription(POST_ADDED)
```

> **Note:**
> 1. To enable WebSocket subscriptions, you need to install `graphql-ws`.
> 2. WebSocket connections only support the **`graphql-ws`** subprotocol.

::: code-group

```bash [npm]
npm i graphql-ws
```

```bash [pnpm]
pnpm add graphql-ws
```

```bash [bun]
bun add graphql-ws
```

:::

## Authentication

The token is only read from cookies (SSR‑safe) for now.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
    apollo: {
        auth: {
            authHeader: 'Authorization', // custom header name
            authType: 'Bearer', // set null to send raw token
            tokenName: 'auth-token' // default: apollo:{clientId}:token
        }
    // or disable entirely:
    // auth: false
    },
    modules: ['@vue3-apollo/nuxt']
})
```
