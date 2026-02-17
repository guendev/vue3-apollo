<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue3-apollo/core'

const GET_POSTS = gql`
  query GetPosts($search: String, $limit: Int!) {
    posts(search: $search, limit: $limit) {
      id
      title
    }
  }
`

const search = ref('')
const limit = ref(10)

const { error, loading, refetch, result } = useQuery(
  GET_POSTS,
  () => ({
    limit: limit.value,
    search: search.value.trim() || undefined,
  }),
  {
    debounce: 300,
    keepPreviousResult: true,
  }
)

const posts = computed(() => result.value?.posts ?? [])
</script>

<template>
  <section class="query-list-example">
    <h2>Posts</h2>

    <div class="toolbar">
      <input
        v-model="search"
        type="text"
        placeholder="Search posts..."
      >

      <select v-model.number="limit">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>

      <button type="button" @click="refetch()">
        Refetch
      </button>
    </div>

    <p v-if="loading">Loading posts...</p>
    <p v-else-if="error">{{ error.message }}</p>

    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.query-list-example {
  display: grid;
  gap: 12px;
}

.toolbar {
  display: flex;
  gap: 8px;
}
</style>
