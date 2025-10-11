export default defineNuxtConfig({
    apollo: {
        clients: {
            default: {
                httpEndpoint: 'https://graphqlplaceholder.vercel.app/graphql'
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
