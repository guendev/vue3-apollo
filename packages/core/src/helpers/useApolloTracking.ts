import type { Ref } from 'vue'

import { getCurrentInstance, getCurrentScope, onScopeDispose, watch } from 'vue'

import type { ApolloOperationType } from './useApolloTracker'

import { isServer } from '../utils/isServer'
import { useApolloTrackingStore } from './useApolloTracker'

interface UseApolloTrackingOptions {
    id?: number | string
    state: Ref<boolean>
    type: ApolloOperationType
}

export function useApolloTracking({ id: customId, state, type }: UseApolloTrackingOptions) {
    // Setup loading tracking
    const currentScope = getCurrentScope()
    if (currentScope && !isServer()) {
        const { track } = useApolloTrackingStore()
        const currentInstance = getCurrentInstance()

        const id = customId ?? currentInstance?.uid ?? Math.random().toString(36).slice(2)

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
