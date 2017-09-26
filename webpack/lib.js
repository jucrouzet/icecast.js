const path = require('path');

const base = require('./base');
const DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');

const devServer = {
  port: 8080,
  proxy: {
    '/**': {  //catch all requests
      target: '/index.html',  //default target
      secure: false,
      bypass: (req, res, opt) => {
        if(req.path.indexOf('/dist/') !== -1) {
          return '/'
        }
        if (req.headers.accept.indexOf('html') !== -1) {
          return '/index.html';
        }
      },
    },
  },
};

module.exports = [
  {
    name: 'Library',
    target: 'web',
    devtool: 'inline-source-map',
    devServer,
    entry: path.resolve('src', 'index.ts'),
    output: {
      filename: `icecast.${base.generatedFileSuffix}.js`,
      library: 'icecast.js',
      libraryTarget: 'umd',
      path: path.resolve('dist'),
      umdNamedDefine: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      loaders: [
        {
          test: /\.ts/,
          enforce: 'pre',
          loader: 'tslint-loader',
          options: {
            typeCheck: true,
          },
        },
        {
          test: /\.ts/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: (process.env.NODE_ENV !== 'watch'),
            },
          },
        },
      ],
    },
    plugins: base.plugins,
  }
];
