import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    clean: true,
    declaration: true,
    entries: [
        'core/src/index'
    ],
    externals: [
        'vue',
        '@apollo/client',
        'graphql'
    ],
    outDir: 'dist',
    rollup: {
        emitCJS: true,
        esbuild: {
            sourcemap: true,
            treeShaking: true
        }
    }
})
