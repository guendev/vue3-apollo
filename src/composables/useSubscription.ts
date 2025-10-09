import type {
    ApolloClient,
    ErrorLike,
    Observable,
    OperationVariables,
    SubscriptionObservable,
    TypedDocumentNode
} from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter, Ref } from 'vue'

import { createEventHook, syncRef } from '@vueuse/core'
import { isDefined } from 'remeda'
import { isReadonly, isRef, onBeforeUnmount, ref, shallowRef, toRef, toValue, watch } from 'vue'

import { useApolloClient } from '@/composables/useApolloClient.ts'

export type UseSubscriptionOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
> = {
    clientId?: string
    enabled?: MaybeRefOrGetter<boolean>
} & Omit<ApolloClient.SubscribeOptions<TData, TVariables>, 'query' | 'variables'>

export function useSubscription<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
>(
    document: DocumentNode | TypedDocumentNode<TData, TVariables>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseSubscriptionOptions<TData, TVariables>
) {
    const client = useApolloClient(options?.clientId)

    const subscription = shallowRef<SubscriptionObservable<ApolloClient.SubscribeResult<TData>>>()
    const observer = shallowRef<ReturnType<Observable<TData>['subscribe']>>()

    const data = shallowRef<TData>()
    const loading = ref(true)
    const error = ref<ErrorLike>()

    const subscriptionData = createEventHook<TData>()
    const subscriptionError = createEventHook<ErrorLike>()

    const enabled = toRef(options?.enabled ?? true)

    const reactiveVariables = ref(toValue(variables))
    if (isRef(variables)) {
        syncRef(variables as Ref, reactiveVariables, {
            direction: isReadonly(variables) ? 'ltr' : 'both'
        })
    }

    const onNext = (value: { data?: TData }) => {
        loading.value = false

        if (isDefined(value.data)) {
            data.value = value.data
            // eslint-disable-next-line ts/ban-ts-comment
            // @ts-expect-error
            void subscriptionData.trigger(value.data)
        }
    }

    const onError = (e: ErrorLike) => {
        loading.value = false
        error.value = e
        void subscriptionError.trigger(e)
    }

    const onComplete = () => {
        loading.value = false
    }

    const startObserver = () => {
        if (!subscription.value) {
            return
        }

        if (observer.value && !observer.value.closed) {
            return
        }

        observer.value = subscription.value.subscribe({
            complete: onComplete,
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

        subscription.value = undefined
    }

    const start = () => {
        if (!enabled.value) {
            return
        }

        subscription.value = client.subscribe<TData, TVariables>({
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

    watch(reactiveVariables, () => {
        if (enabled.value) {
            stop()
            start()
        }
    }, { deep: true })

    onBeforeUnmount(() => {
        stop()
    })

    return {
        data,
        error,
        loading,
        onData: subscriptionData.on,
        onError: subscriptionError.on,
        start,
        stop
    }
}
