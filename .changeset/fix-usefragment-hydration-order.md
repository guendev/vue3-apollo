---
"@vue3-apollo/core": patch
---

Fix a Vue hydration mismatch when rendering the full `useFragment` result during SSR.

The server prefetch path (`diffToResult`) and the client `watchFragment` subscription produced result objects with different key orders (`{ complete, data, dataState }` on the server vs `{ data, dataState, complete }` from Apollo's emission on the client). The values were identical, but serializing the whole result (e.g. `{{ result }}` in a template) made Vue report a hydration text mismatch. The client emission is now normalized to the same shape and key order as the server, keeping SSR and client output byte-identical.
