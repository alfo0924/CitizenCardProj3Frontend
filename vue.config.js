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
    // 設定解析別名
    config.resolve.alias
        .set('@', path.resolve(__dirname, 'src'))

    // 生產環境優化
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize(true)
      config.optimization.splitChunks({
        chunks: 'all'
      })

      // 移除console和debugger
      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.compress.drop_console = true
        args[0].terserOptions.compress.drop_debugger = true
        return args
      })
    }

    // 移除prefetch和preload插件
    config.plugins.delete('prefetch')
    config.plugins.delete('preload')

    // 圖片處理規則
    config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
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
        .end()

    // 字體處理規則
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
        .end()

    // SVG處理規則
    config.module
        .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .use('file-loader')
        .loader('file-loader')
        .options({
          name: 'img/[name].[hash:8].[ext]'
        })
        .end()

    // 媒體文件處理規則
    config.module
        .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: 10000,
          fallback: {
            loader: 'file-loader',
            options: {
              name: 'media/[name].[hash:8].[ext]'
            }
          }
        })
        .end()
  }
})