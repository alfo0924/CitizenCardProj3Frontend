module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 運行時支援
    ['@babel/plugin-transform-runtime', {
      corejs: {
        version: 3,
        proposals: true
      },
      helpers: true,
      regenerator: true,
      useESModules: false
    }],

    // 類屬性和私有方法支援
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

    // Vue 3 JSX支援
    ['@vue/babel-plugin-jsx', {
      optimize: false,
      enableObjectSlots: false
    }]
  ],

  env: {
    development: {
      plugins: [
        'babel-plugin-dynamic-import-node'
      ],
      sourceMaps: true
    },

    production: {
      plugins: [
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger'
      ],
      minified: true,
      comments: false,
      compact: true
    },

    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          },
          modules: 'commonjs'
        }]
      ],
      plugins: [
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
}