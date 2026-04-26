// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
    expoConfig,
    prettierConfig,
    {
        ignores: ['dist/*'],
    },
    {
        // jest.mock() factories must use require() — allow it in test files
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
]);
