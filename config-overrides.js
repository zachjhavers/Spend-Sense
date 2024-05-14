// Define the custom configuration for the webpack build process
const { override, addWebpackPlugin } = require("customize-cra");
const TerserPlugin = require("terser-webpack-plugin");

// Override the default webpack configuration
module.exports = override(
  addWebpackPlugin(
    // Minify the output of the webpack build process
    new TerserPlugin({
      // Customize the terser options
      terserOptions: {
        compress: {
          // Remove console.log statements from the output
          drop_console: true,
        },
        // Mangle the output to reduce the size of the output files
        mangle: true,
      },
      // Do not extract comments from the output
      extractComments: false,
    })
  )
);
