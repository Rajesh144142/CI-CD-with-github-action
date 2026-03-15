module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: ['eslint:recommended', 'plugin:security/recommended', 'prettier'],
    plugins: ['security'],
    parserOptions: {
        ecmaVersion: 2021,
    },
    rules: {
        'no-console': 'off',
    },
};
