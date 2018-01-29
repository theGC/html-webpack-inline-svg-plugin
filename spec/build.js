var webpack = require('webpack')
var webpackConfig = require('./webpack.base.config')
var chalk = require('chalk')
var rm = require('rimraf')

rm(webpackConfig.outputDir, (err) => {

    if (err) console.log(chalk.red(err))

})

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
