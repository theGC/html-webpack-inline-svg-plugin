var path = require('path')
var fs = require('fs')
var cheerio = require('cheerio')
var webpackConfig = require('./webpack.base.config')

module.exports = [

    {
        label: 'It should inline SVG images following the custom SVGO config',
        func: function (done) {

            var htmlFile = path.resolve(webpackConfig.outputDir, 'index-svgo.html')

            fs.readFile(htmlFile, 'utf8', function (err, data) {
                expect(err).toBeFalsy()

                var $ = cheerio.load(data)

                // Assertions affecting any html-webpack-inline-svg-plugin use
                expect($('img#replace-me').length).toBe(0)
                expect($('svg#replace-me').length).toBe(1)
                expect($('img#not-an-svg').length).toBe(1)
                expect($('div#do-not-decode').length).toBe(1)

                // Assertions affecting only svgoConfig option
                // The configuration found on webpack.svgo.config.js is the opposite to SVGO defaults
                expect($('svg#replace-me').attr('xmlns')).toBe(undefined)
                expect($('svg#replace-me title#icon-mood-bad-title').length).toBe(1)
                expect($('svg#replace-me symbol#icon-mood-bad').contents()[0].data).toBe('Random comment')

                done()

            })

        },

    },

]
