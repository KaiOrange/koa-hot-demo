const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin") ;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const devMode = process.env.NODE_ENV === 'development';

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src','index.js'),
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].[hash].js',
        publicPath:"/"
    },
    module: {
        rules: [{
            test: /\.(js)?$/,
            exclude: /node_modules/,
            loader: "babel-loader",
        }, {
            test: /\.(css)?$/,
            // exclude: /node_modules/,
            use: [
                devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1,
                    }
                },
                {loader: 'postcss-loader'}
            ]
        }, {
            test: /\.(less)?$/,
            use: [
                devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1,
                    }
                },
                {loader: 'less-loader'}
            ]
        }, {
            test: /\.(png|jpg|jpeg|gif)$/,
            loader: "url-loader?limit=3000&name=images/[name].[ext]"
        }]
    },
    plugins: [
        new CopyWebpackPlugin([{ from: './src/assert', to: './assert' }]),
        new MiniCssExtractPlugin({
            filename: "[name].[chunkhash:8].css",
            chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            template:"./src/index.html",
        }),
        new webpack.optimize.OccurrenceOrderPlugin()
    ],
};