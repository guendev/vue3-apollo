# useMutation

`useMutation` executes GraphQL mutations and exposes reactive mutation state plus lifecycle hooks.

## Quick start

```ts
import { gql } from 'graphql-tag'
import { useMutation } from '@vue3-apollo/core'

const CREATE_POST = gql`
  mutation CreatePost($post: CreatePostInput!) {
    createPost(post: $post) {
      id
      title
      body
    }
  }
`

const { mutate, data, loading, error, onDone, onError } = useMutation(CREATE_POST)

onDone((payload) => {
  console.log('Created post:', payload)
})

onError((mutationError) => {
  console.error(mutationError.message)
})

await mutate(
  {
    post: {
      title: 'Hello',
      body: 'World',
      userId: 1
    }
  },
  {
    optimisticResponse: {
      createPost: {
        __typename: 'Post',
        id: 'temp-id',
        title: 'Hello',
        body: 'World'
      }
    }
  }
)
```

## Signature

```ts
function useMutation<TData, TVariables, TCache>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables> | Ref | Getter,
  options?: UseMutationOptions<TData, TVariables, TCache>
): {
  mutate,
  data,
  loading,
  error,
  called,
  onDone,
  onError,
  reset
}
```

## Parameters
- `document`: Mutation document (or reactive ref/getter).
- `options?`: Mutation options.

## Returns
- `mutate(variables?, mutateOptions?)`: Runs the mutation.
- `data`: Reactive mutation data.
- `loading`: `true` while mutation is running.
- `error`: Last mutation error.
- `called`: `true` after first `mutate()` call.
- `onDone((data, context) => void)`: Fires on successful mutation with `data` and `{ client }` context.
- `onError((error, context) => void)`: Fires on GraphQL/network errors with `{ client }` context.
- `reset()`: Clears all mutation state (`data`, `loading`, `error`, `called`).

## Options
- `throws?: 'always' | 'auto' | 'never'` (default: `'auto'`)
- `loadingKey?: string | number` (custom key for grouped loading tracking)
- All Apollo mutate options except `mutation` and `variables`.
- `clientId?: string` to target a named client.

## Notes
- `throws: 'always'` rethrows caught mutation exceptions after emitting `onError`.
- Other `throws` values keep errors in reactive state/hooks.
- Per-call `mutateOptions` overrides base options provided to `useMutation`.

## Examples

### Case 1: Form submit with success side effect

```ts
const { mutate, onDone } = useMutation(CREATE_USER)

onDone((data, context) => {
  context.client.cache.evict({ fieldName: 'users' })
  router.push(`/users/${data.createUser.id}`)
})

await mutate({
  input: { name: form.value.name }
})
```

### Case 2: Per-call override options

```ts
const { mutate } = useMutation(UPDATE_PROFILE, {
  awaitRefetchQueries: true
})

await mutate(
  { input: profileForm.value },
  {
    refetchQueries: ['GetProfile']
  }
)
```

### Case 3: Strict throw flow

```ts
const { mutate } = useMutation(UPDATE_USER_MUTATION, {
  throws: 'always'
})

try {
  await mutate({ id: '1', name: 'Updated name' })
}
catch (error) {
  console.error('Mutation failed', error)
}
```

### Case 4: Shared loading key across components

```ts
import { useMutation, useMutationsLoading } from '@vue3-apollo/core'

const loadingKey = 'profile-shared'

// Component A
const { mutate: saveProfile } = useMutation(SAVE_PROFILE, { loadingKey })

// Component B
const { mutate: saveAvatar } = useMutation(SAVE_AVATAR, { loadingKey })
const isAnySaving = useMutationsLoading(loadingKey)
```

Use this when one place in UI should react to mutation loading states triggered by multiple components/composables.

## Related
- [`useQuery`](/composables/useQuery)
- [`useSubscription`](/composables/useSubscription)
