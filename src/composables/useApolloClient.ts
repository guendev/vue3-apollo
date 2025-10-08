import type { ApolloClient } from '@apollo/client/core'

import { inject } from 'vue'

export function useApolloClient() {
    const client = inject<ApolloClient>('apollo')
    if (!client) {
        throw new Error('ApolloClient is not provided. Did you forget to use ApolloPlugin?')
    }
    return client
}
