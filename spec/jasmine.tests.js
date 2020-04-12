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

                expect($('svg#replace-me').length).toBe(1)

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

                expect($('img#replace-me').length).toBe(0)

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

                expect($('img#then-replace-me').length).toBe(0)

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
        label: 'do not touch broken tags',
        func: function (done) {

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

        },

    },

    /**
     * Partial is included to test situations where templates are only parts of a pages output
     * i.e separate header and footer templates
     * resulting in broken opening / closing tags
     *
     */
    {
        label: 'allow partials to have broken tags',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'partial.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {

                expect(err).toBeFalsy()

                const dataSquashed = data.replace(/\s/g,'')

                expect(dataSquashed.startsWith('<\/p><\/div>'))
                    .toBe(true)

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

                expect($('svg#deep-replace-me').length).toBe(1)

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

                expect($('svg#deep-replace-me').length).toBe(1)

                done()

            })

        },

    },

]
