# useAsyncQuery

Nuxt-friendly helper that runs an Apollo **query** inside Nuxt's `useAsyncData`, returning an `AsyncData` object (`data`, `pending`, `error`, `refresh`, `fetchMore`, …) with full SSR support and pagination capabilities.

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

const { data, pending, error, refresh, fetchMore } = await useAsyncQuery({
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

Returns: `AsyncDataWithFetchMore<T, ErrorLike | NuxtError | undefined, TVariables>`

The return object includes all standard `AsyncData` properties plus:
- **`fetchMore`** – Function to load more data and merge with existing results (for pagination)

## Pagination with `fetchMore`

`useAsyncQuery` now supports pagination through the `fetchMore` function, which allows you to load additional data and merge it with your existing results.

```vue
<script setup lang="ts">
import { useAsyncQuery } from '@vue3-apollo/nuxt'
import { gql } from 'graphql-tag'

const GET_POSTS = gql`
  query GetPosts($offset: Int!, $limit: Int!) { 
    posts(offset: $offset, limit: $limit) {
      id
      title
      content
    }
  }
`

const { data, pending, fetchMore } = await useAsyncQuery({
  query: GET_POSTS,
  variables: { offset: 0, limit: 10 }
})

async function loadMore() {
  await fetchMore({
    variables: {
      offset: data.value.posts.length
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) return previousResult
      return {
        posts: [...previousResult.posts, ...fetchMoreResult.posts]
      }
    }
  })
}
</script>

<template>
  <div>
    <div v-for="post in data?.posts" :key="post.id">
      {{ post.title }}
    </div>
    <button @click="loadMore" :disabled="pending">
      Load More
    </button>
  </div>
</template>
```

## Error handling
- If Apollo returns `result.error`, it is thrown; Nuxt catches it and sets the `error` field.
- Use `try/catch` with `await refresh()` for manual retries.
- Errors in `fetchMore` are also caught and set in the `error` field.

## When to use `useQuery` instead

While `useAsyncQuery` now supports `fetchMore` for pagination, you may still prefer `useQuery` if you need:

- **Real-time updates** – Subscribe to query updates via Apollo's ObservableQuery
- **Fine-grained control** – Access to `start()`, `stop()`, and other observable methods
- **Reactive variables** – Automatic re-fetching when variables change

`useQuery` also supports SSR through the `prefetch` option (enabled by default). See the [`useQuery` documentation](../../composables/useQuery) for more details.

---

See also
- [`useQuery`](../../composables/useQuery) — reactive queries with real-time updates and advanced control.
- Nuxt [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — underlying fetching API used by this helper.
