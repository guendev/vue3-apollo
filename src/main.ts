import { createApp } from 'vue'

import '@/style.css'
import App from '@/App.vue'
import { apolloPlugin } from '@/plugins/apolloPlugin.ts'

const app = createApp(App)

app.use(apolloPlugin, {
    clients: {}
})

app.mount('#app')
