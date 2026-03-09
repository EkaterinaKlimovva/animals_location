import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
    {
        ignores: [
            'node_modules',
            'dist',
            'build',
            'prisma.config.ts',
        ],
    },

    ...tseslint.configs.recommended,

    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },

        rules: {
            'no-var': 'error',
            'prefer-const': 'warn',
            'no-console': 'off',
            'eqeqeq': ['warn', 'smart'],

            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],

            'semi': ['error', 'always'],
            'quotes': ['warn', 'single'],
            'comma-dangle': ['warn', 'always-multiline'],
            'indent': ['warn', 2],
            'object-curly-spacing': ['warn', 'always'],
            'no-trailing-spaces': 'warn',
            'eol-last': ['warn', 'always']
        },
    },
];
