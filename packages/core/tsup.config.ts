import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,                 // tạo .d.ts
    format: ['esm', 'cjs'],    // dual build
    sourcemap: true,
    clean: true,
    splitting: false,          // lib nhỏ, tránh split rườm rà
    target: 'es2020',
    skipNodeModulesBundle: true,
    treeshake: true,
    minify: false
})