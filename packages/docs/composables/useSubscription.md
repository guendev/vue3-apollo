

# useSubscription

Reactive GraphQL **subscription** composable.

> Subscriptions are **client-only**. They are not initialized on the server (SSR).

## Quick start

```ts
import { useSubscription } from 'vue3-apollo'
import { NEW_MESSAGES_SUB } from './gql'

const {
  data,
  loading,
  error,
  onData,
  onError,
} = useSubscription(
  NEW_MESSAGES_SUB,
  () => ({
    chatId: 'room-1',
  }),
)

onData((payload) => {
  console.log('New message:', payload)
})

onError((e) => {
  console.error('Subscription error:', e)
})
```

## How it works
- **Reactive variables:** Pass a plain object, a `ref`, or a getter; when variables change, the subscription restarts.
- **Lifecycle-aware:** Starts automatically on mount if `enabled` is `true`; stops on scope dispose.
- **Client-only:** Skips initialization during SSR; requires a WebSocket link in your Apollo client.
- **Tracking:** Integrates with internal tracking to reflect subscription activity.

## API

### Returns
- **`data`** – the latest payload received (undefined until first event).
- **`loading`** – `true` while connecting / before first event.
- **`error`** – connection/transport/GraphQL error, if any.
- **`onData(fn)`** – subscribe to each incoming payload.
- **`onError(fn)`** – subscribe to errors.
- **`start()`** – manually start or restart the subscription.
- **`stop()`** – stop and unsubscribe.

## Options
- **`enabled`** – `boolean | Ref<boolean>` (default: `true`). When `false`, the subscription won’t start until enabled or `start()` is called.
- **Apollo subscribe options** – you can pass standard Apollo `subscribe` options (e.g., `context`), except `query` and `variables`, which are supplied by the composable.
- **`clientId`** – from `UseBaseOption`, target a specific Apollo client instance if using multiple clients.