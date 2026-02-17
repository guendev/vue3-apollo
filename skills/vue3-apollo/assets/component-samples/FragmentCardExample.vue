<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useFragment } from '@vue3-apollo/core'

const props = defineProps<{
  userId: string
}>()

const enabled = ref(true)

const USER_CARD_FRAGMENT = gql`
  fragment UserCard on User {
    id
    name
    email
    avatarUrl
  }
`

const { complete, error, missing, result, start, stop } = useFragment(USER_CARD_FRAGMENT, {
  enabled,
  from: computed(() => `User:${props.userId}`),
})

const user = computed(() => result.value?.data)

const pause = () => {
  enabled.value = false
  stop()
}

const resume = () => {
  enabled.value = true
  start()
}
</script>

<template>
  <section class="fragment-card-example">
    <h2>User card</h2>

    <div class="actions">
      <button type="button" @click="resume">
        Start
      </button>
      <button type="button" @click="pause">
        Stop
      </button>
    </div>

    <p v-if="error">{{ error.message }}</p>

    <article v-else-if="user">
      <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name || 'avatar'">
      <h3>{{ user.name ?? 'Unknown user' }}</h3>
      <p>{{ user.email ?? 'No email in cache' }}</p>
      <p>Complete: {{ complete ? 'yes' : 'no' }}</p>
    </article>

    <p v-else>No fragment data in cache yet.</p>

    <pre v-if="missing">{{ missing }}</pre>
  </section>
</template>

<style scoped>
.fragment-card-example {
  display: grid;
  gap: 12px;
  max-width: 320px;
}

.actions {
  display: flex;
  gap: 8px;
}

article {
  border: 1px solid #ddd;
  border-radius: 10px;
  display: grid;
  gap: 8px;
  padding: 10px;
}

img {
  border-radius: 999px;
  height: 64px;
  object-fit: cover;
  width: 64px;
}
</style>
