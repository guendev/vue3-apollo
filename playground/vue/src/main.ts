import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { createApp } from 'vue'
import { apolloPlugin } from 'vue3-apollo'

import '~/style.css'
import App from '~/App.vue'

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
