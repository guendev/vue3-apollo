# Docs Optimization Plan Report (Core + Nuxt -> Docs)

## Scope
- Source:
  - `packages/core`
  - `packages/nuxt`
- Target:
  - `packages/docs`

## Audit Summary
- [x] Sync API docs with current source exports/signatures
- [x] Add missing pages for uncovered public APIs
- [x] Standardize sidebar/navigation structure
- [x] Standardize internal docs language (English)
- [ ] Add stricter link-quality gate in CI (optional follow-up)

## Findings and Actions

### P0 - Correctness fixes
- [x] Fixed `useApolloClient` signature examples (`useApolloClient('clientId')`)
  - `packages/docs/composables/useApolloClient.md`
- [x] Fixed `client.query` snippet mismatch
  - `packages/docs/composables/useApolloClient.md`
- [x] Removed non-existing `onOptimistic` mention
  - `packages/docs/composables/useMutation.md`
- [x] Updated `useFragment` docs: `from` is optional
  - `packages/docs/composables/useFragment.md`
- [x] Fixed incorrect package import usage in tracking examples
  - `packages/docs/advance/tracking.md`
- [x] Rewrote outdated Nuxt custom integration examples
  - `packages/docs/advance/nuxt-custom-integration.md`

### P1 - Coverage additions
- [x] Added `useApolloClients` page
  - `packages/docs/composables/useApolloClients.md`
- [x] Added Nuxt configuration reference page
  - `packages/docs/nuxt/configuration.md`
- [x] Added Nuxt hooks page (includes `apollo:error`)
  - `packages/docs/nuxt/hooks.md`
- [x] Added `networkStatus` docs in `useQuery`
  - `packages/docs/composables/useQuery.md`
- [x] Added Apollo plugin guide
  - `packages/docs/guide/apollo-plugin.md`

### P2 - Format and IA
- [x] Renamed sidebar section `Advance` -> `Advanced`
  - `packages/docs/.vitepress/config.ts`
- [x] Updated API page structure for major pages (`What`, `Quick start`, `Signature`, `Options/Returns`, `Related`)
- [x] Normalized internal link style (fixed remaining relative link)

## Execution Log

### Phase 1 - P0 correctness
- [x] Completed

### Phase 2 - P1 coverage
- [x] Completed

### Phase 3 - P2 standardization
- [x] Completed

## Validation Checklist
- [x] No known API mismatch between docs and current `core` + `nuxt` source
- [x] Sidebar includes new core/nuxt reference pages
- [x] Build pass in docs app after all changes

## Report Log
- [x] Owner: Codex
- [x] Status: Completed (docs + README sync)
- [ ] PR / Branch:
- [ ] Completion date:
- [x] Final notes: `packages/docs` build completed successfully.
