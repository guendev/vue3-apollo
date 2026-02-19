import { addPlugin, createResolver, defineNuxtModule, updateRuntimeConfig } from '@nuxt/kit'

import type { ApolloModuleOptions } from './type'

export default defineNuxtModule<ApolloModuleOptions>({
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

        if (!options.clients || Object.keys(options.clients).length === 0) {
            console.warn('[@vue3-apollo/nuxt] No Apollo clients configured.')
            return
        }

        updateRuntimeConfig({
            public: {
                apollo: options
            }
        })

        addPlugin(resolver.resolve('./runtime/plugin'))

        if (options.autoImports) {
            nuxt.hook('imports:sources', (sources) => {
                sources.push({
                    from: '@vue3-apollo/core',
                    imports: [
                        // composables
                        'useApolloClients',
                        'useApolloClient',
                        'useFragment',
                        'useLazyQuery',
                        'useMutation',
                        'useQuery',
                        'useSubscription',

                        // helpers
                        'useApolloTrackingStore',
                        'useApolloTracker',
                        'useApolloTracking',
                        'useMutationsLoading',
                        'useQueriesLoading',
                        'useSubscriptionsLoading'
                    ]
                })
                sources.push({
                    from: resolver.resolve('./runtime/composables/useAsyncQuery'),
                    imports: [
                        'useAsyncQuery'
                    ]
                })
            })
        }

        // Add TypeScript declarations
        nuxt.hook('prepare:types', ({ references }) => {
            references.push({ types: '@vue3-apollo/nuxt' })
        })
    }
})
