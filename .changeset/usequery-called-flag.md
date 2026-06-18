---
"@vue3-apollo/core": minor
---

Add a `called` flag to `useQuery`.

`useQuery` now returns a sticky `called` ref that becomes `true` the first time the query actually starts fetching (SSR prefetch or client-side observer) and stays `true` across `stop()`/`start()` cycles. This makes it easy to tell "never fetched yet" apart from "fetched at least once" on the UI — for example to show an initial placeholder before the first request, or to gate an empty state until data has actually been requested.

`useLazyQuery` now reuses this same `called` ref instead of tracking its own, so both composables share a single source of truth. The manual-trigger semantics are unchanged: `execute()` still flips `called` to `true` synchronously.
