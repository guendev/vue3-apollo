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
     * Tùy chọn bổ sung cho HTTP link.
     * Cho phép tùy chỉnh headers, credentials, fetch options, v.v.
     *
     * @example
     * ```ts
     * {
     *   headers: {
     *     authorization: 'Bearer token'
     *   },
     *   credentials: 'include'
     * }
     * ```
     */
    httpLinkOptions?: Omit<HttpLink.Options, 'uri'>

    /**
     * URI của WebSocket endpoint cho GraphQL subscriptions.
     * Khi được cấu hình, subscriptions sẽ sử dụng kết nối WebSocket.
     *
     * @remarks Yêu cầu cài đặt package 'graphql-ws'
     * @example 'wss://api.example.com/graphql'
     */
    wsEndpoint?: string

    /**
     * Tùy chọn bổ sung cho WebSocket link.
     * Cho phép tùy chỉnh connection params, retry logic, keepAlive, v.v.
     * Chỉ có hiệu lực khi `wsEndpoint` được cấu hình.
     *
     * @example
     * ```ts
     * {
     *   connectionParams: {
     *     authToken: 'token'
     *   },
     *   retryAttempts: 5,
     *   keepAlive: 10000
     * }
     * ```
     */
    wsLinkOptions?: Omit<ClientOptions, 'url'>
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
     * Enable devtools integration for each client
     * @default true
     */
    devtools?: boolean

    /**
     * Tùy chọn mặc định cho các operations của Apollo Client.
     * Cho phép cấu hình fetch policy, error handling, polling interval mặc định, v.v.
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
     * Tùy chọn cho InMemoryCache của Apollo Client.
     * Cho phép cấu hình type policies, cache normalization, pagination, v.v.
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
