# Migration from @vue/apollo-composable

## When to use

Use this file when migrating existing code from `@vue/apollo-composable` to `@vue3-apollo/core` and `@vue3-apollo/nuxt`.

## Migration scope

Apply migration in this order:

1. Upgrade Apollo Client to v4.
2. Replace package imports.
3. Migrate Nuxt async query APIs.
4. Migrate `useApolloClient` usage.
5. Migrate mutation callback payload assumptions.
6. Update loading tracking helpers.

## Quick mapping

| Old                                                                   | New                                                                        | Action                                   |
|-----------------------------------------------------------------------|----------------------------------------------------------------------------|------------------------------------------|
| `@vue/apollo-composable`                                              | `@vue3-apollo/core`                                                        | Replace imports for core composables     |
| old `useAsyncQuery(query, variables?, clientId?, context?, options?)` | `useAsyncQuery({ query, variables, clientId, context }, asyncDataConfig?)` | Move to object options                   |
| `useLazyAsyncQuery(...)`                                              | removed                                                                    | Use `useAsyncQuery(..., { lazy: true })` |
| `cache: true/false` in async query                                    | `fetchPolicy`                                                              | Use Apollo fetch policies                |
| `useApolloClient()` returning `{ client, resolveClient }` style       | `useApolloClient(clientId?)` returns client directly                       | Replace call sites                       |
| old mutation `onDone((result) => result.data...)`                     | new `onDone((data) => data...)`                                            | Remove `.data` wrapper assumptions       |

## Step-by-step migration

### 1) Upgrade dependencies

```bash
npm install @apollo/client@^4
```

If Nuxt subscriptions are used:

```bash
npm install graphql-ws
```

### 2) Replace imports

Before:

```ts
import { useQuery, useMutation } from '@vue/apollo-composable'
```

After:

```ts
import { useQuery, useMutation } from '@vue3-apollo/core'
```

Nuxt async query import:

```ts
import { useAsyncQuery } from '@vue3-apollo/nuxt'
```

### 3) Migrate Nuxt async query calls

Positional overloads are removed.

Before:

```ts
useAsyncQuery(GET_POSTS, { page: 1 }, 'default')
```

After:

```ts
useAsyncQuery({
  clientId: 'default',
  query: GET_POSTS,
  variables: { page: 1 },
})
```

`useLazyAsyncQuery` is removed.

Before:

```ts
useLazyAsyncQuery({
  query: GET_POSTS,
})
```

After:

```ts
useAsyncQuery(
  {
    query: GET_POSTS,
  },
  {
    lazy: true,
  }
)
```

`cache` option is removed, use fetch policy:

Before:

```ts
useAsyncQuery({
  cache: true,
  query: GET_POSTS,
})
```

After:

```ts
useAsyncQuery({
  fetchPolicy: 'cache-first',
  query: GET_POSTS,
})
```

### 4) Migrate useApolloClient usage

Before (old pattern):

```ts
const { client, resolveClient } = useApolloClient()
await client.query({ query: GET_USERS })
await resolveClient('analytics').query({ query: GET_DASHBOARD })
```

After:

```ts
import { useApolloClient } from '@vue3-apollo/core'

const client = useApolloClient()
await client.query({ query: GET_USERS })

const analyticsClient = useApolloClient('analytics')
await analyticsClient.query({ query: GET_DASHBOARD })
```

### 5) Migrate mutation onDone handlers

Before:

```ts
onDone((result) => {
  console.log(result.data?.createUser.id)
})
```

After:

```ts
onDone((data) => {
  console.log(data.createUser.id)
})
```

### 6) Migrate loading tracking helpers

Prefer tracking helpers from `@vue3-apollo/core`:

```ts
import {
  useMutationsLoading,
  useQueriesLoading,
  useSubscriptionsLoading,
} from '@vue3-apollo/core'

const queriesBusy = useQueriesLoading('dashboard')
const mutationsBusy = useMutationsLoading('dashboard')
const subscriptionsBusy = useSubscriptionsLoading('dashboard')
```

`useApolloTracker` still exists as a deprecated alias, but new code should use `useApolloTrackingStore`.

## Case examples

### Case 1: happy path (import-only migration for core composables)

Goal:

1. Existing query/mutation/subscription code should continue working with minimal changes.

Action:

1. Replace imports to `@vue3-apollo/core`.
2. Keep composable call signatures unchanged for `useQuery`, `useMutation`, `useSubscription`.

Expected:

1. Same behavior with Apollo Client v4 compatibility.

### Case 2: edge case (Nuxt lazy query migration)

Goal:

1. Preserve lazy route fetch behavior after removing `useLazyAsyncQuery`.

Action:

1. Replace with `useAsyncQuery(..., { lazy: true })`.
2. Keep previous query options inside object argument.

Expected:

1. Data fetch remains lazy and route does not block unexpectedly.

### Case 3: failure case (mutation callback still expects result.data)

Symptom:

1. Runtime/type errors after migration in `onDone`.

Cause:

1. Callback now receives `data` directly, not `result` wrapper.

Recovery:

1. Remove `.data` access from `onDone` handlers.
2. Update callback typing and tests.

## Verification checklist

1. All imports from `@vue/apollo-composable` are removed.
2. Apollo Client version is v4+.
3. Nuxt `useAsyncQuery` calls use object options format.
4. `useLazyAsyncQuery` usage is removed.
5. Old `cache` boolean option is replaced by `fetchPolicy`.
6. `useApolloClient` call sites do not use `.client` or `resolveClient`.
7. Mutation `onDone` handlers no longer assume `result.data`.
8. Loading tracking helpers compile and behave as expected.
9. One SSR page and one client-side mutation flow are smoke-tested.

## Pitfalls

1. Migrating imports but forgetting Apollo Client v4 upgrade.
2. Keeping positional `useAsyncQuery` arguments in Nuxt code.
3. Using removed `useLazyAsyncQuery` API.
4. Assuming old `onDone` payload shape.
5. Keeping `cache: true/false` instead of fetch policy.
6. Keeping old `useApolloClient` access pattern (`client`, `resolveClient`).

## Cross-reference

1. `references/setup-core-vue3.md`
2. `references/setup-nuxt4.md`
3. `references/composables-use-query.md`
4. `references/composables-use-mutation.md`
5. `references/composables-use-apollo-client.md`
6. `references/tracking-and-loading.md`
7. `references/troubleshooting.md`
8. `references/testing-checklist.md`
