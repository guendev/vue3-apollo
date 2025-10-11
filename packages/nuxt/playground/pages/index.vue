<script setup lang="ts">
import type { PostsQueryVariables } from '@vue3-apollo/operations'

import { PostsDocument, UpdatePostDocument } from '@vue3-apollo/operations'
import { reactive, ref } from 'vue'

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

const { data: ssrData, error: ssrError } = await useAsyncQuery(
    {
        query: PostsDocument
    }
)

const isGlobalLoading = useGlobalLoading()

const { finish, start } = useLoadingIndicator()

watch(isGlobalLoading, (loading) => {
    if (loading) {
        start()
    }
    else {
        finish()
    }
})

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-[#0b1220] text-gray-200 antialiased">
    <div class="max-w-5xl mx-auto p-6">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">
          Apollo Demo • Posts
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Get posts by user ID and update title
        </p>
      </header>

      <section class="bg-slate-900/60 border border-white/10 rounded-xl shadow-lg backdrop-blur p-4 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-colors">
            Refresh
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
            Kết quả:
          </div>
          <pre class="w-full overflow-auto text-sm leading-relaxed bg-slate-950/60 border border-white/10 rounded-lg p-3">
{{ result?.posts }}
          </pre>
        </div>
      </section>

      <footer class="mt-8 text-center text-xs text-gray-500">
        Powered by Vue 3 • Apollo • UnoCSS
      </footer>
    </div>
  </div>
</template>
