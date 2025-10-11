# useQuery

A reactive GraphQL query composable for **Vue 3** and **Apollo Client**.

## Quick start

```ts
import { ref } from 'vue'
import { useQuery } from 'vue3-apollo'
import { SEARCH_QUERY } from './queries'

const search = ref('')

const { result, loading, error, refetch } = useQuery(
  SEARCH_QUERY,
  () => ({ q: search.value }),
  {
    debounce: 300,
    keepPreviousResult: true,
  }
)
```

The query automatically updates whenever `search.value` changes, debounced by 300ms.

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

### Options
- **`enabled`** – Enable or disable automatic execution. Useful for conditional queries.
- **`debounce` / `throttle`** – Delay or limit how often variable changes trigger requests.
- **`keepPreviousResult`** – Retain old data while fetching new results to avoid UI flicker.
- **`prefetch`** – Run on server during SSR for instant data on hydration (default: true).
- **`fetchPolicy`, `pollInterval`, etc.** – You can also pass standard Apollo options.