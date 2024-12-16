const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,

  devServer: {
    port: 3009,
    host: 'localhost',
    open: true,
    proxy: {
      '^/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false,
        secure: false,
        pathRewrite: {
          '^/api': '/api'
        },
        onProxyReq: function(proxyReq) {
          if (proxyReq.getHeader('origin')) {
            proxyReq.setHeader('origin', 'http://localhost:8080')
          }
        }
      }
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      },
      progress: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '3600'
    },
    hot: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin/, to: '/index.html' },
        { from: /^\/user/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@store': path.resolve(__dirname, 'src/store')
      },
      extensions: ['.js', '.vue', '.json', '.css', '.scss']
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  },

  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false,
    loaderOptions: {
      css: {
        esModule: false
      },
      scss: {
        additionalData: `@import "@/assets/css/variables.css";`
      }
    }
  },

  chainWebpack: config => {
    config.resolve.alias
        .set('@', path.resolve(__dirname, 'src'))

    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize(true)
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

    config.plugins.delete('prefetch')
    config.plugins.delete('preload')

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
              name: 'static/img/[name].[hash:8].[ext]',
              publicPath: '/',
              esModule: false
            }
          },
          esModule: false
        })

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
              name: 'static/fonts/[name].[hash:8].[ext]',
              publicPath: '/',
              esModule: false
            }
          },
          esModule: false
        })

    config.module
        .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .use('file-loader')
        .loader('file-loader')
        .options({
          name: 'static/img/[name].[hash:8].[ext]',
          publicPath: '/',
          esModule: false
        })
  }
})
