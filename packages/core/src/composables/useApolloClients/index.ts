import { inject } from 'vue'

import { APOLLO_CLIENTS_KEY } from '../../constants/apollo'

/**
 * Get all Apollo client instances
 *
 * @returns Record of all Apollo client instances
 *
 * @example
 * ```ts
 * const clients = useApolloClients()
 * console.log(Object.keys(clients)) // ['default', 'analytics', ...]
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
