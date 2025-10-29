import type {
    ApolloClient,
    ErrorLike,
    Observable,
    OperationVariables,
    SubscriptionObservable,
    TypedDocumentNode
} from '@apollo/client/core'
import type { DocumentNode } from 'graphql'
import type { MaybeRefOrGetter } from 'vue'

import { createEventHook } from '@vueuse/core'
import { computed, getCurrentScope, onScopeDispose, ref, shallowRef, toRef, toValue, watch } from 'vue'

import type { HookContext, UseBaseOption } from '../utils/type'

import { useApolloTracking } from '../helpers/useApolloTracking'
import { isDefined } from '../utils/isDefined'
import { isServer } from '../utils/isServer'
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
    document: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
    variables?: MaybeRefOrGetter<TVariables>,
    options?: UseSubscriptionOptions<TData, TVariables>
) {
    const client = useApolloClient(options?.clientId)

    const subscription = shallowRef<SubscriptionObservable<ApolloClient.SubscribeResult<TData>>>()
    const observer = shallowRef<ReturnType<Observable<TData>['subscribe']>>()

    const enabled = toRef(options?.enabled ?? true)

    const data = shallowRef<TData>()
    const loading = ref(toValue(enabled))
    const error = ref<ErrorLike>()

    const subscriptionData = createEventHook<[TData, HookContext]>()
    const subscriptionError = createEventHook<[ErrorLike, HookContext]>()

    const reactiveVariables = computed(() => toValue(variables) ?? {} as TVariables)
    const reactiveDocument = computed(() => toValue(document))

    useApolloTracking({
        state: loading,
        type: 'subscriptions'
    })

    const onNext = (value: { data?: TData }) => {
        loading.value = false

        if (isDefined(value.data)) {
            data.value = value.data
            void subscriptionData.trigger(value.data, { client })
        }
    }

    const onError = (e: ErrorLike) => {
        loading.value = false
        error.value = e
        void subscriptionError.trigger(e, { client })
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
            query: reactiveDocument.value,
            variables: reactiveVariables.value,
            ...options
        })

        startObserver()
    }

    const restart = () => {
        if (enabled.value) {
            stop()
            start()
        }
    }

    // Subscriptions only work on the client-side (require WebSocket)
    // Skip initialization on server during SSR
    if (!isServer()) {
        start()

        watch(enabled, (isEnabled) => {
            if (isEnabled) {
                start()
            }
            else {
                stop()
            }
        })

        watch(reactiveVariables, restart, {
            deep: true,
            flush: 'post'
        })

        watch(reactiveDocument, restart)

        if (getCurrentScope()) {
            onScopeDispose(() => {
                stop()
            })
        }
        else {
            console.warn('[useSubscription] The subscription will not be automatically stopped when running outside of a scope')
        }
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
         * onData((newData, context) => {
         *   console.log('Received update:', newData)
         *   playNotificationSound()
         *   updateUI(newData)
         *   // Access Apollo client for cache operations
         *   context.client.cache.modify({
         *     fields: {
         *       messages(existing = []) {
         *         return [...existing, newData]
         *       }
         *     }
         *   })
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
         * onError((error, context) => {
         *   console.error('Subscription error:', error)
         *   toast.error('Connection lost. Reconnecting...')
         *   // Access Apollo client for reconnection logic
         *   context.client.reFetchObservableQueries()
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
