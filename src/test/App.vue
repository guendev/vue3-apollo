<script setup lang="ts">
import { useMutation, useQuery } from '~lib'
import { reactive, ref } from 'vue'

import type { PostsQueryVariables } from '~/test/operations/codegen/graphql'

import { PostsDocument, UpdatePostDocument } from '~/test/operations/codegen/graphql'

const enabled = ref(true)

const vars = reactive<PostsQueryVariables>({
    first: 1,
    userId: 1
})

const { error, onResult, result } = useQuery(PostsDocument, vars, {
    enabled,
    keepPreviousResult: true
})

const title = ref('')

const { loading, mutate } = useMutation(UpdatePostDocument)

onResult((data) => {
    console.warn('onResult', data)
})
</script>

<template>
  <div>
    <div>
      <button type="button">
        Refresh
      </button>
      <button type="button" @click="enabled = !enabled">
        {{ enabled ? 'Disable' : 'Enable' }} Query
      </button>
    </div>

    <div class="layer">
      <label>User ID:</label>
      <input v-model.number="vars.userId" type="number" placeholder="User ID">
    </div>

    <div>
      <label>Title:</label>
      <input v-model="title" type="text" placeholder="Title">

      <button
        @click="mutate({ postId: 1, post: { title } })"
      >
        {{ loading ? 'Loading...' : 'Update' }}
      </button>
    </div>

    <div class="layer">
      <strong>Query Status:</strong> {{ enabled ? 'Enabled' : 'Disabled' }}
    </div>

    <div class="layer">
      {{ error }}
    </div>

    <div class="layer">
      {{ result?.posts }}
    </div>
  </div>
</template>

<style>
.layer {
    margin-top: 20px;
}
</style>
