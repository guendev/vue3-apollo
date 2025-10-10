import type { ApolloClientConfig } from '~/src/type'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'
import { APOLLO_CLIENTS_KEY, DEFAULT_APOLLO_CLIENT } from '@vue3-apollo/core'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const apolloConfig = config.public.apollo

    // Validate configuration
    if (!apolloConfig?.clients) {
        throw new Error('[vue3-apollo] No Apollo clients configured')
    }

    if (!apolloConfig.clients[DEFAULT_APOLLO_CLIENT]) {
        throw new Error(`[vue3-apollo] Client with key '${DEFAULT_APOLLO_CLIENT}' is required`)
    }

    // Create Apollo clients registry
    const apolloClients: Record<string, ApolloClient> = {}

    // Create each Apollo client from config
    Object.entries(apolloConfig.clients).forEach(([clientId, clientConfig]: [string, ApolloClientConfig]) => {
        // Create an HTTP link
        const httpLink = new HttpLink({
            uri: clientConfig.uri
        })

        // Create an Apollo Client instance
        const client = new ApolloClient({
            cache: new InMemoryCache(),
            // Disable force fetch on server
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: import.meta.server ? 'no-cache' : 'cache-first'
                }
            },
            link: httpLink,
            // Enable server-side rendering support
            ssrMode: import.meta.server
        })

        // Register client in registry
        apolloClients[clientId] = client

        // Set the default client on global properties
        if (clientId === DEFAULT_APOLLO_CLIENT) {
            nuxtApp.vueApp.config.globalProperties.$apollo = client
        }
    })

    // Provide clients registry for composables
    nuxtApp.vueApp.provide(APOLLO_CLIENTS_KEY, apolloClients)

    // Return for potential use in plugins
    return {
        provide: {
            apolloClients
        }
    }
})
