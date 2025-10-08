import type { Plugin } from 'vue'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export interface ApolloPluginOptions {
    key?: string | symbol
    token?: string
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

        const _key = options.key || 'apollo'

        // Provide client toàn cục
        app.provide(_key, apolloClient)

        app.config.globalProperties[`${_key.toString()}`] = apolloClient
    }
}
