import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    documents: ['src/operations/'],
    generates: {
        'src/operations/codegen/': {
            config: {
                useTypeImports: true
            },
            plugins: [],
            preset: 'client',
            presetConfig: {
                fragmentMasking: false,
                gqlTagName: 'graphql'
            }
        }
    },
    schema: 'https://graphqlplaceholder.vercel.app/graphql'
}

export default config
