import type { Cache, MissingTree } from '@apollo/client/cache'
import type {
    ApolloClient,
    ErrorLike,
    FragmentType,
    GetDataState,
    MaybeMasked,
    OperationVariables,
    Reference,
    StoreObject,
    TypedDocumentNode
} from '@apollo/client/core'
import type { DeepPartial } from '@apollo/client/utilities'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter } from 'vue'

import { createEventHook } from '@vueuse/core'
import { computed, getCurrentScope, onScopeDispose, onServerPrefetch, ref, shallowRef, toValue, watch } from 'vue'

import type { HookContext, UseBaseOption } from '../utils/type'

import { isDefined } from '../utils/isDefined'
import { isServer } from '../utils/isServer'
import { useApolloClient } from './useApolloClient'

/**
 * Options for useFragment composable
 *
 * @template TData - Type of the fragment result data
 * @template TVariables - Type of the fragment variables
 */
export type UseFragmentOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    /**
     * Entity identifier to read the fragment from.
     * Can be an object with __typename and id, a cache reference, or a string ID.
     *
     * @example
     * ```ts
     * from: { __typename: 'User', id: '123' }
     * from: computed(() => ({ __typename: 'User', id: userId.value }))
     * from: 'User:123'
     * ```
     */
    from?: MaybeRefOrGetter<FragmentType<NoInfer<TData>> | null | Reference | StoreObject | string | undefined>

    /**
     * GraphQL fragment document.
     */
    fragment: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>

    /**
     * Fragment name (required if document has multiple fragments).
     */
    fragmentName?: MaybeRefOrGetter<string>

    /**
     * Whether the fragment should be watched.
     * Can be a ref or getter for reactive control.
     * When false, the fragment will be stopped and no updates will be received.
     *
     * @default true
     *
     * @example
     * ```ts
     * enabled: computed(() => isVisible.value)
     * ```
     */
    enabled?: MaybeRefOrGetter<boolean>

    /**
     * Whether to prefetch the fragment on the server during SSR.
     * When true, the fragment will be read on the server and the result
     * will be available immediately on the client.
     *
     * @default true
     */
    prefetch?: boolean

    /**
     * Fragment variables.
     */
    variables?: MaybeRefOrGetter<NoInfer<TVariables>>

    /**
     * Whether to read from optimistic or non-optimistic cache data.
     *
     * @default true
     */
    optimistic?: boolean
} & UseBaseOption

/** Fragment result with completion status and data */
export type UseFragmentResult<TData>
    = | ({
        complete: false
        missing?: MissingTree
    } & GetDataState<MaybeMasked<TData>, 'partial'>)
    | ({
        complete: true
        missing?: never
    } & GetDataState<MaybeMasked<TData>, 'complete'>)

/**
 * Composable for reading GraphQL fragments from Apollo Cache with Vue reactivity.
 * Provides a lightweight live binding and automatically updates when fragment data changes.
 *
 * @template TData - Type of the fragment result data
 * @template TVariables - Type of the fragment variables
 *
 * @param options - Fragment options including document, from identifier, and settings
 *
 * @returns Object containing fragment state and control methods
 *
 * @example
 * ```ts
 * const { data, complete } = useFragment({
 *   fragment: gql`fragment UserFields on User { id name email }`,
 *   from: { __typename: 'User', id: '123' }
 * })
 *
 * // Use optional chaining for partial data
 * console.log(data.value?.name)
 * ```
 *
 * // Type-safe access with result (recommended):
 * @example
 * ```ts
 * const { result } = useFragment({
 *   fragment: USER_FRAGMENT,
 *   from: { __typename: 'User', id: '123' }
 * })
 *
 * if (result.value?.complete) {
 *   // No optional chaining needed
 *   console.log(result.value.data.name)
 *   console.log(result.value.data.email)
 * }
 * ```
 */
