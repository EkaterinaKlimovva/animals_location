import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintPluginImport from 'eslint-plugin-import';

export default [
    {
        ignores: [
            '**/node_modules',
            'dist',
            'build',
            'prisma.config.ts',
            '**/test-reports',
        ],
    },

    ...tseslint.configs.recommended,

    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        plugins: {
            import: eslintPluginImport,
        },
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

            '@typescript-eslint/no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
            'import/no-relative-parent-imports': 'warn',
            'import/no-unresolved': 'off',

            'semi': ['error', 'always'],
            'quotes': ['warn', 'single'],
            'comma-dangle': ['warn', 'always-multiline'],
            'indent': ['warn', 2],
            'object-curly-spacing': ['warn', 'always'],
            'no-trailing-spaces': 'warn',
            'eol-last': ['warn', 'always']
        },
    },

    // Separate configuration for test files that don't need to be in the TypeScript project
    {
        files: ['tests/**/*.ts', 'tests/**/*.js'],
        plugins: {
            import: eslintPluginImport,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
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

            '@typescript-eslint/no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-imports': 'warn',

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
