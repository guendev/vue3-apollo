import type { ApolloClient } from '@apollo/client/core'

import { APOLLO_CLIENTS_KEY, omit } from '@vue3-apollo/core'
import { defineNuxtPlugin } from '#app'
import { defu } from 'defu'

import { createApolloClient } from './utils/createApolloClient'

export default defineNuxtPlugin(async (nuxtApp) => {
    const runTimeconfig = nuxtApp.$config
    const apolloConfig = runTimeconfig.public.apollo

    if (!apolloConfig?.clients) {
        throw new Error('[vue3-apollo] No Apollo clients configured')
    }

    // Create all clients in parallel
    const entries = await Promise.all(
        Object.entries(apolloConfig.clients).map(async ([clientId, config]) => {
            const client = await createApolloClient({
                clientId,
                config: defu(config, omit(apolloConfig, ['clients', 'autoImports'])),
                nuxtApp
            })
            return [clientId, client] as const
        })
    )

    const apolloClients: Record<string, ApolloClient> = Object.fromEntries(entries)

    nuxtApp.vueApp.provide(APOLLO_CLIENTS_KEY, apolloClients)

    return {
        provide: {
            apolloClients
        }
    }
})
