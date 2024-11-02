module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 運行時支援
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      helpers: true,
      regenerator: true,
      useESModules: true
    }],

    // 裝飾器支援
    ['@babel/plugin-transform-class-properties', {
      loose: false
    }],

    ['@babel/plugin-transform-private-methods', {
      loose: false
    }],

    ['@babel/plugin-transform-private-property-in-object', {
      loose: false
    }],

    // 動態導入支援
    '@babel/plugin-syntax-dynamic-import',

    // Vue 3支援
    [
      '@vue/babel-plugin-jsx',
      {
        optimize: false,
        enableObjectSlots: false
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
    development: {
      plugins: [
        'dynamic-import-node'
      ],
      sourceMaps: true
    },
    production: {
      plugins: [
        'transform-remove-console',
        'transform-remove-debugger'
      ],
      minified: true,
      comments: false
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            },
            modules: 'commonjs'
          }
        ]
      ],
      plugins: [
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
}