# useQuery

A reactive GraphQL query composable for **Vue 3** and **Apollo Client**.

## Quick start

```ts
import { ref } from 'vue'
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const GET_USERS = gql`
  query GetUsers($first: Int) {
    users(first: $first) {
      id
      name
      email
    }
  }
`

const first = ref(5)

const { error, loading, refetch, result } = useQuery(
  GET_USERS,
  () => ({ 
    first: first.value 
  }),
  {
      keepPreviousResult: true
  }
)
```

The query automatically updates when `first.value` changes.

### A very basic example without variables

```ts
import { useQuery } from '@vue3-apollo/core'
import { gql } from 'graphql-tag'

const GET_POSTS = gql`
  query GetPosts { 
    posts {
      id
      title
    }
  }
`

const { result, loading, error } = useQuery(GET_POSTS)
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