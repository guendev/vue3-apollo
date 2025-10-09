import { defineConfig } from 'tsup'

export default defineConfig({
    clean: true,
    dts: {
        compilerOptions: {
            composite: false,
            declaration: true,
            declarationMap: true,
            skipLibCheck: true
        },
        resolve: true
    },
    entry: ['src/index.ts'],
    esbuildOptions(options) {
        options.mangleProps = undefined
        options.reserveProps = undefined
        options.mangleQuoted = false
        options.keepNames = true
    },
    external: ['vue', '@apollo/client', 'graphql', '@vueuse/core'],
    format: ['esm', 'cjs'],
    minify: false,
    onSuccess: 'echo "Build completed successfully!"',
    outDir: 'dist',
    platform: 'neutral',
    shims: true,
    sourcemap: true,
    splitting: true,
    target: 'es2022',
    treeshake: true
})
