import type { HttpLink } from '@apollo/client/link/http'
import type { ClientOptions } from 'graphql-ws'

/**
 * Apollo Client configuration options
 */
export interface ApolloClientConfig {
    /**
     * GraphQL endpoint URI
     */
    httpEndpoint: string

    /**
     * Optional configuration object for HTTP link options used in configuring Apollo Client.
     * Excludes the `uri` property from `HttpLink.Options`.
     *
     * This object allows customization of settings such as headers, credentials, and other
     * options supported by the `HttpLink` of Apollo Client, except for specifying the URI.
     *
     */
    httpLinkOptions?: Omit<HttpLink.Options, 'uri'>

    /**
     * WebSocket endpoint URI for GraphQL subscriptions.
     * When provided, subscriptions will be routed through WebSocket connection.
     * Requires 'graphql-ws' package to be installed.
     *
     * @example 'wss://api.example.com/graphql'
     */
    wsEndpoint?: string

    /**
     * Optional configuration object for WebSocket link options.
     * Excludes the `url` property from `ClientOptions`.
     * Only used when `wsEndpoint` is provided.
     *
     */
    wsLinkOptions?: Omit<ClientOptions, 'url'>

    /**
     * Enable devtools integration for each client
     * @default true
     */
    devtools?: boolean
}

/**
 * Nuxt Apollo Module configuration options
 */
export interface ApolloModuleOptions {
    /**
     * Multiple client configurations for Apollo.
     * Provide a record mapping client IDs to their configuration.
     * Must include a 'default' client.
     *
     * @example
     * ```ts
     * export default defineNuxtConfig({
     *   apollo: {
     *     clients: {
     *       default: {
     *         uri: 'https://api.example.com/graphql'
     *       },
     *       analytics: {
     *         uri: 'https://analytics.example.com/graphql'
     *       }
     *     }
     *   }
     * })
     * ```
     */
    clients?: Record<string, ApolloClientConfig>

    /**
     * Enable auto-import for Apollo composables
     * @default true
     */
    autoImports?: boolean

    /**
     * Enable devtools integration
     * @default true
     */
    devtools?: boolean
}

/**
 * Apollo runtime configuration
 */
export type ApolloRuntimeConfig = Pick<ApolloModuleOptions, 'clients' | 'devtools'>
