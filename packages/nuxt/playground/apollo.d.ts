import type { ErrorPolicy } from '@apollo/client'

/**
 * Declare the default options you intend to set in `apollo.defaultOptions`
 * (or per-client `defaultOptions`) in `nuxt.config.ts`.
 *
 * Apollo Client v4 requires `errorPolicy` / `returnPartialData` defaults to be
 * declared before use for type safety. Without this, TypeScript reports:
 *   "A default option for query.errorPolicy must be declared in
 *    ApolloClient.DeclareDefaultOptions before usage."
 *
 * @see https://www.apollographql.com/docs/react/data/typescript#declaring-default-options-for-type-safety
 */
declare module '@apollo/client' {
    namespace ApolloClient {
        namespace DeclareDefaultOptions {
            interface Mutate {
                errorPolicy?: ErrorPolicy
            }
            interface Query {
                errorPolicy?: ErrorPolicy
            }
            interface WatchQuery {
                errorPolicy?: ErrorPolicy
                returnPartialData?: boolean
            }
        }
    }
}

export {}
