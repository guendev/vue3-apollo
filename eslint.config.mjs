import antfu from '@antfu/eslint-config'

export default antfu(
    {
        ignores: [
            'src/**/*.generated.*',
            '.nuxt',
            '**/*/*.md',
            'skills/**'
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
        },
        vue: true
    },
    {
        rules: {
            'eslint-comments/no-unlimited-disable': 'off',
            'perfectionist/sort-array-includes': 'error',
            'perfectionist/sort-classes': 'error',
            'perfectionist/sort-heritage-clauses': 'error',
            'perfectionist/sort-imports': [
                'error',
                {
                    internalPattern: ['^\...+'],
                    newlinesBetween: 1
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
    }
)
