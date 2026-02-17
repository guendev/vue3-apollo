import { defineConfig } from 'vitepress'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
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
            },
            {
                link: '/advance/skills',
                text: 'Skills'
            }
        ],
        search: {
            provider: 'local'
        },
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
                    },
                    {
                        link: '/guide/apollo-plugin',
                        text: 'Apollo Plugin'
                    },
                    {
                        link: '/about/credits',
                        text: 'Credits'
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
                        link: '/nuxt/configuration',
                        text: 'Configuration'
                    },
                    {
                        link: '/nuxt/composables/useAsyncQuery',
                        text: 'useAsyncQuery'
                    },
                    {
                        link: '/nuxt/hooks',
                        text: 'Hooks'
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
                        link: '/composables/useApolloClients',
                        text: 'useApolloClients'
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
                        link: '/advance/nuxt-custom-integration',
                        text: 'Nuxt Integration'
                    },
                    {
                        link: '/advance/typescript',
                        text: 'TypeScript & Codegen'
                    },
                    {
                        link: '/advance/tracking',
                        text: 'Tracking'
                    },
                    {
                        link: '/advance/skills',
                        text: 'Skills'
                    }
                ],
                text: 'Advanced'
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
