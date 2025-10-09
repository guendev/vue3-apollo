import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    build: {
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            fileName: (format) => {
                if (format === 'es')
                    return 'index.mjs'
                if (format === 'cjs')
                    return 'index.cjs'
                return 'index.js'
            },
            formats: ['es', 'cjs']
        },
        minify: false,
        outDir: 'dist',
        rollupOptions: {
            external: ['vue', '@apollo/client', 'graphql', '@vueuse/core'],
            output: {
                exports: 'named',
                preserveModules: true,
                preserveModulesRoot: 'src',
                sourcemap: true
            },
            treeshake: true
        },
        sourcemap: true,
        target: 'es2022'
    },
    plugins: [
        tsconfigPaths({
            loose: true
        }),
        dts({
            include: ['src/**/*'],
            outDir: 'dist',
            rollupTypes: true,
            tsconfigPath: './tsconfig.json'
        })
    ]
})
