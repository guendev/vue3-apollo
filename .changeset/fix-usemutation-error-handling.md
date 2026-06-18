---
"@vue3-apollo/core": major
---

Align `useMutation` error/result handling with its documented behavior.

- **BREAKING:** `throws: 'auto'` (the default) now mirrors Apollo's default behavior — a failed `mutate()` rethrows unless an error policy other than `'none'` is in effect (resolved from per-call options, base options, then the client's default mutate options). Previously every error was swallowed unless `throws: 'always'` was set. Callers that relied on the old swallow-by-default behavior should switch to `throws: 'never'` or wrap `mutate()` in `try/catch`.
- `onDone` now only fires when the mutation returns defined data, matching the documentation and `useQuery`.
- `onError` now awaits `nextTick()` in the `result.error` branch so its timing is consistent with the `catch` path.
- The Apollo mutate options are now derived once instead of on every `mutate()` call.

`mutate()` continues to resolve to `undefined` when the mutation errors and `throws` is not `'always'` (the error is exposed via the `error` ref and the `onError` hook).
