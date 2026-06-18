---
"@vue3-apollo/core": patch
---

Unify `useLazyQuery`'s `called` flag with `useQuery`.

`useLazyQuery` now reuses the `called` ref exposed by `useQuery` instead of tracking its own, so both composables share a single source of truth. There is no behavior change: `execute()` still flips `called` to `true` synchronously on the first call.
