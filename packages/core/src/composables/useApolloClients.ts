import { inject } from 'vue'

import { APOLLO_CLIENTS_KEY } from '../constants/apollo'

/**
 * Get all Apollo client instances
 *
 * @returns Object containing all registered Apollo clients
 *
 * @example
 * ```ts
 * // Get all clients
 * const clients = useApolloClients()
 *
 * // Access specific client
 * const defaultClient = clients.default
 * const analyticsClient = clients.analytics
 *
 * // Iterate over all clients
 * Object.entries(clients).forEach(([id, client]) => {
 *   console.log(`Client ${id}:`, client)
 * })
 * ```
 */
export function useApolloClients() {
    const apolloClients = inject(APOLLO_CLIENTS_KEY)

    if (!apolloClients) {
        throw new Error(
            '[useApolloClients] Apollo clients registry not found. Did you forget to install ApolloPlugin?'
        )
    }

    return apolloClients
}
