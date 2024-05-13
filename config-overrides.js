const TerserPlugin = require("terser-webpack-plugin");

module.exports = function override(config, env) {
  config.optimization.minimizer = [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
        },
        mangle: true,
      },
    }),
  ];
  return config;
};
