import type { ApolloModuleOptions } from '~/src/type'

import { addPlugin, createResolver, defineNuxtModule, updateRuntimeConfig } from '@nuxt/kit'
import { DEFAULT_APOLLO_CLIENT } from '@vue3-apollo/core'

export default defineNuxtModule<ApolloModuleOptions>({
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
            console.warn('[@vue3-apollo/nuxt] No Apollo clients configured.')
            return
        }

        if (!options.clients[DEFAULT_APOLLO_CLIENT]) {
            console.warn(`[@vue3-apollo/nuxt] A "${DEFAULT_APOLLO_CLIENT}" client is required.`)
            return
        }

        // Add runtime config to pass options to the plugin with proper typing
        updateRuntimeConfig({
            public: {
                apollo: {
                    clients: options.clients
                }
            }
        })

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
