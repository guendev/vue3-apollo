# Composable: useSubscription

## When to use

Use `useSubscription` for realtime updates in Vue components:

1. Chat/message streams.
2. Live counters, notifications, or activity feeds.
3. Event-driven UI where server pushes updates.

## Signature

```ts
useSubscription(document, variables?, options?)
```

```ts
import { useSubscription } from '@vue3-apollo/core'
```

`document` accepts `DocumentNode` or `TypedDocumentNode` (including reactive getter/ref).
`variables` accepts plain object, ref, or getter.

## Returns

1. `data`
2. `loading`
3. `error`
4. `onData((data, context) => {})`
5. `onError((error, context) => {})`
6. `start()`
7. `stop()`

Behavior notes:

1. `data` is latest event payload (not an accumulated list).
2. `loading` starts from `enabled` initial value.
3. `loading` becomes `false` on first payload, error, completion, or stop.
4. Incoming payload/error callbacks are ignored while `enabled` is `false`.

## Key options

1. `enabled`: `boolean | Ref<boolean> | () => boolean`, default `true`.
2. When `enabled` is `false`, subscription is fully gated: it will stop, avoid handling events, and `start()` is a no-op until `enabled` becomes `true`.
3. `clientId`: route to named Apollo client.
4. `loadingKey`: custom loading group key (`string | number`) for tracking across multiple subscription owners.
5. Standard Apollo subscribe options are supported (except `query` and `variables`).

Lifecycle notes:

1. Subscription is client-only; server path is skipped.
2. Variable changes trigger restart (deep watch).
3. Document changes trigger restart.
4. In component scope, cleanup is automatic.
5. Outside component scope, warning is emitted and you must stop manually.

## Prerequisites

1. Apollo client must support subscriptions (typically with `GraphQLWsLink`).
2. For Nuxt module usage: configure `wsEndpoint` and install `graphql-ws`.
3. Do not rely on SSR for subscriptions; initialize on client only.

## Basic usage

```ts
import { gql } from 'graphql-tag'
import { useSubscription } from '@vue3-apollo/core'

const NEW_MESSAGES = gql`
  subscription OnMessage($roomId: ID!) {
    messageAdded(roomId: $roomId) {
      id
      text
      createdAt
    }
  }
`

const roomId = ref('room-1')

const { data, loading, error, onData } = useSubscription(
  NEW_MESSAGES,
  () => ({ roomId: roomId.value })
)

onData((payload) => {
  console.log('message event:', payload)
})
```

## Case examples

### Case 1: Happy path (live feed in component scope)

Goal: show realtime updates and auto-clean on unmount.

```ts
const { data, onData } = useSubscription(FEED_SUBSCRIPTION)

onData((event) => {
  feedItems.value.unshift(event.feedUpdated)
})
```

### Case 2: Edge case (enabled gate + manual control)

Goal: start realtime only after user enters a room.

```ts
const enabled = ref(false)

const { start, stop } = useSubscription(
  ROOM_SUBSCRIPTION,
  () => ({ roomId: activeRoomId.value }),
  { enabled }
)

const enterRoom = () => {
  enabled.value = true
  // auto-starts via enabled watcher
}

const leaveRoom = () => {
  enabled.value = false
  // auto-stops via enabled watcher
}
```

Note:

1. Calling `start()` while `enabled.value === false` does nothing.
2. You can still call `start()` manually after re-enabling if needed.

### Case 3: Edge case (avoid noisy restarts)

Goal: prevent unnecessary reconnect loops from unstable variable objects.

```ts
const roomId = ref('room-1')

const subscriptionVars = computed(() => ({
  roomId: roomId.value,
}))

const { data } = useSubscription(ROOM_SUBSCRIPTION, subscriptionVars)
```

Guideline:

1. Use stable refs/computed for variables.
2. Avoid creating unrelated fields in variable object that change frequently.

### Case 4: Failure case (WebSocket not configured)

Symptoms:

1. No events arrive.
2. Runtime warning about failing to initialize WebSocket link.

Recovery:

1. Ensure `wsEndpoint` is configured on the client.
2. Ensure `graphql-ws` package is installed.
3. Confirm server supports `graphql-ws` protocol.

### Case 5: Shared loading group (A/B components)

Goal: one connection indicator should react when either component A or B is subscribing.

```ts
import { useSubscription, useSubscriptionsLoading } from '@vue3-apollo/core'

const loadingKey = 'chat-shared'

// Component A
useSubscription(ROOM_SUBSCRIPTION, () => ({ roomId: 'room-1' }), { loadingKey })

// Component B
useSubscription(TYPING_SUBSCRIPTION, () => ({ roomId: 'room-1' }), { loadingKey })
const isAnyConnecting = useSubscriptionsLoading(loadingKey)
```

Note:

1. Same `loadingKey` means both subscriptions contribute to the same tracking bucket.
2. Use unique keys when loading indicators must stay isolated.

## Verification checklist

1. Subscription starts on client when `enabled` is true.
2. `start()` is a no-op while `enabled` is false.
3. `onData` receives payload and updates UI.
4. `loading` transitions to `false` after first event or error.
5. `onError` path is visible in UI/logging.
6. Variable change restarts stream correctly.
7. `stop()` unsubscribes and halts updates.
8. Outside scope usage includes explicit stop strategy.
9. If grouped loading is used, verify all intended subscriptions share the same `loadingKey`.

## Pitfalls

1. Expecting subscriptions to run during SSR.
2. Forgetting `graphql-ws` while configuring `wsEndpoint`.
3. Passing unstable variable objects and causing frequent reconnects.
4. Assuming `data` accumulates automatically instead of representing latest event.
5. Forgetting to stop when running outside component scope.
6. Using wrong `clientId` in multi-client setups.
7. Reusing one `loadingKey` across unrelated features and coupling connection UX unintentionally.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/setup-nuxt4.md`
3. `references/composables-use-query.md`
4. `references/composables-use-apollo-client.md`
5. `references/tracking-and-loading.md`
6. `references/nuxt-custom-integration.md`
7. `references/troubleshooting.md`
8. `references/testing-checklist.md`
