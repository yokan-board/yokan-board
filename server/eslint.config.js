const globals = require('globals');
const pluginJs = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const pluginPrettier = require('eslint-plugin-prettier'); // Import the plugin

module.exports = [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest, // Add Jest globals
                commonjs: true,
                es2021: true,
            },
            ecmaVersion: 12,
        },
    },
    pluginJs.configs.recommended,
    prettierConfig,
    {
        plugins: {
            prettier: pluginPrettier, // Register the plugin
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },
];
