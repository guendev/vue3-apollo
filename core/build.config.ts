import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    clean: true,
    declaration: true,
    entries: [
        {
            input: 'core/src/index',
            name: 'index',
            outDir: 'dist/core'
        }
    ],
    externals: [
        'vue',
        '@apollo/client',
        'graphql'
    ],
    outDir: 'dist/core',
    rollup: {
        emitCJS: true,
        esbuild: {
            sourcemap: true,
            treeShaking: true
        }
    }
})
