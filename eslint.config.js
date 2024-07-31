import pluginJs from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser, //
                ...globals.jest,
                ...globals.node,
                TARGET: 'readonly',
            },
        },
    },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
];
