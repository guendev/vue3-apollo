import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    description: 'Vue Apollo',
    themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
        nav: [
            { link: '/', text: 'Home' },
            { link: '/markdown-examples', text: 'Examples' }
        ],

        sidebar: [
            {
                items: [
                    { link: '/markdown-examples', text: 'Markdown Examples' },
                    { link: '/api-examples', text: 'Runtime API Examples' }
                ],
                text: 'Examples'
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    },
    title: 'Vue Apollo'
})
