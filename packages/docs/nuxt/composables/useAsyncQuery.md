# useAsyncQuery

`useAsyncQuery` runs an Apollo `client.query` through Nuxt `useAsyncData`, providing SSR-ready `AsyncData`.

## Quick start

```vue
<script setup lang="ts">
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
  variables: { first: 10 }
})
</script>
```

## Signature

```ts
useAsyncQuery(options, config?)
```

## Parameters
- `options: UseAsyncQueryOptions<TData, TVariables>`
- `config?: AsyncDataOptions`

## Returns
- `AsyncData<T, ErrorLike | NuxtError | undefined>`

## Options
- `options.key?: string | Ref | Getter`
- `options.clientId?: string`
- `options` also includes Apollo query options.
- `config` follows Nuxt `AsyncDataOptions`.

## Notes
- `useAsyncQuery` is auto-imported when `apollo.autoImports` is enabled (default).
- If auto-imports are disabled, import from `#imports`.
- If Apollo returns `result.error`, `useAsyncQuery` throws and Nuxt exposes it on `error`.
- Use `await refresh()` for retries.

## Examples

### Case 1: SSR page data (default client)

```ts
const { data, pending, error } = await useAsyncQuery({
  query: GET_DASHBOARD
})
```

### Case 2: Named client + stable key + lazy mode

```ts
const route = useRoute()

const { data, pending, refresh } = await useAsyncQuery(
  {
    query: GET_ANALYTICS,
    variables: { id: route.params.id },
    clientId: 'analytics',
    key: () => `analytics:${String(route.params.id)}`
  },
  {
    lazy: true
  }
)

await refresh()
```

### Case 3: Manual retry flow in action handler

```ts
const { refresh, error } = await useAsyncQuery({
  query: GET_REPORT
})

const retry = async () => {
  await refresh()
  if (error.value) {
    console.error('Retry failed:', error.value)
  }
}
```

## Related
- [`useQuery`](/composables/useQuery)
- [Nuxt `useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data)
