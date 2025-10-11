import type { Ref } from 'vue'

import { getCurrentInstance, getCurrentScope, onScopeDispose, watch } from 'vue'

import type { ApolloOperationType } from '../useApolloTracker'

import { isServer } from '../../utils/isServer'
import { useApolloTracker } from '../useApolloTracker'

interface UseApolloTrackingOptions {
    state: Ref<boolean>
    type: ApolloOperationType
}

export function useApolloTracking({ state, type }: UseApolloTrackingOptions) {
    // Setup loading tracking
    const currentScope = getCurrentScope()
    if (currentScope && !isServer()) {
        const { track } = useApolloTracker()
        const currentInstance = getCurrentInstance()

        const id = currentInstance?.uid ?? Math.random().toString(36).slice(2)

        watch(state, (state) => {
            track({
                id,
                state,
                type
            })
        })

        onScopeDispose(() => track({
            id,
            state: false,
            type
        }))
    }
}
