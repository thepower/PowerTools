const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: './src/index.ts',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /.ts$/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  node: {
    __dirname: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        baseUrl: './src',
      }),
    ],
    fallback: {
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
    },
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  target: 'node',
};
