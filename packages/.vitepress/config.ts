import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    description: 'Vue 3 + Apollo Client utilities and Nuxt 4 module',
    themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
        nav: [
            { link: '/', text: 'Home' },
            { link: '/getting-started', text: 'Getting Started' },
            { link: '/core', text: 'Core' },
            { link: '/nuxt', text: 'Nuxt' }
        ],

        sidebar: [
            {
                items: [
                    { link: '/getting-started', text: 'Getting Started' }
                ],
                text: 'Guide'
            },
            {
                items: [
                    { link: '/core', text: 'Core' },
                    { link: '/nuxt', text: 'Nuxt' }
                ],
                text: 'Packages'
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/guendev/vue3-apollo' }
        ]
    },
    title: 'Vue3 Apollo'
})
