# useQuery

A reactive GraphQL query composable for **Vue 3** and **Apollo Client**.

## Quick start

```ts
import { ref } from 'vue'
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

// 1) Define your query
const SEARCH_QUERY = gql`
  query Search($q: String!) {
    search(q: $q) { id title }
  }
`

const search = ref('')

const { error, loading, refetch, result } = useQuery(
    SEARCH_QUERY,
    () => ({ q: search.value }),
    {
        debounce: 300,
        keepPreviousResult: true,
    }
)
```

The query automatically updates whenever `search.value` changes, debounced by 300ms.

### A very basic example without variables

```ts
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const GET_USERS = gql`
  query GetUsers { users { id name email } }
`

const { result, loading, error } = useQuery(GET_USERS)
```

## How it works

- **Reactive variables:** Automatically watches refs or getters passed as variables.
- **Lifecycle management:** Starts and stops queries with Vue component lifecycle.
- **Smart updates:** Uses Apollo cache and network status to minimize requests.
- **SSR support:** When `prefetch` is enabled, queries run on the server for immediate hydration on the client.

## API

### Returns
- **`result`** – Reactive query data. Updates automatically when data changes.
- **`loading`** – Boolean flag indicating if the query is in progress.
- **`error`** – Holds GraphQL or network errors if any occur.
- **`refetch(variables?)`** – Manually re-run the query with optional new variables.
- **`fetchMore({ variables, updateQuery })`** – Fetch and merge additional data (e.g., for pagination).
- **`start()` / `stop()`** – Manually control when to start or pause the query.
- **`onResult((data, context) => {})`** – Fires when new data is received. The `context` includes the active Apollo client instance.
  ```ts
  onResult((data, context) => {
      console.log('New data:', data)
      console.log('Client:', context.client)
  })
  ```

- **`onError((error, context) => {})`** – Fires when a query error occurs. Use to handle or log errors. `context.client` provides the source client.
  ```ts
  onError((error, context) => {
      toast.error(error.message)
      console.error('Query failed via client:', context.client)
  })
  ```

### Options
- **`enabled`** – Enable or disable automatic execution. Useful for conditional queries.
- **`debounce` / `throttle`** – Delay or limit how often variable changes trigger requests.
- **`keepPreviousResult`** – Retain old data while fetching new results to avoid UI flicker.
- **`prefetch`** – Run on server during SSR for instant data on hydration (default: true).
- **`fetchPolicy`, `pollInterval`, etc.** – You can also pass standard Apollo options.

## TypeScript typing

If you use TypeScript, you can type your queries in two common ways:

1) With `TypedDocumentNode` (manual types)

```ts
import type { TypedDocumentNode } from '@apollo/client/core'
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

type UsersQuery = { users: { id: string; name: string }[] }

const GET_USERS_TDN: TypedDocumentNode<UsersQuery> = gql`
  query GetUsers { users { id name } }
`

const { result } = useQuery(GET_USERS_TDN)
// result.value is UsersQuery | undefined
```

2) With GraphQL Code Generator (recommended for larger projects)

Use the Codegen to generate `TypedDocumentNode`s and types from your schema/operations. See Advanced → TypeScript & Codegen for a step-by-step guide.
