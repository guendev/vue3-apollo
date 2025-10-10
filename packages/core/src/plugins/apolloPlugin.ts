import type { ApolloClient } from '@apollo/client/core'
import type { Plugin } from 'vue'

import { APOLLO_CLIENTS_KEY } from '../constants/apollo'

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

        // Provide the entire clients registry
        app.provide(APOLLO_CLIENTS_KEY, clients)
    }
}
