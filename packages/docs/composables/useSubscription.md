# useSubscription

`useSubscription` runs a reactive GraphQL subscription and updates data as events arrive.

## Quick start

```ts
import { useSubscription } from '@vue3-apollo/core'

const { data, loading, error, onData, onError } = useSubscription(
  NEW_MESSAGES_SUB,
  () => ({ chatId: 'room-1' })
)

onData((payload) => {
  console.log('Message update:', payload)
})

onError((subscriptionError) => {
  console.error(subscriptionError.message)
})
```

## Signature

```ts
function useSubscription<TData, TVariables>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables> | Ref | Getter,
  variables?: TVariables | Ref | Getter,
  options?: UseSubscriptionOptions<TData, TVariables>
)
```

## Parameters
- `document`: Subscription document (or reactive ref/getter).
- `variables?`: Subscription variables (or reactive ref/getter).
- `options?`: Subscription options.

## Returns
- `data`: Latest pushed payload.
- `loading`: `true` while connecting / waiting for first payload.
- `error`: Last subscription error.
- `onData((data, context) => void)`: Fired for each payload.
- `onError((error, context) => void)`: Fired for subscription errors.
- `start()`: Start/restart subscription.
- `stop()`: Stop/unsubscribe.

## Options
- `enabled?: boolean | Ref | Getter` (default: `true`)
- `loadingKey?: string | number` (custom key for grouped loading tracking)
- All Apollo subscribe options except `query` and `variables`.
- `clientId?: string`

## Notes
- Subscriptions are client-only; they are not initialized during SSR.
- Variables/document changes restart the underlying subscription.

## Examples

### Case 1: Realtime feed in component scope

```ts
const { data, onData } = useSubscription(FEED_SUBSCRIPTION)

onData((payload) => {
  feedItems.value.unshift(payload.feedUpdated)
})
```

### Case 2: Enabled gate + manual control

```ts
import { ref } from 'vue'
import { useSubscription } from '@vue3-apollo/core'

const enabled = ref(false)

const { data, start, stop } = useSubscription(NEW_MESSAGES_SUB, undefined, {
  enabled
})

enabled.value = true
start()
// ...
stop()
```

### Case 3: Stable variables to avoid noisy restarts

```ts
const roomId = ref('room-1')
const subscriptionVars = computed(() => ({ roomId: roomId.value }))

useSubscription(ROOM_SUBSCRIPTION, subscriptionVars)
```

### Case 4: Shared loading key across components

```ts
import { useSubscription, useSubscriptionsLoading } from '@vue3-apollo/core'

const loadingKey = 'chat-shared'

// Component A
useSubscription(ROOM_SUBSCRIPTION, () => ({ roomId: 'room-1' }), { loadingKey })

// Component B
useSubscription(TYPING_SUBSCRIPTION, () => ({ roomId: 'room-1' }), { loadingKey })
const isAnyConnecting = useSubscriptionsLoading(loadingKey)
```

Use this when one place in UI should react to subscription loading states triggered by multiple components/composables.

## Related
- [`Nuxt Integration`](/nuxt)
- [`useQuery`](/composables/useQuery)
