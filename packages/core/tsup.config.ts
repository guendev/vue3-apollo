import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: {
        compilerOptions: {
            composite: false,
            customConditions: []
        },
        entry: 'src/index.ts',
        resolve: true
    },
    entry: ['src/index.ts'],
    esbuildOptions(options) {
        options.conditions = ['module', 'import', 'require']
    },
    external: ['vue', '@apollo/client', 'graphql'],
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
