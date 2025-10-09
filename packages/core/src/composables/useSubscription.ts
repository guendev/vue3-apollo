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
import { getCurrentScope, isReadonly, isRef, onScopeDispose, ref, shallowRef, toRef, toValue, watch } from 'vue'

import type { UseBaseOption } from '../utils'

import { isDefined } from '../utils'
import { useApolloClient } from './useApolloClient'

export type UseSubscriptionOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables
> = {
    /**
     * Whether the query should be executed.
     * Can be a ref or getter for reactive control.
     * When false, the query will be stopped and no requests will be made.
     *
     * @default true
     *
     * @example
     * ```ts
     * const shouldFetch = ref(false)
     * useQuery(MY_QUERY, variables, {
     *   enabled: shouldFetch // Query only runs when shouldFetch is true
     * })
     * ```
     */
    enabled?: MaybeRefOrGetter<boolean>
} & Omit<ApolloClient.SubscribeOptions<TData, TVariables>, 'query' | 'variables'> & UseBaseOption

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
    }, {
        deep: true,
        flush: 'post'
    })

    if (getCurrentScope()) {
        onScopeDispose(() => {
            stop()
        })
    }
    else {
        console.warn('[useSubscription] The subscription will not be automatically stopped when running outside of a scope')
    }

    return {
        /**
         * The latest data received from the subscription.
         * Updates in real-time as new events arrive from the server.
         * Undefined until the first data is received.
         */
        data,

        /**
         * GraphQL error if the subscription failed.
         * Includes connection errors, GraphQL errors, and transport errors.
         */
        error,

        /**
         * Whether the subscription is in loading state.
         * True when connecting or waiting for first data.
         * Becomes false after first data arrives or on error.
         */
        loading,

        /**
         * Event hook that fires when new data is received.
         * Fires every time the subscription pushes an update.
         *
         * @example
         * ```ts
         * onData((newData) => {
         *   console.log('Received update:', newData)
         *   playNotificationSound()
         *   updateUI(newData)
         * })
         * ```
         */
        onData: subscriptionData.on,

        /**
         * Event hook that fires when a subscription error occurs.
         * Fires for connection errors, GraphQL errors, or transport failures.
         *
         * @example
         * ```ts
         * onError((error) => {
         *   console.error('Subscription error:', error)
         *   toast.error('Connection lost. Reconnecting...')
         * })
         * ```
         */
        onError: subscriptionError.on,

        /**
         * Manually start or restart the subscription.
         * Useful when using enabled: false initially or after stopping.
         * Automatically called on mount if enabled is true.
         *
         * @example
         * ```ts
         * const { start, stop } = useSubscription(
         *   SUBSCRIPTION,
         *   variables,
         *   { enabled: false }
         * )
         *
         * // Start when user logs in
         * onLogin(() => {
         *   start()
         * })
         * ```
         */
        start,

        /**
         * Stop the subscription and close the connection.
         * Useful for pausing real-time updates or cleaning up manually.
         * Automatically called on component unmount.
         *
         * @example
         * ```ts
         * const { stop } = useSubscription(SUBSCRIPTION, variables)
         *
         * // Stop when user navigates away
         * onBeforeRouteLeave(() => {
         *   stop()
         * })
         *
         * // Or pause temporarily
         * const pauseButton = () => {
         *   stop()
         * }
         * ```
         */
        stop
    }
}
