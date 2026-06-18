export default defineNuxtConfig({
    apollo: {
        clients: {
            default: {
                // Advanced runtime setup (custom cache + typePolicies functions)
                configFile: '~/apollo/default',
                defaultOptions: {
                    query: {
                        errorPolicy: 'none'
                    }
                },
                httpEndpoint: 'https://graphqlplaceholder.vercel.app/graphql'
            }
        },
        defaultOptions: {
            query: {
                errorPolicy: 'all'
            }
        }
    },
    compatibilityDate: '2025-10-10',
    devtools: {
        enabled: true,

        timeline: {
            enabled: true
        }
    },
    modules: [
        '../src/module',
        '@unocss/nuxt'
    ]
})
