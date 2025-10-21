import type { ApolloClient } from '@apollo/client/core'

import { APOLLO_CLIENTS_KEY, omit } from '@vue3-apollo/core'
import { defineNuxtPlugin } from '#app'
import { defu } from 'defu'

import { createApolloClient } from './utils/createApolloClient'

export default defineNuxtPlugin(async (nuxtApp) => {
    const runTimeconfig = nuxtApp.$config
    const globalConfig = runTimeconfig.public.apollo

    if (!globalConfig?.clients) {
        throw new Error('[vue3-apollo] No Apollo clients configured')
    }

    const apolloClients: Record<string, ApolloClient> = {}

    for (const [clientId, config] of Object.entries(globalConfig.clients)) {
        apolloClients[clientId] = await createApolloClient({
            clientId,
            config: defu(config, omit(globalConfig, ['clients', 'autoImports'])),
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
