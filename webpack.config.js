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
        test: /\.(gif|png|jpe?g|svg|xml|json)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ],
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets/')
    },
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
        }
      ]
    })
  ]


};