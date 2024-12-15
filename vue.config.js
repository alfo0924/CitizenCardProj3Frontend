const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,

  devServer: {
    port: 3009,
    host: 'localhost',
    open: true,
    proxy: {
      '/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false
      }
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true'
    },
    hot: true,
    historyApiFallback: true
  },

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
    }
  },

  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false,
    loaderOptions: {
      css: {
        esModule: false
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
              name: 'img/[name].[hash:8].[ext]',
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
              name: 'fonts/[name].[hash:8].[ext]',
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
          name: 'img/[name].[hash:8].[ext]',
          esModule: false
        })
  }
})
