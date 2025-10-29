import type {
    ApolloClient,
    ErrorLike,
    NetworkStatus,
    ObservableQuery,
    OperationVariables,
    TypedDocumentNode
} from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter } from 'vue'

import { createEventHook, useDebounceFn, useThrottleFn } from '@vueuse/core'
import { computed, getCurrentScope, onScopeDispose, onServerPrefetch, ref, shallowRef, toValue, watch } from 'vue'

import type { HookContext, UseBaseOption } from '../utils/type'

import { useApolloTracking } from '../helpers/useApolloTracking'
import { isDefined } from '../utils/isDefined'
import { isServer } from '../utils/isServer'
import { omit } from '../utils/omit'
import { useApolloClient } from './useApolloClient'

/**
 * Options for useQuery composable
 *
 * @template TData - Type of the query result data
 * @template TVariables - Type of the query variables
 */
export type UseQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    /**
     * Delay in milliseconds before executing the query after variables change.
     * Waits for variables to stop changing before making the request.
     * Useful for search inputs where you want to wait until the user stops typing.
     *
     * Note: If both debounce and throttle are provided, debounce takes priority.
     *
     * @example
     * ```ts
     * useQuery(SEARCH_QUERY, searchText, {
     *   debounce: 500, // Wait 500 ms after the last keystroke
     *   keepPreviousResult: true
     * })
     * ```
     */
    debounce?: number

    /**
     * Whether the query should be executed.
     * Can be a ref or getter for reactive control.
     * When false, the query will be stopped and no requests will be made.
     *
     * @default true
     *
     * @example
     * ```ts
     * const shouldFetch = ref(false)
     * useQuery(MY_QUERY, variables, {
     *   enabled: shouldFetch // Query only runs when shouldFetch is true
     * })
     * ```
     */
    enabled?: MaybeRefOrGetter<boolean>

    /**
     * Keep the previous query result while fetching new data.
     * When true, prevents a result from being reset to undefined when variables change
     * and cache doesn't have data yet.
     *
     * Useful for providing better UX by showing old data while loading new data.
     *
     * @default false
     *
     * @example
     * ```ts
     * useQuery(PAGINATED_QUERY, page, {
     *   keepPreviousResult: true // Show previous page while loading next
     * })
     * ```
     */
    keepPreviousResult?: boolean

    /**
     * Whether to prefetch the query on the server during SSR.
     * When true, the query will be executed on the server and the result
     * will be available immediately on the client without refetching.
     *
     * @default true
     *
     * @example
     * ```ts
     * useQuery(USER_QUERY, userId, {
     *   prefetch: true // Fetch data on server for SSR
     * })
     * ```
     */
    prefetch?: boolean

    /**
     * Maximum frequency (in milliseconds) at which the query can be executed
     * when variables change. Limits the rate of requests but ensures periodic updates.
     * Useful for real-time filters or scroll events.
     *
     * Note: If both debounce and throttle are provided, debounce takes priority.
     *
     * @example
     * ```ts
     * useQuery(FILTER_QUERY, filters, {
     *   throttle: 500 // Execute at most once every 500 ms
     * })
     * ```
     */
    throttle?: number
} & Omit<ApolloClient.WatchQueryOptions<TData, TVariables>, 'query' | 'variables'> & UseBaseOption

/**
 * Composable for executing GraphQL queries with Vue reactivity.
 * Automatically manages query lifecycle, caching, and reactive updates.
 *
 * @template TData - Type of the query result data
 * @template TVariables - Type of the query variables
 *
 * @param document - GraphQL query document or typed document node (can be reactive ref or getter)
 * @param variables - Query variables (can be reactive ref or getter)
 * @param options - Query options including Apollo options and custom features
 *
 * @returns Object containing query state and control methods
 *
 * @example
 * ```ts
 * const searchText = ref('')
 * const { result, loading, error, refetch } = useQuery(
 *   SEARCH_QUERY,
 *   searchText,
 *   {
 *     debounce: 300,
 *     keepPreviousResult: true
 *   }
 * )
 * ```
 */
