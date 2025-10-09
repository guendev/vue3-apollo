import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

import '~/test/style.css'
import { createApp } from 'vue'

import { apolloPlugin } from '~/core/plugins/apolloPlugin'
import App from '~/test/App.vue'

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
