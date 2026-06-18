import type { InMemoryCacheConfig } from '@apollo/client'
import type { NormalizedCacheObject } from '@apollo/client/core'
import type { HttpLink as HttpLinkType } from '@apollo/client/link/http'
import type { RetryLink as RetryLinkType } from '@apollo/client/link/retry'
import type { NuxtApp } from 'nuxt/app'

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { defu } from 'defu'
import { useCookie } from 'nuxt/app'

import type { ApolloClientConfig } from '../../type'
import type { ApolloClientBuilder, ApolloClientContext } from '../defineApolloClient'
import type { ApolloErrorHookPayload } from '../types'

import { pick } from '../utils/pick'

const APOLLO_STATE_KEY_PREFIX = 'apollo:'

interface CreateApolloClientParams {
    clientId: string
    config: ApolloClientConfig
    // Subset used internally; cast to the full `NuxtApp` for the builder context,
    // since the plugin's `nuxtApp` is the base `_NuxtApp` (before `$apolloClients`
    // is provided), while builders expect the full, augmented `NuxtApp`.
    nuxtApp: Pick<NuxtApp, 'callHook' | 'hook' | 'payload' | 'runWithContext'>
    /** Optional runtime builder (from a client's `configFile`). */
    setup?: ApolloClientBuilder
}

