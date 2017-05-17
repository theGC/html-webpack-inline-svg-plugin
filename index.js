'use strict'

const assert = require('assert')
const path = require('path')
const chalk = require('chalk')
const parse5 = require('parse5')
const _ = require('lodash')
const fs = require('fs')
const SVGO = require('svgo')
const svgoDefaultConfig = require(path.resolve(__dirname, 'svgo-config.js'))

// let $

let outputHtml

let userConfig

function HtmlWebpackInlineSVGPlugin (options) {

    assert.equal(options, undefined, 'The HtmlWebpackInlineSVGPlugin does not accept any options')

}

HtmlWebpackInlineSVGPlugin.prototype.apply = function (compiler) {

    // Hook into the html-webpack-plugin processing
    compiler.plugin('compilation', (compilation) => {

        compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {

            // build the custom config
            userConfig =
                htmlPluginData.plugin.options.svgoConfig &&
                _.isObject(htmlPluginData.plugin.options.svgoConfig) ?
                htmlPluginData.plugin.options.svgoConfig :
                {}

            this.processImages(htmlPluginData.html)
                .then((html) => {

                    htmlPluginData.html = html || htmlPluginData.html

                    callback(null, htmlPluginData)

                })
                .catch((err) => callback(null, htmlPluginData))

        })

    })

}


/**
 * find all inline images and replace their html within the output
 * @param {string} html
 * @returns {Promise}
 *
 */
HtmlWebpackInlineSVGPlugin.prototype.processImages = function (html) {

    return new Promise((resolve, reject) => {

        const documentFragment = parse5.parseFragment(html, {
            locationInfo: true
        })

        const inlineImages = this.getInlineImages(documentFragment)

        if (!inlineImages || !inlineImages.length) return resolve(html)

        let processedImage = this.processImage(html)

        // run the Promises in a synchronous order
        // allows us to ensure we have completed processing of an inline image before the next ones Promise is called (via then chaining)
        for (let i = inlineImages.length - 1; i >= 0; i--) {

            processedImage = processedImage
                .then((html) => {

                    // if we have more inline images then return the next Promise
                    if (i > 0) return this.processImage(html)

                    // else resolve this Promise
                    return resolve(html)

                })
                .catch((err) => reject(err))

        }

    })

}


/**
 * get the first inline image and replace it with its inline SVG
 * @returns {Promise}
 *
 */
HtmlWebpackInlineSVGPlugin.prototype.processImage = function (html) {

    return new Promise((resolve, reject) => {

        // rebuild the document fragment each time with the updated html
        const documentFragment = parse5.parseFragment(html, {
            locationInfo: true,
        })

        const inlineImage = this.getInlineImage(documentFragment)

        if (inlineImage) {

            this.processOutputHtml(html, inlineImage)
                .then((html) => {

                    resolve(html)

                })
                .catch((err) => reject(err))

        } else {

            // no inline image - just resolve
            resolve(html)

        }

    })

}


/**
 * get a count for how many inline images the html document contains
 * @param {Object} documentFragment - parse5 processed html
 * @param {array} inlineImages
 * @returns {array}
 *
 */
HtmlWebpackInlineSVGPlugin.prototype.getInlineImages = function (documentFragment, inlineImages) {

    if (!inlineImages) inlineImages = []

    if (documentFragment.childNodes && documentFragment.childNodes.length) {

        documentFragment.childNodes.forEach((childNode) => {

            if (childNode.nodeName === 'img') {

                if (_.filter(childNode.attrs, { name: 'inline' }).length) {

                    inlineImages.push(childNode)

                }

            } else {

                inlineImages = this.getInlineImages(childNode, inlineImages)

            }

        })

    }

    return inlineImages

}


/**
 * return the first inline image or false if none
 * @param {Object} documentFragment - parse5 processed html
 * @returns {boolean|Object}
 *
 */
HtmlWebpackInlineSVGPlugin.prototype.getInlineImage = function (documentFragment) {

    let inlineImage = false

    if (documentFragment.childNodes && documentFragment.childNodes.length) {

        documentFragment.childNodes.some((childNode) => {

            if (childNode.nodeName === 'img') {

                if (_.filter(childNode.attrs, { name: 'inline' }).length) {

                    inlineImage = childNode

                    return true

                }

            } else if (childNode.childNodes && childNode.childNodes.length) {

                return this.getInlineImage(childNode)

            }

            return false

        })

    }

    return inlineImage

}


