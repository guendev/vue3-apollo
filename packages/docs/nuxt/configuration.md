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
- `devtools?: boolean` (default: `import.meta.dev`): Enables Apollo devtools integration per client. When unset, devtools are enabled in development and disabled in production.

### Shared options (`ApolloSharedConfig`)
- `auth?: ApolloSharedAuthConfig | false`
- `httpLinkOptions?: Omit<HttpLink.Options, 'uri'>`
- `wsLinkOptions?: Omit<ClientOptions, 'connectionParams' | 'url'>`
- `devtools?: boolean` (defaults to `import.meta.dev` unless overridden per client)
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
- Core composables: `useApolloClients`, `useApolloClient`, `useFragment`, `useLazyQuery`, `useMutation`, `useQuery`, `useSubscription`
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

## Type-safe `defaultOptions`

Apollo Client v4 makes the `errorPolicy` (and `watchQuery.returnPartialData`) defaults **opt-in for type safety**. If you set them in `apollo.defaultOptions` (or a per-client `defaultOptions`) without declaring them first, TypeScript will report:

```
A default option for query.errorPolicy must be declared in
ApolloClient.DeclareDefaultOptions before usage.
```

This comes from Apollo itself — the module simply forwards Apollo's `defaultOptions` type. To use these defaults, declare them once in a `.d.ts` file picked up by your project (e.g. `app/apollo.d.ts`):

```ts
// app/apollo.d.ts
import type { ErrorPolicy } from '@apollo/client'

declare module '@apollo/client' {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      // Declare the keys as OPTIONAL so they don't become required on every client.
      interface Query {
        errorPolicy?: ErrorPolicy
      }
      interface WatchQuery {
        errorPolicy?: ErrorPolicy
        returnPartialData?: boolean
      }
      interface Mutate {
        errorPolicy?: ErrorPolicy
      }
    }
  }
}

export {}
```

After this, the following type-checks cleanly:

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    defaultOptions: {
      query: { errorPolicy: 'all' }
    },
    clients: {
      default: { httpEndpoint: 'https://api.example.com/graphql' }
    }
  }
})
```

> Declare the fields as **optional** (`errorPolicy?`). Declaring them as required forces every `defaultOptions` object to specify `watchQuery`, `query` **and** `mutate`.
>
> See Apollo's [Declaring default options for type safety](https://www.apollographql.com/docs/react/data/typescript#declaring-default-options-for-type-safety).

## Related
- [`Nuxt Integration`](/nuxt)
- [`Nuxt Hooks`](/nuxt/hooks)
- [`Custom Apollo Integration`](/advance/nuxt-custom-integration)
