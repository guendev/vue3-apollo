# Composable: useFragment

## When to use

Use `useFragment` when UI should bind directly to Apollo cache fragment state:

1. You already have normalized entities in cache and want lightweight reactive reads.
2. You need partial/complete state for fragment-driven rendering.
3. You want fragment updates without running a full query.

## Signature

Recommended overload:

```ts
useFragment(document, options?)
```

Legacy overload (still supported):

```ts
useFragment({ fragment, ...options })
```

```ts
import { useFragment } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'
```

`document` accepts `DocumentNode` or `TypedDocumentNode` (including reactive getter/ref).

## Returns

1. `result`
2. `data`
3. `complete`
4. `missing`
5. `error`
6. `start()`
7. `stop()`
8. `onResult((result, context) => {})`
9. `onError((error, context) => {})`

Behavior notes:

1. `result` is the source of truth (`complete`, `data`, and optional `missing`).
2. `onResult` only fires when result has defined `data`.
3. If `from` cannot resolve to a cache id, result is marked `complete: false` with partial empty data.

## Key options

1. `from`: cache id string, entity object, ref, or getter.
2. `fragmentName`: required when the document contains multiple fragments.
3. `variables`: fragment variables (reactive supported).
4. `enabled`: default `true`; when `false`, watching is blocked and `start()` is a no-op.
5. `optimistic`: default `true`; include optimistic cache layer in reads.
6. `prefetch`: default `true`; enables SSR prefetch path.
7. `clientId`: route to named Apollo client.

Important behavior:

1. `enabled` is a hard gate for `start/restart`.
2. `stop()` only unsubscribes the watcher; it does not clear last `result`/`error`.
3. Incoming watcher `next/error` callbacks are ignored while `enabled` is `false`.
4. Changes in `from`, `variables`, `fragmentName`, or `document` trigger restart when enabled.

## SSR behavior

1. With `prefetch: true` and `enabled: true`, fragment diff runs in `onServerPrefetch`.
2. SSR prefetch sets initial `result` and can trigger `onResult` if data exists.
3. Fragment live watching remains client-only via `watchFragment` subscription.

## Lifecycle and scope

1. In component scope, cleanup is automatic on scope dispose.
2. Outside scope, a warning is emitted and manual `stop()` is required.
3. Initial client start happens automatically when enabled.

## Basic usage

```ts
import { gql } from 'graphql-tag'
import { useFragment } from '@vue3-apollo/core'

const USER_CARD = gql`
  fragment UserCard on User {
    id
    name
    email
  }
`

const { result, complete, missing } = useFragment(USER_CARD, {
  from: () => `User:${userId.value}`,
})

if (result.value?.complete) {
  console.log(result.value.data.name)
}

if (!complete.value && missing.value) {
  console.log('Missing fields:', missing.value)
}
```

## Case examples

### Case 1: Happy path (cache-backed entity card)

Goal: render a user card that updates when cache writes happen elsewhere.

```ts
const { data, onResult } = useFragment(USER_CARD_FRAGMENT, {
  from: () => `User:${userId.value}`,
})

onResult(({ data }) => {
  console.log('User updated in cache:', data)
})
```

### Case 2: Edge case (enabled gate)

Goal: delay fragment watcher until UI section is opened.

```ts
const enabled = ref(false)

const { start } = useFragment(USER_CARD_FRAGMENT, {
  from: () => `User:${userId.value}`,
  enabled,
})

// while disabled, this does nothing
start()

// open panel
enabled.value = true
```

### Case 3: Edge case (multiple fragments in one document)

Goal: avoid ambiguity when using a document containing more than one fragment.

```ts
const { result } = useFragment(MULTI_FRAGMENT_DOC, {
  from: 'User:1',
  fragmentName: 'UserCard',
})
```

### Case 4: Failure case (unidentifiable `from`)

Symptoms:

1. `complete` stays `false`.
2. `data` remains partial/empty.

Recovery:

1. Ensure `from` resolves to a valid normalized cache id.
2. If passing object form, include fields needed by `cache.identify` (typically `__typename` + id key).
3. Confirm the entity is present in Apollo cache before watching.

## Verification checklist

1. Fragment updates reactively when cache writes occur.
2. `complete`/`missing` behavior is handled in UI for partial data.
3. `enabled` toggle correctly starts/stops watcher.
4. `start()` no-op behavior while disabled is understood.
5. `fragmentName` is provided for multi-fragment documents.
6. Out-of-scope usage includes manual `stop()` strategy.
7. SSR flow is validated when `prefetch` is enabled.

## Pitfalls

1. Assuming `useFragment` fetches network data; it only reads/watches cache.
2. Forgetting `fragmentName` when document contains multiple fragments.
3. Passing unstable `from`/`variables` values and causing frequent restarts.
4. Expecting `stop()` to clear previous `result` automatically.
5. Using non-normalized `from` values that cannot be identified in cache.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/setup-core-vue3.md`
3. `references/setup-nuxt4.md`
4. `references/composables-use-query.md`
5. `references/composables-use-subscription.md`
6. `references/troubleshooting.md`
7. `references/testing-checklist.md`
