import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { apolloPlugin } from '@vue3-apollo/core'
import { createApp } from 'vue'

import App from '@/App.vue'

const app = createApp(App)

app.use(apolloPlugin, {
    clients: {
        default: new ApolloClient({
            cache: new InMemoryCache(),
            link: new HttpLink({ uri: 'https://graphqlplaceholder.vercel.app/graphql' })
        })
    }
})

app.mount('#app')
