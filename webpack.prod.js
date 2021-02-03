const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'production',
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all',
  //         filename: '[name].app.bundle.js',
  //       },
  //     },
  //   },
  // },
});