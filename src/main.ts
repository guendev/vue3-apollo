import { createApp } from 'vue'

import '@/style.css'
import App from '@/App.vue'
import { apolloPlugin } from '@/plugins/apollo.ts'

const app = createApp(App)

app.use(apolloPlugin, {
    uri: 'https://graphqlplaceholder.vercel.app/graphql'
})

app.mount('#app')
