import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: { entry: 'core/src/index.ts', resolve: true },
    entry: ['core/src/index.ts'],
    external: ['vue', '@apollo/client', 'graphql'],
    format: ['esm', 'cjs'],
    outDir: 'dist/core',
    sourcemap: true,
    treeshake: true
})
