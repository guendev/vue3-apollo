# TypeScript & Codegen

This page shows how to achieve strong typing for GraphQL when using Vue3 Apollo.

## Manual typing with TypedDocumentNode

Best for small projects or quick demos.

```ts
import type { TypedDocumentNode } from '@apollo/client/core'
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

type UsersQuery = {
    users: { 
        id: string; 
        name: string; 
        email: string 
    }[] 
}

const GET_USERS: TypedDocumentNode<UsersQuery> = gql`
  query GetUsers {
    users { 
      id
      name
      email
    }
  }
`

const { result } = useQuery(GET_USERS)

// result.value: UsersQuery | undefined
```

Pros: simple, no extra tools. Cons: you must maintain types by hand and they can get out of sync when the schema changes.

## Using GraphQL Code Generator (Recommended)

Great for production projects. Codegen generates types and `TypedDocumentNode`s from your schema and `.graphql`/`gql` documents.

### Install

::: code-group

```bash [npm]
npm i -D @graphql-codegen/cli @graphql-codegen/client-preset graphql
```

```bash [pnpm]
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset graphql
```

:::

If you use Apollo Client and `graphql-tag`, make sure the runtime deps are installed:

::: code-group

```bash [npm]
npm i @apollo/client graphql graphql-tag
```

```bash [pnpm]
pnpm add @apollo/client graphql graphql-tag
```

:::

### Minimal configuration

Create a `codegen.ts` or `codegen.yml`. Example with `codegen.ts` (TypeScript, client preset):

```ts
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://graphqlplaceholder.vercel.app/graphql',
  documents: ['src/**/*.{ts,tsx,vue,graphql,gql}'],
  generates: {
    './src/graphql/__generated__/': {
      preset: 'client',
      presetConfig: {
        // Where fragment-masking and gql tag files will be generated
        fragmentMasking: false
      }
    }
  }
}

export default config
```

Or YAML:

```yaml
# codegen.yml
schema: https://graphqlplaceholder.vercel.app/graphql
documents:
  - src/**/*.{ts,tsx,vue,graphql,gql}
generates:
  src/graphql/__generated__:
    preset: client
    presetConfig:
      fragmentMasking: false
```

Add an npm script:

```json
{
  "scripts": {
    "codegen": "graphql-codegen"
  }
}
```

### Write a query and generate types

You can define your query in `.ts` with `gql`, or place it in a separate `.graphql` file.

```ts
// src/graphql/queries.ts
import { gql } from 'graphql-tag'

export const GET_USERS = gql`
  query GetUsers {
    users { 
      id 
      name 
      email 
    }
  }
`
```

Run codegen:

```bash
pnpm codegen
```

After generation, import the typed artifacts:

```ts
// Option 1: use GET_USERS directly, enhanced by the client preset
import { useQuery } from '@vue3-apollo/core'
import { GET_USERS } from '@/graphql/queries'
// With the client preset, GET_USERS becomes a TypedDocumentNode<TData, TVars>

const { result } = useQuery(GET_USERS)

// Option 2: import TData/TVars types (depending on your preset/config)
// import type { GetUsersQuery } from '@/graphql/__generated__/graphql'
```

If you use the `client` preset, codegen also generates a `graphql` helper (tag) and pre-typed `TypedDocumentNode`s. You can write:

```ts
import { graphql } from '@/graphql/__generated__'

export const GET_USERS = graphql(`
  query GetUsers {
    users {
     id
     name 
     email
    }
  }
`)

// GET_USERS is already a strongly typed TypedDocumentNode<...>
```

### Use with useQuery and client.query

```ts
import { useQuery, useApolloClient } from '@vue3-apollo/core'
import { GET_USERS } from '@/graphql/queries' // or from __generated__

// Reactive
const { result, loading, error } = useQuery(GET_USERS)

// Imperative
const client = useApolloClient()
const { data } = await client.query({ 
    query: GET_USERS 
})
// data is fully typed
```

### Tips & notes

- Re-run codegen whenever your schema or any query/mutation/subscription changes.
- For larger projects, consider enabling TypeScript strict mode to maximize type safety.
- Make sure the `documents` glob covers all places where you define `gql`/`.graphql` operations.

---

See also:

- Apollo Client Docs: https://www.apollographql.com/docs/
- GraphQL Code Generator: https://the-guild.dev/graphql/codegen
- Starter examples: see Getting Started and the `useQuery` composable page.
