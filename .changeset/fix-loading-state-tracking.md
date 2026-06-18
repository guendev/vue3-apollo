---
"@vue3-apollo/core": minor
---

Overhaul core loading-state management:

- Prune empty owner buckets in the tracking store so `activeByOwner` no longer grows unbounded (one stale `{}` per mounted component/key) over the lifetime of a long-running app.
- Replace the per-track `{ ...map }` spread (O(owners) allocation on every operation) with `triggerRef`, and skip reactivity entirely for no-op decrements (e.g. the `immediate` watch firing with an initial `false`).
- Count in-flight calls in `useMutation` (and overlapping `refetch`/`fetchMore`/variable updates in `useQuery`) so concurrent operations no longer clear `loading` while another is still running.
- Namespace owner ids so a custom `loadingKey` can never collide with a component `uid`.
- Add `useGlobalLoading()` for app-wide loading state (`{ any, queries, mutations, subscriptions }`), and align return-type annotations across the owner-scoped loading helpers.
