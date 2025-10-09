import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    entry: ['src/index.ts'],
    external: ['vue', '@apollo/client', 'graphql', '@vueuse/core'],
    format: ['esm', 'cjs'],
    minify: false,
    outDir: 'dist',
    platform: 'neutral',
    shims: true,
    sourcemap: true,
    splitting: true,
    target: 'es2022',
    treeshake: true
})