/**
 * append the inlineImages SVG data to the output HTML and remove the original img
 * @param {string} html
 * @param {Object} inlineImage - parse5 document
 * @returns {Promise}
 *
 */
HtmlWebpackInlineSVGPlugin.prototype.processOutputHtml = function (html, inlineImage) {

    return new Promise((resolve, reject) => {

        const svgSrcObject = _.find(inlineImage.attrs, { name: 'src' })

        // image does not have a src attribute
        if (!svgSrcObject) return resolve(html)

        const svgSrc = svgSrcObject.value

        // image src attribute must not be blank and it must be referencing a file with a .svg extension
        if (!svgSrc || svgSrc.indexOf('.svg') === -1) return resolve(html)

        fs.readFile(path.resolve(svgSrc), 'utf8', (err, data) => {

            if (err) reject(err)

            const configObj = Object.assign(svgoDefaultConfig, userConfig)

            const config = {}

            // pass all objects to the config.plugins array
            config.plugins = _.map(configObj, (value, key) => ({ [key]: value }));

            const svgo = new SVGO(config)

            svgo.optimize(data, (result) => {

                if (result.error) return reject(result.error)

                const optimisedSVG = result.data

                html = this.replaceImageWithSVG(html, inlineImage, optimisedSVG)

                resolve(html)

            })

        })

    })

}


/**
 * replace the img with the optimised SVG
 * @param {string} html
 * @param {Object} inlineImage - parse5 document
 * @param {Object} svg
 *
 */
HtmlWebpackInlineSVGPlugin.prototype.replaceImageWithSVG = function (html, inlineImage, svg) {

    const start = inlineImage.__location.startOffset

    const end = inlineImage.__location.endOffset

    // remove the img tag and add the svg content
    return html.substring(0, start) + svg + html.substring(end)

}

// HtmlWebpackInlineSVGPlugin.prototype.apply = function (compiler) {

//     // Hook into the html-webpack-plugin processing
//     compiler.plugin('compilation', (compilation) => {

//         compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {

//             $ = cheerio.load(htmlPluginData.html, {
//                 decodeEntities: false
//             })

//             // find img tags with an inline attribute
//             const $imgs = $('img[inline]')

//             const imgArray = []

//             $imgs.each((index, img) => {

//                 const svgSrc = $(img).attr('src')

//                 // must be referencing a file with a .svg extension
//                 if (svgSrc && svgSrc.indexOf('.svg') !== -1) {

//                     imgArray.push({
//                         img,
//                         svgSrc,
//                     })

//                 }

//             })

//             Promise.all(imgArray.map(imgObject => this.processImage(htmlPluginData, imgObject)))
//                 .then(() => {

//                     const html = $.html()

//                     htmlPluginData.html = html || htmlPluginData.html

//                     // cheerio will remove closing body and html tags if the document

//                     callback(null, htmlPluginData)

//                 })
//                 .catch((err) => {

//                     const errorMessage =
//                         err.message ?
//                         err.message :
//                         'One of your inline SVGs hit an error, likely caused by the file not being found'

//                     console.error(chalk.red(errorMessage))

//                 })

//         })

//     })

// }

// HtmlWebpackInlineSVGPlugin.prototype.processImage = (htmlPluginData, imgObject) =>

//     new Promise((resolve, reject) => {

//         fs.readFile(path.resolve(imgObject.svgSrc), 'utf8', (err, data) => {

//             if (err) reject(err)

//             const configObj = Object.assign(svgoDefaultConfig, userConfig)

//             const config = {}

//             // pass all objects to the config.plugins array
//             config.plugins = _.map(configObj, (value, key) => ({ [key]: value }));

//             const svgo = new SVGO(config)

//             svgo.optimize(data, (result) => {

//                 if (result.error) reject(result.error)

//                 const optimisedSVG = result.data

//                 $(imgObject.img).after(optimisedSVG)

//                 $(imgObject.img).remove()

//                 resolve(optimisedSVG)

//             })

//         })

//     })

module.exports = HtmlWebpackInlineSVGPlugin
