<script setup lang="ts">
import { ref } from 'vue'

import { useQuery } from '@/composables/useQuery.ts'
import { UserByIdDocument } from '@/operations/codegen/graphql.ts'

const { error, refetch, result } = useQuery(UserByIdDocument, {
    userByIdId: 1
})

const userId = ref(1000000000)
</script>

<template>
  <div>
    <div>
      <button type="button" @click="refetch({ userByIdId: userId })">
        Refresh
      </button>
    </div>

    <div class="layer">
      <input v-model.number="userId" type="number">
    </div>

    <div class="layer">
      {{ error }}
    </div>

    <div class="layer">
      {{ result?.userById }}
    </div>
  </div>
</template>

<style>
.layer {
    margin-top: 20px;
}
</style>
