<script setup lang="ts">
import { ref } from 'vue'

import { useQuery } from '@/composables/useQuery'
import { UserByIdDocument } from '@/operations/codegen/graphql.ts'

const { refetch, result } = useQuery(UserByIdDocument, {
    userByIdId: 1
})

const userId = ref(1)
</script>

<template>
  <div>
    <div>
      <button type="button" @click="refetch({ userByIdId: userId })">
        Refresh
      </button>
    </div>

    <input v-model.number="userId" type="number">

    <div class="data">
      {{ result?.userById }}
    </div>
  </div>
</template>

<style>
.data {
    margin-top: 20px;
}
</style>
