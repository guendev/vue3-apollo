import type { ComputedRef } from 'vue'

import { computed, getCurrentInstance } from 'vue'

import { useApolloTracker } from '../useApolloTracker'

/**
 * Track the loading state for Apollo queries in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any queries are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's queries
 * const isLoading = useQueryLoading()
 *
 * // Track queries with a custom id
 * const isLoading = useQueryLoading('my-custom-id')
 * ```
 */
export function useQueriesLoading(id?: number | string): ComputedRef<boolean> {
    const { activeByOwner } = useApolloTracker()

    const loadingId = id ?? getCurrentInstance()?.uid

    return computed(() => {
        if (!loadingId) {
            return false
        }

        const ownerCounters = activeByOwner.value[loadingId]

        if (!ownerCounters) {
            return false
        }

        return (ownerCounters.queries || 0) > 0
    })
}
