import type { ComputedRef } from 'vue'

import { computed, getCurrentInstance } from 'vue'

import type { ApolloOperationType } from './useApolloTracker'

import { customOwnerId, instanceOwnerId } from '../utils/ownerId'
import { useApolloTrackingStore } from './useApolloTracker'

/**
 * Shared implementation behind `useQueriesLoading`, `useMutationsLoading` and
 * `useSubscriptionsLoading`.
 *
 * Resolves the owner bucket the same way as `useApolloTracking` (explicit id ->
 * custom key, otherwise the current component uid) so readers and writers
 * always agree on the namespaced id.
 *
 * @param type - Operation type to observe
 * @param id - Optional owner id. Falls back to the current component uid.
 * @returns A computed ref indicating whether any matching operation is loading
 */
export function useOperationLoading(type: ApolloOperationType, id?: number | string): ComputedRef<boolean> {
    const { activeByOwner } = useApolloTrackingStore()

    const instanceUid = getCurrentInstance()?.uid
    const ownerId = id != null
        ? customOwnerId(id)
        : instanceUid != null
            ? instanceOwnerId(instanceUid)
            : undefined

    return computed(() => {
        if (ownerId == null) {
            return false
        }

        return (activeByOwner.value[ownerId]?.[type] || 0) > 0
    })
}
