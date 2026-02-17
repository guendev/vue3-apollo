<script setup lang="ts">
import { ref } from 'vue'
import { gql } from 'graphql-tag'
import { useSubscription } from '@vue3-apollo/core'

type Message = {
  id: string
  text: string
  createdAt: string
}

const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessageAdded($roomId: ID!) {
    messageAdded(roomId: $roomId) {
      id
      text
      createdAt
    }
  }
`

const roomId = ref('general')
const enabled = ref(true)
const messages = ref<Message[]>([])

const { error, loading, onData, start, stop } = useSubscription(
  MESSAGES_SUBSCRIPTION,
  () => ({ roomId: roomId.value }),
  { enabled }
)

onData((payload) => {
  const nextMessage = payload.messageAdded
  if (!nextMessage) return
  messages.value = [nextMessage, ...messages.value]
})

const connect = () => {
  enabled.value = true
  start()
}

const disconnect = () => {
  enabled.value = false
  stop()
}
</script>

<template>
  <section class="subscription-feed-example">
    <h2>Live feed</h2>

    <div class="toolbar">
      <input v-model="roomId" type="text" placeholder="Room id">

      <button type="button" @click="connect">
        Connect
      </button>

      <button type="button" @click="disconnect">
        Disconnect
      </button>
    </div>

    <p v-if="loading">Waiting for events...</p>
    <p v-if="error">{{ error.message }}</p>

    <ul>
      <li v-for="message in messages" :key="message.id">
        <strong>{{ message.text }}</strong>
        <small>{{ message.createdAt }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.subscription-feed-example {
  display: grid;
  gap: 12px;
}

.toolbar {
  display: flex;
  gap: 8px;
}

ul {
  display: grid;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  display: grid;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
}
</style>
