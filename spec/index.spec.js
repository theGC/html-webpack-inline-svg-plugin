/* eslint-env jasmine */
var path = require('path')
var fs = require('fs')
var chalk = require('chalk')
var cheerio = require('cheerio')
var webpack = require('webpack')
var rm = require('rimraf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackInlineSVGPlugin = require('../')

var OUTPUT_DIR = path.join(__dirname, '../dist')

rm(OUTPUT_DIR, (err) => {

    if (err) console.log(chalk.red(err))

})

describe('HtmlWebpackInlineSVGPlugin', function () {

    beforeEach(function (done) {

        webpack({
            entry: path.join(__dirname, 'fixtures', 'entry.js'),
            output: {
                path: OUTPUT_DIR,
            },
            plugins: [
                new HtmlWebpackPlugin({
                    template: path.join(__dirname, 'fixtures', 'index.html'),
                }),
                new HtmlWebpackPlugin({
                    filename: path.resolve(OUTPUT_DIR, 'partial.html'),
                    template: path.join(__dirname, 'fixtures', 'partial.html'),
                }),
                new HtmlWebpackInlineSVGPlugin(),
            ],
        }, function (err) {

            expect(err).toBeFalsy()

            done()

        })

    })

    it('should not inline imgs without inline attribute', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('img.leave-me').length).toBe(1)

            done()

        })

    })

    it('should inline imgs with inline attribute', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('svg#inline-me').length).toBe(1)

            done()

        })

    })

    it('should inline deep imgs with inline attribute', function (done) {
        
        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('svg#deep-inline-me').length).toBe(1)

            done()

        })

    })

    it('should remove img tags with inline attribute', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('#replace-me').length).toBe(0)

            done()

        })

    })

    it('should ignore images that are not svg', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var $ = cheerio.load(data)

            expect($('#not-an-svg').length).toBe(1)

            done()

        })

    })

    it('do not html decode content', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var $ = cheerio.load(data, {
                decodeEntities: false,
            })

            expect($('#do-not-decode').html())
                .toBe('<?= $foo->bar; ?>')

            done()

        })

    })

    it('do not touch broken tags', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'index.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            var re1 = /should output broken tags<\/p>/gi;

            expect(data.match(re1))
                .not.toBe(null)

            var re2 = /<p>should output unclosed tags/gi;

            expect(data.match(re2))
                .not.toBe(null)

            done()

        })

    })

    it('allow partials to have broken tags', function (done) {

        var htmlFile = path.resolve(OUTPUT_DIR, 'partial.html')

        fs.readFile(htmlFile, 'utf8', function (er, data) {

            expect(er).toBeFalsy()

            const dataSquashed = data.replace(/\s/g,'')

            expect(dataSquashed.startsWith('<\/p><\/div>'))
                .toBe(true)

            done()

        })

    })

})
