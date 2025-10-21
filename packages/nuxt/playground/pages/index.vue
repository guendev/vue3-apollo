<script setup lang="ts">
import type { PostsQueryVariables } from '@vue3-apollo/operations'

import { gql } from '@apollo/client'
import { PostDetailFragmentDoc, PostsDocument, UpdatePostDocument } from '@vue3-apollo/operations'
import { reactive, ref } from 'vue'

// Constants
const rawQuery = gql`
    query Users($userId: Int) {
        users(userId: $userId) {
            id
            email
            name
            phone
        }
    }
`

// Refs
const enabled = ref(true)
const title = ref('')
const fragmentPostId = ref(1)
const fragmentEnabled = ref(true)

// Reactive variables
const vars = reactive<PostsQueryVariables>({
    first: 1,
    userId: 1
})

const rawQueryVars = computed(() => ({ userId: vars.userId }))

// Queries
const { error, onResult, refetch, result } = useQuery(PostsDocument, vars, {
    enabled,
    keepPreviousResult: true
})

const { data: ssrData, error: ssrError } = await useAsyncQuery(
    {
        query: PostsDocument,
        variables: {
            userId: 1
        }
    }
)

const { error: rawQueryError, result: rawQueryResult } = useQuery(rawQuery, rawQueryVars, {
    enabled,
    keepPreviousResult: true
})

// Fragments
const {
    complete: fragmentComplete,
    data: fragmentData,
    error: fragmentError,
    missing: fragmentMissing,
    onResult: onFragmentResult,
    result: fragmentResult
} = useFragment({
    enabled: fragmentEnabled,
    fragment: PostDetailFragmentDoc,
    from: computed(() => ({
        __typename: 'Post',
        id: fragmentPostId.value
    }))
})

// Mutations
const { loading, mutate } = useMutation(UpdatePostDocument)

// Event handlers
onResult((data) => {
    console.warn('onResult', data)
})

onFragmentResult((result) => {
    console.warn('onFragmentResult', result)
})

// Watch fragment result for type narrowing demo
watchEffect(() => {
    if (fragmentResult.value?.complete) {
        // TypeScript knows data is non-optional here
        console.warn('Fragment complete:', fragmentResult.value.data)
    }
    else if (fragmentResult.value?.data) {
        // Partial data
        console.warn('Fragment partial:', fragmentResult.value.data)
    }
})

// Composables
const route = useRoute()
const isLoading = useQueriesLoading()
const { finish, start } = useLoadingIndicator()

// Watchers
watch(isLoading, (loading) => {
    if (loading) {
        start()
    }
    else {
        finish()
    }
})
</script>

<template>
  <div class="min-h-screen bg-[#0b1220] text-gray-200 antialiased">
    <div class="max-w-5xl mx-auto p-6">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">
          Apollo Demo
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Get posts and users and update post title
        </p>
      </header>

      <section class="bg-slate-900/60 border border-white/10 rounded-xl shadow-lg backdrop-blur p-4 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-colors"
            @click="refetch()"
          >
            Refetch
          </button>
          <button type="button" class="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-gray-200 border border-white/10 transition-colors" @click="enabled = !enabled">
            {{ enabled ? 'Disable' : 'Enable' }} Query
          </button>
          <button
            v-if="ssrData"
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white transition-colors"
            @click="openViewSource(route.fullPath)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View SSR Source
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
                @click="mutate({ postId: 1, post: { title } })"
              >
                {{ loading ? 'Loading...' : 'Update' }}
              </button>
            </div>
          </div>
        </div>

        <div class="text-sm text-gray-300 pt-3 flex gap-2">
          SSR Data:
          <div v-if="ssrError" class="text-rose-400">
            {{ ssrError }}
          </div>
          <div v-else>
            <div class="text-emerald-400">
              {{ ssrData?.posts?.length }} posts
            </div>
            <div class="sr-only">
              {{ ssrData?.posts }}
            </div>
          </div>
        </div>

        <div class="border-t border-white/10 pt-4 space-y-3">
          <div v-if="error" class="text-sm text-rose-400 bg-rose-900/20 border border-rose-700/40 rounded-lg p-3">
            {{ error }}
          </div>

          <div class="text-sm text-gray-300">
            Posts:
          </div>
          <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
{{ result?.posts }}
          </pre>
        </div>

        <div class="border-white/10 pt-4 space-y-3">
          <div v-if="rawQueryError" class="text-sm text-rose-400 bg-rose-900/20 border border-rose-700/40 rounded-lg p-3">
            {{ rawQueryError }}
          </div>

          <div class="text-sm text-gray-300">
            Users:
          </div>
          <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
{{ (rawQueryResult as any)?.users }}
          </pre>
        </div>

        <!-- Fragment Testing Section -->
        <div class="border-t border-white/10 pt-4 space-y-3">
          <div class="flex items-center gap-3 mb-3">
            <h3 class="text-sm font-medium text-gray-300">
              Fragment Testing (useFragment)
            </h3>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-2 px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-gray-200 border border-white/10 transition-colors"
              @click="fragmentEnabled = !fragmentEnabled"
            >
              {{ fragmentEnabled ? 'Disable' : 'Enable' }}
            </button>
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-400">Post ID:</label>
              <input
                v-model.number="fragmentPostId"
                type="number"
                min="1"
                class="w-20 px-2 py-1 text-xs rounded bg-slate-800/70 text-gray-100 border border-slate-700 focus:(outline-none ring-1 ring-indigo-500)"
              >
            </div>
            <div class="ml-auto flex items-center gap-2">
              <span class="text-xs text-gray-400">Complete:</span>
              <span :class="fragmentComplete ? 'text-emerald-400' : 'text-amber-400'" class="text-xs font-medium">
                {{ fragmentComplete ? '✓ Yes' : '⚠ Partial' }}
              </span>
            </div>
          </div>

          <div v-if="fragmentError" class="text-sm text-rose-400 bg-rose-900/20 border border-rose-700/40 rounded-lg p-3">
            {{ fragmentError }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div class="text-xs text-gray-400 mb-2">
                Fragment Data (from cache):
              </div>
              <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
{{ fragmentData }}
              </pre>
            </div>

            <div>
              <div class="text-xs text-gray-400 mb-2">
                Full Result (type-safe):
              </div>
              <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
{{ fragmentResult }}
              </pre>
            </div>
          </div>

          <div v-if="fragmentMissing" class="text-xs">
            <div class="text-amber-400 mb-2">
              Missing Fields:
            </div>
            <pre class="w-full overflow-auto text-xs leading-relaxed bg-amber-950/20 border border-amber-700/40 rounded-lg p-3">
{{ fragmentMissing }}
            </pre>
          </div>

          <div class="text-xs text-gray-500 bg-slate-800/30 border border-white/5 rounded-lg p-3">
            <strong>💡 Tips:</strong>
            <ul class="mt-2 space-y-1 list-disc list-inside">
              <li>Fragment reads data synchronously from Apollo Cache</li>
              <li>Update post title above to see fragment auto-update</li>
              <li>Change Post ID to read different entities</li>
              <li>Use <code class="px-1 py-0.5 bg-slate-700 rounded">result.value?.complete</code> for TypeScript type narrowing</li>
            </ul>
          </div>
        </div>
      </section>

      <footer class="mt-8 text-center text-xs text-gray-500">
        Powered by Vue 3 • Apollo • UnoCSS
      </footer>
    </div>
  </div>
</template>
