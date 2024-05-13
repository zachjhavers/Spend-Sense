const { override, addWebpackPlugin } = require("customize-cra");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = override(
  addWebpackPlugin(
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true, // This will remove all console.* calls
        },
        mangle: true, // Reduce names of local variables to usually a single letter.
      },
      extractComments: false, // Do not extract comments to a separate file
    })
  )
);
