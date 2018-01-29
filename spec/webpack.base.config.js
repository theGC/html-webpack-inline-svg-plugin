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
                template: path.join(__dirname, 'fixtures', 'index.html'),
            }),
            new HtmlWebpackPlugin({
                filename: path.resolve(OUTPUT_DIR, 'blank.html'),
                template: path.join(__dirname, 'fixtures', 'blank.html'),
            }),
            new HtmlWebpackPlugin({
                filename: path.resolve(OUTPUT_DIR, 'partial.html'),
                template: path.join(__dirname, 'fixtures', 'partial.html'),
            }),
            new HtmlWebpackInlineSVGPlugin(),
        ],

    },

}
