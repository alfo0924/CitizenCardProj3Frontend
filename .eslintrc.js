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
        // 關閉所有格式相關規則
        'indent': 'off',
        'space-before-function-paren': 'off',
        'eol-last': 'off',
        'no-trailing-spaces': 'off',
        'comma-dangle': 'off',
        'quotes': 'off',
        'semi': 'off',
        'dot-notation': 'off',
        'quote-props': 'off',

        // 關閉 console 警告
        'no-console': 'off',
        'no-debugger': 'off',

        // Vue相關規則
        'vue/html-indent': 'off',
        'vue/script-indent': 'off',
        'vue/max-attributes-per-line': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/multiline-html-element-content-newline': 'off',
        'vue/first-attribute-linebreak': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/html-self-closing': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
        'vue/attribute-hyphenation': 'off',
        'vue/v-on-event-hyphenation': 'off',
        'vue/attributes-order': 'off',
        'vue/no-v-html': 'off',

        // Import相關規則
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/order': ['off', {
            'groups': [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index'
            ],
            'newlines-between': 'always'
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
    ],
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly'
    }
}
