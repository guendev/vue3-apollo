---
"@vue3-apollo/core": minor
"@vue3-apollo/nuxt": minor
---

feat(core): refactor `useFragment` API and split option types

- New overload: `useFragment(document, options?)` (recommended)
- Introduce `UseFragmentOptions<TData, TVariables>` (no `fragment`)
- Add `UseLegacyFragmentOptions<TData, TVariables>` extending the new options with `fragment` — deprecated
- Keep legacy overload `useFragment({ fragment, ... })` for backward compatibility
- Update docs to reflect the new API

Migration
- Prefer `useFragment(document, options?)`
- Adopt `UseFragmentOptions`; legacy type/overload will be removed in a future major