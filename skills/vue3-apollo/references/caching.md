# Caching

## When to use

Use this file when implementing or debugging Apollo cache behavior in Vue 3 or Nuxt 4 with `@vue3-apollo/core` and `@vue3-apollo/nuxt`.

## Cache model in vue3-apollo

`@vue3-apollo/*` uses Apollo `InMemoryCache` directly.
Core behavior to remember:

1. Query and mutation composables rely on Apollo cache semantics.
2. `useFragment` is cache-first by design (read/watch cache, not network fetch).
3. Nuxt runtime creates one cache per configured client and hydrates from SSR payload.

## Setup patterns

### Core (Vue 3) cache setup

```ts
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from '@apollo/client/link/http'

const client = new ApolloClient({
  cache: new InMemoryCache({
    possibleTypes: {
      Node: ['User', 'Post'],
    },
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: ['search'],
            merge(existing = [], incoming: unknown[]) {
              return [...existing, ...incoming]
            },
          },
        },
      },
      User: {
        keyFields: ['id'],
      },
    },
  }),
  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
})
```

### Nuxt module cache setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql',
      },
    },
    inMemoryCacheOptions: {
      possibleTypes: {
        Node: ['User', 'Post'],
      },
      typePolicies: {
        Query: {
          fields: {
            feed: {
              keyArgs: false,
              merge(existing = [], incoming: unknown[]) {
                return [...existing, ...incoming]
              },
            },
          },
        },
      },
    },
  },
})
```

### Nuxt runtime cache patching (advanced)

Use when policies must be added at runtime.

```ts
// app/plugins/01.apollo-cache.ts
import type { InMemoryCache } from '@apollo/client/cache'

export default defineNuxtPlugin(() => {
  const client = useApolloClient('default')
  const cache = client.cache as InMemoryCache

  cache.policies.addPossibleTypes({
    Node: ['User', 'Post'],
  })

  cache.policies.addTypePolicies({
    Query: {
      fields: {
        notifications: {
          keyArgs: false,
          merge(existing = [], incoming: unknown[]) {
            return [...incoming, ...existing]
          },
        },
      },
    },
  })
})
```

## Fetch policy guide

Use policy by behavior, not preference:

1. `cache-first`: default read path for stable screens.
2. `network-only`: force fresh data (admin dashboards, critical freshness).
3. `cache-and-network`: show cache quickly, then refresh from network.
4. `no-cache`: do not store response.

`useQuery` example:

```ts
const { result } = useQuery(GET_PROFILE, undefined, {
  fetchPolicy: 'network-only',
  nextFetchPolicy: 'cache-first',
})
```

Nuxt SSR note:

1. For page-level SSR contract, prefer `useAsyncQuery`.
2. `useQuery({ prefetch: true })` is SSR-capable but not a replacement for Nuxt `AsyncData` flow.

## Cache update after mutations

Use one of these strategies explicitly:

1. `update` / `cache.modify` for precise local updates.
2. `refetchQueries` when update logic is expensive or risky.
3. `optimisticResponse` for responsive UI.

```ts
const { mutate } = useMutation(DELETE_POST, {
  update(cache, { data }) {
    const postId = data?.deletePost?.id
    if (!postId) return

    cache.evict({
      id: cache.identify({ __typename: 'Post', id: postId }),
    })
    cache.gc()
  },
})
```

## Fragment-first cache reads

Use `useFragment` when entity is already normalized in cache:

```ts
const { complete, result } = useFragment(USER_CARD_FRAGMENT, {
  from: () => `User:${userId.value}`,
})

if (complete.value) {
  console.log(result.value?.data.name)
}
```

If fragment stays incomplete:

1. Verify cache id resolution (`__typename` + id/keyFields).
2. Verify fragment fields are already in cache.

## SSR and hydration cache behavior (Nuxt)

Current Nuxt runtime behavior:

1. On server, cache is extracted into Nuxt payload after render.
2. On client, cache is restored from payload before operations run.
3. Query/subscription links are re-created per client; cache persists through hydration payload.

Practical check:

1. First render has server data.
2. Client hydration does not flash to empty state.

## Case examples

### Case 1: happy path (infinite list merge)

Goal:

1. Keep one logical list cache entry across pages.

Action:

1. Use `keyArgs: false` and merge arrays in `typePolicies`.
2. Use `fetchMore` in `useQuery`.

Expected:

1. New page data appends without replacing old list.

### Case 2: edge case (fresh first fetch, cached subsequent reads)

Goal:

1. Avoid stale first load but reduce repeated network calls.

Action:

1. Set `fetchPolicy: 'network-only'`.
2. Set `nextFetchPolicy: 'cache-first'`.

Expected:

1. First request is fresh, later reads are cache-efficient.

### Case 3: failure case (cache duplication or stale entity)

Symptom:

1. Same logical record appears multiple times or does not update everywhere.

Cause:

1. Missing/wrong `keyFields`, or merge policy overwriting incorrectly.

Recovery:

1. Define correct `keyFields` for entity type.
2. Re-check field `merge` and `keyArgs` policies.
3. Verify `cache.identify(...)` returns stable id.

## Verification checklist

1. `InMemoryCache` options are explicitly configured where needed.
2. Key entities have stable `keyFields` (or default `id` semantics).
3. Pagination fields have intentional `keyArgs` and `merge`.
4. Mutation write path (`update`/`refetchQueries`) is explicit.
5. Fragment reads are complete for expected entities.
6. Nuxt SSR hydration restores cache without mismatch/flicker.
7. Multi-client cache behavior is validated per `clientId`.

## Pitfalls

1. Using default cache behavior for pagination without field policies.
2. Relying on `refetchQueries` everywhere and ignoring cache update strategy.
3. Expecting `useFragment` to fetch missing fields from network.
4. Overriding Apollo link chain and forgetting to revalidate cache-related flows.
5. Ignoring `keyFields` for non-standard identifiers.

## Cross-reference

1. `references/composables-use-query.md`
2. `references/composables-use-mutation.md`
3. `references/composables-use-fragment.md`
4. `references/setup-core-vue3.md`
5. `references/setup-nuxt4.md`
6. `references/nuxt-custom-integration.md`
7. `references/troubleshooting.md`
8. `references/testing-checklist.md`
