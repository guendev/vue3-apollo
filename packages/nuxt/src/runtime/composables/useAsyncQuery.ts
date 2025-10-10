import type {
    ApolloClient,
    ErrorLike,
    OperationVariables
} from '@apollo/client/core'
import type { UseBaseOption } from '@vue3-apollo/core'
import type { AsyncDataOptions } from '#app'
import type { MaybeRefOrGetter } from 'vue'

import { omit, useApolloClient } from '@vue3-apollo/core'
import { useAsyncData } from '#app'
import { print } from 'graphql'
import { hash } from 'ohash'
import { unref } from 'vue'

export type UseAsyncQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    key?: MaybeRefOrGetter<string>
} & ApolloClient.QueryOptions<Optional<TData>, TVariables> & UseBaseOption

type Optional<T> = T | undefined

export function useAsyncQuery<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
>(
    options: UseAsyncQueryOptions<TData, TVariables>,
    config?: AsyncDataOptions<Optional<TData>>
) {
    const client = useApolloClient(options?.clientId)

    // Generate a unique key for the query if not provided
    // Todo: Add support for custom key generation
    const key = options.key || hash({
        clientId: options.clientId,
        query: print(options.query),
        variables: unref(options.variables)
    })

    return useAsyncData<Optional<TData>, ErrorLike>(key, async () => {
        const queryResult = await client.query({
            ...omit(options, ['clientId', 'key']),
            variables: options.variables as NoInfer<TVariables>
        })

        if (queryResult.error) {
            throw queryResult.error
        }

        return queryResult.data
    }, config)
}
