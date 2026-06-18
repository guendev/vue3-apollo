import { createGlobalState } from '@vueuse/core'
import { shallowRef, triggerRef } from 'vue'

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

export const useApolloTrackingStore = createGlobalState(
    () => {
        // { id -> counters per type }
        const activeByOwner = shallowRef<Record<number | string, PerType>>({})

        // Global counters across all owners
        const activeGlobal = shallowRef<PerType>({})

        /**
         * Track the loading state of Apollo operations
         * @example
         * const { track } = useApolloTrackingStore()
         * track({ id: getCurrentInstance()?.uid, state: true, type: 'queries' })
         */
        const track = ({ id, state, type }: TrackParams) => {
            const delta = state ? 1 : -1

            let ownerCounters = activeByOwner.value[id]

            // A decrement for an owner we are not tracking is a no-op (e.g. an
            // `immediate` watch firing with an initial `false`, or a second
            // dispose after the counter already reached zero). Bail out without
            // creating an empty bucket and without triggering reactivity —
            // global counters are only ever incremented alongside an owner, so
            // there is nothing to decrement globally either.
            if (!ownerCounters && delta < 0) {
                return
            }

            if (!ownerCounters) {
                ownerCounters = activeByOwner.value[id] = {}
            }

            // Update by-owner counters
            const nextOwner = Math.max(0, (ownerCounters[type] || 0) + delta)
            if (nextOwner === 0) {
                delete ownerCounters[type]
            }
            else {
                ownerCounters[type] = nextOwner
            }

            // Prune empty owners so `activeByOwner` does not grow unbounded as
            // components/composables (each with a distinct uid or key) mount and
            // unmount over the lifetime of a long-running app.
            if (Object.keys(ownerCounters).length === 0) {
                delete activeByOwner.value[id]
            }

            // Update global counters
            const nextGlobal = Math.max(0, (activeGlobal.value[type] || 0) + delta)
            if (nextGlobal === 0) {
                delete activeGlobal.value[type]
            }
            else {
                activeGlobal.value[type] = nextGlobal
            }

            // The `shallowRef`s keep the same underlying object reference;
            // `triggerRef` notifies readers without allocating a fresh copy of
            // the whole map on every operation (the previous `{ ...map }` spread
            // was O(owners) per track).
            triggerRef(activeByOwner)
            triggerRef(activeGlobal)
        }

        return {
            activeByOwner,
            activeGlobal,
            track
        }
    }
)

/**
 * @deprecated Use `useApolloTrackingStore` instead.
 */
export const useApolloTracker = useApolloTrackingStore
