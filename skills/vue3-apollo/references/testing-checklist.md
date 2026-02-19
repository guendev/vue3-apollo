# Testing Checklist

## When to use

Use this file before merging any change that touches `@vue3-apollo/core` or `@vue3-apollo/nuxt` integration, composables, or docs examples.

## Test strategy

Apply checks in this order:

1. Setup integrity (plugin/module/client registry).
2. Operation behavior (query, lazy query, mutation, subscription, fragment).
3. Nuxt SSR + hydration behavior.
4. Multi-client routing behavior.
5. Error and tracking behavior.

## Pre-merge gate

Run project checks first (adapt to current project scripts):

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If this is a consumer app (not library repo), run equivalent local scripts:

1. Typecheck.
2. Build.
3. One runtime smoke flow in dev.

## Core Vue 3 checklist

1. `apolloPlugin` is installed with non-empty `clients`.
2. `useApolloClient()` returns a valid default client.
3. `useQuery` returns data and updates loading state.
4. `useLazyQuery` does not run before `execute()`, then resolves data on execute.
5. `useMutation` handles success and error path.
6. `useSubscription` receives events on client when ws is configured.
7. `useFragment` reads cache data and reacts to cache updates.
8. No runtime error for missing client registry or wrong `clientId`.

Smoke snippet:

```ts
import { gql } from 'graphql-tag'
import { useApolloClient, useQuery } from '@vue3-apollo/core'

const HEALTH = gql`query Health { __typename }`

const client = useApolloClient()
await client.query({ query: HEALTH })

const { result, loading, error } = useQuery(HEALTH)
```

## Nuxt 4 checklist

1. `modules: ['@vue3-apollo/nuxt']` is enabled.
2. `apollo.clients.default.httpEndpoint` exists.
3. `useAsyncQuery` works for a page-level SSR query.
4. If `apollo.autoImports` is false, all used composables are manually imported.
5. If `wsEndpoint` is configured, `graphql-ws` is installed and subscription works on client.
6. No warning/error for `No Apollo clients configured`.

SSR page snippet:

```vue
<script setup lang="ts">
import { gql } from 'graphql-tag'

const GET_POSTS = gql`
  query GetPosts {
    posts { id title }
  }
`

const { data, pending, error } = await useAsyncQuery({
  query: GET_POSTS,
})
</script>
```

## SSR and hydration checks

1. First request renders expected server data (not empty shell for SSR path).
2. Hydration does not cause immediate duplicate fetch regressions.
3. `useQuery({ prefetch: true })` path works when used, but Nuxt page SSR still prefers `useAsyncQuery`.
4. No client/server mismatch caused by runtime-only subscription logic.

## Multi-client checks

1. Default client operations still work after adding named clients.
2. Named client operations (`clientId`) hit expected endpoint.
3. Invalid `clientId` fails with clear error.
4. Custom plugin integration only affects intended client.

## Error hook and recovery checks (Nuxt)

1. `nuxtApp.hook('apollo:error', ...)` receives payload for:
- GraphQL errors
- Network errors
- Protocol errors
2. Custom error handling does not break normal request flow.
3. If `client.setLink(...)` is used, verify retry/auth/ws behavior is preserved.

## Tracking and loading checks

1. `useQueriesLoading`, `useMutationsLoading`, `useSubscriptionsLoading` toggle as expected.
2. Global tracking counters return to zero after settled operations.
3. Owner-scoped tracking uses stable ids when aggregation is intended.
4. No stuck loading state after errors.

## Case examples

### Case 1: happy path (full Nuxt flow)

Goal:

1. Verify one SSR query + one mutation + one subscription in a Nuxt app.

Pass criteria:

1. SSR query renders on first load.
2. Mutation updates UI and no stale loading.
3. Subscription receives at least one event on client.

### Case 2: edge case (autoImports disabled)

Goal:

1. Ensure app works with `apollo.autoImports: false`.

Pass criteria:

1. Manual imports are added from `@vue3-apollo/core` and `@vue3-apollo/nuxt`.
2. No `is not defined` composable runtime errors.

### Case 3: failure case (ws dependency missing)

Goal:

1. Confirm failure is detected and diagnosed quickly.

Pass criteria:

1. Warning about missing `graphql-ws` appears.
2. Query/mutation still work via HTTP.
3. Subscription test is marked failed with clear action item.

## Release blocker criteria

Block merge if any of these are true:

1. Client registry setup errors remain.
2. SSR route expected to be server-rendered fails to preload data.
3. Multi-client routing selects wrong endpoint.
4. Link customization breaks ws split or auth behavior.
5. Tracking/loading remains non-zero after idle state.

## Pitfalls

1. Only testing query success path and skipping mutation/subscription error paths.
2. Treating local dev success as proof of SSR correctness without first-render verification.
3. Forgetting to retest named clients after modifying default client config.
4. Overriding Apollo link chain without re-validating ws and retry behavior.
5. Skipping tracking checks after changing loading orchestration.

## Cross-reference

1. `references/setup-core-vue3.md`
2. `references/setup-nuxt4.md`
3. `references/nuxt-custom-integration.md`
4. `references/troubleshooting.md`
5. `references/composables-use-query.md`
6. `references/composables-use-lazy-query.md`
7. `references/composables-use-mutation.md`
8. `references/composables-use-subscription.md`
9. `references/tracking-and-loading.md`
