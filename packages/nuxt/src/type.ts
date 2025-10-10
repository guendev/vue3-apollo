import type { ApolloClient, InMemoryCacheConfig } from '@apollo/client'
import type { HttpLink } from '@apollo/client/link/http'
import type { ClientOptions } from 'graphql-ws'

/**
 * Apollo Client configuration options
 */
export interface ApolloClientConfig extends ApolloSharedConfig {
    /**
     * URI của GraphQL endpoint qua HTTP/HTTPS.
     *
     * @example 'https://api.example.com/graphql'
     */
    httpEndpoint: string

    /**
     * URI của WebSocket endpoint cho GraphQL subscriptions.
     * Khi được cấu hình, subscriptions sẽ sử dụng kết nối WebSocket.
     *
     * @remarks Yêu cầu cài đặt package 'graphql-ws'
     * @example 'wss://api.example.com/graphql'
     */
    wsEndpoint?: string
}

/**
 * Nuxt Apollo Module configuration options
 */
export interface ApolloModuleOptions extends ApolloSharedConfig {
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
export type ApolloRuntimeConfig = ApolloModuleOptions

/**
 * Shared configuration options for Apollo Client and Module
 */
export interface ApolloSharedConfig {
    /**
     * Tùy chọn bổ sung cho HTTP link.
     * Cho phép tùy chỉnh headers, credentials, fetch options, v.v.
     *
     * @example
     * ```ts
     * {
     *   credentials: 'include'
     * }
     * ```
     */
    httpLinkOptions?: Omit<HttpLink.Options, 'uri'>

    /**
     * Tùy chọn bổ sung cho WebSocket link.
     * Cho phép tùy chỉnh connection params, retry logic, keepAlive, v.v.
     * Chỉ có hiệu lực khi `wsEndpoint` được cấu hình.
     *
     * @example
     * ```ts
     * {
     *   retryAttempts: 5,
     *   keepAlive: 10000
     * }
     * ```
     */
    wsLinkOptions?: Omit<ClientOptions, 'connectionParams' | 'url'>

    /**
     * Enable devtools integration for each client
     * @default true
     */
    devtools?: boolean

    /**
     * Default options for Apollo Client operations.
     * Allows configuration of fetch policies, error handling, polling intervals, etc.
     *
     * @example
     * ```ts
     * {
     *   watchQuery: {
     *     fetchPolicy: 'cache-and-network'
     *   },
     *   query: {
     *     fetchPolicy: 'network-only',
     *     errorPolicy: 'all'
     *   },
     *   mutate: {
     *     errorPolicy: 'all'
     *   }
     * }
     * ```
     */
    defaultOptions?: ApolloClient.DefaultOptions

    /**
     * Configuration options for Apollo Client's InMemoryCache.
     * Allows customization of type policies, cache normalization, pagination, etc.
     *
     * @example
     * ```ts
     * {
     *   typePolicies: {
     *     Query: {
     *       fields: {
     *         posts: {
     *           merge: true
     *         }
     *       }
     *     }
     *   }
     * }
     * ```
     */
    inMemoryCacheOptions?: InMemoryCacheConfig
}
