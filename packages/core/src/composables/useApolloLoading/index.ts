import { createGlobalState } from '@vueuse/core'
import { shallowRef } from 'vue'

export type ApolloLoadingId = number | string

export type ApolloOperationType = 'all' | 'mutation' | 'query' | 'subscription'

type PerType = Partial<Record<ApolloOperationType, number>>

interface TrackParams {
    /**
     * Unique identifier for the owner (component uid, composable id, etc.)
     */
    id: ApolloLoadingId
    /**
     * Loading state (true = loading, false = idle)
     */
    state: boolean
    /**
     * Type of operation ('query', 'mutation', 'subscription')
     */
    type: Exclude<ApolloOperationType, 'all'>
}

export const useApolloLoading = createGlobalState(
    () => {
        // { id -> counters per type }
        const activeByOwner = shallowRef<Record<ApolloLoadingId, PerType>>({})

        // Global counters across all owners
        const activeGlobal = shallowRef<PerType>({})

        /**
         * Track the loading state of Apollo operations
         * @example
         * const { track } = useApolloLoading()
         * track({ id: getCurrentInstance()?.uid, state: true, type: 'query' })
         */
        const track = ({ id, state, type }: TrackParams) => {
            const delta = state ? 1 : -1

            // Update global counters
            activeGlobal.value[type] = Math.max(0, (activeGlobal.value[type] || 0) + delta)
            activeGlobal.value.all = Math.max(0, (activeGlobal.value.all || 0) + delta)

            // Update by-owner counters
            if (!activeByOwner.value[id]) {
                activeByOwner.value[id] = {}
            }

            const ownerCounters = activeByOwner.value[id]
            ownerCounters[type] = Math.max(0, (ownerCounters[type] || 0) + delta)
            ownerCounters.all = Math.max(0, (ownerCounters.all || 0) + delta)

            // Clean up empty owner entries
            if (ownerCounters.all === 0) {
                delete activeByOwner.value[id]
            }

            // Trigger reactivity
            activeGlobal.value = { ...activeGlobal.value }
            activeByOwner.value = { ...activeByOwner.value }
        }

        return {
            activeByOwner,
            activeGlobal,
            track
        }
    }
)
