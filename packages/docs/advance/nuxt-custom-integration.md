# Custom Apollo Integration for Nuxt


A compact guide for setting up and extending Apollo Client in Nuxt, focusing on module limitations, plugin customization, and best practices.

## Overview

Nuxt modules simplify setup but run only at **build time**, meaning they can’t access runtime APIs like `useRuntimeConfig` or `useApolloClient`.  
For dynamic logic (auth, caching, token refresh), use **plugins**, which run after app startup with full Nuxt context.

## Why Use Plugins

### 1. Serialization  
During build, Nuxt serializes module options into JSON.  
Complex objects like `ApolloClient` or custom `Link`s **lose references** and can’t be reused at runtime.

### 2. Context Isolation  
Modules execute in a **separate build context**, isolated from Nuxt’s runtime environment.  
Plugins, on the other hand, run inside the live app, where you can modify the Apollo client safely.

✅ **Modules:** define static config & generate runtime code  
✅ **Plugins:** handle runtime logic & modify live instances

## Basic Setup

Configure the Apollo client in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  graphql: {
    clients: {
      default: {
        httpEndpoint: ''
      }
    }
  }
})
```

## Plugin Customization

Create a plugin at `app/plugins/apollo.ts` to adjust the client at runtime:

```ts
export default defineNuxtPlugin(() => {
    const { client } = useApolloClient()
    const runtimeConfig = useRuntimeConfig()
    const access = useCookie('accessToken')

    const httpLink = new HttpLink({
        uri: runtimeConfig.public.apiBase
    })

    const authLink = new SetContextLink((prevContext) => {
        return {
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            }
        }
    })

    const retryLink = new RetryLink()

    const errorLink = new ErrorLink(({ error, forward, operation }) => {
        console.log(error)
    })


    const cache = client.cache as InMemoryCache
    cache.policies.addPossibleTypes(possibleTypes.possibleTypes)

    const typePolicies: StrictTypedTypePolicies = {}
    cache.policies.addTypePolicies(typePolicies)

    client.setLink(ApolloLink.from([authLink, errorLink, retryLink, httpLink]))
})
```

### Plugin Execution Order

Nuxt runs plugins **in registration order**, based on file name sorting.  
When customizing Apollo, ensure your plugin runs **before** any other plugin that uses Apollo Client.  
You can control this by prefixing the file name (e.g., `00.apollo.ts`) or following [Nuxt’s plugin registration order](https://nuxt.com/docs/4.x/guide/directory-structure/app/plugins#registration-order).


## Best Practices

- Use `runtimeConfig` for environment-dependent URLs and secrets.  
- Manage `possibleTypes` and `typePolicies` within plugins.  
- Avoid storing tokens globally on the server.  
- Test on both SSR and CSR modes for consistent behavior.
