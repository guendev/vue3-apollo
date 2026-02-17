# Nuxt Configuration

`@vue3-apollo/nuxt` reads `apollo` options from `nuxt.config.ts` and creates Apollo clients at runtime.

## Minimal config

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql'
      }
    }
  }
})
```

## Option reference

### Module options (`apollo`)
- `clients?: Record<string, ApolloClientConfig>`: Client map. Should include `default` in normal setups.
- `autoImports?: boolean` (default: `true`): Auto-import core composables/helpers and `useAsyncQuery`.
- `devtools?: boolean` (default: `true` via module defaults): Enables Apollo devtools integration per client.

### Shared options (`ApolloSharedConfig`)
- `auth?: ApolloSharedAuthConfig | false`
- `httpLinkOptions?: Omit<HttpLink.Options, 'uri'>`
- `wsLinkOptions?: Omit<ClientOptions, 'connectionParams' | 'url'>`
- `devtools?: boolean` (inherits module/default value unless overridden per client)
- `inMemoryCacheOptions?: InMemoryCacheConfig`
- `assumeImmutableResults?`
- `dataMasking?`
- `defaultOptions?`
- `localState?`
- `queryDeduplication?`

### Per-client options (`ApolloClientConfig`)
- `httpEndpoint: string` (required)
- `wsEndpoint?: string` (optional; requires `graphql-ws`)
- Includes all shared options above.

## Merge behavior
Top-level shared options are merged into each client config. Per-client values override shared defaults.

## Auto-imports
When `autoImports: true`, the module auto-imports:
- Core composables: `useApolloClients`, `useApolloClient`, `useFragment`, `useMutation`, `useQuery`, `useSubscription`
- Tracking helpers: `useApolloTrackingStore`, `useApolloTracker`, `useApolloTracking`, `useMutationsLoading`, `useQueriesLoading`, `useSubscriptionsLoading`
- Nuxt helper: `useAsyncQuery`

## Example: shared + per-client override

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    devtools: true,
    httpLinkOptions: {
      credentials: 'include'
    },
    auth: {
      tokenName: 'auth-token',
      authHeader: 'Authorization',
      authType: 'Bearer'
    },
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql'
      },
      analytics: {
        httpEndpoint: 'https://analytics.example.com/graphql',
        devtools: false
      }
    }
  }
})
```

## Related
- [`Nuxt Integration`](/nuxt)
- [`Nuxt Hooks`](/nuxt/hooks)
- [`Custom Apollo Integration`](/advance/nuxt-custom-integration)
