module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 基本語法支援
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      helpers: true,
      regenerator: true
    }],

    // 裝飾器支援
    ['@babel/plugin-proposal-decorators', {
      legacy: true
    }],

    // 類屬性支援
    ['@babel/plugin-proposal-class-properties', {
      loose: true
    }],

    // ES2022+ 特性支援
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-async-generator-functions',

    // Vue 3支援
    [
      '@vue/babel-plugin-jsx',
      {
        optimize: false
      }
    ],

    // Element Plus按需導入
    [
      'babel-plugin-import',
      {
        libraryName: 'element-plus',
        customStyleName: (name) => {
          return `element-plus/lib/theme-chalk/${name}.css`
        },
        style: true
      }
    ]
  ],
  env: {
    // 開發環境
    development: {
      plugins: [
        'dynamic-import-node'
      ],
      sourceMaps: true
    },

    // 生產環境
    production: {
      plugins: [
        'transform-remove-console',
        'transform-remove-debugger'
      ],
      minified: true,
      comments: false
    },

    // 測試環境
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ]
    }
  },

  // 基本配置
  cacheDirectory: true,
  assumptions: {
    setPublicClassFields: true,
    privateFieldsAsProperties: true
  }
}