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
                test: /\.(svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/svgs/[name].[ext]',
                        }
                    }
                ],
            },
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                        }
                    }
                ],
            },
            {
                test: /\.(html)$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {}
                    }
                ],
            },
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(webpackConfig.outputDir, 'index-inline-all.html'),
            template: path.join(__dirname, 'fixtures', 'index-inline-all.html'),
        }),
        new HtmlWebpackInlineSVGPlugin({
            inlineAll: true,
        }),
    ],

}
