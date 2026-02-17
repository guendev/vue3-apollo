# Nuxt Custom Integration

## When to use

Use this file when `@vue3-apollo/nuxt` default setup is not enough and you need runtime customization in Nuxt plugin(s):

1. Dynamic runtime behavior (headers, token strategy, per-request logic).
2. Centralized error pipeline via Nuxt hook `apollo:error`.
3. Runtime cache policy tweaks (`possibleTypes`, `typePolicies`) after client creation.
4. Per-client customization in multi-client Nuxt apps.

## Build-time vs runtime split

Use module config (`nuxt.config.ts`) for static config:

1. `apollo.clients.*.httpEndpoint`
2. `apollo.clients.*.wsEndpoint`
3. `apollo.auth`
4. `apollo.httpLinkOptions`, `apollo.wsLinkOptions`
5. `apollo.inMemoryCacheOptions`, `apollo.defaultOptions`

Use runtime plugins (`app/plugins/*.ts`) for live app logic:

1. Access `useRuntimeConfig`, `useCookie`, `useApolloClient`.
2. Register Nuxt hooks (`nuxtApp.hook('apollo:error', ...)`).
3. Mutate client cache policies with request-aware data if needed.

Why this split matters:

1. Nuxt module runs at build time, then serializes options into runtime config.
2. Live Apollo client instances are created in runtime plugin flow, not in module setup.
3. Runtime-only concerns should be implemented in plugin files.

## Baseline module setup first

Start from module config, then add plugin only for what cannot be expressed statically.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql',
        wsEndpoint: 'wss://api.example.com/graphql',
      },
    },
    auth: {
      tokenName: 'auth-token',
      authHeader: 'Authorization',
      authType: 'Bearer',
    },
    inMemoryCacheOptions: {
      typePolicies: {
        Query: {
          fields: {
            posts: {
              merge: true,
            },
          },
        },
      },
    },
  },
})
```

## Runtime customization patterns

### Pattern 1: centralized error handling (recommended first)

Prefer Nuxt hook `apollo:error` before replacing Apollo link chain.

```ts
// app/plugins/00.apollo-error.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('apollo:error', ({ clientId, graphQLErrors, networkError, protocolErrors }) => {
    if (networkError) {
      console.error(`[apollo:${clientId}] network`, networkError)
    }
    if (graphQLErrors) {
      for (const err of graphQLErrors.errors) {
        console.error(`[apollo:${clientId}] graphql`, err.message)
      }
    }
    if (protocolErrors) {
      console.error(`[apollo:${clientId}] protocol`, protocolErrors)
    }
  })
})
```

### Pattern 2: cache policy patching after startup

Use when policies depend on runtime context or are split into separate files.

```ts
// app/plugins/01.apollo-cache.ts
import type { InMemoryCache } from '@apollo/client/cache'

export default defineNuxtPlugin(() => {
  const client = useApolloClient('default')
  const cache = client.cache as InMemoryCache

  cache.policies.addPossibleTypes({
    Node: ['User', 'Post'],
  })

  cache.policies.addTypePolicies({
    Query: {
      fields: {
        feed: {
          keyArgs: false,
          merge(existing = [], incoming: unknown[]) {
            return [...existing, ...incoming]
          },
        },
      },
    },
  })
})
```

### Pattern 3: full link override (advanced)

Only do this when static `apollo.*LinkOptions` cannot satisfy requirements.
Replacing link chain can disable default module behavior if done incorrectly.

```ts
// app/plugins/02.apollo-link.ts
import { ApolloLink } from '@apollo/client/core'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { RetryLink } from '@apollo/client/link/retry'

export default defineNuxtPlugin(() => {
  const client = useApolloClient('default')
  const token = useCookie('auth-token')
  const runtimeConfig = useRuntimeConfig()

  const httpLink = new HttpLink({
    uri: runtimeConfig.public.apiBase,
  })

  const authLink = new SetContextLink((prevContext) => ({
    ...prevContext,
    headers: {
      ...prevContext.headers,
      Authorization: token.value ? `Bearer ${token.value}` : '',
    },
  }))

  const retryLink = new RetryLink()
  const errorLink = new ErrorLink(({ error }) => {
    console.error('[apollo:default] custom link error', error)
  })

  client.setLink(ApolloLink.from([authLink, errorLink, retryLink, httpLink]))
})
```

Important:

1. `client.setLink(...)` replaces the whole chain.
2. If you need subscriptions, ensure your custom chain also handles `wsEndpoint` split.
3. If you override error link, preserve your own error reporting flow.

## Nuxt plugin order and scope

1. Run Apollo customization plugin early (`00.*.ts`) before plugins making GraphQL calls.
2. Keep runtime-only logic in `app/plugins/`, not in `nuxt.config.ts` module options.
3. With default `apollo.autoImports: true`, composables are auto-imported.
4. If `apollo.autoImports` is `false`, import manually from `@vue3-apollo/core`.

## Case examples

### Case 1: happy path (hook-only observability)

Goal: centralize GraphQL/network error logging without touching link chain.

1. Add `nuxtApp.hook('apollo:error', ...)` plugin.
2. Keep module defaults for auth/retry/ws.
3. Verify errors are logged for both query and mutation failures.

### Case 2: edge case (multi-client custom behavior)

Goal: apply custom behavior only on one client (`analytics`), keep `default` untouched.

```ts
// app/plugins/00.apollo-analytics.ts
import { ApolloLink } from '@apollo/client/core'
import { SetContextLink } from '@apollo/client/link/context'
import { HttpLink } from '@apollo/client/link/http'

export default defineNuxtPlugin(() => {
  const analyticsClient = useApolloClient('analytics')

  const authLink = new SetContextLink((prevContext) => ({
    ...prevContext,
    headers: {
      ...prevContext.headers,
      'x-analytics-key': 'internal-key',
    },
  }))

  const httpLink = new HttpLink({
    uri: 'https://analytics.example.com/graphql',
  })

  analyticsClient.setLink(ApolloLink.from([authLink, httpLink]))
})
```

### Case 3: failure case (broken subscriptions after custom link)

Symptom: queries work but subscriptions stop after adding custom plugin.

Cause:

1. Plugin replaced client link with HTTP-only chain.
2. Default ws split link from module runtime creation was overwritten.

Recovery:

1. Rebuild custom link with ws split behavior, or avoid full override.
2. Prefer configuring ws through `apollo.clients.*.wsEndpoint` when possible.
3. Validate with a real subscription operation in browser.

## Verification checklist

1. `nuxt.config.ts` still defines `apollo.clients`.
2. Custom plugin runs before Apollo-consuming plugins.
3. If `client.setLink` is used, expected auth/retry/ws/error behavior is still present.
4. `apollo:error` hook fires on network and GraphQL failures.
5. SSR page render and hydration still succeed after customization.
6. Multi-client customization only affects intended `clientId`.

## Pitfalls

1. Overriding link chain and accidentally dropping ws split, retry, or auth behavior.
2. Putting runtime logic into module config, then expecting request-level context.
3. Assuming hook-based error handling and custom error link are both active after full link override.
4. Disabling `apollo.autoImports` but forgetting manual imports in plugin code.
5. Applying customization to wrong client id in multi-client setup.

## Cross-reference

1. `references/setup-nuxt4.md`
2. `references/overview-and-decision-tree.md`
3. `references/composables-use-apollo-client.md`
4. `references/composables-use-subscription.md`
5. `references/troubleshooting.md`
6. `references/testing-checklist.md`
