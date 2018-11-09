const webpackMerge = require('webpack-merge');
const webpackConfigBase = require('./webpack.config.base');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = webpackMerge(webpackConfigBase,{
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin("./public"),
    ],
});