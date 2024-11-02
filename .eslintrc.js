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
        // 關閉或降級一些規則
        'no-console': 'off',
        'no-debugger': 'off',
        'no-unused-vars': 'warn',
        'no-undef': 'warn',
        'space-before-function-paren': 'off',
        'indent': 'off',
        'vue/script-indent': 'off',
        'vue/html-indent': 'off',

        // Vue相關規則
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
        'vue/attribute-hyphenation': 'off',
        'vue/v-on-event-hyphenation': 'off',
        'vue/attributes-order': 'off',
        'vue/html-self-closing': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/multiline-html-element-content-newline': 'off',
        'vue/first-attribute-linebreak': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/max-attributes-per-line': 'off',
        'vue/no-v-html': 'off',

        // 基本風格規則
        'quotes': ['warn', 'single'],
        'semi': ['warn', 'never'],
        'comma-dangle': ['warn', 'never'],
        'object-curly-spacing': ['warn', 'always'],
        'arrow-parens': ['warn', 'always'],
        'eol-last': 'off',
        'no-trailing-spaces': 'warn',
        'no-multiple-empty-lines': ['warn', {
            max: 1,
            maxEOF: 0
        }],

        // import/export規則
        'import/first': 'warn',
        'import/no-duplicates': 'warn',
        'import/order': ['warn', {
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
        'space-before-blocks': ['warn', 'always'],
        'keyword-spacing': ['warn', {
            before: true,
            after: true
        }],
        'space-infix-ops': 'warn',
        'key-spacing': ['warn', {
            beforeColon: false,
            afterColon: true
        }],
        'comma-spacing': ['warn', {
            before: false,
            after: true
        }],
        'arrow-spacing': ['warn', {
            before: true,
            after: true
        }],
        'block-spacing': 'warn',
        'brace-style': ['warn', '1tbs', {
            allowSingleLine: true
        }]
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true
            }
        }
    ]
}
