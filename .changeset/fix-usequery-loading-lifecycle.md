---
"@vue3-apollo/core": patch
---

Fix `useQuery` loading and lifecycle handling:

- Reset `loading` in the error handler so it no longer sticks `true` after an observable error terminates the subscription (default `errorPolicy`).
- Make `start()` idempotent so it never orphans a previous `ObservableQuery` (preventing a leak and a missing observer).
- Clear `loading` on `refetch`/`fetchMore` rejection.
- Set `loading` on reactive variable changes and swallow `setVariables` rejections to avoid unhandled promises.
- Reset `networkStatus` in `stop()`.
