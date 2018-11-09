const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const webpackConfigBase = require('./webpack.config.base');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = webpackMerge(webpackConfigBase,{
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new OpenBrowserPlugin({ url: 'http://localhost:'+ (process.env.PORT || '3000')})
　　 ],
});