import type { ApolloModuleOptions } from '~/src/type'

import { addPlugin, createResolver, defineNuxtModule, updateRuntimeConfig } from '@nuxt/kit'

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

        if (!options.clients || Object.keys(options.clients).length === 0) {
            console.warn('[@vue3-apollo/nuxt] No Apollo clients configured.')
            return
        }

        updateRuntimeConfig({
            public: {
                apollo: {
                    clients: options.clients,
                    devtools: options.devtools
                }
            }
        })

        addPlugin(resolver.resolve('./runtime/plugin'))

        if (options.autoImports) {
            nuxt.hook('imports:sources', (sources) => {
                sources.push({
                    from: '@vue3-apollo/core',
                    imports: [
                        'useQuery',
                        'useLazyQuery',
                        'useMutation',
                        'useSubscription',
                        'useApolloClient',
                        'useApolloClients'
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
