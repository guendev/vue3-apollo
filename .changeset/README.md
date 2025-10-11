# Changesets

This directory contains changeset files that track changes to packages in this monorepo.

## How to use

### Adding a changeset

When you make changes that should trigger a release, run:

```bash
pnpm changeset
```

or

```bash
pnpm changeset:add
```

This will prompt you to:
1. Select which packages have changed
2. Choose the type of version bump (major, minor, patch)
3. Write a summary of the changes

The changeset will be saved as a markdown file in this directory.

### Versioning packages

To consume all changesets and update package versions:

```bash
pnpm version
```

This will:
- Update package.json versions based on changesets
- Generate/update CHANGELOG.md files
- Delete consumed changeset files
- Update pnpm-lock.yaml

### Publishing

To publish all packages with updated versions:

```bash
pnpm release
```

This will:
- Build all packages
- Publish to npm
- Create git tags

## Automated workflow

The release workflow is automated via GitHub Actions:
1. Create a changeset and commit it
2. Push to main branch
3. GitHub Actions will create a "Version Packages" PR
4. Review and merge the PR
5. GitHub Actions will automatically publish the packages

## Configuration

See `config.json` in this directory for changeset configuration.
