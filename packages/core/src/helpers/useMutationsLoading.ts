import { computed, getCurrentInstance } from 'vue'

import { useApolloTrackingStore } from './useApolloTracker'

/**
 * Track the loading state for Apollo mutations in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any mutations are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's mutations
 * const isLoading = useMutationsLoading()
 *
 * // Track mutations with a custom id
 * const isLoading = useMutationsLoading('my-custom-id')
 * ```
 */
export function useMutationsLoading(id?: number | string) {
    const { activeByOwner } = useApolloTrackingStore()

    const loadingId = id ?? getCurrentInstance()?.uid

    return computed(() => {
        if (!loadingId) {
            return false
        }

        const ownerCounters = activeByOwner.value[loadingId]

        if (!ownerCounters) {
            return false
        }

        return (ownerCounters.mutations || 0) > 0
    })
}
