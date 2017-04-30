'use strict'

const assert = require('assert')
const path = require('path')
const cheerio = require('cheerio')
const fs = require('fs')

let $

function HtmlWebpackInlineSVGPlugin (options) {

    assert.equal(options, undefined, 'The HtmlWebpackInlineSVGPlugin does not accept any options')

}

HtmlWebpackInlineSVGPlugin.prototype.apply = function (compiler) {

    // Hook into the html-webpack-plugin processing
    compiler.plugin('compilation', (compilation) => {

        compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {

            $ = cheerio.load(htmlPluginData.html)

            // find img tags with an inline attribute
            const $imgs = $('img[inline]')

            const imgArray = []

            $imgs.each((index, img) => {

                const svgSrc = $(img).attr('src')

                // must be referencing a file with a .svg extension
                if (svgSrc && svgSrc.indexOf('.svg') !== -1) {

                    imgArray.push({
                        img,
                        svgSrc,
                    })

                }

            })

            Promise.all(imgArray.map(imgObject => this.processImage(htmlPluginData, imgObject)))
                .then(() => {

                    const html = $.html()

                    htmlPluginData.html = html || htmlPluginData.html

                    callback(null, htmlPluginData)

                })
                .catch((err) => {

                    console.log(err)

                })

        })

    })

}

HtmlWebpackInlineSVGPlugin.prototype.processImage = (htmlPluginData, imgObject) =>

    new Promise((resolve, reject) => {

        fs.readFile(path.resolve(imgObject.svgSrc), 'utf8', (err, data) => {

            if (err) reject(err)

            $(imgObject.img).after(data)

            $(imgObject.img).remove()

            resolve(data)

        })

    })

module.exports = HtmlWebpackInlineSVGPlugin
