# @vue3-apollo/nuxt

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
