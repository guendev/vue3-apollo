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
    from: MaybeRefOrGetter<FragmentType<NoInfer<TData>> | Reference | StoreObject | string>

    /**
     * GraphQL fragment document.
     */
    fragment: DocumentNode | TypedDocumentNode<TData, TVariables>

    /**
     * Fragment name (required if document has multiple fragments).
     */
    fragmentName?: string

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

    // Calculate cache id
    const cacheId = computed(() => {
        const fromValue = reactiveFrom.value
        if (typeof fromValue === 'string') {
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
        const { fragment, fragmentName } = options

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

    const stop = () => {
        if (subscription.value) {
            subscription.value.unsubscribe()
            subscription.value = undefined
        }
    }

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
                fragment: options.fragment,
                fragmentName: options.fragmentName,
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
            [cacheId, reactiveVariables],
            () => {
                if (enabled.value) {
                    stop()
                    start()
                }
            },
            { deep: true }
        )
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
         * For better type safety, use `result` with type narrowing.
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
         * Use this for better TypeScript type narrowing.
         *
         * @example
         * ```ts
         * if (result.value?.complete) {
         *   console.log(result.value.data.name) // No optional chaining needed
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
