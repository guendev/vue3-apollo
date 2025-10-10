import type { NormalizedCacheObject } from '@apollo/client/core'
import type { NuxtApp } from '#app'

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'

import type { ApolloClientConfig } from '../../type'
import type { ApolloErrorHookPayload } from '../types'

const APOLLO_STATE_KEY_PREFIX = 'apollo:'

interface CreateApolloClientParams {
    clientId: string
    config: ApolloClientConfig
    nuxtApp: Pick<NuxtApp, 'callHook' | 'hook' | 'payload'>
}

export async function createApolloClient({ clientId, config, nuxtApp }: CreateApolloClientParams) {
    // Create an HTTP link
    const httpLink = new HttpLink({
        ...config.httpLinkOptions,
        uri: config.httpEndpoint
    })

    // Create an error link to handle and broadcast errors
    const errorLink = new ErrorLink(({ error, forward, operation }) => {
        // Prepare typed payload for hook
        const payload: ApolloErrorHookPayload = {
            clientId,
            operation
        }
        if (CombinedGraphQLErrors.is(error)) {
            payload.graphQLErrors = error
        }
        else if (CombinedProtocolErrors.is(error)) {
            payload.protocolErrors = error
        }
        else {
            payload.networkError = error
        }

        // Trigger Nuxt hook for centralized error handling
        void nuxtApp.callHook('apollo:error', payload)

        return forward(operation)
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

    // Create a WebSocket link for subscriptions (client-side only)
    let link = httpLink
    if (import.meta.client && config.wsEndpoint) {
        try {
            // Dynamic import to avoid bundling graphql-ws on the server
            // - graphql-ws is an optional peer dependency
            const { createClient } = await import('graphql-ws')

            const wsLink = new GraphQLWsLink(
                createClient({
                    ...config.wsLinkOptions,
                    url: config.wsEndpoint
                })
            )

            // Use split to route operations:
            // - Subscriptions go through WebSocket
            // - Queries and mutations go through HTTP
            link = ApolloLink.split(
                ({ query }) => {
                    const definition = getMainDefinition(query)
                    return (
                        definition.kind === 'OperationDefinition'
                        && definition.operation === 'subscription'
                    )
                },
                wsLink,
                httpLink
            )
        }
        catch (error) {
            console.warn(
                `[Apollo Client: ${clientId}] Failed to initialize WebSocket link. `
                + 'Make sure "graphql-ws" package is installed to use subscriptions.',
                error
            )
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
        // Combine the error link with the main link chain
        link: ApolloLink.from([errorLink, link]),
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
