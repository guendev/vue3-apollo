import { computed, getCurrentInstance } from 'vue'

import { useApolloTracker } from '../useApolloTracker'

/**
 * Track the loading state for Apollo mutations in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any mutations are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's mutations
 * const isLoading = useApolloLoading()
 *
 * // Track mutations with a custom id
 * const isLoading = useApolloLoading('my-custom-id')
 * ```
 */
export function useOperationLoading(id?: number | string) {
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

        // // any operations are currently loading for this id
        // return
    })
}
