const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
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
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
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
    port: 3008,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        ws: true,
        onError: (err, req, res) => {
          console.log('Proxy error:', err)
          // 當後端服務無法連接時，返回模擬數據
          res.writeHead(200, {
            'Content-Type': 'application/json'
          })

          // 根據請求路徑返回不同的模擬數據
          if (req.url.includes('/movies/categories')) {
            res.end(JSON.stringify({
              success: true,
              data: ['動作', '冒險', '喜劇', '劇情', '科幻', '恐怖']
            }))
          } else if (req.url.includes('/movies')) {
            res.end(JSON.stringify({
              success: true,
              data: {
                content: [],
                totalPages: 0,
                totalElements: 0,
                size: 12,
                number: 0
              }
            }))
          } else {
            res.end(JSON.stringify({
              success: false,
              message: '服務暫時無法使用'
            }))
          }
        }
      }
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    hot: true,
    historyApiFallback: true
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

  chainWebpack: config => {
    // 基本配置
    config.resolve.alias
      .set('@', path.resolve(__dirname, 'src'))

    // 生產環境優化
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize(true)
      config.optimization.splitChunks({
        chunks: 'all'
      })

      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.compress.drop_console = true
        args[0].terserOptions.compress.drop_debugger = true
        return args
      })
    }

    // 移除預加載插件
    config.plugins.delete('prefetch')
    config.plugins.delete('preload')

    // 資源處理規則
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[hash:8].[ext]',
            esModule: false
          }
        },
        esModule: false
      })
      .end()

    config.module
      .rule('fonts')
      .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:8].[ext]',
            esModule: false
          }
        },
        esModule: false
      })
      .end()

    config.module
      .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'img/[name].[hash:8].[ext]',
        esModule: false
      })
      .end()

    config.module
      .rule('media')
      .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'media/[name].[hash:8].[ext]',
            esModule: false
          }
        },
        esModule: false
      })
      .end()
  }
})
