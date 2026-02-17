# TypeScript and Codegen

## When to use

Use this file when type safety is required for GraphQL operations:

1. You want typed `result/data/error` from composables.
2. You need reliable variable typing for queries and mutations.
3. You want to avoid manual type drift as schema evolves.

## Recommended strategy

1. Small or quick prototype: manual `TypedDocumentNode`.
2. Production app: GraphQL Code Generator with `client` preset.

## Option A: manual TypedDocumentNode

Use this when schema and operations are small:

```ts
import type { TypedDocumentNode } from '@apollo/client/core'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue3-apollo/core'

type GetUsersData = {
  users: { id: string; name: string }[]
}

const GET_USERS: TypedDocumentNode<GetUsersData> = gql`
  query GetUsers {
    users { id name }
  }
`

const { result } = useQuery(GET_USERS)
// result.value is typed as GetUsersData | undefined
```

Tradeoff:

1. Fast to start.
2. Types can drift when schema changes.

## Option B: GraphQL Code Generator (recommended)

Install dev dependencies:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/client-preset graphql
```

Ensure runtime dependencies exist:

```bash
npm install @apollo/client graphql graphql-tag
```

Minimal `codegen.ts`:

```ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://example.com/graphql',
  documents: ['src/**/*.{ts,tsx,vue,graphql,gql}'],
  generates: {
    './src/graphql/__generated__/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
}

export default config
```

Add script:

```json
{
  "scripts": {
    "codegen": "graphql-codegen"
  }
}
```

Run generation:

```bash
npm run codegen
```

## Integrate generated types with composables

### useQuery

```ts
import { useQuery } from '@vue3-apollo/core'
import { GET_USERS } from '@/graphql/queries'

const { result } = useQuery(GET_USERS)
```

### useMutation

```ts
import { useMutation } from '@vue3-apollo/core'
import { UPDATE_USER } from '@/graphql/mutations'

const { mutate } = useMutation(UPDATE_USER)
await mutate({ input: { id: '1', name: 'Ada' } })
```

### useSubscription

```ts
import { useSubscription } from '@vue3-apollo/core'
import { NEW_MESSAGE } from '@/graphql/subscriptions'

const { data } = useSubscription(NEW_MESSAGE, () => ({ roomId: 'room-1' }))
```

### useAsyncQuery (Nuxt)

```ts
import { GET_DASHBOARD } from '@/graphql/queries'

const { data } = await useAsyncQuery({
  query: GET_DASHBOARD,
})
```

## Typed graphql helper (client preset)

With `client` preset, generated `graphql(...)` helper returns typed documents:

```ts
import { graphql } from '@/graphql/__generated__'

export const GET_USERS = graphql(`
  query GetUsers {
    users { id name }
  }
`)
```

This reduces manual type annotations in app code.

## Case examples

### Case 1: Happy path (query + mutation fully typed)

Goal: end-to-end typed flow for read/write.

```ts
const { result } = useQuery(GET_USERS)
await mutateUpdateUser({ input: { id: '1', name: 'New Name' } })
```

Expected:

1. Autocomplete for fields and variables.
2. Compile-time error for wrong variable shape.

### Case 2: Edge case (partial adoption in existing app)

Goal: migrate gradually without blocking delivery.

Plan:

1. Start codegen for new operations only.
2. Keep legacy manual documents temporarily.
3. Replace manual types file-by-file.

### Case 3: Failure case (generated types do not update)

Symptoms:

1. Operation compiles but fields mismatch runtime schema.
2. Editor still shows old field types.

Recovery:

1. Re-run `npm run codegen`.
2. Verify `documents` glob includes all operation files.
3. Confirm schema source in codegen config points to correct environment.

## Verification checklist

1. Generated folder exists and is committed or regenerated in CI flow.
2. Query/mutation variable types are inferred in editor.
3. Invalid variable shapes fail TypeScript compile.
4. New GraphQL documents are covered by `documents` glob.
5. Team has a consistent command to regenerate types.

## Pitfalls

1. Forgetting to rerun codegen after schema or operation updates.
2. Using incomplete `documents` glob and missing operations.
3. Mixing generated docs and untyped raw docs without clear convention.
4. Pointing codegen schema to wrong endpoint/environment.
5. Expecting runtime validation to replace compile-time variable typing.

## Cross-reference

1. `references/overview-and-decision-tree.md`
2. `references/composables-use-query.md`
3. `references/composables-use-mutation.md`
4. `references/composables-use-subscription.md`
5. `references/composables-use-fragment.md`
6. `references/setup-core-vue3.md`
7. `references/setup-nuxt4.md`
8. `references/testing-checklist.md`
