const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0;
const webpack = require('webpack');

module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    config.module.rules.delete('eslint');
    config.resolve.alias.set('vue', '@vue/compat');
    config.resolve.alias.set('vue$', '@vue/compat');
    config.resolve.alias.set('vue-router', require.resolve('vue-router'));
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            },
            isCustomElement: tag => ['center', 'font', 'marquee', 'big', 'small'].includes(tag)
          }
        };
      });
  },
  configureWebpack: {
    optimization: {
      minimize: false
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PACKAGE_VERSION': `"${version}"`,
      }),
    ],
  },
  parallel: false,
}
