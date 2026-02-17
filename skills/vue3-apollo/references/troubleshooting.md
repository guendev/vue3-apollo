# Troubleshooting

## When to use

Use this file when a Vue 3 or Nuxt 4 app using `@vue3-apollo/core` or `@vue3-apollo/nuxt` has runtime errors, missing data, or unexpected loading behavior.

## Fast triage checklist

Run this order first:

1. Confirm packages are installed in consumer app:
`@vue3-apollo/core`, and for Nuxt: `@vue3-apollo/nuxt`.
2. Confirm at least one client exists (`default` recommended).
3. Confirm app setup path:
- Vue: `app.use(apolloPlugin, { clients })`
- Nuxt: `modules: ['@vue3-apollo/nuxt']` and `apollo.clients.default.httpEndpoint`
4. Confirm imports and auto-import behavior:
- Nuxt `apollo.autoImports: true` or manual imports from public packages.
5. Confirm transport dependencies:
- `graphql-ws` installed if using subscriptions.
6. Confirm error source:
- Apollo operation error
- setup/injection error
- SSR/hydration flow issue

## Error signature map

### `[useApolloClients] Apollo clients registry not found. Did you forget to install ApolloPlugin?`

Cause:

1. Apollo client registry was not provided to Vue app.
2. Composable called before plugin install or outside app context.

Fix:

1. Install plugin in app entry:

```ts
import { createApp } from 'vue'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from '@apollo/client/link/http'
import { apolloPlugin } from '@vue3-apollo/core'

const app = createApp(App)

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
  cache: new InMemoryCache(),
})

app.use(apolloPlugin, {
  clients: {
    default: client,
  },
})
```

2. Ensure composables are called inside `setup()` or active component scope.

### `[ApolloPlugin] No Apollo clients provided`

Cause:

1. `clients` object is empty.

Fix:

1. Provide at least one client under `clients.default`.

### `[@vue3-apollo/nuxt] No Apollo clients configured.` (warning) or `[vue3-apollo] No Apollo clients configured` (runtime error)

Cause:

1. Nuxt module missing `apollo.clients`.
2. Runtime config does not include any client.

Fix:

1. Configure client in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@vue3-apollo/nuxt'],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://api.example.com/graphql',
      },
    },
  },
})
```

2. Restart dev server after config changes.

### `[useApolloClient] Client "X" not found. Available clients: ...`

Cause:

1. Requested `clientId` does not exist in configured clients.
2. Typo or env-conditional config removed expected client.

Fix:

1. Align `clientId` with actual config keys.
2. Verify available clients:

```ts
import { useApolloClients } from '@vue3-apollo/core'

const clients = useApolloClients()
console.log(Object.keys(clients))
```

### `Failed to initialize WebSocket link... Make sure "graphql-ws" package is installed`

Cause:

1. `wsEndpoint` configured but `graphql-ws` is missing.
2. WS endpoint invalid/unreachable.

Fix:

1. Install `graphql-ws`.
2. Verify `apollo.clients.*.wsEndpoint` format (`wss://...`).
3. Re-test using a real subscription operation.

### `[useQuery] ... outside of a scope` or `[useSubscription] ... outside of a scope` or `[useFragment] ... outside of a scope`

Cause:

1. Composable executed without active Vue scope.
2. Auto cleanup cannot be registered.

Fix:

1. Move composable call into component `setup()` or another scoped composable.
2. If intentionally outside scope, manage lifecycle manually (`stop()` where available).

## Symptom routing

### Symptom: Nuxt says composable is undefined

Cause:

1. `apollo.autoImports` disabled.
2. Module not installed in `modules`.

Fix:

1. Enable `apollo.autoImports: true`, or import manually:

```ts
import { useQuery } from '@vue3-apollo/core'
import { useAsyncQuery } from '@vue3-apollo/nuxt'
```

### Symptom: first render has no data in Nuxt page

Cause:

1. Using client-only flow where SSR blocking data is expected.
2. Query disabled (`enabled: false`) or wrong variables at SSR time.

Fix:

1. Use page-level SSR flow:

```ts
const { data, pending, error } = await useAsyncQuery({
  query: GET_POSTS,
})
```

2. For `useQuery`, verify `prefetch` and `enabled` logic during SSR.

### Symptom: subscriptions never receive data

Cause:

1. Running on server (subscriptions are client-only).
2. Missing ws setup or custom `setLink` replaced ws split chain.

Fix:

1. Confirm subscription code runs on client.
2. Confirm `wsEndpoint` + `graphql-ws`.
3. If custom link override is used, preserve ws split behavior.

### Symptom: loading flag appears stuck

Cause:

1. Mutation/query flow failed to reset local state.
2. Tracking refs are unbalanced in custom code.

Fix:

1. Use `try/finally` in custom loading state.
2. Validate with tracking helpers:

```ts
import { useApolloTrackingStore } from '@vue3-apollo/core'

const { activeGlobal } = useApolloTrackingStore()
console.log(activeGlobal.value)
```

### Symptom: mutation error handling is confusing

Cause:

1. `useMutation` `throws` mode misunderstood.
2. Error handled in hook but not in caller flow.

Fix:

1. Pick explicit behavior:
- `throws: 'always'` if caller must catch exceptions.
- Otherwise, handle failure via `error` ref and `onError` callback.

2. Standard pattern:

```ts
const { mutate, error } = useMutation(CREATE_POST, {
  throws: 'always',
})

try {
  await mutate({ input })
} catch (e) {
  console.error(e)
}
```

## Case examples

### Case 1: happy path (resolve setup error quickly)

Input:

1. Error says `Apollo clients registry not found`.

Action:

1. Check plugin install path.
2. Add `app.use(apolloPlugin, { clients: { default: client } })`.
3. Re-test with a minimal `useQuery`.

Expected:

1. Composable resolves client and query executes.

### Case 2: edge case (Nuxt custom integration broke subscriptions)

Input:

1. Queries still work.
2. Subscriptions stopped after custom plugin with `client.setLink(...)`.

Action:

1. Inspect custom chain for ws split support.
2. Restore ws split or move to module-driven ws config.

Expected:

1. Subscription updates resume on client.

### Case 3: failure case (wrong client id in multi-client app)

Input:

1. Runtime throws `Client "analytics" not found`.

Action:

1. Print available clients and compare to config.
2. Fix typo or add missing client in setup.

Expected:

1. Requested composable uses valid client and operation succeeds.

## Verification checklist

1. Setup errors are cleared (`ApolloPlugin`, `No clients configured`, `Client not found`).
2. Query/mutation/subscription each tested once with expected endpoint.
3. Nuxt auto-import/manual import path is consistent with module config.
4. SSR page data path validated with `useAsyncQuery` where required.
5. If custom link override is present, auth/retry/error/ws behavior is verified.
6. Tracking counters return to zero after operations settle.

## Pitfalls

1. Treating Nuxt module config as runtime plugin customization.
2. Using internal monorepo imports instead of `@vue3-apollo/core` and `@vue3-apollo/nuxt`.
3. Overriding link chain and silently dropping ws split behavior.
4. Calling composables outside active Vue scope without manual lifecycle handling.
5. Assuming auto-import is enabled when `apollo.autoImports` was disabled.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/setup-core-vue3.md`
3. `references/setup-nuxt4.md`
4. `references/nuxt-custom-integration.md`
5. `references/composables-use-query.md`
6. `references/composables-use-mutation.md`
7. `references/composables-use-subscription.md`
8. `references/tracking-and-loading.md`
9. `references/testing-checklist.md`
