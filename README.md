# vue3-apollo

A Vue 3 Apollo Client library with composables for GraphQL operations.

## Project Structure

This is a pnpm monorepo with the following packages:

- **packages/core** - The main vue3-apollo library
- **playground** - Development and testing environment

## Development

```bash
# Install dependencies
pnpm install

# Run playground dev server
pnpm dev

# Build the core library
pnpm build

# Generate GraphQL types for playground
pnpm build:apollo
```

## Scripts

- `pnpm dev` - Start the playground development server
- `pnpm build` - Build the core library package
- `pnpm build:apollo` - Generate GraphQL codegen types for playground
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
