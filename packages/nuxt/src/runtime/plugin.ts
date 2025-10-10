import type { ApolloClient } from '@apollo/client/core'

import { APOLLO_CLIENTS_KEY } from '@vue3-apollo/core'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

import { createApolloClient } from './utils/createApolloClient'

export default defineNuxtPlugin(async (nuxtApp) => {
    const runTimeconfig = useRuntimeConfig()
    const apolloConfig = runTimeconfig.public.apollo

    if (!apolloConfig?.clients) {
        throw new Error('[vue3-apollo] No Apollo clients configured')
    }

    const apolloClients: Record<string, ApolloClient> = {}

    for (const [clientId, config] of Object.entries(apolloConfig.clients)) {
        apolloClients[clientId] = await createApolloClient({
            clientId,
            config,
            nuxtApp
        })
    }

    nuxtApp.vueApp.provide(APOLLO_CLIENTS_KEY, apolloClients)

    return {
        provide: {
            apolloClients
        }
    }
})
