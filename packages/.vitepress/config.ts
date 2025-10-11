import { defineConfig } from 'vitepress'

function createComposablesLink(composables: string[]) {
    return composables.map((composable) => {
        return {
            link: `/composables/${composable}`,
            text: composable
        }
    })
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    cleanUrls: true,
    description: 'Vue 3 + Apollo Client utilities and Nuxt 4 module',
    ignoreDeadLinks: true,
    rewrites: {
        'core/src/:pkg(composables|plugins)/:slug*': ':pkg/:slug*',
        'nuxt/src/runtime/composables/useAsyncQuery/index.md': 'composables/useAsyncQuery/index.md'
    },
    themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
        nav: [
            {
                link: '/',
                text: 'Home'
            },
            {
                link: '/getting-started',
                text: 'Getting Started'
            }
        ],
        sidebar: [
            {
                items: [
                    {
                        link: '/introduction',
                        text: 'Introduction'
                    },
                    {
                        link: '/getting-started',
                        text: 'Getting Started'
                    }
                ],
                text: 'Guide'
            },
            {
                items: [
                    {
                        link: '/nuxt',
                        text: 'Integration'
                    },
                    {
                        link: '/composables/useAsyncQuery',
                        text: 'useAsyncQuery'
                    }
                ],
                text: 'Nuxt'
            },
            {
                items: createComposablesLink(['useMutation', 'useQuery', 'useSubscription']),
                text: 'Composables'
            },
            {
                collapsed: true,
                items: createComposablesLink([
                    'useApolloClient',
                    'useApolloClients',
                    'useApolloLoading',
                    'useApolloTracking',
                    'useGlobalLoading',
                    'useGlobalMutationLoading',
                    'useGlobalQueryLoading',
                    'useGlobalSubscriptionLoading',
                    'useMutationLoading',
                    'useQueryLoading',
                    'useSubscriptionLoading'
                ]),
                text: 'Utilities'
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/guendev/vue3-apollo' }
        ]
    },
    title: 'Vue3 Apollo'
})
