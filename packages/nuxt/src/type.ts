/**
 * Apollo Client configuration options
 */
export interface ApolloClientConfig {
    /**
     * GraphQL endpoint URI
     */
    uri: string
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
export interface ApolloRuntimeConfig {
    clients: Record<string, ApolloClientConfig>
}
