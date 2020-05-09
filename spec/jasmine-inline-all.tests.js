var path = require('path')
var fs = require('fs')
var cheerio = require('cheerio')
var webpackConfig = require('./webpack.base.config')

module.exports = [

    {
        label: 'should inline all SVG images and exclude images with the inline-exclude attribute',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index-inline-all.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {
                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                expect($('img#deep-replace-me').length).toBe(0)

                expect($('img#replace-me').length).toBe(0)

                expect($('svg#deep-replace-me').length).toBe(1)

                expect($('svg#replace-me').length).toBe(1)

                expect($('img#exclude-replace-me').length).toBe(1)

                expect($('img#not-an-svg').length).toBe(1)

                done()

            })

        },

    },

]
