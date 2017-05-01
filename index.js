'use strict'

const assert = require('assert')
const path = require('path')
const chalk = require('chalk')
const cheerio = require('cheerio')
const fs = require('fs')
const SVGO = require('svgo')
const svgoDefaultConfig = require(path.resolve(__dirname, 'svgo-config.js'))
const _ = require('lodash')

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

                    const errorMessage =
                        err.message ?
                        err.message :
                        'One of your inline SVGs hit an error, likely caused by the file not being found'

                    console.error(chalk.red(errorMessage))

                })

        })

    })

}

HtmlWebpackInlineSVGPlugin.prototype.processImage = (htmlPluginData, imgObject) =>

    new Promise((resolve, reject) => {

        fs.readFile(path.resolve(imgObject.svgSrc), 'utf8', (err, data) => {

            if (err) reject(err)

            // build the custom config
            const userConfig =
                htmlPluginData.plugin.options.svgoConfig &&
                _.isObject(htmlPluginData.plugin.options.svgoConfig) ?
                htmlPluginData.plugin.options.svgoConfig :
                {}

            const configObj = Object.assign(svgoDefaultConfig, userConfig)

            const config = {}

            // pass all objects to the config.plugins array
            config.plugins = _.map(configObj, (value, key) => ({ [key]: value }));

            const svgo = new SVGO(config)

            svgo.optimize(data, (result) => {

                if (result.error) reject(result.error)

                const optimisedSVG = result.data

                $(imgObject.img).after(optimisedSVG)

                $(imgObject.img).remove()

                resolve(optimisedSVG)

            })

        })

    })

module.exports = HtmlWebpackInlineSVGPlugin
