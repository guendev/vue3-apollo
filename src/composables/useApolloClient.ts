import { DEFAULT_APOLLO_CLIENT } from '../constants'
import { useApolloClients } from './useApolloClients'

/**
 * Get an Apollo client instance by ID
 *
 * @param clientId - The client identifier (defaults to a default client)
 * @returns The Apollo client instance
 *
 * @example
 * ```ts
 * // Get default client
 * const client = useApolloClient()
 *
 * // Get specific client
 * const analyticsClient = useApolloClient('analytics')
 * ```
 */
export function useApolloClient(clientId?: string) {
    const apolloClients = useApolloClients()

    const client = apolloClients[clientId ?? DEFAULT_APOLLO_CLIENT]

    if (!client) {
        const availableClients = Object.keys(apolloClients).join(', ')
        throw new Error(
            `[useApolloClient] Client "${clientId}" not found. Available clients: ${availableClients}`
        )
    }

    return client
}
