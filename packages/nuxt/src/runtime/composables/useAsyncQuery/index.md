# use useAsyncQuery

Nuxt-friendly helper that runs an Apollo **query** inside Nuxt’s `useAsyncData`, giving you an `AsyncData` object (`data`, `pending`, `error`, `refresh`, …) with full SSR support.

It accepts Apollo `QueryOptions`, an optional `key`, and an optional `clientId` for multi-client setups.

## Quick start

```ts
<script setup lang="ts">
import { useAsyncQuery } from 'vue3-apollo/nuxt'
import { GET_POSTS } from '~/gql/queries'

const { data, pending, error, refresh } = await useAsyncQuery(
  {
    query: GET_POSTS,
    variables: {
      limit: 10,
    },
  },
)
</script>
```

## API

```ts
const asyncData = useAsyncQuery(options, config?)
```

- **`options`** – `UseAsyncQueryOptions<TData, TVariables>`
- **`config?`** – Nuxt `AsyncDataOptions` (e.g., `lazy`, `server`, `immediate`, `transform`, `pick`, `default`, …)

**Returns:** `AsyncData<T, ErrorLike | NuxtError | undefined>`

## Behavior
- Runs `client.query` server‑side on the initial request and reuses the result client‑side via Nuxt hydration.
- If **`key` is not provided**, a deterministic key is generated with `ohash` based on the **printed** query and **unref’d** variables.
- If `queryResult.error` exists, it is **thrown**, so `useAsyncData` places it in `error`.
- `variables` are passed as‑is to Apollo; you can provide plain objects or refs/computed via Nuxt/Vue.

## Error handling
- If Apollo returns `result.error`, it is thrown; Nuxt catches it and sets the `error` field of `AsyncData`.
- The `error` type is `ErrorLike | NuxtError | undefined` to align with Apollo and Nuxt error shapes.
- Use `try/catch` with `await refresh()` for manual retries, or rely on Nuxt’s `retry` options if you wrap this helper.

---

**See also**
- [`apolloPlugin`](../apolloPlugin) — register single/multiple Apollo clients.
- [`useQuery`](../useQuery) — reactive queries in Vue components.
- Nuxt [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — underlying data fetching API used by this helper.