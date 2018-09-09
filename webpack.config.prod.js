const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin") ;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src','index.js'),
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.[hash].js',
        publicPath:"/"
    },
    module: {
        rules: [{
            test: /\.(js)?$/,
            exclude: /node_modules/,
            loader: "babel-loader",
        }, {
            test: /\.(css)?$/,
            use: [
                MiniCssExtractPlugin.loader,
                "css-loader"
            ]
        }, {
            test: /\.(png|jpg|jpeg|gif)$/,
            loader: "url-loader?limit=3000&name=images/[name].[ext]"
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[chunkhash:8].css",
            chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            template:"./src/index.html"
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
　　 ],
};