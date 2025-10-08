import type { App } from 'vue'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

export interface ApolloPluginOptions {
    token?: string // optional auth token
    uri: string
}

export const ApolloPlugin = {
    install(app: App, options: ApolloPluginOptions) {
        if (!options?.uri) {
            throw new Error('[ApolloPlugin] Missing `uri` in options')
        }

        const httpLink = new HttpLink({ uri: options.uri })

        const apolloClient = new ApolloClient({
            cache: new InMemoryCache(),
            link: httpLink
        })

        // Provide client toàn cục
        app.provide('apollo', apolloClient);

        // Optionally attach vào app.config.globalProperties để truy cập qua this.$apollo
        (app.config.globalProperties as any).$apollo = apolloClient
    }
}
