# @vue3-apollo/core

## 2.0.0

### Major Changes

- 8417905: Align `useMutation` error/result handling with its documented behavior.

  - **BREAKING:** `throws: 'auto'` (the default) now mirrors Apollo's default behavior — a failed `mutate()` rethrows unless an error policy other than `'none'` is in effect (resolved from per-call options, base options, then the client's default mutate options). Previously every error was swallowed unless `throws: 'always'` was set. Callers that relied on the old swallow-by-default behavior should switch to `throws: 'never'` or wrap `mutate()` in `try/catch`.
  - `onDone` now only fires when the mutation returns defined data, matching the documentation and `useQuery`.
  - `onError` now awaits `nextTick()` in the `result.error` branch so its timing is consistent with the `catch` path.
  - The Apollo mutate options are now derived once instead of on every `mutate()` call.

  `mutate()` continues to resolve to `undefined` when the mutation errors and `throws` is not `'always'` (the error is exposed via the `error` ref and the `onError` hook).

### Minor Changes

- 621e9f6: Overhaul core loading-state management:

  - Prune empty owner buckets in the tracking store so `activeByOwner` no longer grows unbounded (one stale `{}` per mounted component/key) over the lifetime of a long-running app.
  - Replace the per-track `{ ...map }` spread (O(owners) allocation on every operation) with `triggerRef`, and skip reactivity entirely for no-op decrements (e.g. the `immediate` watch firing with an initial `false`).
  - Count in-flight calls in `useMutation` (and overlapping `refetch`/`fetchMore`/variable updates in `useQuery`) so concurrent operations no longer clear `loading` while another is still running.
  - Namespace owner ids so a custom `loadingKey` can never collide with a component `uid`.
  - Add `useGlobalLoading()` for app-wide loading state (`{ any, queries, mutations, subscriptions }`), and align return-type annotations across the owner-scoped loading helpers.

- 5a275de: Add a `called` flag to `useQuery`.

  `useQuery` now returns a sticky `called` ref that becomes `true` the first time the query actually starts fetching (SSR prefetch or client-side observer) and stays `true` across `stop()`/`start()` cycles. This makes it easy to tell "never fetched yet" apart from "fetched at least once" on the UI — for example to show an initial placeholder before the first request, or to gate an empty state until data has actually been requested. The naming mirrors the existing `called` in `useLazyQuery`.

### Patch Changes

