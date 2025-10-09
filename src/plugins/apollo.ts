import type { Plugin } from 'vue'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

import { APOLLO_CLIENTS_KEY, DEFAULT_APOLLO_CLIENT } from '@/constants/apollo.ts'

/**
 * Options for a single Apollo client configuration
 */
export interface ApolloClientConfig {
    clientId?: string
    uri: string
}

/**
 * Plugin options supporting single or multiple Apollo clients
 */
export interface ApolloPluginOptions {
    /**
     * URI for a default client (simple setup)
     */
    uri?: string

    /**
     * Multiple client configurations (advanced setup)
     *
     * @example
     * ```ts
     * app.use(apolloPlugin, {
     *   clients: [
     *     { uri: 'https://api.example.com/graphql' }, // default client
     *     { uri: 'https://analytics.example.com/graphql', clientId: 'analytics' }
     *   ]
     * })
     * ```
     */
    clients?: ApolloClientConfig[]
}

export const apolloPlugin: Plugin<ApolloPluginOptions> = {
    install(app, options) {
        // Support both simple (uri) and advanced (clients) configuration
        const clientConfigs: ApolloClientConfig[] = options?.clients
            ? options.clients
            : options?.uri
                ? [{ uri: options.uri }]
                : []

        if (clientConfigs.length === 0) {
            throw new Error('[ApolloPlugin] Missing `uri` or `clients` in options')
        }

        // Create a client's registry
        const apolloClients: Record<string, ApolloClient> = {}

        // Create and register each client
        clientConfigs.forEach((config) => {
            const httpLink = new HttpLink({ uri: config.uri })

            const apolloClient = new ApolloClient({
                cache: new InMemoryCache(),
                link: httpLink
            })

            const clientId = config.clientId || DEFAULT_APOLLO_CLIENT

            // Register a client in the registry
            apolloClients[clientId] = apolloClient

            // Set the default client on global properties
            if (clientId === DEFAULT_APOLLO_CLIENT) {
                app.config.globalProperties.$apollo = apolloClient
            }
        })

        // Provide the entire clients registry
        app.provide(APOLLO_CLIENTS_KEY, apolloClients)
    }
}
