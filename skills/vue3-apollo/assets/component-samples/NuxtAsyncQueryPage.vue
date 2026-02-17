<script setup lang="ts">
import { gql } from 'graphql-tag'

const route = useRoute()

const page = computed(() => {
  const raw = Number(route.query.page ?? 1)
  return Number.isFinite(raw) && raw > 0 ? raw : 1
})

const GET_POSTS = gql`
  query GetPosts($page: Int!) {
    posts(page: $page) {
      id
      title
    }
  }
`

const { data, error, pending, refresh } = await useAsyncQuery(
  {
    query: GET_POSTS,
    variables: computed(() => ({ page: page.value })),
  },
  {
    watch: [page],
  }
)

const posts = computed(() => data.value?.posts ?? [])
</script>

<template>
  <main class="nuxt-async-query-page">
    <h1>Posts page {{ page }}</h1>

    <p v-if="pending">Loading...</p>
    <p v-else-if="error">{{ error.message }}</p>

    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>

    <button type="button" @click="refresh()">
      Refresh
    </button>
  </main>
</template>

<style scoped>
.nuxt-async-query-page {
  display: grid;
  gap: 12px;
}

ul {
  display: grid;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