export function useQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
    document: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseQueryOptions<TData, TVariables>
) {
    const client = useApolloClient(options?.clientId)

    const query = shallowRef<ObservableQuery<TData, TVariables>>()
    const observer = shallowRef<ReturnType<ObservableQuery<TData, TVariables>['subscribe']>>()

    const enabled = computed(() => toValue(options?.enabled ?? true))

    const result = shallowRef<TData>()
    const loading = ref(toValue(enabled))
    const networkStatus = ref<NetworkStatus>()
    const error = ref<ErrorLike>()

    const onResultEvent = createEventHook<[TData, HookContext]>()
    const onErrorEvent = createEventHook<[ErrorLike, HookContext]>()

    // Setup loading tracking
    useApolloTracking({
        state: loading,
        type: 'queries'
    })

    const reactiveVariables = computed(() => toValue(variables) ?? {} as TVariables)
    const reactiveDocument = computed(() => toValue(document))

    const getQueryOptions = () => {
        if (!options) {
            return {}
        }

        return omit(
            options,
            ['debounce', 'enabled', 'keepPreviousResult', 'throttle', 'clientId', 'prefetch']
        )
    }

    // SSR Support: Prefetch a query on server during SSR
    const prefetch = options?.prefetch ?? true
    if (prefetch && enabled.value && isServer()) {
        onServerPrefetch(async () => {
            try {
                const queryResult = await client.query<TData, TVariables>({
                    ...getQueryOptions(),
                    query: reactiveDocument.value,
                    variables: reactiveVariables.value
                })

                // Set initial data from server
                result.value = queryResult.data
                // Set loading to false after successful prefetch
                loading.value = false
                if (queryResult.error) {
                    error.value = queryResult.error
                }
            }
            catch (e) {
                error.value = e as ErrorLike
                loading.value = false
            }
        })
    }

    const onNext = (value: ObservableQuery.Result<TData, 'complete' | 'empty' | 'partial' | 'streaming'>) => {
        loading.value = value.loading
        networkStatus.value = value.networkStatus

        error.value = value.error
        if (value.error) {
            void onErrorEvent.trigger(value.error, { client })
        }

        // Only update the result when:
        // - Has new data, or
        // - keepPreviousResult = false (always update even if undefined)
        if (isDefined(value.data) || !options?.keepPreviousResult) {
            result.value = value.data as TData
            if (isDefined(result.value)) {
                void onResultEvent.trigger(value.data as TData, { client })
            }
        }
    }

    const onError = (e: ErrorLike) => {
        error.value = e
        void onErrorEvent.trigger(e, { client })
    }

    const startObserver = () => {
        if (!query.value) {
            return
        }

        if (observer.value && !observer.value.closed) {
            return
        }

        observer.value = query.value.subscribe({
            error: onError,
            next: onNext
        })
    }

    const stop = () => {
        loading.value = false

        if (observer.value && !observer.value.closed) {
            observer.value.unsubscribe()
        }
        observer.value = undefined

        if (query.value) {
            query.value.stopPolling()
            query.value = undefined
        }
    }

    const start = () => {
        if (!enabled.value) {
            return
        }

        // Check if we have cached data from SSR on the client-side
        if (!isServer()) {
            try {
                const cachedData = client.readQuery<TData, TVariables>({
                    query: reactiveDocument.value,
                    variables: reactiveVariables.value
                })

                // If we have cached data from SSR, set the result and loading state immediately
                if (cachedData) {
                    result.value = cachedData
                    loading.value = false
                }
            }
            catch {
                // No cached data continue with normal flow
            }
        }

        query.value = client.watchQuery<TData, TVariables>({
            ...getQueryOptions(),
            notifyOnNetworkStatusChange: options?.notifyOnNetworkStatusChange ?? options?.keepPreviousResult,
            query: reactiveDocument.value,
            variables: reactiveVariables.value
        })

        startObserver()
    }

    // Only start observer on the client-side, not on server
    // Server-side data is already fetched via onServerPrefetch
    if (!isServer()) {
        start()

        watch(enabled, (isEnabled) => {
            if (isEnabled) {
                start()
            }
            else {
                stop()
            }
        })

        const updateVariables = (newVariables: TVariables) => {
            if (enabled.value && query.value) {
                void query.value.setVariables(newVariables)
            }
        }

        // Debounce has priority over throttle if both are provided
        const optimizedUpdateVariables = options?.debounce
            ? useDebounceFn(updateVariables, options.debounce)
            : options?.throttle
                ? useThrottleFn(updateVariables, options.throttle)
                : updateVariables

        watch(reactiveVariables, (updatedVariables) => {
            optimizedUpdateVariables(updatedVariables)
        }, {
            deep: true,
            flush: 'post'
        })

        watch(reactiveDocument, () => {
            if (enabled.value) {
                stop()
                start()
            }
        })
    }

    const refetch = async (variables?: TVariables) => {
        if (!query.value) {
            return
        }
        error.value = undefined
        loading.value = true
        return query.value.refetch(variables)
    }

    const fetchMore = async (options: Pick<ObservableQuery.FetchMoreOptions<TData, TVariables>, 'updateQuery' | 'variables'>) => {
        if (!query.value) {
            return
        }

        error.value = undefined
        loading.value = true
        return query.value.fetchMore(options)
    }

    if (getCurrentScope()) {
        onScopeDispose(() => {
            stop()
        })
    }
    else {
        console.warn('[useQuery] The query will not be automatically stopped when running outside of a scope')
    }

    return {
        /**
         * GraphQL error if the query failed.
         * Includes both network errors and GraphQL errors.
         */
        error,

        /**
         * Fetch more data and merge it with existing results.
         * Useful for pagination, infinite scroll, or load more functionality.
         * Uses Apollo Client's updateQuery to merge new data with existing cache.
         *
         * @param updateQuery - Function to merge previous result with new data
         * @param variables - New variables for the query (e.g., next page offset)
         *
         * @example
         * ```ts
         * // Load more items for pagination
         * const { result, fetchMore } = useQuery(ITEMS_QUERY, { offset: 0, limit: 10 })
         *
         * const loadMore = async () => {
         *   await fetchMore({
         *     variables: {
         *       offset: result.value.items.length
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
        fetchMore,

        /**
         * Whether the query is currently loading.
         * True during initial load and refetch operations.
         */
        loading,

        /**
         * Apollo NetworkStatus enum value.
         * Provides detailed information about the query state.
         * @see https://www.apollographql.com/docs/react/data/queries/#inspecting-loading-states
         */
        networkStatus,

        /**
         * Event hook that fires when a query error occurs.
         * Use this to react to errors (e.g., show notifications).
         *
         * @example
         * ```ts
         * onError((error, context) => {
         *   toast.error(error.message)
         *   console.log('Failed with client:', context.client)
         * })
         * ```
         */
        onError: onErrorEvent.on,

        /**
         * Event hook that fires when new query results are received.
         * Only fires when actual data is present (not undefined).
         *
         * @example
         * ```ts
         * onResultEvent((data, context) => {
         *   console.log('New data:', data)
         *   console.log('Apollo client:', context.client)
         * })
         * ```
         */
        onResult: onResultEvent.on,

        /**
         * Manually refetch the query with optional new variables.
         * Always bypasses cache and makes a network request.
         *
         * @param variables - Optional new variables for the refetch
         *
         * @example
         * ```ts
         * // Refetch with same variables
         * await refetch()
         *
         * // Refetch with new variables
         * await refetch({ id: '123' })
         * ```
         */
        refetch,

        /**
         * The query result data.
         * Can be undefined if no data has been loaded yet.
         * When keepPreviousResult is true, retains previous data during refetch.
         */
        result,

        /**
         * Manually start the query.
         * Useful after stopping the query or when using enabled: false initially.
         *
         * @example
         * ```ts
         * const { start, stop } = useQuery(QUERY, vars, { enabled: false })
         * // Later...
         * start()
         * ```
         */
        start,

        /**
         * Stop the query and unsubscribe from updates.
         * Useful for pausing queries or cleaning up manually.
         *
         * @example
         * ```ts
         * const { stop } = useQuery(QUERY, vars)
         * // Stop when no longer needed
         * stop()
         * ```
         */
        stop
    }
}
