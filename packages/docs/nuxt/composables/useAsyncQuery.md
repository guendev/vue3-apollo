# useAsyncQuery

Nuxt-friendly helper that runs an Apollo **query** inside Nuxt’s `useAsyncData`, returning an `AsyncData` object (`data`, `pending`, `error`, `refresh`, …) with full SSR support.

It accepts Apollo `QueryOptions`, an optional `key`, and an optional `clientId` for multi-client setups.

## Quick start

```vue
<script setup lang="ts">
import { useAsyncQuery } from '@vue3-apollo/nuxt'
import { gql } from 'graphql-tag'

const GET_POSTS = gql`
  query GetPosts($first: Int) { 
    posts(first: $first) {
      id
      title 
   }
  }
`

const { data, pending, error, refresh } = await useAsyncQuery({
  query: GET_POSTS,
  variables: { first: 10 },
})
</script>
```

## API

```ts
const asyncData = useAsyncQuery(options, config?)
```

- `options` – `UseAsyncQueryOptions<TData, TVariables>`
- `config?` – Nuxt `AsyncDataOptions` (e.g., `lazy`, `server`, `immediate`, `transform`, `pick`, `default`, …)

Returns: `AsyncData<T, ErrorLike | NuxtError | undefined>`

## Error handling
- If Apollo returns `result.error`, it is thrown; Nuxt catches it and sets the `error` field.
- Use `try/catch` with `await refresh()` for manual retries.

---

See also
- [`useQuery`](../../composables/useQuery) — reactive queries in Vue components.
- Nuxt [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — underlying fetching API used by this helper.
