# Getting Started

This project provides two public packages:

- @vue3-apollo/core — Vue 3 composables and utilities around Apollo Client.
- @vue3-apollo/nuxt — A Nuxt 4 module that wires Apollo Client into your app with SSR support.

The docs are written in English and focus on these two packages.

## Installation

Using pnpm (recommended):

```bash
# Core only
pnpm add @vue3-apollo/core @apollo/client graphql

# Nuxt module
pnpm add @vue3-apollo/nuxt @apollo/client graphql
```

Optional dependency for subscriptions:

```bash
pnpm add graphql-ws
```

Peer requirements:

- vue >= 3.5
- @apollo/client >= 4
- graphql >= 16

## Quick Links

- Core Composables: useQuery, useSubscription, useApolloClient, useApolloClients → /core
- Nuxt Module usage and options → /nuxt

## TypeScript

Both packages ship full TypeScript typings. For queries and subscriptions, prefer TypedDocumentNode for strong typing:

```ts
import type { TypedDocumentNode } from '@apollo/client/core'
```
