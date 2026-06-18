---
"@vue3-apollo/nuxt": minor
---

Add `defineApolloClient` for advanced, runtime client setup.

Point a client at a builder file with the new per-client `configFile` option (e.g. `configFile: '~/apollo/default'`). The builder runs at runtime, so configuration that cannot be serialized through `nuxt.config` — custom `ApolloLink`s, a custom `InMemoryCache`, or `typePolicies` with `merge`/`read`/`keyFields` **functions** — now works on both server and client.

The builder receives a context of factories (`createAuthLink`, `createErrorLink`, `createHttpLink`, `createRetryLink`, `createWsLink`, `createCache`) plus the pre-assembled `defaultLink`/`defaultCache`, so you can compose on top of the defaults instead of rebuilding the whole chain — auth, the `apollo:error` hook, the WebSocket subscription split and SSR cache handling keep working. A builder may also return a fully constructed `ApolloClient` as an escape hatch.

The builder runs with the Nuxt context restored, so app-level composables (`useCookie`, `useRuntimeConfig`, `useRequestURL`, …) work inside it.

`defineApolloClient` is auto-imported in builder files; it can also be imported explicitly from `@vue3-apollo/nuxt/config` (along with its `ApolloClientContext` type).

This is fully additive and opt-in: clients without a `configFile` behave exactly as before.
