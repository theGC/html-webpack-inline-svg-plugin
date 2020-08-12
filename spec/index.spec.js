/* eslint-env jasmine */
var chalk = require('chalk')
var webpack = require('webpack')
var axios = require('axios')
var MockAdapter = require('axios-mock-adapter')
var webpackConfig = require('./webpack.base.config')
var webpackPostEmitConfig = require('./webpack.post-emit.config')
var webpackPreEmitConfig = require('./webpack.pre-emit.config')
var webpackInlineAllConfig = require('./webpack.inline-all.config')
var webpackAllowFromUrlConfig = require('./webpack.allow-from-url.config')
var webpackSvgoConfig = require('./webpack.svgo.config')
var jasmineTests = require('./jasmine.tests')
var jasmineInlineAllTests = require('./jasmine-inline-all.tests')
var jasmineAllowFromUrlTests = require('./jasmine-allow-from-url.tests')
var jasmineSvgoTests = require('./jasmine-svgo.tests')
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

            // callback is fired before all files have been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })


    // run all tests

    jasmineTests.forEach((test) => {

        it(test.label, test.func)

    })

})

describe('HtmlWebpackInlineSVGPlugin: allowFromUrl webpack resolve', function () {
    
    var mock = new MockAdapter(axios)
    
    beforeAll(function (done) {
        mock.onGet('https://badge.fury.io/js/html-webpack-inline-svg-plugin.svg').reply(200, '<svg class="mocked-svg"><text>mocked svg</text></svg>')

        // Like when the SVG file is retrieved locally, the webpack build process fails as well if the URL provided doesn't download for some reason
        // mock.onGet('https://notFound/typoInExtension/html-webpack-inline-svg-plugin-typoInNaming.svg').reply(404)
        // mock.onGet('http://errorLoading/someIconWhichDoesNotExist.svg').reply(500)
        // mock.onGet('http://timeoutLoading/someIconWhichDoesNotExist-timeout.svg').timeout();

        // clone the config
        const webpackTestConfig = Object.assign({}, webpackConfig.options, webpackAllowFromUrlConfig)


        // run webpack

        webpack(webpackTestConfig, (err) => {

            expect(err).toBeFalsy()

            // callback is fired before all files have been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })

    afterEach(() => {
        mock.restore();
    })


    // run all-images-from-url tests

    jasmineAllowFromUrlTests.forEach((test) => {
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

            // callback is fired before all files have been written to disk
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

            // callback is fired before all files hve been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })


    // run all-images tests

    jasmineInlineAllTests.forEach((test) => {

        it(test.label, test.func)

    })

})


describe('HtmlWebpackInlineSVGPlugin: custom SVGO config resolve.', function () {

    beforeAll(function (done) {

        // clone the config

        const webpackTestConfig = Object.assign({}, webpackConfig.options, webpackSvgoConfig)


        // run webpack

        webpack(webpackTestConfig, (err) => {

            expect(err).toBeFalsy()

            // callback is fired before all files hve been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })

    jasmineSvgoTests.forEach((test) => {

        it(test.label, test.func)

    })

})
