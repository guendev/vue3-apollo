import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: { entry: 'src/core/index.ts' },
    entry: ['src/core/index.ts'],
    external: ['vue', '@apollo/client', 'graphql', '@vueuse/core'],
    format: ['esm', 'cjs'],
    minify: true,
    outDir: 'dist',
    skipNodeModulesBundle: true,
    sourcemap: true,
    splitting: false,
    target: 'es2020',
    treeshake: true,
    tsconfig: 'tsconfig.build.json'
})
