const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV !== 'production',
  productionSourceMap: false,

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          common: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }
  },

  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        ws: true
      }
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },

  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false,
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/css/variables.scss";
          @import "@/assets/css/mixins.scss";
        `
      }
    }
  },

  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: '市民卡系統',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },

  chainWebpack: config => {
    config.resolve.alias
        .set('@', path.resolve(__dirname, 'src'))

    if (process.env.NODE_ENV === 'production') {
      // 優化生產環境
      config.optimization.minimize(true)
      config.optimization.splitChunks({
        chunks: 'all'
      })

      // 移除console
      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.compress.drop_console = true
        args[0].terserOptions.compress.drop_debugger = true
        return args
      })
    }

    // 移除prefetch
    config.plugins.delete('prefetch')
    config.plugins.delete('preload')

    // 處理圖片
    config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: 10000,
          fallback: {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[hash:8].[ext]'
            }
          }
        })

    // 處理字體
    config.module
        .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: 10000,
          fallback: {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash:8].[ext]'
            }
          }
        })
  }
})