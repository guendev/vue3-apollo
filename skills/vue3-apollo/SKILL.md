---
name: vue3-apollo
description: Vue 3 and Nuxt 4 Apollo workflow for @vue3-apollo/core and @vue3-apollo/nuxt. Use when implementing, debugging, documenting, or migrating GraphQL features with useQuery, useMutation, useSubscription, useFragment, useApolloClient, useAsyncQuery, multi-client setup, SSR hydration, cookie auth, tracking hooks, and TypeScript codegen in consumer applications.
---

# Vue3 Apollo

## Overview

Use this skill to build and maintain guidance for projects that consume `@vue3-apollo/core` and `@vue3-apollo/nuxt`.
Primary human-facing docs: `https://vue3-apollo.guen.dev/`.
Assume all guidance must match the currently installed package version in the consumer project.

## Consumer Context

1. Assume this library is consumed as installed npm packages in another repository.
2. Verify behavior from:
- `node_modules/@vue3-apollo/core/dist/index.d.ts`
- `node_modules/@vue3-apollo/nuxt/dist/*.d.mts`
- package `README.md` files
- `https://vue3-apollo.guen.dev/`
3. Use public imports only: `@vue3-apollo/core` and `@vue3-apollo/nuxt`.
4. Check installed versions in `node_modules/@vue3-apollo/core/package.json` and `node_modules/@vue3-apollo/nuxt/package.json` before giving version-sensitive guidance.

## Execution Workflow

1. Classify the request:
- Core composables
- Nuxt module/runtime
- TypeScript/codegen
- Migration
- Tracking/loading
- Troubleshooting
2. Read only the matching reference file(s) from `references/`.
3. Confirm behavior against installed package `dist` type files, README, and docs.
4. Implement changes with current API shape and naming.
5. Update docs/examples if behavior or API expectations changed.
6. Validate by running relevant checks and report any gaps.

## Decision Routing

Read these files based on task type:

- `references/overview-and-decision-tree.md`: start here for mixed or unclear requests.
- `references/setup-core-vue3.md`: Vue 3 core setup and plugin wiring.
- `references/setup-nuxt4.md`: Nuxt module setup and runtime behavior.
- `references/composables-use-query.md`: query lifecycle, SSR prefetch, debounce/throttle.
- `references/composables-use-mutation.md`: mutation flow, throws modes, callbacks.
- `references/composables-use-subscription.md`: client-only subscription lifecycle.
- `references/composables-use-fragment.md`: fragment cache reading, new and legacy overloads.
- `references/composables-use-apollo-client.md`: imperative client access and multi-client usage.
- `references/caching.md`: cache normalization, policies, mutation cache updates, and Nuxt SSR hydration behavior.
- `references/tracking-and-loading.md`: tracking store and owner-scoped loading helpers.
- `references/typescript-and-codegen.md`: typed documents and codegen workflow.
- `references/migration-from-vue-apollo-composable.md`: migration behavior and compatibility notes.
- `references/nuxt-custom-integration.md`: runtime customization and Nuxt hook integration.
- `references/troubleshooting.md`: error diagnosis and recovery patterns.
- `references/testing-checklist.md`: verification checklist before completion.

## Source-First Rules

1. Use installed package `dist` type declarations and README as source of truth for available public API.
2. Preserve current public API names and option contracts used by consumers.
3. Keep compatibility where behavior explicitly supports legacy usage.
4. Match SSR and client-only boundaries exactly as documented and exposed in public API.
5. Avoid introducing React-only Apollo patterns from the separate `apollo-client` sample skill.
6. Never suggest internal repository import paths in user-facing code snippets.

## Current Behavioral Constraints

1. `useApolloClient` resolves first registered client when `clientId` is not provided.
2. `useSubscription` initializes only on client; server path is skipped.
3. `useFragment` supports both new overload and deprecated legacy overload.
4. Nuxt auth is cookie-based in current runtime creation flow.
5. Nuxt `useAsyncQuery` uses object options and integrates with `useAsyncData`.
6. Nuxt runtime provides `apollo:error` hook payload for centralized handling.
7. Nuxt module `apollo.autoImports` is enabled by default; if disabled, import composables manually.

## Implementation Checklist

Apply this checklist for every task:

1. Confirm target API and types using installed package `dist` type files and README.
2. Verify edge behavior (enabled flags, SSR/client mode, error paths).
3. Keep naming and option contracts consistent with existing types.
4. Ensure docs/examples mirror the real signature and behavior.
5. Add or update tests/check steps when behavior changes.

## Fallback Strategy

If a planned reference file is missing or incomplete:

1. Read the closest page at `https://vue3-apollo.guen.dev/` first.
2. Verify against installed package versions, `dist` type files, and README.
3. Keep changes minimal and strictly aligned to existing public patterns.
