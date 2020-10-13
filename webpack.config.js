const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')

const dev_mode = process.env.WEBPACK_DEV_SERVER === 'true'

module.exports = {
  entry: {
    graph: './src/graph.js'
  },
  output: {
    filename: dev_mode ? '[name].js' : '[name].[contenthash].js'
  },
  devtool: dev_mode ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: dev_mode,
              reloadAll: true
            }
          },
          "css-loader"
        ]
      },
      {
        test: /\.mp3$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          }
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: ['url-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/graph.html",
      filename: "./graph.html",
      chunks: ['graph'],
      favicon: './src/assets/favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: dev_mode ? '[name].css' : '[name].[hash].css',
      chunkFilename: dev_mode ? '[id].css' : '[id].[hash].css'
    })
  ],
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  }
}