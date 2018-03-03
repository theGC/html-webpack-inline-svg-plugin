var webpack = require('webpack')
var webpackConfig = require('./webpack.base.config')
var webpackPostEmitConfig = require('./webpack.post-emit.config')
var webpackPreEmitConfig = require('./webpack.pre-emit.config')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackInlineSVGPlugin = require('../')
var chalk = require('chalk')
var rm = require('rimraf')

rm(webpackConfig.outputDir, (err) => {

    if (err) console.log(chalk.red(err))

})


// add pre or post emit config to base

Object.assign(webpackConfig.options, webpackPostEmitConfig)
// Object.assign(webpackConfig.options, webpackPreEmitConfig)


/**
 * no testing - just attempt to output the dist folder and files
 *
 */

webpack(webpackConfig.options, function (err) {

    if (err) {

        console.log(chalk.red(err))

        return

    }

    console.log(chalk.green('build complete'))

})
