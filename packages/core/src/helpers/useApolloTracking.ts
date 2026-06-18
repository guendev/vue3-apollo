import type { Ref } from 'vue'

import { getCurrentInstance, getCurrentScope, onScopeDispose, watch } from 'vue'

import type { ApolloOperationType } from './useApolloTracker'

import { isServer } from '../utils/isServer'
import { customOwnerId, instanceOwnerId } from '../utils/ownerId'
import { useApolloTrackingStore } from './useApolloTracker'

interface UseApolloTrackingOptions {
    id?: number | string
    state: Ref<boolean>
    type: ApolloOperationType
}

export function useApolloTracking({ id: customId, state, type }: UseApolloTrackingOptions) {
    // Setup loading tracking.
    //
    // Tracking is skipped on the server: the store is created via
    // `createGlobalState`, so it is a process-wide singleton. Writing to it
    // during SSR would let concurrent requests share (and leak) loading state
    // across each other. Safely tracking SSR loading would require per-request
    // scoped state, which is out of scope here.
    const currentScope = getCurrentScope()
    if (currentScope && !isServer()) {
        const { track } = useApolloTrackingStore()
        const currentInstance = getCurrentInstance()

        // Namespace the bucket so custom keys can never collide with component
        // uids (see `utils/ownerId`). The random fallback keeps the global
        // counters correct when there is no owner to read it back; the prune in
        // the store means it no longer leaks.
        const id = customId != null
            ? customOwnerId(customId)
            : currentInstance
                ? instanceOwnerId(currentInstance.uid)
                : Math.random().toString(36).slice(2)

        watch(state, (state) => {
            track({
                id,
                state,
                type
            })
        }, { immediate: true })

        onScopeDispose(() => track({
            id,
            state: false,
            type
        }))
    }
}
