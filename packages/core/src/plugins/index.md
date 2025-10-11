

# apolloPlugin

Vue 3 plugin that registers **one or more Apollo Client instances** in the app `provide`/`inject` tree so composables (e.g. `useQuery`, `useMutation`, `useSubscription`) can access them by `clientId`.

## Overview
- Accepts a **clients registry**: a record of `{ [clientId: string]: ApolloClient }`.
- You **must** include a `default` client id.
- All clients are provided under the injection key `APOLLO_CLIENTS_KEY`.

## Installation

```ts
import { createApp } from 'vue'
import { apolloPlugin } from 'vue3-apollo'
import { createApolloClient } from './apollo' // your factory

const defaultClient = createApolloClient({ /* ... */ })

createApp(App)
  .use(
    apolloPlugin,
    {
      clients: {
        default: defaultClient,
      },
    },
  )
  .mount('#app')
```

## Multiple clients
Add any number of named clients alongside `default` (e.g., analytics, admin, read‑only):

```ts
const defaultClient = createApolloClient({ /* ... */ })
const analyticsClient = createApolloClient({ /* ... */ })
const adminClient = createApolloClient({ /* ... */ })

app.use(
  apolloPlugin,
  {
    clients: {
      default: defaultClient, // required
      analytics: analyticsClient,
      admin: adminClient,
    },
  },
)
```

## Accessing clients

### Via composables (recommended)
All data composables accept an optional `clientId` in their options. If omitted, they use `default`.

```ts
// use the default client
const { result } = useQuery(
  GET_POSTS,
)

// use a specific named client
const { result: analyticsData } = useQuery(
  GET_DASHBOARD,
  undefined,
  {
    clientId: 'analytics',
  },
)
```

### Direct injection (advanced)
If needed, you can inject the registry and work with clients directly.

```ts
import { inject } from 'vue'
import { APOLLO_CLIENTS_KEY } from 'vue3-apollo/constants/apollo'

const clients = inject(APOLLO_CLIENTS_KEY)!
const adminClient = clients.admin
```

## Error handling
If `clients` is an empty object, the plugin throws:

```text
[ApolloPlugin] No Apollo clients provided
```

## Types

```ts
export interface ApolloPluginOptions {
  /** Map of client ids to ApolloClient instances. Must include 'default'. */
  clients: Record<string, ApolloClient>
}
```

## See also
- `useApolloClient()` — helper to select the active client by `clientId`.
- `useQuery()`, `useMutation()`, `useSubscription()` — composables that consume the provided clients.