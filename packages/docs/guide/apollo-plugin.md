# Apollo Plugin

`apolloPlugin` registers Apollo client instances into Vue dependency injection so all composables can resolve clients.

## Quick start

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'
import { createApp } from 'vue'
import { apolloPlugin } from '@vue3-apollo/core'

import App from './App.vue'

const defaultClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: 'https://api.example.com/graphql' })
})

const app = createApp(App)

app.use(apolloPlugin, {
  clients: {
    default: defaultClient
  }
})

app.mount('#app')
```

## Multi-client setup

```ts
app.use(apolloPlugin, {
  clients: {
    default: defaultClient,
    analytics: analyticsClient
  }
})
```

Then resolve clients with:
- `useApolloClient()`
- `useApolloClient('analytics')`
- `useApolloClients()`

## APOLLO_CLIENTS_KEY (advanced)
`APOLLO_CLIENTS_KEY` is the injection key used internally by the plugin.

Typical applications should not inject manually. Use the plugin instead.

## Errors
The plugin throws when `clients` is an empty object.

## Related
- [`Getting Started`](/getting-started)
- [`useApolloClient`](/composables/useApolloClient)
- [`useApolloClients`](/composables/useApolloClients)
