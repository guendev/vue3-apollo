# Custom Apollo Integration for Nuxt

For advanced setups — custom link chains, a custom cache instance, or `typePolicies`
with functions — use a **runtime builder** via `defineApolloClient`.

## Default first

For most projects, configure only `nuxt.config.ts` and keep the defaults.

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

## Why a builder file (and not `nuxt.config`)

`nuxt.config` options are serialized into the runtime config, which must be JSON.
That means **functions and class instances are lost** — most importantly
`typePolicies` `merge`/`read`/`keyFields` functions and custom `ApolloLink`s. The
builder file is real runtime code, so everything survives on both server and client.

## `defineApolloClient`

Point a client at a builder file with the `configFile` option:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql',
        configFile: '~/apollo/default'
      }
    }
  }
})
```

```ts
// app/apollo/default.ts
import { ApolloLink, InMemoryCache } from '@apollo/client'

export default defineApolloClient((ctx) => {
  return {
    // typePolicies functions survive because this is real code
    cache: new InMemoryCache({
      typePolicies: {
        Query: { fields: { feed: { keyArgs: ['type'], merge: true } } }
      }
    }),
    // compose on top of the defaults — keeps auth, the apollo:error hook and the WS split
    link: ApolloLink.from([
      ctx.createAuthLink(),
      ctx.createErrorLink(),
      new MyTracingLink(),
      ctx.createHttpLink()
    ])
  }
})
```

`defineApolloClient` is auto-imported, so no import is needed.

### The builder context (`ctx`)

The builder receives factories that produce the **same** links/cache the module
builds by default, so you compose instead of rebuilding from scratch:

| Member | Description |
|---|---|
| `ctx.createAuthLink()` | Auth link (injects the cookie token into headers) |
| `ctx.createErrorLink()` | Error link that broadcasts the `apollo:error` hook |
| `ctx.createHttpLink(options?)` | HTTP link (merged on top of `httpLinkOptions`) |
| `ctx.createRetryLink(options?)` | A `RetryLink` |
| `ctx.createWsLink()` | WS link (or `undefined` on the server / no `wsEndpoint` / no `graphql-ws`) |
| `ctx.createCache(options?)` | `InMemoryCache` (merged on top of `inMemoryCacheOptions`) |
| `ctx.defaultLink` | The assembled default chain `[auth, error, retry, http\|ws-split]` |
| `ctx.defaultCache` | The assembled default cache (SSR state already restored on the client) |
| `ctx.config` | The resolved scalar config (endpoints, auth, …) |
| `ctx.clientId` / `ctx.isServer` / `ctx.nuxtApp` | Client id, SSR flag, Nuxt app |

### Just tweak the cache, keep everything else

```ts
export default defineApolloClient(ctx => ({
  cache: ctx.createCache({ typePolicies: { /* … */ } })
  // link omitted → ctx.defaultLink is used
}))
```

### Composables in the builder

The builder runs inside the Nuxt plugin, so app-level composables work
(`useCookie`, `useRuntimeConfig`, `useRequestHeaders`, …). Call them **before** the
first `await`, or wrap them with `ctx.nuxtApp.runWithContext(() => …)`:

```ts
export default defineApolloClient((ctx) => {
  const token = useCookie('auth-token') // before any await
  // …
})
```

### Returning a fully built client (escape hatch)

A builder may return a complete `ApolloClient`. The module then only wires SSR
cache extraction/restoration — auth/error/WS are entirely up to you.

```ts
import { ApolloClient } from '@apollo/client'

export default defineApolloClient(ctx => new ApolloClient({
  cache: ctx.defaultCache,
  link: ctx.defaultLink
}))
```

## SSR

SSR cache extraction/restoration is handled automatically for the cache your
builder returns (or the default one) — no extra work needed.

## Related
- [`Nuxt Integration`](/nuxt)
- [`Nuxt Configuration`](/nuxt/configuration)
