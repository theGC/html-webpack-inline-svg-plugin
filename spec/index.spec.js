/* eslint-env jasmine */
var path = require('path')
var fs = require('fs')
var chalk = require('chalk')
var cheerio = require('cheerio')
var webpack = require('webpack')
var webpackConfig = require('./webpack.base.config')
var rm = require('rimraf')

rm(webpackConfig.outputDir, (err) => {

    if (err) console.log(chalk.red(err))

})

describe('HtmlWebpackInlineSVGPlugin', function () {

    beforeAll(function (done) {

        webpack(webpackConfig.options, (err) => {

            expect(err).toBeFalsy()

            // callbck is fired before all files hve been written to disk
            // due to use of after-emit - place a timeout to try and avoid the issue

            setTimeout(done, 2000)

        })

    })

    it('should not inline imgs without inline attribute', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('img.leave-me').length).toBe(1)

            done()

        })

    })

    it('should inline imgs with inline attribute', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('svg#inline-me').length).toBe(1)

            done()

        })

    })

    it('should remove img tags with inline attribute', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('#replace-me').length).toBe(0)

            done()

        })

    })

    it('should remove multiple inlined img tags within the same document', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('#then-replace-me').length).toBe(0)

            done()

        })

    })

    it('should ignore images that are not svg', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('#not-an-svg').length).toBe(1)

            done()

        })

    })

    it('do not html decode content', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            expect(data.indexOf('<?= $foo->bar; ?>'))
                .not.toBe(-1)

            done()

        })

    })

    it('do not touch broken tags', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var re1 = /should output broken tags<\/p>/gi;

            expect(data.match(re1))
                .not.toBe(null)

            var re2 = /<p>should output unclosed tags/gi;

            expect(data.match(re2))
                .not.toBe(null)

            done()

        })

    })

    /**
     * Partial is included to test situations where templates are only parts of a pages output
     * i.e separate header and footer templates
     * resulting in broken opening / closing tags
     *
     */
    it('allow partials to have broken tags', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'partial.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            const dataSquashed = data.replace(/\s/g,'')

            expect(dataSquashed.startsWith('<\/p><\/div>'))
                .toBe(true)

            done()

        })

    })

    it('should replace nested inline imgs', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('#deep-replace-me').length).toBe(0)

            done()

        })

    })

    it('should contain deep inline SVG', function (done) {

        var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (err, data) {

            expect(err).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('svg#deep-inline-me').length).toBe(1)

            done()

        })

    })

})
