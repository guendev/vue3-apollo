import type { ComputedRef } from 'vue'

import { computed, getCurrentInstance } from 'vue'

import type { ApolloLoadingId } from './useApolloLoading'

import { useApolloLoading } from './useApolloLoading'

/**
 * Track the loading state for Apollo mutations in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any mutations are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's mutations
 * const isLoading = useMutationLoading()
 *
 * // Track mutations with a custom id
 * const isLoading = useMutationLoading('my-custom-id')
 * ```
 */
export function useMutationLoading(id?: ApolloLoadingId): ComputedRef<boolean> {
    const { activeByOwner } = useApolloLoading()

    const loadingId = id ?? getCurrentInstance()?.uid

    return computed(() => {
        if (!loadingId) {
            return false
        }

        const ownerCounters = activeByOwner.value[loadingId]

        if (!ownerCounters) {
            return false
        }

        return (ownerCounters.mutation || 0) > 0
    })
}
