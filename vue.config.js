const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  // 基本配置
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,

  // Webpack 配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    // 性能提示配置
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  },

  // 開發伺服器配置
  devServer: {
    port: 3009,
    open: true,
    // 代理配置
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
          res.writeHead(200, {
            'Content-Type': 'application/json'
          })

          // 模擬數據
          const mockData = {
            stores: {
              content: [
                {
                  id: 1,
                  name: '示例商店1',
                  imageUrl: '',
                  category: '餐廳',
                  status: 'OPEN',
                  rating: 4.5,
                  address: '台北市信義區信義路五段7號',
                  phone: '02-12345678',
                  businessHours: '10:00-22:00',
                  description: '這是一家示例商店',
                  latitude: 25.033,
                  longitude: 121.5654
                }
              ],
              totalPages: 1,
              totalElements: 1,
              size: 12,
              number: 0
            },
            categories: ['餐廳', '購物', '娛樂', '美容', '教育', '運動'],
            areas: ['信義區', '大安區', '中山區', '松山區', '內湖區'],
            reviews: []
          }

          // 根據請求路徑返回對應數據
          if (req.url.includes('/stores/categories')) {
            res.end(JSON.stringify({
              success: true,
              data: mockData.categories
            }))
          } else if (req.url.includes('/stores/areas')) {
            res.end(JSON.stringify({
              success: true,
              data: mockData.areas
            }))
          } else if (req.url.includes('/stores/search')) {
            res.end(JSON.stringify({
              success: true,
              data: mockData.stores
            }))
          } else if (req.url.includes('/stores')) {
            res.end(JSON.stringify({
              success: true,
              data: mockData.stores
            }))
          } else if (req.url.includes('/reviews')) {
            res.end(JSON.stringify({
              success: true,
              data: mockData.reviews
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
    // 客戶端配置
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    // CORS 配置
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    // 靜態文件配置
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    hot: true,
    historyApiFallback: true
  },

  // CSS 配置
  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false,
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/scss/_variables.scss";
          @import "@/assets/scss/_mixins.scss";
        `
      }
    }
  },

  // Webpack 鏈式配置
  chainWebpack: config => {
    // 別名配置
    config.resolve.alias
      .set('@', path.resolve(__dirname, 'src'))

    // 生產環境優化
    if (process.env.NODE_ENV === 'production') {
      // 代碼壓縮
      config.optimization.minimize(true)

      // 代碼分割
      config.optimization.splitChunks({
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
