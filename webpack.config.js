const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const noop = require('lodash/noop');
const pkg = require('./package.json');

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

function externalPackages(peerDependencies) {
  const packages = {};
  Object.keys(peerDependencies).forEach((key) => (packages[key] = key));

  return packages;
}

module.exports = (env) => ({
  mode: env.debug === 'false' ? 'production' : 'development',
  entry: {
    index: './src/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: resolve('src'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: resolve(`./tsconfig.json`),
            },
          },
        ],
      },
      {
        test: /\.((c|sa|sc)ss)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // Run `postcss-loader` on each CSS `@import`, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
              // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
              importLoaders: 1,
              // Automatically enable css modules for files satisfying `/\.module\.\w+$/i` RegExp.
              modules: { auto: false },
              sourceMap: env.debug === 'true',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: env.debug === 'true',
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.scss', '.ts', '.js', '.png', '.svg'],
    alias: {
      '@': resolve('src'),
      '@images': resolve('images'),
    },
  },
  output: {
    filename: '[name].js',
    path: resolve('dist'),
    sourceMapFilename: '[name].map',
    library: '[name]',
    libraryTarget: 'umd',
  },
  devtool: env.debug === 'false' ? undefined : 'inline-source-map',
  optimization: {
    minimize: env.debug === 'false',
  },
  plugins: [
    env.profile
      ? new BundleAnalyzerPlugin({
          analyzerMode: 'disabled',
          generateStatsFile: true,
        })
      : noop,
    new MiniCssExtractPlugin({ filename: 'node-visualizer.css' }),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin({
      patterns: [
        {
          context: resolve(`./`),
          from: 'package.json',
          to: resolve('dist'),
        },
      ],
    }),
    new Dotenv(),
  ],
  externals: [{ ...externalPackages(pkg.peerDependencies) }],
});
