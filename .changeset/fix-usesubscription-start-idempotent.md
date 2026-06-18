---
"@vue3-apollo/core": patch
---

Fix `useSubscription` lifecycle handling:

- Make `start()` idempotent so calling it while a subscription is already running is a safe no-op, instead of overwriting `subscription` with a new (never-subscribed) observable while the previous observer keeps running. This was reachable via the documented "enabled gate + manual control" usage (`enabled.value = true; start()`), where both the `enabled` watcher and the manual call would invoke `start()`.
- Initialize `loading` to `false` during SSR, since subscriptions are client-only and never connect on the server — avoiding a connecting state that can never resolve in the server-rendered output.
