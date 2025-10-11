import type { Ref } from 'vue'

import { getCurrentInstance, getCurrentScope, watch } from 'vue'

import type { ApolloOperationType } from '../useApolloLoading'

import { isServer } from '../../utils/isServer'
import { useApolloLoading } from '../useApolloLoading'

interface UseApolloTrackingOptions {
    state: Ref<boolean>
    type: Exclude<ApolloOperationType, 'all'>
}

export function useApolloTracking({ state, type }: UseApolloTrackingOptions) {
    // Setup loading tracking
    const currentScope = getCurrentScope()
    if (currentScope && !isServer()) {
        const { track } = useApolloLoading()
        const currentInstance = getCurrentInstance()

        const id = currentInstance?.uid ?? Math.random().toString(36).slice(2)

        watch(state, (state) => {
            track({
                id,
                state,
                type
            })
        })
    }
}
