import type { Plugin } from 'vue'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export interface ApolloPluginOptions {
    uri: string
}

export const apolloPlugin: Plugin<ApolloPluginOptions> = {
    install(app, options) {
        if (!options?.uri) {
            throw new Error('[ApolloPlugin] Missing `uri` in options')
        }

        const httpLink = new HttpLink({ uri: options.uri })

        const apolloClient = new ApolloClient({
            cache: new InMemoryCache(),
            link: httpLink
        })

        // Provide client toàn cục
        app.provide('apollo', apolloClient)

        app.config.globalProperties.$apollo = apolloClient
    }
}
