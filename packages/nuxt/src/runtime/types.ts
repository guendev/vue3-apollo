import type { ErrorLike, NormalizedCacheObject } from '@apollo/client/core'
import type { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors'
import type { ErrorLink } from '@apollo/client/link/error'
import type { HookResult } from '@nuxt/schema'

import type { ApolloRuntimeConfig } from '../type'

/**
 * Payload for apollo:error hook
 */
export interface ApolloErrorHookPayload extends Omit<ErrorLink.ErrorHandlerOptions, 'error' | 'forward'> {
    /**
     * The Apollo client ID where the error occurred
     */
    clientId: string

    /**
     * GraphQL errors from the server
     */
    graphQLErrors?: CombinedGraphQLErrors

    /**
     * Network error (connection, timeout, etc.)
     */
    networkError?: ErrorLike

    /**
     * Protocol errors
     */
    protocolErrors?: CombinedProtocolErrors
}

declare module '@nuxt/schema' {
    interface NuxtPayload {
        apollo?: Record<string, NormalizedCacheObject>
    }

    interface PublicRuntimeConfig {
        apollo?: ApolloRuntimeConfig
    }

    interface RuntimeNuxtHooks {
        /**
         * Called when an Apollo Client error occurs (GraphQL, Protocol, or Network error)
         *
         * @example
         * ```ts
         * export default defineNuxtPlugin((nuxtApp) => {
         *   nuxtApp.hook('apollo:error', ({ clientId, graphQLErrors, networkError }) => {
         *     if (networkError) {
         *       console.error('Network error:', networkError)
         *     }
         *     if (graphQLErrors) {
         *       graphQLErrors.errors.forEach(error => {
         *         console.error('GraphQL error:', error.message)
         *       })
         *     }
         *   })
         * })
         * ```
         */
        'apollo:error': (payload: ApolloErrorHookPayload) => void
    }
}

declare module 'nuxt/schema' {
    interface NuxtPayload {
        apollo?: Record<string, NormalizedCacheObject>
    }

    interface PublicRuntimeConfig {
        apollo?: ApolloRuntimeConfig
    }
}

declare module '#app' {
    interface RuntimeNuxtHooks {
        /**
         * Called when an Apollo Client error occurs (GraphQL, Protocol, or Network error)
         *
         * @example
         * ```ts
         * export default defineNuxtPlugin((nuxtApp) => {
         *   nuxtApp.hook('apollo:error', ({ clientId, graphQLErrors, networkError }) => {
         *     if (networkError) {
         *       console.error('Network error:', networkError)
         *     }
         *     if (graphQLErrors) {
         *       graphQLErrors.errors.forEach(error => {
         *         console.error('GraphQL error:', error.message)
         *       })
         *     }
         *   })
         * })
         * ```
         */
        'apollo:error': (payload: ApolloErrorHookPayload) => HookResult
    }
}

// avoid isolated modules
export {}
