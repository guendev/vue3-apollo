import type { ApolloCache, ApolloClient, ErrorLike, OperationVariables, TypedDocumentNode } from '@apollo/client/core'
import type { DocumentNode } from 'graphql'

import { createEventHook } from '@vueuse/core'
import { nextTick, ref, shallowRef } from 'vue'

import type { HookContext, UseBaseOption } from '../utils/type'

import { useApolloTracking } from '../helpers/useApolloTracking'
import { isDefined } from '../utils/isDefined'
import { useApolloClient } from './useApolloClient'

/**
 * Options for useMutation composable
 *
 * @template TData - Type of the mutation result data
 * @template TVariables - Type of the mutation variables
 * @template TCache - Type of the Apollo cache
 */
export type UseMutationOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache
> = {

    /**
     * Controls when the mutation should throw errors.
     * - 'always': Always throw errors (useful with try/catch)
     * - 'auto': Default Apollo behavior
     * - 'never': Never throw, only set error state
     *
     * @default 'auto'
     *
     * @example
     * ```ts
     * useMutation(MUTATION, {
     *   throws: 'always' // Will throw on error
     * })
     * ```
     */
    throws?: 'always' | 'auto' | 'never'
} & Omit<ApolloClient.MutateOptions<TData, TVariables, TCache>, 'mutation' | 'variables'> & UseBaseOption

/**
 * Composable for executing GraphQL mutations with Vue reactivity.
 * Provides a function to trigger mutations and reactive state for results.
 *
 * @template TData - Type of the mutation result data
 * @template TVariables - Type of the mutation variables
 * @template TCache - Type of the Apollo cache
 *
 * @param document - GraphQL mutation document or typed document node
 * @param options - Mutation options including Apollo options and custom features
 *
 * @returns Object containing mutation function, state, and event hooks
 *
 * @example
 * ```ts
 * // Basic usage
 * const { mutate, loading, error } = useMutation(CREATE_USER_MUTATION)
 * await mutate({ name: 'John', email: 'john@example.com' })
 *
 * // With options
 * const { mutate, data, onDone } = useMutation(UPDATE_USER_MUTATION, {
 *   refetchQueries: ['GetUsers'],
 *   awaitRefetchQueries: true
 * })
 *
 * onDone((data) => {
 *   console.log('Mutation completed:', data)
 * })
 *
 * // With per-call options
 * await mutate (variables, {
 *   optimisticResponse: { updateUser: { id: '1', name: 'John' } }
 * })
 * ```
 */
export function useMutation<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache
>(
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    options?: UseMutationOptions<TData, TVariables, TCache>
) {
    const client = useApolloClient(options?.clientId)

    const data = shallowRef<TData>()
    const loading = ref(false)
    const error = ref<ErrorLike>()
    const called = ref(false)

    const onDone = createEventHook<[TData, HookContext]>()
    const onError = createEventHook<[ErrorLike, HookContext]>()

    useApolloTracking({
        state: loading,
        type: 'mutations'
    })

    const mutate = async (
        variables?: TVariables,
        mutateOptions?: Omit<ApolloClient.MutateOptions<TData, TVariables, TCache>, 'mutation' | 'variables'>
    ) => {
        loading.value = true
        error.value = undefined
        called.value = true

        try {
            const result = await client.mutate<TData, TVariables, TCache>({
                mutation: document,
                variables: variables as TVariables ?? undefined,
                ...options,
                ...mutateOptions
            })

            data.value = result.data

            if (isDefined(result.data)) {
                await nextTick()
                void onDone.trigger(result.data, { client })
            }

            if (result.error) {
                error.value = result.error
                void onError.trigger(result.error, { client })
            }

            return result
        }
        catch (e) {
            const mutationErrorValue = e as ErrorLike
            error.value = mutationErrorValue

            await nextTick()
            void onError.trigger(mutationErrorValue, { client })
            if (options?.throws === 'always') {
                throw e
            }
        }
        finally {
            loading.value = false
        }
    }

    const reset = () => {
        data.value = undefined
        loading.value = false
        error.value = undefined
        called.value = false
    }

    return {
        /**
         * Whether the mutation has been called at least once.
         * Useful for conditional rendering based on mutation execution state.
         */
        called,

        /**
         * The mutation result data.
         * Undefined until the mutation completes successfully.
         */
        data,

        /**
         * GraphQL error if the mutation failed.
         * Includes both network errors and GraphQL errors.
         */
        error,

        /**
         * Whether the mutation is currently executing.
         * True from when mutate() is called until completion or error.
         */
        loading,

        /**
         * Function to execute the mutation.
         *
         * @param variables - Variables for the mutation
         * @param mutateOptions - Per-call options that override base options
         * @returns Promise resolving to the mutation result
         *
         * @example
         * ```ts
         * // Basic call
         * await mutate({ id: '1', name: 'John' })
         *
         * // With per-call options
         * await mutate (variables, {
         *   refetchQueries: ['GetSpecificUser'],
         *   optimisticResponse: { ... }
         * })
         * ```
         */
        mutate,

        /**
         * Event hook that fires when the mutation completes successfully.
         * Only fires when actual data is returned (not undefined).
         *
         * @example
         * ```ts
         * onDone((data, context) => {
         *   toast.success('User created!')
         *   router.push(`/users/${data.createUser.id}`)
         *   // Access Apollo client for manual cache updates
         *   context.client.cache.evict({ fieldName: 'users' })
         * })
         * ```
         */
        onDone: onDone.on,

        /**
         * Event hook that fires when the mutation encounters an error.
         * Fires for both network errors and GraphQL errors.
         *
         * @example
         * ```ts
         * onError((error, context) => {
         *   toast.error(error.message)
         *   console.error('Mutation failed:', error)
         *   // Access Apollo client for error handling
         *   context.client.clearStore()
         * })
         * ```
         */
        onError: onError.on,

        /**
         * Reset the mutation state to initial values.
         * Clears data, error, loading, and called flags.
         *
         * @example
         * ```ts
         * // After mutation completes
         * if (data.value) {
         *   reset() // Clear state for next use
         * }
         * ```
         */
        reset
    }
}
