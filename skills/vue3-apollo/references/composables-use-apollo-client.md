# Composable: useApolloClient

## When to use

Use `useApolloClient` for imperative Apollo calls:

1. You need one-off `query`, `mutate`, or `subscribe` calls.
2. You need direct cache operations (`readQuery`, `writeQuery`, `evict`, `gc`).
3. You need explicit client routing in multi-client setups.

Use `useApolloClients` when you need the full client registry.

## Signatures

```ts
useApolloClient(clientId?: string)
useApolloClients()
```

```ts
import { useApolloClient, useApolloClients } from '@vue3-apollo/core'
```

Important:

1. `useApolloClient` takes a `string` client id, not an object.
2. Calling `useApolloClient()` without id returns the first registered client in registry order.

## Basic usage

```ts
import { gql } from 'graphql-tag'
import { useApolloClient } from '@vue3-apollo/core'

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`

const client = useApolloClient()
const { data } = await client.query({ query: GET_USERS })
```

## Multi-client usage

```ts
const defaultClient = useApolloClient()
const analyticsClient = useApolloClient('analytics')
```

Inspect available clients:

```ts
const clients = useApolloClients()
console.log(Object.keys(clients))
```

## Imperative mutation pattern

```ts
const client = useApolloClient('default')

const { data } = await client.mutate({
  mutation: CREATE_POST,
  variables: {
    input: { title: 'Hello' },
  },
})
```

When to prefer this over `useMutation`:

1. No reactive mutation state is needed (`loading/error/data/called` refs).
2. You only need promise-based flow in a utility/composable function.

## Cache operations pattern

```ts
const client = useApolloClient()

client.cache.evict({ fieldName: 'posts' })
client.cache.gc()
```

## Case examples

### Case 1: Happy path (imperative query in action handler)

Goal: run query only when user clicks refresh.

```ts
const client = useApolloClient()

const refresh = async () => {
  const { data } = await client.query({
    query: GET_DASHBOARD,
    fetchPolicy: 'network-only',
  })
  dashboard.value = data.dashboard
}
```

### Case 2: Edge case (strict multi-client routing)

Goal: prevent accidental cross-service requests.

```ts
const clients = useApolloClients()
if (!clients.analytics) {
  throw new Error('analytics client is not configured')
}

const analyticsClient = useApolloClient('analytics')
await analyticsClient.query({ query: GET_ANALYTICS })
```

### Case 3: Failure case (registry missing or wrong client id)

Symptoms:

1. Registry not found error.
2. No clients found in registry.
3. Named client not found.

Recovery:

1. Verify plugin/module setup is initialized before composable usage.
2. Verify at least one client is registered.
3. Verify `clientId` exists in registry keys.

## Verification checklist

1. `useApolloClient()` returns a valid client instance.
2. Named client lookup works for configured ids.
3. One imperative `query` and one `mutate` call succeed.
4. Cache operation path works without runtime errors.
5. No object-style call like `useApolloClient({ clientId: 'x' })` remains.

## Pitfalls

1. Passing `{ clientId: 'x' }` instead of `'x'`.
2. Assuming default client is always named `default` (it returns first registry key).
3. Calling composable before app plugin/module is installed.
4. Forgetting to guard missing named clients in multi-client apps.
5. Using imperative calls where reactive composables are a better fit.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/setup-core-vue3.md`
3. `references/setup-nuxt4.md`
4. `references/composables-use-query.md`
5. `references/composables-use-mutation.md`
6. `references/composables-use-subscription.md`
7. `references/troubleshooting.md`
8. `references/testing-checklist.md`
