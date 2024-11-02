module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:vue/vue3-recommended',
        '@vue/standard'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        parser: '@babel/eslint-parser',
        requireConfigFile: false,
        sourceType: 'module'
    },
    rules: {
        // 基本規則
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': 'warn',
        'no-undef': 'error',

        // 空格和縮進
        'indent': ['error', 2],
        'space-before-function-paren': ['error', 'never'],
        'space-before-blocks': ['error', 'always'],
        'keyword-spacing': ['error', { before: true, after: true }],
        'space-infix-ops': 'error',

        // 逗號和分號
        'comma-dangle': ['error', 'never'],
        'semi': ['error', 'never'],

        // 引號
        'quotes': ['error', 'single'],
        'quote-props': ['error', 'as-needed'],

        // Vue特定規則
        'vue/html-indent': ['error', 2],
        'vue/script-indent': ['error', 2, { baseIndent: 0 }],
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
        'vue/html-closing-bracket-newline': ['error', {
            singleline: 'never',
            multiline: 'always'
        }],
        'vue/max-attributes-per-line': ['error', {
            singleline: 3,
            multiline: 1
        }],
        'vue/no-v-html': 'off',

        // import/export規則
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/order': ['error', {
            groups: [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index'
            ],
            'newlines-between': 'always'
        }],

        // 其他規則
        'eol-last': ['error', 'always'],
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'arrow-parens': ['error', 'always'],
        'arrow-spacing': ['error', { before: true, after: true }],
        'block-spacing': 'error',
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        'camelcase': ['error', { properties: 'never' }],
        'comma-spacing': ['error', { before: false, after: true }],
        'func-call-spacing': ['error', 'never'],
        'key-spacing': ['error', { beforeColon: false, afterColon: true }],
        'no-trailing-spaces': 'error',
        'padded-blocks': ['error', 'never'],
        'space-in-parens': ['error', 'never']
    },
    overrides: [
        {
            files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
            env: {
                jest: true
            }
        }
    ]
}