export function useFragment<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
    options: UseFragmentOptions<TData, TVariables>
) {
    const client = useApolloClient(options.clientId)
    const cache = computed(() => client.cache)

    const enabled = computed(() => toValue(options.enabled ?? true))
    const optimistic = options.optimistic ?? true

    const result = shallowRef<UseFragmentResult<TData>>()
    const error = ref<ErrorLike>()

    const onResultEvent = createEventHook<[UseFragmentResult<TData>, HookContext]>()
    const onErrorEvent = createEventHook<[ErrorLike, HookContext]>()

    // Handle reactive from
    const reactiveFrom = computed(() => toValue(options.from))

    // Handle reactive variables
    const reactiveVariables = computed(() => toValue(options.variables))
    const reactiveFragment = computed(() => toValue(options.fragment))
    const reactiveFragmentName = computed(() => toValue(options.fragmentName))

    // Calculate cache id
    const cacheId = computed(() => {
        const fromValue = reactiveFrom.value
        if (typeof fromValue === 'string') {
            return fromValue
        }

        if (!fromValue) {
            return fromValue
        }

        return cache.value.identify(fromValue)
    })

    const diffToResult = (diff: Cache.DiffResult<TData>): UseFragmentResult<TData> => {
        const result = {
            complete: diff.complete,
            data: diff.result,
            dataState: diff.complete ? 'complete' : 'partial'
        } as UseFragmentResult<TData>

        if (diff.missing) {
            result.missing = diff.missing.missing
        }

        return result
    }

    const diff = (): UseFragmentResult<TData> => {
        const id = cacheId.value
        const fragment = reactiveFragment.value
        const fragmentName = reactiveFragmentName.value

        if (!id) {
            return diffToResult({
                complete: false,
                result: {} as DeepPartial<TData>
            })
        }

        const diff = cache.value.diff<TData, TVariables>({
            id,
            optimistic,
            // https://github.com/apollographql/apollo-client/blob/cc1e467e4edeeb9ea66e0af3615fbb7d5fbda693/src/react/hooks/useFragment.ts#L191
            // eslint-disable-next-line dot-notation
            query: cache.value['getFragmentDoc'](
                // https://github.com/apollographql/apollo-client/blob/cc1e467e4edeeb9ea66e0af3615fbb7d5fbda693/src/react/hooks/useFragment.ts#L192
                // eslint-disable-next-line dot-notation
                client['transform'](fragment),
                fragmentName
            ),
            returnPartialData: true,
            variables: reactiveVariables.value
        })

        // https://github.com/apollographql/apollo-client/blob/cc1e467e4edeeb9ea66e0af3615fbb7d5fbda693/src/react/hooks/useFragment.ts#L201C17-L201C23
        // eslint-disable-next-line dot-notation
        const maskedResult = client['queryManager'].maskFragment({
            data: diff.result === null ? {} : diff.result,
            fragment,
            fragmentName
        })

        return diffToResult({
            ...diff,
            result: maskedResult
        })
    }

    // SSR Support: Prefetch fragment on server during SSR
    const prefetch = options.prefetch ?? true
    if (prefetch && enabled.value && isServer()) {
        onServerPrefetch(() => {
            try {
                const fragmentResult = diff()
                result.value = fragmentResult

                if (isDefined(fragmentResult.data)) {
                    void onResultEvent.trigger(fragmentResult, { client })
                }
            }
            catch (e) {
                error.value = e as ErrorLike
                void onErrorEvent.trigger(e as ErrorLike, { client })
            }
        })
    }

    const subscription = shallowRef<ReturnType<ReturnType<ApolloClient['watchFragment']>['subscribe']>>()

    const start = () => {
        if (!enabled.value) {
            return
        }

        const id = cacheId.value

        if (!id) {
            result.value = diffToResult({
                complete: false,
                result: {} as DeepPartial<TData>
            })
            return
        }

        // Read initial data
        result.value = diff()

        if (isDefined(result.value.data)) {
            void onResultEvent.trigger(result.value, { client })
        }

        // Watch for changes
        try {
            const observable = client.watchFragment({
                fragment: reactiveFragment.value,
                fragmentName: reactiveFragmentName.value,
                from: id,
                optimistic,
                variables: reactiveVariables.value
            })

            subscription.value = observable.subscribe({
                error: (e) => {
                    error.value = e as ErrorLike
                    void onErrorEvent.trigger(e as ErrorLike, { client })
                },
                next: (value) => {
                    result.value = value as UseFragmentResult<TData>
                    error.value = undefined

                    if (isDefined(value.data)) {
                        void onResultEvent.trigger(value as UseFragmentResult<TData>, { client })
                    }
                }
            })
        }
        catch (e) {
            error.value = e as ErrorLike
            void onErrorEvent.trigger(e as ErrorLike, { client })
        }
    }

    const stop = () => {
        if (subscription.value) {
            subscription.value.unsubscribe()
            subscription.value = undefined
        }
    }

    const restart = () => {
        if (enabled.value) {
            stop()
            start()
        }
    }

    // Only start on the client-side, server data is handled via onServerPrefetch
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

        // Watch for changes in from, variables, or fragment options
        watch(
            [reactiveFragmentName, cacheId, reactiveVariables],
            () => {
                restart()
            },
            { deep: true, flush: 'post' }
        )

        watch(reactiveFragment, () => {
            restart()
        })
    }

    if (getCurrentScope()) {
        onScopeDispose(() => {
            stop()
        })
    }
    else {
        console.warn('[useFragment] The fragment will not be automatically stopped when running outside of a scope')
    }

    return {
        /**
         * Whether all fragment fields were found in cache.
         */
        complete: computed(() => result.value?.complete ?? false),

        /**
         * The fragment result data.
         * Can be undefined if no data has been loaded yet or if `from` is null.
         * May contain partial data when not all fields are available in cache.
         *
         * For type-safe access without optional chaining, use `result` with type narrowing.
         *
         * @example
         * Basic usage with optional chaining:
         * ```ts
         * const { data } = useFragment(options)
         * console.log(data.value?.name)
         * ```
         *
         * @example
         * Create a helper for complete data access:
         * ```ts
         * // composables/useStrictFragment.ts
         * import type { OperationVariables } from '@apollo/client'
         * import type { UseFragmentOptions } from '@vue3-apollo/core'
         *
         * export function useStrictFragment<TData = unknown, TVariables extends OperationVariables = OperationVariables>(options: UseFragmentOptions<TData, TVariables>) {
         *     const fragment = useFragment(options)
         *     const data = computed(() => fragment.result.value.data as TData)
         *     return { ...fragment, data }
         * }
         *
         * // Usage
         * const { data } = useStrictFragment(options)
         * if (data.value) {
         *   console.log(data.value.name) // No optional chaining needed
         * }
         * ```
         */
        data: computed(() => result.value?.data),

        /**
         * GraphQL error if reading the fragment failed.
         */
        error,

        /**
         * A tree of all MissingFieldError messages reported during fragment reading.
         */
        missing: computed(() => result.value?.missing),

        /**
         * Event hook that fires when a fragment error occurs.
         *
         * @example
         * ```ts
         * onError((error, context) => {
         *   console.error('Fragment error:', error.message)
         * })
         * ```
         */
        onError: onErrorEvent.on,

        /**
         * Event hook that fires when new fragment results are received.
         * Only fires when actual data is present (not undefined).
         *
         * @example
         * ```ts
         * onResult((data, context) => {
         *   console.log('Fragment updated:', data)
         * })
         * ```
         */
        onResult: onResultEvent.on,

        /**
         * The full fragment result including data, complete status, and missing info.
         *
         * This is the recommended way to access fragment data with type safety.
         * TypeScript can narrow the type based on the `complete` flag, eliminating
         * the need for optional chaining.
         *
         * @example
         * Type-safe access with complete check:
         * ```ts
         * const { result } = useFragment(options)
         *
         * if (result.value?.complete) {
         *   // TypeScript knows all fields are present
         *   console.log(result.value.data.name) // No optional chaining needed
         *   console.log(result.value.data.email)
         * } else if (result.value?.data) {
         *   // Partial data - use optional chaining
         *   console.log(result.value.data.name ?? 'Loading...')
         * }
         * ```
         *
         * @example
         * Handle missing fields:
         * ```ts
         * const { result, missing } = useFragment(options)
         *
         * if (!result.value?.complete && missing.value) {
         *   console.log('Missing fields:', missing.value)
         * }
         * ```
         */
        result,

        /**
         * Manually start watching the fragment.
         * Useful after stopping the fragment or when using enabled: false initially.
         *
         * @example
         * ```ts
         * const { start, stop } = useFragment({
         *   fragment: MY_FRAGMENT,
         *   from: { __typename: 'User', id: '123' },
         *   enabled: false
         * })
         * // Later...
         * start()
         * ```
         */
        start,

        /**
         * Stop watching the fragment and unsubscribe from updates.
         * Useful for pausing fragments or cleaning up manually.
         *
         * @example
         * ```ts
         * const { stop } = useFragment(options)
         * // Stop when no longer needed
         * stop()
         * ```
         */
        stop
    }
}
