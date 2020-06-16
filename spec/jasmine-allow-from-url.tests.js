var path = require('path')
var fs = require('fs')
var cheerio = require('cheerio')
var webpackConfig = require('./webpack.base.config')

module.exports = [

    {
        label: 'should inline all SVG images (even the ones being an URL) and exclude images with the inline-exclude attribute',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index-allow-from-url.html')

            return fs.readFile(htmlFile, 'utf8', function (err, data) {
                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('img#find-and-replace-me').length).toBe(1)

                expect($('svg#find-and-replace-me').length).toBe(0)

                expect($('img#replace-me').length).toBe(0)

                expect($('svg#replace-me').length).toBe(1)

                expect($('img#not-found').length).toBe(1)

                expect($('img#error-loading').length).toBe(1)

                expect($('img#timeout-loading').length).toBe(1)

                expect($('img#replace-me-too').length).toBe(0)

                expect($('svg#replace-me-too').length).toBe(1)

                expect($('img#not-an-svg').length).toBe(1)

                expect($('div#do-not-decode').length).toBe(1)

                done()

            })

        },

    },

]
