import type {
    ApolloClient,
    ErrorLike,
    NetworkStatus,
    ObservableQuery,
    OperationVariables,
    TypedDocumentNode
} from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter, Ref } from 'vue'

import { createEventHook, syncRef, useDebounceFn, useThrottleFn } from '@vueuse/core'
import { computed, getCurrentScope, isReadonly, isRef, onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'

import type { UseBaseOption } from '../utils/type'

import { isDefined } from '../utils/isDefined'
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
 * @param document - GraphQL query document or typed document node
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
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseQueryOptions<TData, TVariables>
) {
    const client = useApolloClient(options?.clientId)

    const query = shallowRef<ObservableQuery<TData, TVariables>>()
    const observer = shallowRef<ReturnType<ObservableQuery<TData, TVariables>['subscribe']>>()

    const result = shallowRef<TData>()
    const loading = ref(true)
    const networkStatus = ref<NetworkStatus>()
    const error = ref<ErrorLike>()

    const onResult = createEventHook<TData>()
    const onErrorEvent = createEventHook<ErrorLike>()

    const enabled = computed(() => toValue(options?.enabled ?? true))
    const reactiveVariables = ref(toValue(variables))
    if (isRef(variables)) {
        syncRef(variables as Ref, reactiveVariables, {
            direction: isReadonly(variables) ? 'ltr' : 'both'
        })
    }

    const onNext = (value: ObservableQuery.Result<TData, 'complete' | 'empty' | 'partial' | 'streaming'>) => {
        loading.value = value.loading
        networkStatus.value = value.networkStatus

        error.value = value.error
        if (value.error) {
            void onErrorEvent.trigger(value.error)
        }

        // Only update the result when:
        // - Has new data, or
        // - keepPreviousResult = false (always update even if undefined)
        if (isDefined(value.data) || !options?.keepPreviousResult) {
            result.value = value.data as TData
            if (isDefined(result.value)) {
                // eslint-disable-next-line ts/ban-ts-comment
                // @ts-expect-error
                void onResult.trigger(value.data)
            }
        }
    }

    const onError = (e: ErrorLike) => {
        error.value = e
        void onErrorEvent.trigger(e)
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

        query.value = client.watchQuery<TData, TVariables>({
            notifyOnNetworkStatusChange: options?.notifyOnNetworkStatusChange ?? options?.keepPreviousResult,
            query: document,
            variables: toValue(reactiveVariables),
            ...options
        })

        startObserver()
    }

    start()

    watch(enabled, (isEnabled) => {
        if (isEnabled) {
            start()
        }
        else {
            stop()
        }
    })

    const refetch = async (variables?: TVariables) => {
        if (!query.value) {
            return
        }
        error.value = undefined
        loading.value = true
        return query.value.refetch(variables)
    }

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

    watch(reactiveVariables, (newVariables) => {
        optimizedUpdateVariables(newVariables)
    }, {
        deep: true,
        flush: 'post'
    })

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
         * onErrorEvent((error) => {
         *   toast.error(error.message)
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
         * onResult((data) => {
         *   console.log('New data:', data)
         * })
         * ```
         */
        onResult: onResult.on,

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
