const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // 專案部署的基本路徑
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',

  // 建構輸出目錄
  outputDir: 'dist',

  // 靜態資源目錄
  assetsDir: 'static',

  // 是否在開發環境下通過 eslint-loader 在每次保存時 lint 代碼
  lintOnSave: process.env.NODE_ENV !== 'production',

  // 生產環境是否生成 sourceMap 文件
  productionSourceMap: false,

  // webpack 配置
  configureWebpack: {
    // 設置性能提示
    performance: {
      hints: false
    },
    // 優化設定
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  },

  // webpack-dev-server 配置
  devServer: {
    port: 3000, // 開發伺服器端口
    open: true, // 自動打開瀏覽器
    proxy: {
      // 代理設定
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    // 開發伺服器安全設定
    https: false,
    // 熱更新設定
    hot: true
  },

  // CSS 相關選項
  css: {
    // 是否使用 css 分離插件
    extract: process.env.NODE_ENV === 'production',
    // 是否為 CSS 開啟 source map
    sourceMap: false,
    // CSS 預處理器配置
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/css/variables.scss";
        `
      }
    }
  },

  // PWA 插件配置
  pwa: {
    name: '市民卡系統',
    themeColor: '#007bff',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  },

// 第三方插件配置
  pluginOptions: {
    // i18n國際化配置
    i18n: {
      locale: 'zh-TW',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },

    // PWA配置
    pwa: {
      workboxPluginMode: 'GenerateSW',
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: new RegExp('^https://api.example.com/'),
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 20,
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    },

    // SASS全局變量配置
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, './src/assets/css/variables.scss'),
        path.resolve(__dirname, './src/assets/css/mixins.scss')
      ]
    },

    // 自動導入組件配置
    'vue-cli-plugin-auto-routing': {
      pages: 'src/views',
      importPrefix: '@/views/'
    },

    // 壓縮圖片配置
    compression: {
      image: {
        quality: 80
      }
    },

    // 打包分析配置
    bundleAnalyzer: {
      openAnalyzer: false,
      analyzerMode: process.env.NODE_ENV === 'production' ? 'static' : 'disabled'
    },

    // 多環境配置
    envs: {
      development: {
        API_URL: 'http://localhost:8080'
      },
      production: {
        API_URL: 'https://api.example.com'
      }
    },

    // ESLint配置
    lintOnSave: process.env.NODE_ENV !== 'production',

    // 自動修復配置
    autoFix: {
      eslint: true,
      stylelint: true
    },

    // 測試配置
    jest: {
      moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
      transform: {
        '^.+\\.vue$': 'vue-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+\\.jsx?$': 'babel-jest'
      }
    }
  },

  // 多頁面配置
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: '市民卡系統',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },

  // 是否使用 thread-loader
  parallel: require('os').cpus().length > 1,

  // 是否啟用 dll
  // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#dll-mode
  dll: false,

  // chainWebpack 配置
  chainWebpack: config => {
    // 設定解析別名
    config.resolve.alias
        .set('@', require('path').join(__dirname, 'src'))

    // 設定壓縮
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize(true)
    }

    // 移除 prefetch 插件
    config.plugins.delete('prefetch')

    // 設定圖片壓縮
    config.module
        .rule('images')
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({
          bypassOnDebug: true
        })
        .end()
  }
})