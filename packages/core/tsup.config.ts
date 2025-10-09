import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: { entry: 'src/index.ts', resolve: true },
    entry: ['src/index.ts'],
    external: ['vue', '@apollo/client', 'graphql'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    sourcemap: true,
    treeshake: true
})
