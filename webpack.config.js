/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/main.ts',
    vendors: [ 'phaser' ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: 'file-loader'
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      title: 'Development'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/index.html'
        },
        {
          from: 'src/favicon.ico'
        },
        {
          from: 'src/assets',
          to: 'assets'
        }

      ]
    })
  ]


};