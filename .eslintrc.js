module.exports = {
    extends: ['airbnb/base', 'prettier'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        browser: true,
        jest: true,
        webextensions: true,
    },
    globals: {
        TARGET: true,
    },
    plugins: ['prettier'],
    rules: {
        'max-len': [
            'error',
            120,
            4,
            {
                ignoreUrls: true,
                ignoreComments: false,
                ignoreRegExpLiterals: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'no-console': 'off',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'import/prefer-default-export': 'off',
        'import/extensions': ['error', 'always'],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'no-await-in-loop': 'off',
        'implicit-arrow-linebreak': 'off',
        'no-param-reassign': 'off',
        'consistent-return': 'off',
        radix: 'off',
    },
};
