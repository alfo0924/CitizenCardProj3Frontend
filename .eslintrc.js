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
        'no-console': 'off',
        'no-debugger': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-mixed-operators': 'off',
        'no-useless-catch': 'off',
        'no-new': 'off',
        'import/first': 'off',
        'import/order': 'off',

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
        'vue/require-default-prop': 'off',
        'vue/require-prop-types': 'off',
        'vue/no-multiple-template-root': 'off'
    },
    globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        axios: true
    }
}
