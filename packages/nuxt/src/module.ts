import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { DEFAULT_APOLLO_CLIENT } from '@vue3-apollo/core'

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
        compatibility: {
            nuxt: '^4.0.0'
        },
        configKey: 'apollo',
        name: '@vue3-apollo/nuxt'
    },
    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)

        // Validate configuration
        if (!options.clients || Object.keys(options.clients).length === 0) {
            throw new Error(`[@vue3-apollo/nuxt] No Apollo clients configured. Please add at least a "${DEFAULT_APOLLO_CLIENT}" client in your nuxt.config.ts`)
        }

        if (!options.clients[DEFAULT_APOLLO_CLIENT]) {
            throw new Error(`[@vue3-apollo/nuxt] A "${DEFAULT_APOLLO_CLIENT}" client is required. Please configure it in your nuxt.config.ts`)
        }

        // Add runtime config to pass options to the plugin
        nuxt.options.runtimeConfig.public.apollo = {
            clients: options.clients
        }

        // Add plugin to initialize Apollo clients
        addPlugin(resolver.resolve('./runtime/plugin'))

        // Setup auto-imports for composables
        if (options.autoImports) {
            nuxt.hook('imports:sources', (sources) => {
                sources.push({
                    from: '@vue3-apollo/core',
                    imports: [
                        'useQuery',
                        'useLazyQuery',
                        'useMutation',
                        'useSubscription',
                        'useApolloClient'
                    ]
                })
            })
        }

        // Add TypeScript declarations
        nuxt.hook('prepare:types', ({ references }) => {
            references.push({ types: '@vue3-apollo/nuxt' })
        })

        // Add devtools integration
        if (options.devtools && nuxt.options.dev) {
            // TODO: Implement devtools integration
            // This can be added later to show Apollo Client state, queries, mutations in Nuxt DevTools
        }
    }
})
