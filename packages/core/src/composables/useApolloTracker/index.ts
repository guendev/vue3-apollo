import { createGlobalState } from '@vueuse/core'
import { shallowRef } from 'vue'

export type ApolloOperationType = 'mutations' | 'queries' | 'subscriptions'

type PerType = Partial<Record<ApolloOperationType, number>>

interface TrackParams {
    /**
     * Unique identifier for the owner (component uid, composable id, etc.)
     */
    id: number | string
    /**
     * Loading state (true = loading, false = idle)
     */
    state: boolean
    /**
     * Type of operation ('queries', 'mutations', 'subscriptions')
     */
    type: ApolloOperationType
}

export const useApolloTracker = createGlobalState(
    () => {
        // { id -> counters per type }
        const activeByOwner = shallowRef<Record<number | string, PerType>>({})

        // Global counters across all owners
        const activeGlobal = shallowRef<PerType>({})

        /**
         * Track the loading state of Apollo operations
         * @example
         * const { track } = useApolloTracker()
         * track({ id: getCurrentInstance()?.uid, state: true, type: 'query' })
         */
        const track = ({ id, state, type }: TrackParams) => {
            const delta = state ? 1 : -1

            // Update global counters
            activeGlobal.value[type] = Math.max(0, (activeGlobal.value[type] || 0) + delta)

            // Update by-owner counters
            if (!activeByOwner.value[id]) {
                activeByOwner.value[id] = {}
            }

            const ownerCounters = activeByOwner.value[id]
            ownerCounters[type] = Math.max(0, (ownerCounters[type] || 0) + delta)

            if (ownerCounters[type] === 0) {
                delete ownerCounters[type]
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
