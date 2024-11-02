module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 運行時支援
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true,
      useESModules: false,
      version: '^7.22.5'
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
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            browsers: [
              '> 1%',
              'last 2 versions',
              'not dead'
            ]
          }
        }]
      ],
      plugins: [
        'babel-plugin-dynamic-import-node'
      ]
    },

    production: {
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            browsers: [
              '> 1%',
              'last 2 versions',
              'not dead'
            ]
          }
        }]
      ],
      plugins: [
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger'
      ]
    },

    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ],
      plugins: [
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
}
