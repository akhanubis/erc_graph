const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
require('dotenv').config()

const dev_mode = process.env.WEBPACK_DEV_SERVER === 'true'

module.exports = {
  entry: {
    graph: './src/graph.js',
    index: './src/index.js'
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
      favicon: './src/assets/logo03.svg'
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      chunks: ['index'],
      favicon: './src/assets/logo03.svg'
    }),
    new MiniCssExtractPlugin({
      filename: dev_mode ? '[name].css' : '[name].[hash].css',
      chunkFilename: dev_mode ? '[id].css' : '[id].[hash].css'
    }),
    new webpack.DefinePlugin({
      POCKET_RPC_URL: JSON.stringify(process.env.POCKET_RPC_URL)
    })
  ],
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  }
}