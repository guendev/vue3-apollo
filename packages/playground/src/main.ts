import 'virtual:uno.css'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import App from '~/App.vue'
import { apolloPlugin } from '~core/plugins'
import { createApp } from 'vue'

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
