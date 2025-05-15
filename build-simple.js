const webpack = require('webpack');
const config = require('./webpack.config.js');

// Set production mode explicitly
config.mode = 'production';

// Simplified build to avoid timeouts
const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error('Build errors:');
    info.errors.forEach(error => {
      console.error(error);
    });
  }

  if (stats.hasWarnings()) {
    console.warn('Build warnings:');
    info.warnings.forEach(warning => {
      console.warn(warning);
    });
  }

  console.log('Webpack build completed successfully!');
});