# useFragment

`useFragment` reads and watches Apollo cache fragments reactively.

## Quick start

```ts
import { gql } from 'graphql-tag'
import { useFragment } from '@vue3-apollo/core'

const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    name
    email
  }
`

const { result, complete, missing, onResult } = useFragment(USER_FRAGMENT, {
  from: 'User:1'
})

onResult((payload) => {
  if (payload.complete) {
    console.log(payload.data.name)
  }
})
```

## Signature

```ts
useFragment(document, options?)
useFragment({ fragment, ...options }) // legacy overload (deprecated)
```

## Parameters
- `document`: Fragment document (`DocumentNode` or `TypedDocumentNode`).

## Returns
- `result`: Full fragment result (`data`, `complete`, optional `missing`).
- `data`: Computed fragment data.
- `complete`: Computed boolean for full fragment availability.
- `missing`: Computed missing tree from cache diff.
- `error`: Last fragment error.
- `onResult((payload, context) => void)`: Fragment result events.
- `onError((error, context) => void)`: Fragment error events.
- `start()`: Start watching (no-op when disabled).
- `stop()`: Stop watching.

## Options
- `from?`: Cache entity source (`string`, entity object, cache reference, ref/getter).
- `fragmentName?`: Required when the document contains multiple fragments.
- `variables?`: Fragment variables.
- `enabled?`: Default `true`.
- `prefetch?`: SSR prefetch toggle, default `true`.
- `optimistic?`: Include optimistic cache layer, default `true`.
- `clientId?`: Target a named Apollo client.

## Notes
- `from` is optional. If it is missing/empty, the composable returns an incomplete result.
- For strict type narrowing, prefer `result` and check `result.value?.complete`.

## Examples

### Case 1: Cache-backed entity card

```ts
import { computed, ref } from 'vue'
import { useFragment } from '@vue3-apollo/core'

const userId = ref<string | null>('1')

const { result } = useFragment(USER_FRAGMENT, {
  from: computed(() => (userId.value ? `User:${userId.value}` : undefined))
})

if (result.value?.complete) {
  console.log(result.value.data.email)
}
```

### Case 2: Multiple fragments in one document

```ts
const { result } = useFragment(MULTI_FRAGMENT_DOC, {
  from: 'User:1',
  fragmentName: 'UserCard'
})
```

### Case 3: Delayed watcher with enabled gate

```ts
const enabled = ref(false)

const { start } = useFragment(USER_FRAGMENT, {
  from: 'User:1',
  enabled
})

start() // no-op while disabled
enabled.value = true
```

## Related
- [`useQuery`](/composables/useQuery)
- [`TypeScript & Codegen`](/advance/typescript)
