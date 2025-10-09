import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export function createApolloClient(uri: string) {
    const httpLink = new HttpLink({ uri: config.uri })

    const apolloClient = new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink
    })
}
