<script setup lang="ts">
import { ref } from 'vue'
import { gql } from 'graphql-tag'
import { useMutation } from '@vue3-apollo/core'

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
    }
  }
`

const title = ref('')
const body = ref('')
const feedback = ref('')

const { error, loading, mutate, reset } = useMutation(CREATE_POST, {
  throws: 'always',
})

const onSubmit = async () => {
  feedback.value = ''

  try {
    await mutate({
      input: {
        body: body.value,
        title: title.value,
      },
    })

    feedback.value = 'Post created successfully.'
    title.value = ''
    body.value = ''
  } catch (e) {
    feedback.value = e instanceof Error ? e.message : 'Create post failed.'
  }
}

const onReset = () => {
  reset()
  feedback.value = ''
  title.value = ''
  body.value = ''
}
</script>

<template>
  <section class="mutation-form-example">
    <h2>Create post</h2>

    <form @submit.prevent="onSubmit">
      <label>
        Title
        <input v-model="title" type="text" required>
      </label>

      <label>
        Body
        <textarea v-model="body" rows="5" required />
      </label>

      <div class="actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save' }}
        </button>

        <button type="button" :disabled="loading" @click="onReset">
          Reset
        </button>
      </div>
    </form>

    <p v-if="error">{{ error.message }}</p>
    <p v-if="feedback">{{ feedback }}</p>
  </section>
</template>

<style scoped>
.mutation-form-example {
  display: grid;
  gap: 12px;
  max-width: 480px;
}

form {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
