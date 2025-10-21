import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    documents: ['src/entries'],
    generates: {
        'src/codegen/': {
            config: {
                customDirectives: {
                    apolloUnmask: true
                },
                inlineFragmentTypes: 'mask',
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
