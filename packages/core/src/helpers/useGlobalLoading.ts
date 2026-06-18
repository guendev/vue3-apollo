import type { ComputedRef } from 'vue'

import { computed } from 'vue'

import { useApolloTrackingStore } from './useApolloTracker'

/**
 * Global loading state aggregated across every owner.
 */
export interface GlobalLoadingState {
    /**
     * Whether any query, mutation, or subscription is currently loading.
     */
    any: boolean
    /**
     * Whether any mutation is currently loading.
     */
    mutations: boolean
    /**
     * Whether any query is currently loading.
     */
    queries: boolean
    /**
     * Whether any subscription is currently loading.
     */
    subscriptions: boolean
}

/**
 * Track the global Apollo loading state across all components and composables.
 *
 * Unlike the owner-scoped helpers (`useQueriesLoading`, ...), this reads the
 * global counters, so it reflects activity from the entire app — handy for a
 * top-level progress bar or loading overlay.
 *
 * @returns A computed ref with per-type booleans plus an `any` aggregate
 *
 * @example
 * ```TypeScript
 * const loading = useGlobalLoading()
 *
 * // Top-level spinner while anything is in flight
 * const showSpinner = computed(() => loading.value.any)
 *
 * // Or only while queries are loading
 * const showQuerySpinner = computed(() => loading.value.queries)
 * ```
 */
export function useGlobalLoading(): ComputedRef<GlobalLoadingState> {
    const { activeGlobal } = useApolloTrackingStore()

    return computed(() => {
        const counters = activeGlobal.value
        const queries = (counters.queries || 0) > 0
        const mutations = (counters.mutations || 0) > 0
        const subscriptions = (counters.subscriptions || 0) > 0

        return {
            any: queries || mutations || subscriptions,
            mutations,
            queries,
            subscriptions
        }
    })
}
