/* eslint-env jasmine */
var chalk = require('chalk')
var webpack = require('webpack')
var webpackConfig = require('./webpack.base.config')
var webpackPostEmitConfig = require('./webpack.post-emit.config')
var webpackPreEmitConfig = require('./webpack.pre-emit.config')
var webpackInlineAllConfig = require('./webpack.inline-all.config')
var jasmineTests = require('./jasmine.tests')
var jasmineInlineAllTests = require('./jasmine-inline-all.tests')
var rm = require('rimraf')

rm(webpackConfig.outputDir, (err) => {

    if (err) console.log(chalk.red(err))

})

describe('HtmlWebpackInlineSVGPlugin: post webpack resolve', function () {

    beforeAll(function (done) {

        // clone the config

        const webpackTestConfig = Object.assign({}, webpackConfig.options, webpackPostEmitConfig)


        // run webpack

        webpack(webpackTestConfig, (err) => {

            expect(err).toBeFalsy()

            // callbck is fired before all files have been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })


    // run all tests

    jasmineTests.forEach((test) => {

        it(test.label, test.func)

    })

})


// second set of tests running prior to webpack resolves

describe('HtmlWebpackInlineSVGPlugin: pre webpack resolve', function () {

    beforeAll(function (done) {

        // clone the config

        const webpackTestConfig = Object.assign({}, webpackConfig.options, webpackPreEmitConfig)


        // run webpack

        webpack(webpackTestConfig, (err) => {

            expect(err).toBeFalsy()

            // callbck is fired before all files have been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })


    // run all tests

    jasmineTests.forEach((test) => {

        it(test.label, test.func)

    })

})


describe('HtmlWebpackInlineSVGPlugin: inlineAll resolve', function () {

    beforeAll(function (done) {

        // clone the config

        const webpackTestConfig = Object.assign({}, webpackConfig.options, webpackInlineAllConfig)


        // run webpack

        webpack(webpackTestConfig, (err) => {

            expect(err).toBeFalsy()

            // callbck is fired before all files hve been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })


    // run all-images tests

    jasmineInlineAllTests.forEach((test) => {

        it(test.label, test.func)

    })

})
