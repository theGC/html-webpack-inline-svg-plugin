var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackInlineSVGPlugin = require('../')
var OUTPUT_DIR = path.join(__dirname, '../dist')

module.exports = {

    outputDir: OUTPUT_DIR,

    options: {

        watch: false,

        entry: path.join(__dirname, 'fixtures', 'entry.js'),

        output: {
            path: OUTPUT_DIR,
        },

    },

}
