import type { ErrorLike, ObservableQuery, OperationVariables, TypedDocumentNode } from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter, Ref } from 'vue'

import { syncRef } from '@vueuse/core'
import { isReadonly, isRef, onBeforeUnmount, ref, shallowRef, toRef, toValue, watch } from 'vue'

import { useApolloClient } from '@/composables/useApolloClient.ts'

export interface UseQueryOptions {
    enabled?: MaybeRefOrGetter<boolean>
}

export function useQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseQueryOptions
) {
    const client = useApolloClient()

    const query = shallowRef<ObservableQuery<TData, TVariables>>()
    const observer = shallowRef<ReturnType<ObservableQuery<TData, TVariables>['subscribe']>>()

    const result = shallowRef<TData>()
    const loading = ref(true)
    const error = ref<ErrorLike>()

    const enabled = toRef(options?.enabled ?? true)

    const reactiveVariables = ref(toValue(variables))
    if (isRef(variables)) {
        syncRef(variables as Ref, reactiveVariables, {
            direction: isReadonly(variables) ? 'ltr' : 'both'
        })
    }

    const onNext = (value: ObservableQuery.Result<TData, 'complete' | 'empty' | 'partial' | 'streaming'>) => {
        error.value = value.error
        loading.value = value.loading
        result.value = value.data as TData
    }

    const onError = (e: ErrorLike) => {
        error.value = e
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
        if (observer.value && !observer.value.closed) {
            observer.value.unsubscribe()
        }
    }

    const start = () => {
        if (!enabled.value) {
            return
        }

        query.value = client.watchQuery<TData, TVariables>({
            query: document,
            variables: toValue(reactiveVariables) as TVariables
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
        reactiveVariables.value = variables
        error.value = undefined
        loading.value = true
        query.value.refetch(variables)
    }

    watch(reactiveVariables, (newVariables) => {
        if (enabled.value && query.value) {
            void refetch(newVariables)
        }
    }, { deep: true })

    onBeforeUnmount(() => {
        stop()
    })

    return { error, loading, refetch, result }
}
