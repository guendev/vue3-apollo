# Migration

This plugin is designed to make migration from **@vue/apollo-composable** effortless.

## Quick Overview
1. Upgrade to **Apollo Client v4**
2. Update imports from `@vue/apollo-composable` → `@vue3-apollo/core`
3. Integrate new **loading tracking system** (optional but recommended)
4. Review **Breaking Changes** and update types or options accordingly

## 1. Migration Steps

### 1.1 Update Apollo Client

Vue3 Apollo requires **Apollo Client v4** or higher.

```bash
npm install @apollo/client@^4
```

```json
{
  "@apollo/client": "^4.x.x"
}
```

### 1.2 Update Imports

Simply change imports from `@vue/apollo-composable` to `@vue3-apollo/core`.

**Before:**
```ts
import { useQuery } from '@vue/apollo-composable'
```

**After:**
```ts
import { useMutation, useQuery, useSubscription } from '@vue3-apollo/core'
```

Most composables keep familiar APIs, so migration is usually straightforward after updating imports.

## 2. Enhanced Loading Tracking

Vue3 Apollo introduces an improved tracking system to monitor loading states globally or per component.

### Example
```ts
import { useQueriesLoading } from '@vue3-apollo/core'

// Track loading of queries in a specific component or scope
const isLoading = useQueriesLoading('dashboard')
```

You can pass an optional **`id`** parameter to share loading states across components.

### Available Helpers
- `useQueriesLoading(id?)`
- `useMutationsLoading(id?)`
- `useSubscriptionsLoading(id?)`

## 3. Breaking Changes

The new `useAsyncQuery` for Nuxt is close to the old one but there are some **notable differences** you should adjust for:

### 3.1) Positional overloads removed → object options only
**Before (positional):**
```ts
useAsyncQuery(query, variables?, clientId?, context?, options?)
```
**After (object):**
```ts
useAsyncQuery({
    clientId, // optional
    context, // optional
    query,
    variables,
})
```
> This simplifies typing and aligns with Apollo `QueryOptions`.

### 3.2) `useLazyAsyncQuery` removed
Use `useAsyncQuery` with Nuxt `AsyncData` options instead of the dedicated "lazy" variant.

**Before:**
```ts
useLazyAsyncQuery({
    query,
    variables,
})
```
**After (Nuxt AsyncData):**
```ts
useAsyncQuery(
    {
        query,
        variables,
    },
    {
        lazy: true, // do not block navigation; fetch after route resolves
    },
)
```

### 3.3) `cache` option removed
The old `cache?: boolean` flag is replaced by **Apollo fetch policies**.

**Before:**
```ts
useAsyncQuery({
    cache: true,
    query,
    variables,
})
```
**After:**
```ts
useAsyncQuery({
    fetchPolicy: 'cache-first',
    query,
    variables,
})
```

### 3.4) `useApolloClient` changes

The old helper returned an object with `resolveClient` and `client`. The new helper is a **function** that returns the Apollo client instance directly.

**Before:**
```ts
// Old package
const { resolveClient, client } = useApolloClient()

// default client
await client.query({ query: GET_USERS })

// named client
const analytics = resolveClient('analytics')
await analytics.query({ query: GET_DASHBOARD })
```

**After:**
```ts
// @vue3-apollo/core
import { useApolloClient } from '@vue3-apollo/core'

// default (first available)
const client = useApolloClient()
await client.query({ query: GET_USERS })

// named client
const analyticsClient = useApolloClient('analytics')
await analyticsClient.query({ query: GET_DASHBOARD })
```

**Notes**
- No `resolveClient` function, no `.client` property.
- If **no clients are registered**, an error is thrown.
- If the **requested id is missing**, an error is thrown with the list of available clients.
- Register clients via `apolloPlugin` and include a `default` client.

### 3.5) `useMutation onDone` changes

In the old API, `onDone` received a `MutateResult` object wrapping the mutation data, whereas in the new API it directly provides the **typed mutation data (TData)**.

**Before:**
```ts
onDone((result, { client }) => {
  // result.data contains mutation result
  console.log(result.data?.createUser.id)
  // access Apollo client through context
  client.cache.modify({ ... })
})
```

**After:**
```ts
onDone((data, context) => {
  // data is the mutation result directly
  console.log(data.createUser.id)
  // access Apollo client through context
  context.client.cache.modify({ ... })
})
```

**Key Differences:**
- Old: `result` was of type `MutateResult<TData>` → contained `{ data, error, extensions }`.
- New: first argument is `TData`, not wrapped inside `data`.
- Second argument `context` still includes `{ client }`.

## 4. Summary
| Feature                         | Old                              | New                                                 | Notes                                                        |
|---------------------------------|----------------------------------|-----------------------------------------------------|--------------------------------------------------------------|
| Async Query (SSR)               | `useAsyncQuery` from old package | `useAsyncQuery` (object options)                    | Unified API for Nuxt 4                                       |
| Lazy Async Query                | `useLazyAsyncQuery`              | Removed → use `useAsyncQuery` with `{ lazy: true }` | Simplified lazy fetching                                     |
| Query / Mutation / Subscription | `@vue/apollo-composable`         | `@vue3-apollo/core`                                 | Same core API, except for `useMutation`'s `onDone` callback. |
| Global Loading Tracking         | ✅                                | ✅                                                   | via `useApolloTrackingStore` (`useApolloTracker` deprecated alias) |
| Component-scoped Loading        | ❌                                | ✅                                                   | pass `id` to track across scopes                             |
| Apollo v4 Support               | Manual                           | ✅                                                   | Native                                                       |

## 5. Example Migration

**Before:**
```ts
import { useQuery } from '@vue/apollo-composable'

import MY_QUERY from './myQuery.gql'

const { error, loading, result } = useQuery(MY_QUERY)
```

**After:**
```ts
import { useQuery } from '@vue3-apollo/core'

import MY_QUERY from './myQuery.gql'

const { error, loading, result } = useQuery(MY_QUERY)
```

Optionally track loading across components:
```ts
import { useQueriesLoading } from '@vue3-apollo/core'

const isLoading = useQueriesLoading('dashboard')
```

🎉 **Migration complete!** Replace imports, update Apollo Client to v4, and enjoy new global tracking.
