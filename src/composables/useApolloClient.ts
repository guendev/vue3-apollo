import { inject } from 'vue'

import { APOLLO_CLIENTS_KEY, DEFAULT_APOLLO_CLIENT } from '@/constants/apollo.ts'

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
export function useApolloClient(clientId: string = DEFAULT_APOLLO_CLIENT) {
    const apolloClients = inject(APOLLO_CLIENTS_KEY)

    if (!apolloClients) {
        throw new Error(
            '[useApolloClient] Apollo clients registry not found. Did you forget to install ApolloPlugin?'
        )
    }

    const client = apolloClients[clientId]

    if (!client) {
        const availableClients = Object.keys(apolloClients).join(', ')
        throw new Error(
            `[useApolloClient] Client "${clientId}" not found. Available clients: ${availableClients}`
        )
    }

    return client
}
