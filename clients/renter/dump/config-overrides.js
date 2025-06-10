const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    util: require.resolve('util'),
    buffer: require.resolve('buffer'),
  };
  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.js'];
  config.ignoreWarnings = [/Failed to parse source map/];

  // Add module resolution settings
  config.resolve.modules = [
    'node_modules',
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules')
  ];

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]);
  return config;
}; 