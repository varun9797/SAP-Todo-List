module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
        es2022: true,
    },
    ignorePatterns: ['.eslintrc.js', 'dist/**/*', 'node_modules/**/*', 'coverage/**/*'],
    rules: {
        // TypeScript specific rules
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/prefer-const': 'error',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/prefer-as-const': 'error',

        // General ESLint rules
        'no-console': 'off', // Allow console in backend
        'no-debugger': 'error',
        'no-duplicate-case': 'error',
        'no-empty': 'warn',
        'no-extra-semi': 'error',
        'no-fallthrough': 'error',
        'no-invalid-regexp': 'error',
        'no-irregular-whitespace': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-labels': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error',

        // Best practices
        'eqeqeq': ['error', 'always'],
        'no-caller': 'error',
        'no-new-wrappers': 'error',
        'no-throw-literal': 'error',
        'no-undef-init': 'error',
        'no-underscore-dangle': 'off',
        'one-var': ['error', 'never'],
        'radix': 'error',

        // Code style (handled by Prettier)
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],

        // Import/Export rules
        'no-duplicate-imports': 'error',

        // Express/Node specific
        'no-process-exit': 'error',

        // Jest specific rules for test files
        'jest/no-disabled-tests': 'off',
        'jest/no-focused-tests': 'off',
        'jest/no-identical-title': 'off',
        'jest/prefer-to-have-length': 'off',
        'jest/valid-expect': 'off',
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
            env: {
                jest: true,
            },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/unbound-method': 'off',
                'no-console': 'off',
            },
        },
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
