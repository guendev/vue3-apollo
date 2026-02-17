# Custom Apollo Integration for Nuxt

Use custom integration only when module configuration is not enough (custom link chains, custom cache policies, or advanced runtime behavior).

## Default first
For most projects, configure only `nuxt.config.ts` and keep defaults from `@vue3-apollo/nuxt`.

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

## Why Use Plugins

### 1. Serialization  
During build, Nuxt serializes module options into JSON.  
Complex objects like `ApolloClient` or custom `Link`s **lose references** and can’t be reused at runtime.

### 2. Context Isolation  
Modules execute in a **separate build context**, isolated from Nuxt’s runtime environment.  
Plugins, on the other hand, run inside the live app, where you can modify the Apollo client safely.

✅ **Modules:** define static config & generate runtime code  
✅ **Plugins:** handle runtime logic & modify live instances

## Runtime customization pattern
If you need runtime client customization, create a plugin that updates a client after module initialization.

```ts
// app/plugins/10.apollo-custom.ts
import { ApolloLink, HttpLink } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'

export default defineNuxtPlugin((nuxtApp) => {
  const client = nuxtApp.$apolloClients.default
  const runtimeConfig = useRuntimeConfig()

  const httpLink = new HttpLink({
    uri: runtimeConfig.public.graphqlHttp
  })

  const retryLink = new RetryLink()

  client.setLink(ApolloLink.from([retryLink, httpLink]))
})
```

## Notes
- File naming (`10.apollo-custom.ts`) helps ensure ordering relative to other plugins.
- Keep auth/header behavior in module config (`apollo.auth`) unless you must override it.
- Validate both SSR and CSR behavior after custom link changes.

## Related
- [`Nuxt Integration`](/nuxt)
- [`Nuxt Configuration`](/nuxt/configuration)
