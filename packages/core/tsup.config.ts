import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    external: ['vue', '@apollo/client', 'graphql', '@vueuse/core'],
    format: ['esm', 'cjs'],
    minify: false,
    outDir: 'dist',
    platform: 'neutral',
    shims: false,
    sourcemap: true,
    splitting: false,
    target: 'es2020',
    treeshake: {
        moduleSideEffects: false,
        preset: 'recommended'
    }
})
