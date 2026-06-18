# @vue3-apollo/nuxt

## 2.0.0

### Minor Changes

- 99d1f57: Fix several issues in the Nuxt module:

  - **Error link no longer retries on every error.** The internal error link used to call `forward(operation)` unconditionally, which could retry an operation forever on persistent (e.g. GraphQL) errors. It now only broadcasts the `apollo:error` hook and lets the error propagate; network-level retries remain handled by `RetryLink`.
  - **`auth.authType: null` now works as documented.** A `null`/empty `authType` sends the token without any prefix instead of producing a literal `"null <token>"` header. The type now accepts `null | string`.
  - **Devtools are no longer force-enabled in production.** The module-level `devtools: true` default was merged into every client and shadowed the `?? import.meta.dev` fallback, leaving Apollo devtools enabled in production. Devtools now default to `import.meta.dev` and can still be toggled explicitly per client or globally.
  - **`$apolloClients` is now typed** on `NuxtApp` (`nuxtApp.$apolloClients` / `useNuxtApp().$apolloClients`).
  - Normalize the internal auth-credentials helper to always return an object.
  - Remove an unused `NuxtPayload.apollo` type augmentation (SSR cache state is stored under `payload.data['apollo:{clientId}']`).
  - Create Apollo clients in parallel instead of sequentially.

### Patch Changes

- f7bc17b: Update runtime dependencies: bump `@vueuse/core` in core, and `@nuxt/kit` and `defu` in nuxt.
- Updated dependencies [621e9f6]
- Updated dependencies [1f3a5b3]
- Updated dependencies [8417905]
- Updated dependencies [7a989f3]
- Updated dependencies [402dc0f]
- Updated dependencies [23e11f3]
- Updated dependencies [f7bc17b]
- Updated dependencies [5a275de]
  - @vue3-apollo/core@2.0.0

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
- Updated dependencies [82ea9a4]
- Updated dependencies [8d4112e]
- Updated dependencies [4750b5c]
- Updated dependencies [fc6d71d]
- Updated dependencies [4942282]
- Updated dependencies [d055fd3]
  - @vue3-apollo/core@1.6.0

## 1.5.3

### Patch Changes

- e08ac78: refactor(useMutation): remove `onOptimistic` hook and related documentation
- Updated dependencies [e08ac78]
  - @vue3-apollo/core@1.5.3

## 1.5.2

### Patch Changes

- d2cfe82: refactor(useMutation): reorder mutation logic to ensure optimistic updates occur before mutation execution
- Updated dependencies [d2cfe82]
  - @vue3-apollo/core@1.5.2

## 1.5.1

### Patch Changes

- 85eebf4: feat(core): accept reactive GraphQL documents in useMutation and useFragment

  - useMutation: Add support reactive document
  - useFragment: Add support reactive document

- Updated dependencies [85eebf4]
  - @vue3-apollo/core@1.5.1

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
- Updated dependencies [8527617]
- Updated dependencies [410834c]
- Updated dependencies [bbe4070]
  - @vue3-apollo/core@1.5.0

## 1.4.2

### Patch Changes

- a0ad8ba: chore(deps): update dependencies
- 74d5d01: fix: ensure `onDone` is triggered properly on mutation success
- Updated dependencies [a0ad8ba]
- Updated dependencies [74d5d01]
  - @vue3-apollo/core@1.4.2

## 1.4.1

### Patch Changes

- 1a3d84b: feat(core): add useApolloClients composable
- Updated dependencies [1a3d84b]
  - @vue3-apollo/core@1.4.1

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
- Updated dependencies [2bf90d0]
- Updated dependencies [bb91dd5]
- Updated dependencies [2ac58e8]
- Updated dependencies [89ce295]
- Updated dependencies [e6dc841]
  - @vue3-apollo/core@1.4.0

## 1.3.2

### Patch Changes

- df6ab74: fix(core): update `useFragment` to handle nullish `from` values and refine strict fragment usage example
- Updated dependencies [df6ab74]
  - @vue3-apollo/core@1.3.2

## 1.3.1

### Patch Changes

- d53a206: fix(core): correct UseFragmentResult type definition
- Updated dependencies [d53a206]
  - @vue3-apollo/core@1.3.1

## 1.3.0

### Minor Changes

- 1dd8e04: feat: introduce useFragment composable

### Patch Changes

- Updated dependencies [1dd8e04]
  - @vue3-apollo/core@1.3.0

## 1.2.4

### Patch Changes

- d709e0d: feat: add support for more ApolloClient configuration options
- Updated dependencies [d709e0d]
  - @vue3-apollo/core@1.2.3

## 1.2.3

### Patch Changes

- 646c6fb: fix(core): rename `onResult` to `onResultEvent` in `useQuery` composable
- Updated dependencies [646c6fb]
  - @vue3-apollo/core@1.2.2

## 1.2.2

### Patch Changes

- ef342f6: fix(runtime): add `RetryLink` to Apollo client link chain

## 1.2.1

### Patch Changes

- aa79eb9: fix(runtime): ensure `SetContextLink` merges headers with existing context

## 1.2.0

### Minor Changes

- 9f8bb24: feat(core): add `HookContext` to event hooks

### Patch Changes

- Updated dependencies [9f8bb24]
  - @vue3-apollo/core@1.2.0

## 1.1.0

### Minor Changes

- 59c1932: Setup package publishing with provenance to npm registry

### Patch Changes

- Updated dependencies [59c1932]
  - @vue3-apollo/core@1.1.0
