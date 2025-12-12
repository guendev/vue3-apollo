# @vue3-apollo/core

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
