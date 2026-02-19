# Setup Nuxt 4

## When to use

Use this file when a Nuxt 4 app needs:

1. `@vue3-apollo/nuxt` module setup.
2. SSR-ready GraphQL queries with `useAsyncQuery`.
3. Multi-client, cookie auth, or WebSocket subscription wiring.

## Prerequisites

1. Nuxt 4 project.
2. At least one GraphQL HTTP endpoint.
3. `nuxt.config.ts` access.

## Install

```bash
npm install @vue3-apollo/nuxt @apollo/client graphql graphql-tag
```

If subscriptions are needed:

```bash
npm install graphql-ws
```

## Minimal module setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://example.com/graphql',
      },
    },
  },
})
```

Important defaults:

1. `apollo.autoImports` defaults to `true`.
2. At least one client must exist under `apollo.clients`.
3. `apollo` config is exposed into runtime config by the module.
4. Auto-imported core composables include `useQuery`, `useLazyQuery`, `useMutation`, `useSubscription`, `useFragment`, `useApolloClient`, and `useApolloClients`.

## Use in pages and components

With default `autoImports: true`, composables can be used directly:

```vue
<script setup lang="ts">
import { gql } from 'graphql-tag'

const GET_POSTS = gql`
  query GetPosts {
    posts { id title }
  }
`

const { data, pending, error } = await useAsyncQuery({
  query: GET_POSTS,
})
</script>
```

If `apollo.autoImports` is disabled, import manually:

```ts
import { useLazyQuery, useQuery } from '@vue3-apollo/core'
import { useAsyncQuery } from '@vue3-apollo/nuxt'
```

## Multi-client setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql',
      },
      analytics: {
        httpEndpoint: 'https://analytics.example.com/graphql',
      },
    },
  },
})
```

Use named client in operations:

```ts
const { data } = await useAsyncQuery({
  clientId: 'analytics',
  query: GET_ANALYTICS,
})
```

## Auth cookie setup

Nuxt module auth reads token from cookie.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://example.com/graphql',
      },
    },
    auth: {
      authHeader: 'Authorization',
      authType: 'Bearer',
      tokenName: 'auth-token',
    },
  },
})
```

Notes:

1. Default token cookie key is `apollo:{clientId}:token`.
2. Set `auth: false` to disable auth header injection.

## WebSocket subscriptions

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://example.com/graphql',
        wsEndpoint: 'wss://example.com/graphql',
      },
    },
    wsLinkOptions: {
      retryAttempts: 3,
    },
  },
})
```

Notes:

1. Subscription link is client-only.
2. Missing `graphql-ws` will cause a runtime warning and subscriptions will not initialize.

## Case examples

### Case 1: Happy path (Nuxt SSR page data)

Goal: render page with server-fetched data on first request.

```vue
<script setup lang="ts">
import { gql } from 'graphql-tag'

const GET_DASHBOARD = gql`
  query GetDashboard {
    dashboard { id title }
  }
`

const { data, pending, error } = await useAsyncQuery({
  query: GET_DASHBOARD,
})
</script>
```

### Case 2: Edge case (autoImports disabled + multi-client)

Goal: explicit imports and custom client selection.

```ts
import { useAsyncQuery } from '@vue3-apollo/nuxt'
import { gql } from 'graphql-tag'

const GET_ANALYTICS = gql`
  query GetAnalytics {
    metrics { name value }
  }
`

const { data } = await useAsyncQuery({
  clientId: 'analytics',
  query: GET_ANALYTICS,
})
```

### Case 3: Failure case (module wired but no clients)

Symptom: module warns no Apollo clients configured, composables do not work as expected.

Recovery:

1. Ensure `apollo.clients.default` exists in `nuxt.config.ts`.
2. Ensure `modules` includes `@vue3-apollo/nuxt`.
3. Restart dev server after config changes.

## Verification checklist

1. `nuxt.config.ts` includes `modules: ['@vue3-apollo/nuxt']`.
2. `apollo.clients.default.httpEndpoint` is set.
3. A page-level `useAsyncQuery` returns data.
4. If multi-client is used, `clientId` matches configured keys.
5. If subscriptions are used, `graphql-ws` is installed and `wsEndpoint` is set.
6. If composables are not imported manually, `apollo.autoImports` is enabled.

## Pitfalls

1. Forgetting to configure `apollo.clients`, which leaves module unusable.
2. Assuming `useQuery({ prefetch: true })` is identical to Nuxt `useAsyncData` flow.
3. Forgetting `graphql-ws` while enabling `wsEndpoint`.
4. Using named client ids that do not exist in `apollo.clients`.
5. Disabling `apollo.autoImports` but still omitting manual imports.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/nuxt-custom-integration.md`
3. `references/composables-use-query.md`
4. `references/composables-use-lazy-query.md`
5. `references/composables-use-subscription.md`
6. `references/composables-use-apollo-client.md`
7. `references/troubleshooting.md`
8. `references/testing-checklist.md`
