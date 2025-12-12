<script setup lang="ts">
import type {
    PostsQueryVariables,
    TodosQuery,
    TodosQueryVariables
} from '@vue3-apollo/operations'

import { gql } from '@apollo/client'
import { useFragment, useMutation, useQuery } from '@vue3-apollo/core'
import { PostDetailFragmentDoc, PostsDocument, UpdatePostDocument } from '@vue3-apollo/operations'
import { computed, reactive, ref } from 'vue'

const enabled = ref(true)

const vars = reactive<PostsQueryVariables>({
    first: 1,
    userId: 1
})

const { error, result } = useQuery(PostsDocument, vars, {
    enabled,
    fetchPolicy: 'cache-first',
    keepPreviousResult: true,
    returnPartialData: true
})

const title = ref('')

const { loading, mutate, onDone: onUpdatedPost, onOptimistic } = useMutation(UpdatePostDocument)

onUpdatedPost((data) => {
    console.warn('onUpdatedPost', data)
})

onOptimistic((data) => {
    console.warn('onOptimistic', data)
})

const { data } = useFragment({
    fragment: PostDetailFragmentDoc,
    from: {
        __typename: 'Post',
        id: 1
    }
})

const rawTodoQuery = ref(`
query Todo($userId: Int, $first: Int) {
    todos(userId: $userId, first: $first) {
        id
    }
}
`)

const todoQuery = computed(() => gql(rawTodoQuery.value))

const { result: todosResult } = useQuery<TodosQuery, TodosQueryVariables>(todoQuery, vars, {
    keepPreviousResult: true
})

function handleUpdate() {
    mutate({
        post: {
            title: title.value
        },
        postId: 1
    }, {
        optimisticResponse: (vars) => {
            return {
                updatePost: {
                    __typename: 'Post',
                    id: vars.postId,
                    title: vars.post.title
                }
            }
        }
    })
}
</script>

<template>
  <div class="min-h-screen bg-[#0b1220] text-gray-200 antialiased">
    <div class="max-w-5xl mx-auto p-6">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">
          Apollo Demo
        </h1>
        <a
          target="_blank"
          href="https://graphqlplaceholder.vercel.app/graphql"
          class="text-sm text-gray-400 mt-1 hover:underline"
        >
          https://graphqlplaceholder.vercel.app/graphql
        </a>
      </header>

      <section class="bg-slate-900/60 border border-white/10 rounded-xl shadow-lg backdrop-blur p-4 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-colors">
            Refresh
          </button>
          <button type="button" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-gray-200 border border-white/10 transition-colors" @click="enabled = !enabled">
            {{ enabled ? 'Disable' : 'Enable' }} Query
          </button>
          <span class="ml-auto text-xs text-gray-400">Query Status: <strong class="text-gray-200">{{ enabled ? 'Enabled' : 'Disabled' }}</strong></span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="block text-sm text-gray-300">User ID</label>
            <input
              v-model.number="vars.userId" type="number" placeholder="User ID"
              class="w-full px-3 py-2 rounded-lg bg-slate-800/70 text-gray-100 placeholder:text-gray-500 border border-slate-700 focus:(outline-none ring-2 ring-indigo-500)"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm text-gray-300">First</label>
            <input
              v-model.number="vars.first" type="number" min="1" step="1" placeholder="First"
              class="w-full px-3 py-2 rounded-lg bg-slate-800/70 text-gray-100 placeholder:text-gray-500 border border-slate-700 focus:(outline-none ring-2 ring-indigo-500)"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm text-gray-300">Title</label>
            <div class="flex gap-2">
              <input
                v-model="title" type="text" placeholder="Title"
                class="flex-1 px-3 py-2 rounded-lg bg-slate-800/70 text-gray-100 placeholder:text-gray-500 border border-slate-700 focus:(outline-none ring-2 ring-indigo-500)"
              >
              <button
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white whitespace-nowrap transition-colors"
                @click="handleUpdate"
              >
                {{ loading ? 'Loading...' : 'Update' }}
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-white/10 pt-4 space-y-3">
          <div v-if="error" class="text-sm text-rose-400 bg-rose-900/20 border border-rose-700/40 rounded-lg p-3">
            {{ error }}
          </div>

          <div class="text-sm text-gray-300">
            Masked Posts:
          </div>
          <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
 {{ result?.posts }}
          </pre>

          <div class="text-sm text-gray-300">
            Fragments:
          </div>
          <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
 {{ data }}
          </pre>
        </div>
      </section>

      <section class="bg-slate-900/60 border border-white/10 rounded-xl shadow-lg backdrop-blur p-4 sm:p-6 space-y-4 mt-10">
        <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
type Todo {
    id: Int!
    title: String
    completed: Boolean
}
          </pre>

        <textarea
          v-model="rawTodoQuery"
          class="w-full px-3 py-2 rounded-lg bg-slate-800/70 text-gray-100 placeholder:text-gray-500 border border-slate-700 focus:(outline-none ring-2 ring-indigo-500)"
          rows="8"
          placeholder="Enter GraphQL query here"
        />
        <div class="border-t border-white/10 pt-4 space-y-3">
          <div class="text-sm text-gray-300">
            Todos:
          </div>
          <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
 {{ todosResult?.todos }}
          </pre>
        </div>
      </section>

      <footer class="mt-8 text-center text-xs text-gray-500">
        Powered by Vue 3 • Apollo • UnoCSS
      </footer>
    </div>
  </div>
</template>
