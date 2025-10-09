import type { ApolloCache, ApolloClient, ErrorLike, OperationVariables, TypedDocumentNode } from '@apollo/client/core'
import type { DocumentNode } from 'graphql'

import { createEventHook } from '@vueuse/core'
import { isDefined } from 'remeda'
import { nextTick, ref, shallowRef } from 'vue'

import { useApolloClient } from '@/composables/useApolloClient.ts'

export type UseMutationOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache
> = {
    clientId?: string
    throws?: 'always' | 'auto' | 'never'
} & Omit<ApolloClient.MutateOptions<TData, TVariables, TCache>, 'mutation' | 'variables'>

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

    const onDone = createEventHook<TData>()
    const onError = createEventHook<ErrorLike>()

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
                // eslint-disable-next-line ts/ban-ts-comment
                // @ts-expect-error
                void onDone.trigger(result.data)
            }

            if (result.error) {
                error.value = result.error
                void onError.trigger(result.error)
            }

            return result
        }
        catch (e) {
            const mutationErrorValue = e as ErrorLike
            error.value = mutationErrorValue

            await nextTick()
            void onError.trigger(mutationErrorValue)
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
        called,
        data,
        error,
        loading,
        mutate,
        onDone: onDone.on,
        onError: onError.on,
        reset
    }
}
