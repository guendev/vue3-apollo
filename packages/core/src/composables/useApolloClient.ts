import { inject } from 'vue'

import { APOLLO_CLIENTS_KEY } from '../constants/apollo'

/**
 * Get an Apollo client instance by ID
 *
 * @param clientId - The client identifier (defaults to first available client)
 * @returns The Apollo client instance
 *
 * @example
 * ```ts
 * // Get the first available client (usually 'default')
 * const client = useApolloClient()
 *
 * // Get specific client
 * const analyticsClient = useApolloClient('analytics')
 * ```
 */
export function useApolloClient(clientId?: string) {
    const apolloClients = inject(APOLLO_CLIENTS_KEY)

    if (!apolloClients) {
        throw new Error(
            '[useApolloClients] Apollo clients registry not found. Did you forget to install ApolloPlugin?'
        )
    }
    // If no clientId provided, get the first available client
    if (!clientId) {
        const firstClientId = Object.keys(apolloClients)[0]
        if (!firstClientId) {
            throw new Error(
                '[useApolloClient] No Apollo clients found in registry'
            )
        }
        return apolloClients[firstClientId]
    }

    // Get a specific client by ID
    const client = apolloClients[clientId]

    if (!client) {
        const availableClients = Object.keys(apolloClients).join(', ')
        throw new Error(
            `[useApolloClient] Client "${clientId}" not found. Available clients: ${availableClients}`
        )
    }

    return client
}
