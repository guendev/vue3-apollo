---
"@vue3-apollo/core": patch
"@vue3-apollo/nuxt": patch
---

fix(core): improve reactive variable handling in `useQuery` and `useSubscription`
- Replaced `syncRef` with `computed` for `reactiveVariables`.
- Simplified variable updates to improve reactivity and reduce overhead.