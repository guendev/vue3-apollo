import type { ApolloClient } from '@apollo/client/core'

import { APOLLO_CLIENTS_KEY } from '@vue3-apollo/core'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createApolloClient } from '~/src/runtime/utils/createApolloClient'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const apolloConfig = config.public.apollo

    if (!apolloConfig?.clients) {
        throw new Error('[vue3-apollo] No Apollo clients configured')
    }

    const apolloClients: Record<string, ApolloClient> = {}

    Object.entries(apolloConfig.clients).forEach(([clientId, clientConfig]) => {
        apolloClients[clientId] = createApolloClient(clientId, clientConfig)
    })

    nuxtApp.vueApp.provide(APOLLO_CLIENTS_KEY, apolloClients)

    return {
        provide: {
            apolloClients
        }
    }
})