- 1f3a5b3: Fix a Vue hydration mismatch when rendering the full `useFragment` result during SSR.

  The server prefetch path (`diffToResult`) and the client `watchFragment` subscription produced result objects with different key orders (`{ complete, data, dataState }` on the server vs `{ data, dataState, complete }` from Apollo's emission on the client). The values were identical, but serializing the whole result (e.g. `{{ result }}` in a template) made Vue report a hydration text mismatch. The client emission is now normalized to the same shape and key order as the server, keeping SSR and client output byte-identical.

- 7a989f3: Fix `useQuery` loading and lifecycle handling:

  - Reset `loading` in the error handler so it no longer sticks `true` after an observable error terminates the subscription (default `errorPolicy`).
  - Make `start()` idempotent so it never orphans a previous `ObservableQuery` (preventing a leak and a missing observer).
  - Clear `loading` on `refetch`/`fetchMore` rejection.
  - Set `loading` on reactive variable changes and swallow `setVariables` rejections to avoid unhandled promises.
  - Reset `networkStatus` in `stop()`.

- 402dc0f: Fix `useSubscription` lifecycle handling:

  - Make `start()` idempotent so calling it while a subscription is already running is a safe no-op, instead of overwriting `subscription` with a new (never-subscribed) observable while the previous observer keeps running. This was reachable via the documented "enabled gate + manual control" usage (`enabled.value = true; start()`), where both the `enabled` watcher and the manual call would invoke `start()`.
  - Initialize `loading` to `false` during SSR, since subscriptions are client-only and never connect on the server — avoiding a connecting state that can never resolve in the server-rendered output.

- 23e11f3: Unify `useLazyQuery`'s `called` flag with `useQuery`.

  `useLazyQuery` now reuses the `called` ref exposed by `useQuery` instead of tracking its own, so both composables share a single source of truth. There is no behavior change: `execute()` still flips `called` to `true` synchronously on the first call.

- f7bc17b: Update runtime dependencies: bump `@vueuse/core` in core, and `@nuxt/kit` and `defu` in nuxt.

## 1.6.0

### Minor Changes

- 82ea9a4: Add `useLazyQuery` for manual query execution with `called` and `execute()`.
  Expose `query` from `useQuery` for advanced ObservableQuery flows.
  Update Nuxt auto-imports to include `useLazyQuery` and refresh playground/docs.

### Patch Changes

- 8d4112e: Improve `useFragment` start/stop gating to avoid duplicate subscriptions and ignore events while disabled.
- 4750b5c: Block query updates and imperative calls when enabled is false.
- fc6d71d: rename useApolloTracker to useApolloTrackingStore and keep deprecated alias
- 4942282: Update package dependencies across the workspace.
- d055fd3: Add `loadingKey` support to `useQuery`, `useMutation`, and `useSubscription`, and allow custom owner ids in Apollo loading tracking.

## 1.5.3

### Patch Changes

- e08ac78: refactor(useMutation): remove `onOptimistic` hook and related documentation

## 1.5.2

### Patch Changes

- d2cfe82: refactor(useMutation): reorder mutation logic to ensure optimistic updates occur before mutation execution

## 1.5.1

### Patch Changes

- 85eebf4: feat(core): accept reactive GraphQL documents in useMutation and useFragment

  - useMutation: Add support reactive document
  - useFragment: Add support reactive document

## 1.5.0

### Minor Changes

- 410834c: feat(useMutation): add `onOptimistic` event hook for handling optimistic UI updates
- bbe4070: feat(core): refactor `useFragment` API and split option types

  - New overload: `useFragment(document, options?)` (recommended)
  - Introduce `UseFragmentOptions<TData, TVariables>` (no `fragment`)
  - Add `UseLegacyFragmentOptions<TData, TVariables>` extending the new options with `fragment` — deprecated
  - Keep legacy overload `useFragment({ fragment, ... })` for backward compatibility
  - Update docs to reflect the new API

  Migration

  - Prefer `useFragment(document, options?)`
  - Adopt `UseFragmentOptions`; legacy type/overload will be removed in a future major

### Patch Changes

- 8527617: chore(deps): update dependencies to latest versions across packages

## 1.4.2

### Patch Changes

- a0ad8ba: chore(deps): update dependencies
- 74d5d01: fix: ensure `onDone` is triggered properly on mutation success

## 1.4.1

### Patch Changes

- 1a3d84b: feat(core): add useApolloClients composable

## 1.4.0

### Minor Changes

- bb91dd5: chore(deps): update dependencies
  - Update `@vueuse/core` to v14.

### Patch Changes

- 2bf90d0: fix(core): improve reactive variable handling in `useQuery` and `useSubscription`
  - Replaced `syncRef` with `computed` for `reactiveVariables`.
  - Simplified variable updates to improve reactivity and reduce overhead.
- 2ac58e8: fix(core): support reactive GraphQL documents in `useFragment`
- 89ce295: fix(core): support reactive GraphQL documents in useQuery #27
- e6dc841: fix(core): support reactive GraphQL documents in `useSubscription`

## 1.3.2

### Patch Changes

- df6ab74: fix(core): update `useFragment` to handle nullish `from` values and refine strict fragment usage example

## 1.3.1

### Patch Changes

- d53a206: fix(core): correct UseFragmentResult type definition

## 1.3.0

### Minor Changes

- 1dd8e04: feat: introduce useFragment composable

## 1.2.3

### Patch Changes

- d709e0d: feat: add support for more ApolloClient configuration options

## 1.2.2

### Patch Changes

- 646c6fb: fix(core): rename `onResult` to `onResultEvent` in `useQuery` composable

## 1.2.1

### Patch Changes

- d9aeeaf: fix(core): trigger onResult and onError event hooks during SSR in useQuery

## 1.2.0

### Minor Changes

- 9f8bb24: feat(core): add `HookContext` to event hooks

## 1.1.0

### Minor Changes

- 59c1932: Setup package publishing with provenance to npm registry
