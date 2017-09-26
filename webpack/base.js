const path = require('path');
const webpack = require('webpack');

const pjson = require('../package.json');

const plugins = [
  new webpack.DefinePlugin({
    __IS_DEV__: (!process.env.NODE_ENV || process.env.NODE_ENV === 'development'),
    __APP_NAME__: JSON.stringify(pjson.name),
    __APP_VERSION__: JSON.stringify(pjson.version),
    __LOG_LEVEL__: (process.env.NODE_ENV === 'production') ? "'WARN'": "'DEBUG'",
  }),
];

let generatedFileSuffix = pjson.version;

if (process.env.NODE_ENV === 'production') {
  console.warn('Bundling in production mode');
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: true,
    }),
  );
  generatedFileSuffix += '.min'
} else {
  console.warn('Bundling in dev mode');
}

module.exports = {
  pjson,
  plugins,
  generatedFileSuffix
};
