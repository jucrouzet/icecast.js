const glob = require('glob');
const path = require('path');

const nodeExternals = require('webpack-node-externals');

const base = require('./base');

const getBrowserFiles = () => {
  return glob.sync(
    '**/*.test.ts',
    {
      cwd: path.resolve('test', 'browser'),
      absolute: true,
    },
  )
    .reduce(
      (sum, value) => {
        sum[path.basename(value, '.test.ts')] = value;
        return sum;
      },
      {},
    );
};

module.exports = [
  {
    name: 'WDIO Tests',
    devtool: 'inline-source-map',
    externals: [ nodeExternals() ],
    entry: path.resolve('test', 'wdio', 'index.ts'),
    output: {
      path: path.resolve('test', 'wdio'),
      filename: 'tests.js',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      loaders: [
        {
          test: /\.ts/,
          loader: 'ts-loader',
        },
      ],
    },
    plugins: base.plugins,
  },
  {
    name: 'Browser tests',
    target: 'web',
    devtool: 'inline-source-map',
    entry: getBrowserFiles(),
    output: {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
      filename: '[name].js',
      library: 'icecast',
      libraryTarget: 'umd',
      path: path.resolve('test', 'static', 'scripts'),
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      loaders: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'istanbul-instrumenter-loader',
          enforce: 'post',
          options: {
            debug: true,
            esModules: true,
            produceSourceMap: true,
            preserveComments: true,
          }
        },
        {
          test: /\.test.ts$/,
          loader: 'mocha-loader',
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
        },
      ],
    },
    plugins: base.plugins
  },
];

