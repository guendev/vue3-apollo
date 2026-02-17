# Nuxt Hooks

Runtime hooks exposed by `@vue3-apollo/nuxt`.

## apollo:error
`apollo:error` is emitted whenever an Apollo client operation fails.

### Quick start

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('apollo:error', (payload) => {
    const { clientId, graphQLErrors, protocolErrors, networkError } = payload

    if (networkError) {
      console.error(`[${clientId}] network error`, networkError)
    }

    if (graphQLErrors) {
      graphQLErrors.errors.forEach((item) => {
        console.error(`[${clientId}] graphql error`, item.message)
      })
    }

    if (protocolErrors) {
      console.error(`[${clientId}] protocol errors`, protocolErrors.errors)
    }
  })
})
```

### Payload
- `clientId: string`
- `operation`: Apollo operation metadata
- `graphQLErrors?`: GraphQL server errors
- `networkError?`: Network/transport-level error
- `protocolErrors?`: Protocol errors

### Notes
- Hook is called for each affected operation.
- Works with multi-client setups; use `clientId` for routing/reporting.

## Related
- [`Nuxt Configuration`](/nuxt/configuration)
- [`Nuxt Integration`](/nuxt)
