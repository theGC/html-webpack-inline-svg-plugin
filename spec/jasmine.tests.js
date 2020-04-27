var path = require('path')
var fs = require('fs')
var cheerio = require('cheerio')
var webpackConfig = require('./webpack.base.config')

module.exports = [

    {
        label: 'should not inline imgs without inline attribute',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('img.leave-me').length).toBe(1)

                done()

            })

        },

    },

    {
        label: 'should inline imgs with inline attribute',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('svg#inline-me').length).toBe(1)

                done()

            })

        },

    },

    {
        label: 'should remove img tags with inline attribute',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('#replace-me').length).toBe(0)

                done()

            })

        },

    },

    {
        label: 'should remove multiple inlined img tags within the same document',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('#then-replace-me').length).toBe(0)

                done()

            })

        },

    },

    {
        label: 'should ignore images that are not svg',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('#not-an-svg').length).toBe(1)

                done()

            })

        },

    },

    {
        label: 'do not html decode content',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                expect(data.indexOf('<?= $foo->bar; ?>'))
                    .not.toBe(-1)

                done()

            })

        },

    },

    {
        label: 'should replace nested inline imgs',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('#deep-replace-me').length).toBe(0)

                done()

            })

        },

    },

    {
        label: 'should contain deep inline SVG',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('svg#deep-inline-me').length).toBe(1)

                done()

            })

        },

    },

]
