---
"@vue3-apollo/nuxt": minor
---

Fix several issues in the Nuxt module:

- **Error link no longer retries on every error.** The internal error link used to call `forward(operation)` unconditionally, which could retry an operation forever on persistent (e.g. GraphQL) errors. It now only broadcasts the `apollo:error` hook and lets the error propagate; network-level retries remain handled by `RetryLink`.
- **`auth.authType: null` now works as documented.** A `null`/empty `authType` sends the token without any prefix instead of producing a literal `"null <token>"` header. The type now accepts `null | string`.
- **Devtools are no longer force-enabled in production.** The module-level `devtools: true` default was merged into every client and shadowed the `?? import.meta.dev` fallback, leaving Apollo devtools enabled in production. Devtools now default to `import.meta.dev` and can still be toggled explicitly per client or globally.
- **`$apolloClients` is now typed** on `NuxtApp` (`nuxtApp.$apolloClients` / `useNuxtApp().$apolloClients`).
- Normalize the internal auth-credentials helper to always return an object.
- Remove an unused `NuxtPayload.apollo` type augmentation (SSR cache state is stored under `payload.data['apollo:{clientId}']`).
- Create Apollo clients in parallel instead of sequentially.
