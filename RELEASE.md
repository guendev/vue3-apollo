# Release Guide

This document provides comprehensive instructions for releasing packages in the vue3-apollo monorepo.

## Prerequisites

Before you can release packages, ensure you have:

1. **npm Account**: An account on [npmjs.com](https://www.npmjs.com)
2. **npm Access**: Maintainer access to `@vue3-apollo` scope packages
3. **GitHub Secrets**: The following secrets configured in the GitHub repository:
   - `NPM_TOKEN`: npm access token with publish permissions

### Creating an npm Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to Access Tokens in your account settings
3. Create a new token with "Automation" type
4. Copy the token and add it to GitHub Secrets as `NPM_TOKEN`

## Release Workflow

### Option 1: Automated Release (Recommended)

This is the standard workflow using changesets and GitHub Actions:

#### Step 1: Create a Changeset

When you make changes that should be included in a release:

```bash
pnpm changeset
```

This will:
- Prompt you to select which packages have changed
- Ask for the type of change (major, minor, patch)
- Request a description of the changes

The changeset is saved as a markdown file in `.changeset/` directory.

#### Step 2: Commit and Push

```bash
git add .changeset/*.md
git commit -m "chore: add changeset for [feature/fix description]"
git push origin main
```

#### Step 3: Automated PR Creation

GitHub Actions will automatically:
- Detect the new changeset
- Create a "Version Packages" PR
- Update package versions in the PR
- Generate/update CHANGELOG.md files

#### Step 4: Review and Merge

1. Review the "Version Packages" PR
2. Verify version bumps are correct
3. Check generated changelogs
4. Merge the PR

#### Step 5: Automatic Publishing

Once merged, GitHub Actions will:
- Build all packages
- Publish to npm with provenance
- Create git tags
- Push tags to repository

### Option 2: Manual Release

If you need to release manually:

#### Step 1: Create and Apply Changesets

```bash
# Create changeset
pnpm changeset

# Update versions
pnpm version

# Commit version changes
git add .
git commit -m "chore: version packages"
git push
```

#### Step 2: Build and Publish

```bash
# Build all packages
pnpm build

# Publish to npm
pnpm release
```

## Available Scripts

### Build Scripts

```bash
# Build all packages
pnpm build

# Build specific packages
pnpm build:core      # Build @vue3-apollo/core
pnpm build:nuxt      # Build @vue3-apollo/nuxt
pnpm build:docs      # Build documentation
```

### Release Scripts

```bash
# Create a new changeset
pnpm changeset
pnpm changeset:add   # Alias

# Update versions based on changesets
pnpm version

# Build and publish packages
pnpm release
```

### Development Scripts

```bash
# Run documentation site
pnpm dev:docs

# Lint code
pnpm lint
pnpm lint:fix
```

## Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **Major (1.0.0 → 2.0.0)**: Breaking changes
- **Minor (1.0.0 → 1.1.0)**: New features, backward compatible
- **Patch (1.0.0 → 1.0.1)**: Bug fixes, backward compatible

## Package Configuration

### Core Package (@vue3-apollo/core)

- Published as public package
- Includes provenance
- Supports ESM and CJS
- Peer dependencies: `@apollo/client`, `graphql`, `vue`

### Nuxt Module (@vue3-apollo/nuxt)

- Published as public package
- Depends on `@vue3-apollo/core` (workspace protocol)
- Peer dependencies: `@apollo/client`, `graphql`, `vue`
- Optional peer: `graphql-ws`

### Documentation (@vue3-apollo/docs)

- Private package (not published)
- Ignored in changeset configuration

## Troubleshooting

### Publishing Fails

If publishing fails:

1. Check npm token is valid
2. Verify you have permissions for `@vue3-apollo` scope
3. Ensure all packages build successfully
4. Check for any pre-publish errors in package build scripts

### Version Conflicts

If there are version conflicts:

1. Run `pnpm install` to sync lock file
2. Verify no manual version changes conflict with changesets
3. Delete and recreate problematic changesets if needed

### GitHub Actions Not Running

If workflows don't trigger:

1. Verify GitHub Actions are enabled for the repository
2. Check branch protection rules don't block workflows
3. Ensure `NPM_TOKEN` secret is configured
4. Review workflow logs for specific errors

## CI/CD Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on:
- Push to `main`
- Pull requests to `main`

Jobs:
- **lint**: Code linting
- **build**: Build all packages
- **type-check**: TypeScript type checking

### Release Workflow (`.github/workflows/release.yml`)

Runs on:
- Push to `main`

Jobs:
- **release**: Version management and publishing

## Best Practices

1. **Always use changesets**: Don't manually update versions in package.json
2. **Write clear changeset summaries**: These become your changelog entries
3. **Review Version Packages PRs carefully**: Ensure correct version bumps
4. **Test locally before merging**: Build and test packages locally
5. **Keep dependencies updated**: Regularly run `pnpm update:dependencies`

## Support

For issues or questions:
- GitHub Issues: https://github.com/guendev/vue3-apollo/issues
- Author: Guen <heloo@guen.dev>
