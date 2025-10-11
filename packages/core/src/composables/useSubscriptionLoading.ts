import type { ComputedRef } from 'vue'

import { computed, getCurrentInstance } from 'vue'

import type { ApolloLoadingId } from './useApolloLoading'

import { useApolloLoading } from './useApolloLoading'

/**
 * Track the loading state for Apollo subscriptions in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any subscriptions are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's subscriptions
 * const isLoading = useSubscriptionLoading()
 *
 * // Track subscriptions with a custom id
 * const isLoading = useSubscriptionLoading('my-custom-id')
 * ```
 */
export function useSubscriptionLoading(id?: ApolloLoadingId): ComputedRef<boolean> {
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

        return (ownerCounters.subscription || 0) > 0
    })
}
