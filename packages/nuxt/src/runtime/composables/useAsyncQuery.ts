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

export type UseAsyncQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    key?: MaybeRefOrGetter<string>
} & ApolloClient.QueryOptions<Optional<TData>, TVariables> & UseBaseOption
type NoInfer<T> = [T][T extends any ? 0 : never]

type Optional<T> = T | undefined

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
    const key = toValue(options.key) || hash({
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
