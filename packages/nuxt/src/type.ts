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
}

/**
 * Apollo runtime configuration
 */
export type ApolloRuntimeConfig = ApolloModuleOptions

/**
 * Shared authentication configuration options for Apollo Client and Module
 * @remarks Only cookie-based authentication is supported due to SSR constraints
 */
export interface ApolloSharedAuthConfig {
    /**
     * Name of the authentication token to retrieve from storage.
     * The token will be searched in cookie or localStorage depending on `tokenStorage` configuration.
     *
     * @default 'apollo:{clientId}:token' - Falls back to pattern using client ID
     * @example 'auth-token'
     */
    tokenName?: string

    /**
     * Authentication scheme used in the Authorization header.
     * Set to `null` to send the token without any prefix.
     *
     * @default 'Bearer'
     * @example 'Bearer' | 'JWT' | 'Token'
     */
    authType?: string

    /**
     * Name of the HTTP header used to send the authentication token.
     *
     * @default 'Authorization'
     * @example 'X-Auth-Token'
     */
    authHeader?: string
}

/**
 * Shared configuration options for Apollo Client and Module
 */
export interface ApolloSharedConfig extends Pick<ApolloClient.Options, 'assumeImmutableResults' | 'dataMasking' | 'defaultOptions' | 'localState' | 'queryDeduplication'> {
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
     * Additional options for WebSocket link.
     * Allows customizing connection params, retry logic, keepAlive, etc.
     * Only effective when `wsEndpoint` is configured.
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

    /**
     * Optional configuration for authentication in Apollo Shared Settings.
     * This property can either be an object of type `ApolloSharedAuthConfig` to enable specific authentication settings
     * or a boolean value `false` to disable authentication altogether.
     */
    auth?: ApolloSharedAuthConfig | false
}
