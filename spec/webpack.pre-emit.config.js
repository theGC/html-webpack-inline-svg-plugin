const path = require('path')
const webpackConfig = require('./webpack.base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSVGPlugin = require('../')

module.exports = {

    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(webpackConfig.outputDir, 'index.html'),
            template: path.join(__dirname, 'fixtures', 'index-pre-emit.html'),
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(webpackConfig.outputDir, 'partial.html'),
            template: path.join(__dirname, 'fixtures', 'partial-pre-emit.html'),
        }),
        new HtmlWebpackInlineSVGPlugin({
            runPreEmit: true,
        }),
    ],

}
