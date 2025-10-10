import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

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

export default defineNuxtModule<ApolloModuleOptions>({
    // Default configuration options of the Nuxt module
    defaults: {
        autoImports: true,
        devtools: true
    },
    meta: {
        configKey: 'apollo',
        name: 'apollo'
    },
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url)

        // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
        addPlugin(resolver.resolve('./runtime/plugin'))
    }
})
