import typescript from '@rollup/plugin-typescript'
import { resolve } from 'node:path'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'

const external = ['vue', '@apollo/client', 'graphql', '@vueuse/core']

export default defineConfig([
    {
        external,
        input: resolve(__dirname, 'src/index.ts'),
        output: [
            {
                dir: 'dist',
                entryFileNames: '[name].mjs',
                exports: 'named',
                format: 'es',
                preserveModules: true,
                preserveModulesRoot: 'src',
                sourcemap: true
            },
            {
                dir: 'dist',
                entryFileNames: '[name].cjs',
                exports: 'named',
                format: 'cjs',
                preserveModules: true,
                preserveModulesRoot: 'src',
                sourcemap: true
            }
        ],
        plugins: [
            typescript({
                declaration: false,
                declarationMap: false,
                sourceMap: true,
                tsconfig: './tsconfig.json'
            })
        ],
        treeshake: true
    },
    {
        external,
        input: resolve(__dirname, 'src/index.ts'),
        output: {
            dir: 'dist',
            format: 'es'
        },
        plugins: [
            dts({
                tsconfig: './tsconfig.json'
            })
        ]
    }
])
