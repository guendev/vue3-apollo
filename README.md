# Vue3 Apollo

Composable Apollo Client utilities for Vue 3 and Nuxt 4.

## 📦 Packages

This monorepo contains the following packages:

- **[@vue3-apollo/core](./packages/core)**: Core composables for Vue 3 + Apollo Client
- **[@vue3-apollo/nuxt](./packages/nuxt)**: Nuxt 4 module for seamless integration
- **[@vue3-apollo/docs](./packages/docs)**: Documentation site

## 🚀 Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm 10.18.2

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific packages
pnpm build:core
pnpm build:nuxt
pnpm build:docs

# Run documentation site
pnpm dev:docs
```

## 📝 Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

### Creating a changeset

When you make changes that should trigger a release:

```bash
pnpm changeset
```

This will prompt you to select packages and describe your changes.

### Versioning

To update package versions based on changesets:

```bash
pnpm version
```

### Publishing

To publish all packages:

```bash
pnpm release
```

### Automated releases

The project uses GitHub Actions for automated releases:

1. Create a changeset and commit it to your branch
2. Push to `main` branch
3. GitHub Actions will create a "Version Packages" PR
4. Review and merge the PR
5. Packages will be automatically published to npm

**Required GitHub Secrets:**
- `NPM_TOKEN`: npm access token for publishing packages

## 📄 License

MIT

## 👤 Author

Guen <heloo@guen.dev>

## 🔗 Links

- [Documentation](https://github.com/guendev/vue3-apollo)
- [GitHub](https://github.com/guendev/vue3-apollo)
- [npm - @vue3-apollo/core](https://www.npmjs.com/package/@vue3-apollo/core)
- [npm - @vue3-apollo/nuxt](https://www.npmjs.com/package/@vue3-apollo/nuxt)
