import antfu from '@antfu/eslint-config'
import graphqlPlugin from '@graphql-eslint/eslint-plugin'

export default antfu(
    {
        ignores: [
            'src/**/*.generated.*',
            '.junie/*'
        ],
        stylistic: {
            overrides: {
                'style/comma-dangle': ['error', 'never'],
                'style/indent': ['error', 4, { SwitchCase: 1 }],
                'style/indent-binary-ops': 'off',
                'style/no-tabs': 'off',
                'style/quotes': ['error', 'single', { avoidEscape: true }],
                'style/semi': ['error', 'never']
            }
        },
        typescript: {
            overrides: {
                'node/prefer-global/buffer': 'off',
                'ts/consistent-type-imports': 'error'
            }
        }
    },
    {
        rules: {
            'eslint-comments/no-unlimited-disable': 'off',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            message: 'Please use alias @[alias] instead.',
                            regex: '^\\.'
                        }
                    ]
                }
            ],
            'perfectionist/sort-array-includes': 'error',
            'perfectionist/sort-classes': 'error',
            'perfectionist/sort-heritage-clauses': [
                'error',
                {
                    customGroups: {
                        withIdInterface: '^WithId'
                    },
                    groups: [
                        'withIdInterface',
                        'unknown'
                    ]
                }
            ],
            'perfectionist/sort-imports': [
                'error',
                {
                    internalPattern: ['^@/.+'],
                    newlinesBetween: 'always'
                }
            ],
            'perfectionist/sort-interfaces': [
                'error',
                {
                    partitionByNewLine: true
                }
            ],
            'perfectionist/sort-intersection-types': [
                'error',
                {
                    partitionByNewLine: true
                }
            ],
            'perfectionist/sort-modules': 'error',
            'perfectionist/sort-object-types': [
                'error',
                {
                    partitionByNewLine: true
                }
            ],
            'perfectionist/sort-objects': [
                'error',
                {
                    partitionByNewLine: true
                }
            ],
            'perfectionist/sort-switch-case': 'error',
            'perfectionist/sort-union-types': 'error'
        }
    },
    {
        files: ['src/modules/**/*.graphql', 'src/apollo/schema/schema.generated.graphqls'],
        languageOptions: {
            parser: graphqlPlugin.parser
        },
        plugins: {
            '@graphql-eslint': graphqlPlugin
        },
        rules: {
            ...graphqlPlugin.configs['flat/schema-recommended'].rules,
            '@graphql-eslint/alphabetize': [
                'error',
                {
                    fields: ['ObjectTypeDefinition', 'InterfaceTypeDefinition', 'InputObjectTypeDefinition'],
                    groups: [
                        'id',
                        'key',
                        '*',
                        'createdAt',
                        'updatedAt'
                    ],
                    values: true
                }
            ],
            '@graphql-eslint/no-hashtag-description': 'off',
            '@graphql-eslint/no-unreachable-types': 'off',
            '@graphql-eslint/require-description': 'off',
            '@graphql-eslint/strict-id-in-types': [
                'error',
                {
                    exceptions: {
                        types: [
                            'AudioAttr',
                            'AuthTokens',
                            'CardConnection',
                            'CardEdge',
                            'ContentRef',
                            'ImageAttr',
                            'PageInfo',
                            'PracticeTask',
                            'ReviewLog',
                            'TaskChoices',
                            'TaskIntro',
                            'TaskReorder',
                            'TextAttr'
                        ]
                    }
                }
            ]
        }
    }
)
