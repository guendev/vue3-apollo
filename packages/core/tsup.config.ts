import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: {
        resolve: true
    },
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'], // dual build
    minify: false,
    skipNodeModulesBundle: true,
    sourcemap: true,
    splitting: false, // lib nhỏ, tránh split rườm rà
    target: 'es2020',
    treeshake: true
})
