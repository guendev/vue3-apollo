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

import { createEventHook, syncRef } from '@vueuse/core'
import { isDefined } from 'remeda'
import { isReadonly, isRef, onBeforeUnmount, ref, shallowRef, toRef, toValue, watch } from 'vue'

import { useApolloClient } from '@/composables/useApolloClient.ts'

export type UseQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
    enabled?: MaybeRefOrGetter<boolean>
    keepPreviousResult?: boolean
} & Omit<ApolloClient.WatchQueryOptions<TData, TVariables>, 'query' | 'variables'>

export function useQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseQueryOptions<TData, TVariables>
) {
    const client = useApolloClient()

    const query = shallowRef<ObservableQuery<TData, TVariables>>()
    const observer = shallowRef<ReturnType<ObservableQuery<TData, TVariables>['subscribe']>>()

    const result = shallowRef<TData>()
    const loading = ref(true)
    const networkStatus = ref<NetworkStatus>()
    const error = ref<ErrorLike>()

    const queryResult = createEventHook<TData>()
    const queryError = createEventHook<ErrorLike>()

    const enabled = toRef(options?.enabled ?? true)
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
            void queryError.trigger(value.error)
        }

        // Only update the result when:
        // - Has new data, or
        // - keepPreviousResult = false (always update even if undefined)
        if (isDefined(value.data) || !options?.keepPreviousResult) {
            result.value = value.data as TData
            if (isDefined(result.value)) {
                // eslint-disable-next-line ts/ban-ts-comment
                // @ts-expect-error
                void queryResult.trigger(value.data)
            }
        }
    }

    const onError = (e: ErrorLike) => {
        error.value = e
        void queryError.trigger(e)
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
        query.value.refetch(variables)
    }

    watch(reactiveVariables, (newVariables) => {
        if (enabled.value && query.value) {
            void query.value.setVariables(newVariables)
        }
    }, { deep: true })

    onBeforeUnmount(() => {
        stop()
    })

    return {
        error,
        loading,
        networkStatus,
        onError: queryError.on,
        onResult: queryResult.on,
        refetch,
        result,
        start,
        stop
    }
}
