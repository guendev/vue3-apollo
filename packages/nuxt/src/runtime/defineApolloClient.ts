import type { ApolloClient, ApolloLink, InMemoryCache, InMemoryCacheConfig } from '@apollo/client'
import type { SetContextLink } from '@apollo/client/link/context'
import type { ErrorLink } from '@apollo/client/link/error'
import type { HttpLink } from '@apollo/client/link/http'
import type { RetryLink } from '@apollo/client/link/retry'
import type { NuxtApp } from 'nuxt/app'

import type { ApolloClientConfig } from '../type'

/** A builder function as accepted by {@link defineApolloClient}. */
export type ApolloClientBuilder = (ctx: ApolloClientContext) => ApolloClientSetup | Promise<ApolloClientSetup>

/**
 * Building blocks and context passed to a {@link defineApolloClient} builder.
 *
 * The factories produce the same links/cache the module would build by default,
 * so you can **compose** (insert/replace individual links) instead of rebuilding
 * the whole chain — auth, the `apollo:error` hook, the WS subscription split and
 * SSR cache handling all keep working.
 */
export interface ApolloClientContext {
    /** The id of the client being created. */
    clientId: string

    /** The resolved (scalar) client config from `nuxt.config` runtime config. */
    config: ApolloClientConfig

    /** `true` while running on the server (SSR). */
    isServer: boolean

    /** The current Nuxt app instance. Use `nuxtApp.runWithContext` after `await`. */
    nuxtApp: NuxtApp

    /** Create the auth link (injects the cookie token into headers). */
    createAuthLink: () => SetContextLink

    /** Create an `InMemoryCache`, merged on top of `inMemoryCacheOptions`. */
    createCache: (options?: InMemoryCacheConfig) => InMemoryCache

    /** Create the error link that broadcasts the `apollo:error` hook. */
    createErrorLink: () => ErrorLink

    /** Create the HTTP link, merged on top of `httpLinkOptions`. */
    createHttpLink: (options?: Partial<HttpLink.Options>) => HttpLink

    /** Create a `RetryLink`. */
    createRetryLink: (options?: RetryLink.Options) => RetryLink

    /**
     * Create the WebSocket link for subscriptions.
     * Returns `undefined` on the server, when no `wsEndpoint` is set, or when
     * `graphql-ws` is not installed.
     */
    createWsLink: () => ApolloLink | undefined

    /** The fully assembled default cache (with SSR state already restored on the client). */
    defaultCache: InMemoryCache

    /** The fully assembled default link chain: `[auth, error, retry, http|ws-split]`. */
    defaultLink: ApolloLink
}

/**
 * What a {@link defineApolloClient} builder may return:
 * - a partial options object (recommended) — the module fills the rest and wires SSR; or
 * - a fully constructed `ApolloClient` (escape hatch) — the module only wires SSR.
 */
export type ApolloClientSetup = ApolloClient | ApolloClientSetupOptions

/**
 * Apollo Client options a builder may return. `ssrMode` / `ssrForceFetchDelay`
 * are managed by the module and cannot be overridden.
 */
export type ApolloClientSetupOptions = Partial<Omit<ApolloClient.Options, 'ssrForceFetchDelay' | 'ssrMode'>>

/**
 * Define an Apollo Client at runtime for advanced setups that cannot be expressed
 * as serializable `nuxt.config` options — custom links, a custom cache instance,
 * or `typePolicies` with functions (which are lost when serialized).
 *
 * Reference the file from `nuxt.config` via the client's `configFile` option.
 *
 * @example
 * ```ts
 * // app/apollo/default.ts
 * import { ApolloLink, InMemoryCache } from '@apollo/client'
 *
 * export default defineApolloClient((ctx) => ({
 *   cache: new InMemoryCache({ typePolicies: { Query: { fields: { feed: relayStylePagination() } } } }),
 *   link: ApolloLink.from([ctx.createAuthLink(), ctx.createErrorLink(), new MyLink(), ctx.createHttpLink()])
 * }))
 * ```
 */
export function defineApolloClient(builder: ApolloClientBuilder): ApolloClientBuilder {
    return builder
}
