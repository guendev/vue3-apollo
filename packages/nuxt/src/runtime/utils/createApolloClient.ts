import type { NormalizedCacheObject } from '@apollo/client/core'
import type { NuxtApp } from '#app'
import type { ApolloClientConfig } from '~/src/type'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const APOLLO_STATE_KEY_PREFIX = 'apollo:'

interface CreateApolloClientParams {
    clientId: string
    config: ApolloClientConfig
    nuxtApp: Pick<NuxtApp, 'hook' | 'payload'>
}

export function createApolloClient({ clientId, config, nuxtApp }: CreateApolloClientParams) {
    // Create an HTTP link
    const httpLink = new HttpLink({
        uri: config.uri
    })

    // Create a cache instance
    const cache = new InMemoryCache()

    // Restore cache on client-side from server state
    if (import.meta.client) {
        const stateKey = `${APOLLO_STATE_KEY_PREFIX}${clientId}`
        const cachedState = nuxtApp.payload.data[stateKey]

        if (cachedState) {
            cache.restore(cachedState as NormalizedCacheObject)
        }
    }

    // Create an Apollo Client instance
    const client = new ApolloClient({
        cache,
        // Configure cache policies for optimal SSR
        defaultOptions: {
            query: {
                fetchPolicy: import.meta.server ? 'network-only' : 'cache-first'
            },
            watchQuery: {
                fetchPolicy: import.meta.server ? 'network-only' : 'cache-first'
            }
        },
        devtools: {
            enabled: config.devtools ?? config.devtools,
            name: clientId
        },
        link: httpLink,
        // Prevent refetching immediately after SSR hydration
        ssrForceFetchDelay: 100,
        // Enable server-side rendering support
        ssrMode: import.meta.server
    })

    // Extract Apollo state on the server-side for SSR
    if (import.meta.server) {
        nuxtApp.hook('app:rendered', () => {
            const stateKey = `${APOLLO_STATE_KEY_PREFIX}${clientId}`
            nuxtApp.payload.data[stateKey] = client.cache.extract()
        })
    }

    return client
}
