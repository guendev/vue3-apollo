import { defineConfig } from 'taze'

export default defineConfig({
  // Scan all workspace packages in the monorepo
  recursive: true,
  // Write the resolved versions back to package.json files
  write: true,
  // Don't auto-install after updating; let pnpm install run separately
  install: false,
  // Bump to the latest available version, including majors
  mode: 'major',
  // Packages to keep pinned / skip when updating
  exclude: [],
})
