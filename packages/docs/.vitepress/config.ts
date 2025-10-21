import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    cleanUrls: true,
    description: 'Vue 3 + Apollo Client utilities and Nuxt 4 module',
    ignoreDeadLinks: true,
    markdown: {
        config(md) {
            md.use(groupIconMdPlugin)
        }
    },
    themeConfig: {
        editLink: {
            pattern: 'https://github.com/guendev/vue3-apollo/tree/main/packages/docs/:path',
            text: 'Edit this page on GitHub'
        },
        nav: [
            {
                link: '/getting-started',
                text: 'Guide'
            },
            {
                link: '/nuxt',
                text: 'Nuxt'
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
                    },
                    {
                        link: '/migration',
                        text: 'Migration'
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
                        link: '/composables/useFragment',
                        text: 'useFragment'
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
            { icon: 'github', link: 'https://github.com/guendev/vue3-apollo' },
            { icon: 'facebook', link: 'https://www.facebook.com/guen.dev' }
        ]
    },
    title: 'Vue Apollo',
    vite: {
        plugins: [
            groupIconVitePlugin()
        ]
    }
})
