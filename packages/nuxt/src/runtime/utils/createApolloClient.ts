import type { ApolloClientConfig } from '~/src/type'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export function createApolloClient(clientId: string, options: ApolloClientConfig) {
    // Create an HTTP link
    const httpLink = new HttpLink({
        uri: options.uri
    })

    // Create an Apollo Client instance
    return new ApolloClient({
        cache: new InMemoryCache(),
        // Disable force fetch on server
        defaultOptions: {
            watchQuery: {
                fetchPolicy: import.meta.server ? 'no-cache' : 'cache-first'
            }
        },
        devtools: {
            enabled: options.devtools ?? options.devtools,
            name: clientId
        },
        link: httpLink,
        // Enable server-side rendering support
        ssrMode: import.meta.server
    })
}
