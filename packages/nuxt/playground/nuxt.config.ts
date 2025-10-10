export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: {
    enabled: true,
  },
  compatibilityDate: '2025-10-10',
  apollo: {
    clients: {
      default: {
        uri: 'https://graphqlplaceholder.vercel.app/graphql',
      },
    },
  },
})
