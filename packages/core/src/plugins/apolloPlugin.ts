import type { ApolloClient } from '@apollo/client/core'
import type { Plugin } from 'vue'

import { APOLLO_CLIENTS_KEY, DEFAULT_APOLLO_CLIENT } from '~/constants'

/**
 * Plugin options supporting single or multiple Apollo clients
 */
export interface ApolloPluginOptions {
    /**
     * Multiple client configurations (advanced setup). Mutually exclusive with 'uri' field.
     * Provide a record mapping client IDs to corresponding Apollo client instances.
     * Must include a 'default' client.
     *
     * @example
     * ```ts
     * app.use(apolloPlugin, {
     *   clients: {
     *     default: defaultClient, // required default client
     *     analytics: analyticsClient // additional named client
     *   }
     * })
     * ```
     */
    clients: Record<string, ApolloClient>
}

export const apolloPlugin: Plugin<ApolloPluginOptions> = {
    install(app, { clients }) {
        if (Object.keys(clients).length === 0) {
            throw new Error('[ApolloPlugin] No Apollo clients provided')
        }

        if (!clients[DEFAULT_APOLLO_CLIENT]) {
            throw new Error(`[ApolloPlugin] Client with key '${DEFAULT_APOLLO_CLIENT}' is required`)
        }

        // Create a client's registry
        const apolloClients: Record<string, ApolloClient> = {}

        // Create and register each client
        Object.entries(clients).forEach(([clientId, client]) => {
            // Register a client in the registry
            apolloClients[clientId] = client

            // Set the default client on global properties
            if (clientId === DEFAULT_APOLLO_CLIENT) {
                app.config.globalProperties.$apollo = client
            }
        })

        // Provide the entire clients registry
        app.provide(APOLLO_CLIENTS_KEY, apolloClients)
    }
}
