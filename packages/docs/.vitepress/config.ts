import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    cleanUrls: true,
    description: 'Vue 3 + Apollo Client utilities and Nuxt 4 module',
    ignoreDeadLinks: true,
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
                        link: '/nuxt/composables/useAsyncQuery',
                        text: 'useAsyncQuery'
                    }
                ],
                text: 'Nuxt'
            },
            {
                items: [
                    {
                        link: '/composables/useApolloClient',
                        text: 'useApolloClient'
                    },
                    {
                        link: '/composables/useMutation',
                        text: 'useMutation'
                    },
                    {
                        link: '/composables/useQuery',
                        text: 'useQuery'
                    },
                    {
                        link: '/composables/useSubscription',
                        text: 'useSubscription'
                    }
                ],
                text: 'Composables'
            },
            {
                items: [
                    {
                        link: '/advance/tracking',
                        text: 'Tracking'
                    }
                ],
                text: 'Advance'
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/guendev/vue3-apollo' }
        ]
    },
    title: 'Vue3 Apollo'
})
