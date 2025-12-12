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
import { toValue, unref } from 'vue'

/**
 * Extended AsyncData type with fetchMore support for pagination
 *
 * @template TData - The data type returned from the GraphQL query
 * @template TError - The error type
 * @template TVariables - The type of variables passed to the query
 */
export type AsyncDataWithFetchMore<TData, TError, TVariables extends OperationVariables = OperationVariables> = {
    /**
     * Fetch more data and merge it with existing results.
     * Useful for pagination, infinite scroll, or load more functionality.
     *
     * @param options - Options for fetching more data
     * @param options.variables - New variables for the query (e.g., next page offset)
     * @param options.updateQuery - Function to merge previous result with new data
     *
     * @example
     * ```typescript
     * const { data, fetchMore } = await useAsyncQuery({
     *   query: ITEMS_QUERY,
     *   variables: { offset: 0, limit: 10 }
     * })
     *
     * const loadMore = async () => {
     *   await fetchMore({
     *     variables: {
     *       offset: data.value.items.length
     *     },
     *     updateQuery: (previousResult, { fetchMoreResult }) => {
     *       if (!fetchMoreResult) return previousResult
     *       return {
     *         ...previousResult,
     *         items: [...previousResult.items, ...fetchMoreResult.items]
     *       }
     *     }
     *   })
     * }
     * ```
     */
    fetchMore: (options: {
        updateQuery: (previousResult: TData, options: { fetchMoreResult: TData | undefined }) => TData
        variables?: Partial<TVariables>
    }) => Promise<void>
} & AsyncData<TData, TError>

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
 * - Pagination support with fetchMore
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
 * @returns {AsyncDataWithFetchMore<DefaultT | PickFrom<DataT, PickKeys>, ErrorLike | NuxtError | undefined, TVariables>} Object containing reactive data, pending state, error, fetchMore, and utility functions
 *
 * @example
 * ```typescript
 * const { data, pending, error, fetchMore } = await useAsyncQuery({
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
): AsyncDataWithFetchMore<DefaultT | PickFrom<DataT, PickKeys>, ErrorLike | NuxtError | undefined, TVariables>

export function useAsyncQuery<
    DataT = unknown,
    TVariables extends OperationVariables = OperationVariables,
    PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
    DefaultT = DataT
>(
    options: UseAsyncQueryOptions<DataT, TVariables>,
    config?: AsyncDataOptions<DataT, DataT, PickKeys, DefaultT>
): AsyncDataWithFetchMore<DefaultT | PickFrom<DataT, PickKeys>, ErrorLike | NuxtError | undefined, TVariables>

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

    const asyncData = useAsyncData<DataT, ErrorLike, DataT, PickKeys, DefaultT>(
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

    /**
     * Fetch more data and merge it with existing results
     */
    const fetchMore = async (fetchOptions: {
        updateQuery: (previousResult: DataT, options: { fetchMoreResult: DataT | undefined }) => DataT
        variables?: Partial<TVariables>
    }) => {
        // Merge new variables with existing ones
        const mergedVariables = {
            ...toValue(options.variables),
            ...fetchOptions.variables
        } as TVariables

        try {
            // Fetch more data using Apollo client
            const queryResult = await client.query({
                ...omit(options, ['clientId', 'key']),
                // Always fetch from network for fetchMore
                fetchPolicy: 'network-only',
                variables: mergedVariables
            })

            if (queryResult.error) {
                throw queryResult.error
            }

            // Get the previous result from asyncData
            // AsyncData's data can be of various types based on PickKeys and DefaultT
            const previousResult = asyncData.data.value

            // Only merge if we have both previous and new results
            if (previousResult !== null && previousResult !== undefined && queryResult.data) {
                // Merge the results using the updateQuery function
                const updatedData = fetchOptions.updateQuery(previousResult as DataT, {
                    fetchMoreResult: queryResult.data as DataT
                })

                // Update the asyncData with merged results
                // We need to cast here because the AsyncData type uses complex PickFrom/DefaultT generics
                asyncData.data.value = updatedData as typeof asyncData.data.value
            }
        }
        catch (error) {
            asyncData.error.value = error as ErrorLike | NuxtError
            throw error
        }
    }

    return {
        ...asyncData,
        fetchMore
    }
}
