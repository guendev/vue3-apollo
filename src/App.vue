<script setup lang="ts">
import { useQuery } from '@/composables/useQuery'
import { UserByIdDocument } from '@/operations/codegen/graphql.ts'

const { result } = useQuery(UserByIdDocument, {
    userByIdId: 1
})
</script>

<template>
  <div>
    <button type="button">
      Click me
    </button>

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
