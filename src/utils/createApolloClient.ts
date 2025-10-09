import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export function createApolloClient(uri: string) {
    const httpLink = new HttpLink({ uri })

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink
    })
}
