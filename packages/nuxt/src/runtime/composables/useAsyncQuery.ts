import type {
    ApolloClient,
    OperationVariables,
    TypedDocumentNode
} from '@apollo/client/core'
import type { UseBaseOption } from '@vue3-apollo/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter } from 'vue'

import { omit, useApolloClient } from '@vue3-apollo/core'
import { useAsyncData } from '#app'
import { toValue } from 'vue'

/**
 * Options for useAsyncQuery composable
 *
 * @template TData - Type of the query result data
 * @template TVariables - Type of the query variables
 */
export type UseAsyncQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    /**
     * Custom key for the async data.
     * If not provided, a key will be auto-generated based on the query.
     *
     * @example
     * ```ts
     * useAsyncQuery(MY_QUERY, variables, {
     *   key: 'my-custom-key'
     * })
     * ```
     */
    key?: string

    /**
     * Whether to fetch data on the server during SSR.
     * When false, the query will only be executed on the client.
     *
     * @default true
     */
    server?: boolean

    /**
     * Whether to fetch data on the client.
     * When false, the query will only be executed on the server.
     *
     * @default true
     */
    lazy?: boolean

    /**
     * Whether to fetch data immediately.
     * When false, you need to manually call execute/refresh.
     *
     * @default true
     */
    immediate?: boolean

    /**
     * Watch reactive sources and auto-refresh when they change.
     * Can be an array of refs/getters to watch.
     *
     * @default []
     */
    watch?: MaybeRefOrGetter<any>[]

    /**
     * Transform the query result before returning.
     * Useful for extracting nested data or mapping results.
     *
     * @example
     * ```ts
     * useAsyncQuery(USER_QUERY, variables, {
     *   transform: (data) => data.user
     * })
     * ```
     */
    transform?: (data: TData) => any

    /**
     * Whether to deduplicate requests with the same key.
     * When true, multiple calls with the same key will share the same request.
     *
     * @default 'defer'
     */
    dedupe?: 'cancel' | 'defer'
} & Omit<ApolloClient.QueryOptions<TData, TVariables>, 'query' | 'variables'> & UseBaseOption

/**
 * Composable for executing GraphQL queries with Nuxt's async data fetching.
 * Automatically handles SSR, caching, and provides Nuxt-compatible async data structure.
 *
 * @template TData - Type of the query result data
 * @template TVariables - Type of the query variables
 *
 * @param document - GraphQL query document or typed document node
 * @param variables - Query variables (can be reactive ref or getter)
 * @param options - Query options including Apollo options and Nuxt async data options
 *
 * @returns Nuxt async a data object with data, pending, error, refresh, etc.
 *
 * @example
 * ```ts
 * const { data, pending, error, refresh } = await useAsyncQuery(
 *   USER_QUERY,
 *   { id: '123' },
 *   {
 *     key: 'user-123',
 *     watch: [userId]
 *   }
 * )
 * ```
 */
export function useAsyncQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseAsyncQueryOptions<TData, TVariables>
) {
    const client = useApolloClient(options?.clientId)

    // Generate a unique key for the query if not provided
    const key = options?.key || `apollo-query-${document.loc?.source.body.slice(0, 50) || 'unknown'}`

    // Extract Apollo-specific options
    const getQueryOptions = () => {
        if (!options) {
            return {}
        }

        return omit(options, [
            'clientId',
            'key',
            'server',
            'lazy',
            'immediate',
            'watch',
            'transform',
            'dedupe'
        ])
    }

    return useAsyncData(
        key,
        async () => {
            const queryResult = await client.query<TData, TVariables>({
                ...getQueryOptions(),
                query: document,
                variables: toValue(variables) as NoInfer<TVariables>
            })

            if (queryResult.error) {
                throw queryResult.error
            }

            // Ensure we return the data, throw if undefined
            if (queryResult.data === undefined || queryResult.data === null) {
                throw new Error('Query returned no data')
            }

            return queryResult.data
        },
        {
            dedupe: options?.dedupe,
            immediate: options?.immediate,
            lazy: options?.lazy,
            server: options?.server,
            transform: options?.transform,
            watch: options?.watch
        }
    )
}
