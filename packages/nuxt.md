# Nuxt Module

Package: `@vue3-apollo/nuxt`

A Nuxt 4 module that registers one or more Apollo Client instances with SSR hydration, optional WebSocket subscriptions, and a centralized error hook.

## Install

```bash
pnpm add @vue3-apollo/nuxt @apollo/client graphql
# optional for subscriptions
pnpm add graphql-ws
```

## Usage

nuxt.config.ts:

```ts
export default defineNuxtConfig({
  modules: [
    '@vue3-apollo/nuxt',
  ],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://example.com/graphql',
        // Optional: enable WebSocket for subscriptions (client only)
        // Requires `graphql-ws` in your deps
        wsEndpoint: process.env.WS_ENDPOINT,
        // Optional: auth
        auth: {
          authHeader: 'Authorization',
          authType: 'Bearer',
          tokenName: 'apollo:default:token', // cookie name used by useCookie
        },
        // Optional: tune defaults
        defaultOptions: {
          query: { fetchPolicy: 'cache-first' },
          watchQuery: { fetchPolicy: 'cache-first' },
        },
        // Pass through options
        httpLinkOptions: { credentials: 'include' },
        wsLinkOptions: { lazy: true, retryAttempts: 3 },
        inMemoryCacheOptions: {},
        devtools: true,
      },
      // Additional named client example
      analytics: {
        httpEndpoint: 'https://analytics.example.com/graphql'
      }
    }
  }
})
```

Then use the core composables in your pages/components:

```vue
<script setup lang="ts">
import gql from 'graphql-tag'
import { useQuery, useApolloClient } from '@vue3-apollo/core'

const GetMe = gql`query { me { id name } }`
const { data, loading, error } = useQuery(GetMe)

// Or target a specific client
const analytics = useApolloClient('analytics')
</script>
```

## Features

- Multi-client support via apollo.clients registry.
- SSR hydration: auto-extracts cache on server and restores it on client.
- Subscriptions with `graphql-ws` when `wsEndpoint` is configured.
- Auth header injection via cookie-based token management using `useCookie`.
- Centralized error handling via a Nuxt hook.

## Error hook

Handle GraphQL, protocol, or network errors in one place:

```ts
// plugins/apollo-error.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('apollo:error', (payload) => {
    const { clientId, operation, graphQLErrors, protocolErrors, networkError } = payload
    console.error('[apollo:error]', clientId, operation.operationName, {
      graphQLErrors, protocolErrors, networkError
    })
  })
})
```

## Options Reference

Client config fields (per client):

- httpEndpoint: string — required. GraphQL HTTP endpoint.
- wsEndpoint?: string — optional. WebSocket endpoint for subscriptions (client-side only).
- auth?: {
  - authHeader?: string = 'Authorization'
  - authType?: string = 'Bearer'
  - tokenName?: string = `apollo:${clientId}:token` (cookie name)
}
- defaultOptions?: ApolloClient.DefaultOptions — forwarded to ApolloClient.
- httpLinkOptions?: HttpLink.Options
- wsLinkOptions?: ClientOptions (from graphql-ws)
- inMemoryCacheOptions?: InMemoryCacheConfig
- devtools?: boolean — enable Apollo devtools integration name-tagged per client.

Notes:

- Subscriptions require installing `graphql-ws` (it is an optional peer dependency). The module lazy-imports it on the client.
- On SSR, cache is extracted automatically and put into `nuxtApp.payload.data` under `apollo:{clientId}`.
