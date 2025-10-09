import type { ApolloClient } from '@apollo/client/core'

import { inject } from 'vue'

import { APOLLO_CLIENTS_KEY } from '@/constants/apollo.ts'

/**
 * Get the entire Apollo clients registry
 *
 * @returns Record of all Apollo clients
 *
 * @example
 * ```ts
 * const clients = useApolloClients()
 * Object.entries(clients).forEach(([id, client]) => {
 *   console.log(`Client ${id}:`, client)
 * })
 * ```
 */
export function useApolloClients(): Record<string, ApolloClient> {
    const apolloClients = inject(APOLLO_CLIENTS_KEY)

    if (!apolloClients) {
        throw new Error(
            '[useApolloClients] Apollo clients registry not found. Did you forget to install ApolloPlugin?'
        )
    }

    return apolloClients
}
