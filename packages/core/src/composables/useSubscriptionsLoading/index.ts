import { computed, getCurrentInstance } from 'vue'

import { useApolloTracker } from '../useApolloTracker'

/**
 * Track the loading state for Apollo subscriptions in a specific component or scope
 *
 * @param id - Optional unique identifier. If not provided, uses current component instance uid
 * @returns A computed ref indicating whether any subscriptions are currently loading for the given id
 *
 * @example
 * ```TypeScript
 * // In a component - automatically tracks this component's subscriptions
 * const isLoading = useSubscriptionsLoading()
 *
 * // Track subscriptions with a custom id
 * const isLoading = useSubscriptionsLoading('my-custom-id')
 * ```
 */
export function useSubscriptionsLoading(id?: number | string) {
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

        return (ownerCounters.subscriptions || 0) > 0
    })
}
