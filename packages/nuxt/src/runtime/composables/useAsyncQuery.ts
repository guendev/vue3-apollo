import type {
    ApolloClient,
    ErrorLike,
    OperationVariables
} from '@apollo/client/core'
import type { UseBaseOption } from '@vue3-apollo/core'
import type { KeysOf, PickFrom } from '#app/composables/asyncData'
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import type { MaybeRefOrGetter } from 'vue'

import { omit, useApolloClient } from '@vue3-apollo/core'
import { print } from 'graphql'
import { useAsyncData } from 'nuxt/app'
import { hash } from 'ohash'
import { unref } from 'vue'

/**
 * Configuration options for useAsyncQuery composable
 *
 * @template TData - The data type returned from the GraphQL query
 * @template TVariables - The type of variables passed to the query
 *
 * @property {MaybeRefOrGetter<string>} [key] - Unique key for caching query results. If not provided, key will be auto-generated from query and variables
 */
export type UseAsyncQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    key?: MaybeRefOrGetter<string>
} & ApolloClient.QueryOptions<Optional<TData>, TVariables> & UseBaseOption

/**
 * Type helper to prevent type inference in specific cases
 * @internal
 */
type NoInfer<T> = [T][T extends any ? 0 : never]

/**
 * Type helper to make a type optional (undefined)
 * @internal
 */
type Optional<T> = T | undefined

/**
 * Composable for executing asynchronous GraphQL queries in Nuxt
 *
 * Combines Apollo Client with Nuxt's useAsyncData to provide:
 * - Server-side rendering (SSR) support
 * - Automatic caching with unique keys
 * - Loading states and error handling
 * - Type-safe with TypeScript
 *
 * @template DataT - The data type returned from the GraphQL query
 * @template TVariables - The type of variables passed to the query
 * @template PickKeys - Keys picked from the returned data
 * @template DefaultT - Default data type when query is not completed
 *
 * @param {UseAsyncQueryOptions<DataT, TVariables>} options - Query configuration options including GraphQL query, variables, and Apollo Client options
 * @param {AsyncDataOptions<DataT, DataT, PickKeys, DefaultT>} [config] - Configuration options for Nuxt's useAsyncData
 *
 * @returns {AsyncData<DefaultT | PickFrom<DataT, PickKeys>, ErrorLike | NuxtError | undefined>} Object containing reactive data, pending state, error, and utility functions
 *
 * @example
 * ```typescript
 * const { data, pending, error } = await useAsyncQuery({
 *   query: gql`
 *     query GetUser($id: ID!) {
 *       user(id: $id) {
 *         id
 *         name
 *         email
 *       }
 *     }
 *   `,
 *   variables: { id: '123' }
 * })
 * ```
 */
export function useAsyncQuery<
    DataT = unknown,
    TVariables extends OperationVariables = OperationVariables,
    PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
    DefaultT = undefined
>(
    options: UseAsyncQueryOptions<DataT, TVariables>,
    config?: AsyncDataOptions<DataT, DataT, PickKeys, DefaultT>
): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, ErrorLike | NuxtError | undefined>

export function useAsyncQuery<
    DataT = unknown,
    TVariables extends OperationVariables = OperationVariables,
    PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
    DefaultT = DataT
>(
    options: UseAsyncQueryOptions<DataT, TVariables>,
    config?: AsyncDataOptions<DataT, DataT, PickKeys, DefaultT>
): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, ErrorLike | NuxtError | undefined>

export function useAsyncQuery<
    DataT = unknown,
    TVariables extends OperationVariables = OperationVariables,
    PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
    DefaultT = undefined
>(
    options: UseAsyncQueryOptions<DataT, TVariables>,
    config?: AsyncDataOptions<DataT, DataT, PickKeys, DefaultT>
) {
    const client = useApolloClient(options?.clientId)

    // Generate a unique key for the query if not provided
    const key = options.key || hash({
        clientId: options.clientId,
        query: print(options.query),
        variables: unref(options.variables)
    })

    return useAsyncData<DataT, ErrorLike, DataT, PickKeys, DefaultT>(
        key,
        async () => {
            const queryResult = await client.query({
                ...omit(options, ['clientId', 'key']),
                variables: options.variables as NoInfer<TVariables>
            })

            if (queryResult.error) {
                throw queryResult.error
            }

            return queryResult.data as DataT
        },
        config
    )
}
