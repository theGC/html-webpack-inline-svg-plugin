const path = require('path')
const webpackConfig = require('./webpack.base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSVGPlugin = require('../')

module.exports = {

    resolve: {
        alias: {
            'img': path.join(__dirname, 'fixtures', 'images'),
        },
    },

    module: {
        rules: [
            {
                test: /\.svg$/i,
                loader: 'file-loader',
                options: {
                    name: 'images/svgs/[name].[ext]',
                    esModule: false,
                },
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader',
                options: {
                    name: 'images/[name].[ext]',
                    esModule: false,
                },
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {},
            },
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html'),
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(webpackConfig.outputDir, 'partial.html'),
            template: path.join(__dirname, 'fixtures', 'partial.html'),
        }),
        new HtmlWebpackInlineSVGPlugin(),
    ],

}
