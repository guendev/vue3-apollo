import type { ObservableQuery, OperationVariables, TypedDocumentNode } from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { Subscription } from 'rxjs'

import { onBeforeUnmount, ref, shallowRef } from 'vue'

import type { Nullable } from '@/utils/type.ts'

import { useApolloClient } from '@/composables/useApolloClient.ts'

export function useQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: TVariables
) {
    const client = useApolloClient()

    const query = shallowRef<ObservableQuery<TData, TVariables>>()
    const observer = shallowRef<Nullable<Subscription>>()

    const result = shallowRef<TData>()
    const loading = ref(true)
    const error = ref<any>()

    const onNext = (value: ObservableQuery.Result<TData, 'complete' | 'empty' | 'partial' | 'streaming'>) => {
        error.value = null
        loading.value = value.loading
        result.value = value.data as TData
    }

    const onError = (e: any) => {
        error.value = e
    }

    const startObserver = () => {
        if (!query.value) {
            return
        }

        if (observer.value && observer.value.closed) {
            return
        }

        observer.value = query.value.subscribe({
            error: onError,
            next: onNext
        })
    }

    const start = () => {
        query.value = client.watchQuery<TData, TVariables>({
            query: document,
            variables: variables ?? {} as TVariables
        })

        startObserver()
    }

    start()

    onBeforeUnmount(() => {
        observer.value?.unsubscribe()
    })

    const refetch = async (vars?: TVariables) => {
        if (!query.value) {
            return
        }
        error.value = null
        loading.value = true
        query.value.refetch(vars)
    }

    return { error, loading, refetch, result }
}