export async function createApolloClient({ clientId, config, nuxtApp, setup }: CreateApolloClientParams) {
    const mergedAuthConfig = config.auth && defu(
        config.auth,
        {
            authHeader: 'Authorization',
            authType: 'Bearer',
            tokenName: `apollo:${clientId}:token`
        }
    )

    const tokenRef = mergedAuthConfig ? useCookie(mergedAuthConfig.tokenName) : undefined

    const getAuthCredentials = (): Record<string, string> => {
        if (!mergedAuthConfig || !mergedAuthConfig.authHeader || !tokenRef?.value) {
            return {}
        }

        // `authType` may be null/empty to send the token without any prefix
        const prefix = mergedAuthConfig.authType ? `${mergedAuthConfig.authType} ` : ''

        return {
            [mergedAuthConfig.authHeader]: `${prefix}${tokenRef.value}`
        }
    }

    // --- Link / cache factories (exposed to the builder so it can compose) ---

    const createAuthLink = () => new SetContextLink((prevContext) => {
        return defu(
            {
                headers: {
                    ...getAuthCredentials()
                }
            },
            prevContext
        )
    })

    const createHttpLink = (options?: Partial<HttpLinkType.Options>) => new HttpLink({
        ...config.httpLinkOptions,
        ...options,
        uri: options?.uri ?? config.httpEndpoint
    })

    const createErrorLink = () => new ErrorLink(({ error, operation }) => {
        const payload: ApolloErrorHookPayload = {
            clientId,
            operation
        }
        if (CombinedGraphQLErrors.is(error)) {
            payload.graphQLErrors = error
        }
        else if (CombinedProtocolErrors.is(error)) {
            payload.protocolErrors = error
        }
        else {
            payload.networkError = error
        }

        // Broadcast the error for centralized handling, then let it propagate.
        // Do NOT `return forward(operation)` here: retrying unconditionally on
        // every error (including persistent GraphQL errors) would loop forever.
        // Network-level retries are handled by RetryLink instead.
        void nuxtApp.callHook('apollo:error', payload)
    })

    const createRetryLink = (options?: RetryLinkType.Options) => new RetryLink(options)

    const createCache = (options?: InMemoryCacheConfig) => new InMemoryCache({
        ...config.inMemoryCacheOptions,
        ...options
    })

    // WebSocket factory. Pre-import graphql-ws (client-only, optional peer dep) so
    // the factory itself stays synchronous for the builder.
    let createWsLink: () => ApolloLink | undefined = () => undefined
    if (import.meta.client && config.wsEndpoint) {
        try {
            // Dynamic import to avoid bundling graphql-ws on the server
            const { createClient } = await import('graphql-ws')

            createWsLink = () => new GraphQLWsLink(
                createClient({
                    ...config.wsLinkOptions,
                    connectionParams: () => ({ ...getAuthCredentials() }),
                    url: config.wsEndpoint as string
                })
            )
        }
        catch (error) {
            console.warn(
                `[Apollo Client: ${clientId}] Failed to initialize WebSocket link. `
                + 'Make sure "graphql-ws" package is installed to use subscriptions.',
                error
            )
        }
    }

    // --- Default cache ---

    const defaultCache = createCache()

    // Restore SSR state into whichever cache the client ends up using (the builder
    // may return its own cache, so restore must run on the final instance).
    const restoreCache = (cache: { restore: (state: NormalizedCacheObject) => unknown }) => {
        if (import.meta.client) {
            const cachedState = nuxtApp.payload.data[`${APOLLO_STATE_KEY_PREFIX}${clientId}`]
            if (cachedState) {
                cache.restore(cachedState as NormalizedCacheObject)
            }
        }
    }

    // --- Default link chain: auth -> error -> retry -> http | ws-split ---

    const buildDefaultLink = () => {
        const httpLink = createHttpLink()
        const wsLink = createWsLink()

        const transport = wsLink
            ? ApolloLink.split(
                ({ query }) => {
                    const definition = getMainDefinition(query)
                    return (
                        definition.kind === 'OperationDefinition'
                        && definition.operation === 'subscription'
                    )
                },
                wsLink,
                httpLink
            )
            : httpLink

        return ApolloLink.from([createAuthLink(), createErrorLink(), createRetryLink(), transport])
    }

    const defaultLink = buildDefaultLink()

    // --- Run the optional builder ---

    const ctx: ApolloClientContext = {
        clientId,
        config,
        createAuthLink,
        createCache,
        createErrorLink,
        createHttpLink,
        createRetryLink,
        createWsLink,
        defaultCache,
        defaultLink,
        isServer: import.meta.server,
        nuxtApp: nuxtApp as NuxtApp
    }

    // Run the builder with the Nuxt context restored, so app-level composables
    // (useCookie, useRuntimeConfig, …) work even though the module may have
    // already awaited internally (e.g. the graphql-ws import) before this point.
    const overrides = setup
        ? await ctx.nuxtApp.runWithContext(() => setup(ctx))
        : undefined

    const wireSSR = (client: ApolloClient) => {
        // Extract Apollo state on the server-side for SSR hydration
        if (import.meta.server) {
            nuxtApp.hook('app:rendered', () => {
                const stateKey = `${APOLLO_STATE_KEY_PREFIX}${clientId}`
                nuxtApp.payload.data[stateKey] = client.cache.extract()
            })
        }
    }

    // Escape hatch: the builder returned a fully constructed client.
    if (overrides instanceof ApolloClient) {
        restoreCache(overrides.cache)
        wireSSR(overrides)
        return overrides
    }

    const { cache: overrideCache, devtools: overrideDevtools, link: overrideLink, ...overrideRest } = overrides ?? {}

    const finalCache = overrideCache ?? defaultCache
    restoreCache(finalCache)

    // On the server, force network-only so SSR always fetches fresh data. Server
    // defaults take precedence (deep-merged first), then builder options, then the
    // scalar config — so the SSR fetch policy can't be weakened by a builder/config.
    const mergedOptions = defu(
        {
            defaultOptions: import.meta.server
                ? {
                    query: {
                        fetchPolicy: 'network-only'
                    },
                    watchQuery: {
                        fetchPolicy: 'network-only'
                    }
                }
                : {}
        },
        overrideRest,
        pick(config, ['assumeImmutableResults', 'dataMasking', 'defaultOptions', 'localState', 'queryDeduplication'])
    ) as Partial<ApolloClient.Options>

    const client = new ApolloClient({
        ...mergedOptions,
        cache: finalCache,
        // The builder may override devtools; otherwise default to dev-only.
        devtools: overrideDevtools ?? {
            enabled: config.devtools ?? import.meta.dev,
            name: clientId
        },
        link: overrideLink ?? defaultLink,
        // Prevent refetching immediately after SSR hydration
        ssrForceFetchDelay: 100,
        // Enable server-side rendering support
        ssrMode: import.meta.server
    })

    wireSSR(client)

    return client
}
