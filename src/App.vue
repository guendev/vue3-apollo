<script setup lang="ts">
import { ref } from 'vue'

import { useQuery } from '@/composables/useQuery.ts'
import { UserByIdDocument } from '@/operations/codegen/graphql.ts'

const enabled = ref(true)

const vars = ref({ userByIdId: 1 })

const { error, refetch, result } = useQuery(UserByIdDocument, vars, {
    enabled
})
</script>

<template>
  <div>
    <div>
      <button type="button" @click="refetch({ userByIdId: vars.userByIdId })">
        Refresh
      </button>
      <button type="button" @click="enabled = !enabled">
        {{ enabled ? 'Disable' : 'Enable' }} Query
      </button>
    </div>

    <div class="layer">
      <input v-model.number="vars.userByIdId" type="number">
    </div>

    <div class="layer">
      <strong>Query Status:</strong> {{ enabled ? 'Enabled' : 'Disabled' }}
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
