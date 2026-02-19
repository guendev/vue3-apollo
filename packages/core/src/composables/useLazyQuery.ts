import type {
    OperationVariables,
    TypedDocumentNode
} from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter, Ref } from 'vue'

import { computed, nextTick, ref, toValue } from 'vue'

import type { UseQueryOptions } from './useQuery'

import { isDefined } from '../utils/isDefined'
import { useQuery } from './useQuery'

/**
 * Options for useLazyQuery composable.
 *
 * Manual execution controls the lifecycle, so `enabled` is intentionally omitted.
 *
 * This type extends all `useQuery` options except `enabled`.
 * Apollo query behavior (cache, fetchPolicy, errorPolicy, etc.) is still applied.
 *
 * @template TData - Type of the query result data
 * @template TVariables - Type of the query variables
 *
 * @example
 * ```ts
 * useLazyQuery(GET_USERS, undefined, {
 *   fetchPolicy: 'cache-first',
 *   keepPreviousResult: true
 * })
 * ```
 */
export type UseLazyQueryOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
> = Omit<UseQueryOptions<TData, TVariables>, 'enabled'>

export interface UseLazyQueryReturn<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
> {
    /**
     * Whether `execute()` has been called at least once.
     */
    called: Ref<boolean>

    /**
     * Executes (or re-executes) the lazy query and resolves with query data.
     *
     * @param variables - Optional per-call variables
     * @returns Promise resolving to query data
     */
    execute: (variables?: TVariables) => Promise<TData>
}

/**
 * Composable for manual/lazy query execution.
 * Uses `useQuery` internally with `enabled: false` and exposes an `execute()` trigger.
 *
 * Unlike `useQuery`, no request is sent until `execute()` is called.
 * Once started, it still follows Apollo cache/network behavior from query options.
 *
 * @template TData - Type of the query result data
 * @template TVariables - Type of the query variables
 *
 * @param document - GraphQL query document or typed document node
 * @param variables - Default variables (can be reactive)
 * @param options - Lazy query options (`useQuery` options except `enabled`)
 *
 * @returns `useQuery` return object plus:
 * - `called`: Whether lazy query has been triggered
 * - `execute(variables?)`: Manual trigger resolving to query data
 *
 * @example
 * ```ts
 * const { execute, called, loading, result } = useLazyQuery(GET_POSTS, undefined, {
 *   fetchPolicy: 'cache-first'
 * })
 *
 * const loadPosts = async () => {
 *   const data = await execute({ userId: 1, first: 10 })
 *   console.log(data.posts)
 * }
 * ```
 */
export function useLazyQuery<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
>(
    document: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseLazyQueryOptions<TData, TVariables>
): ReturnType<typeof useQuery<TData, TVariables>> & UseLazyQueryReturn<TData, TVariables> {
    const called = ref(false)
    const enabled = ref(false)
    const executeVariables = ref<TVariables>()

    const reactiveVariables = computed(() => executeVariables.value ?? toValue(variables) ?? {} as TVariables)

    const { query, start, ...rest } = useQuery<TData, TVariables>(
        document,
        reactiveVariables,
        {
            ...(options ?? {}),
            enabled
        } as unknown as UseQueryOptions<TData, TVariables>
    )

    /**
     * Triggers query execution and resolves with result data.
     * The first call enables and starts the underlying observer when needed.
     */
    const execute = async (variables?: TVariables) => {
        called.value = true

        if (isDefined(variables)) {
            executeVariables.value = variables
        }

        if (!enabled.value) {
            enabled.value = true
            await nextTick()
        }

        if (!query.value) {
            start()
            await nextTick()
        }

        if (!query.value) {
            throw new Error('[useLazyQuery] Failed to start query observer')
        }

        const queryResult = await query.value.reobserve({
            variables: reactiveVariables.value
        })

        const errorPolicy = options?.errorPolicy ?? 'none'
        if (queryResult.error && errorPolicy === 'none') {
            throw queryResult.error
        }

        if (!isDefined(queryResult.data)) {
            if (queryResult.error) {
                throw queryResult.error
            }
            throw new Error('[useLazyQuery] Query completed without data')
        }

        return queryResult.data as TData
    }

    return {
        ...rest,
        called,
        execute,
        query,
        start
    }
}
