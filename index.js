'use strict'

const path = require('path')
const chalk = require('chalk')
const parse5 = require('parse5')
const _ = require('lodash')
const fs = require('fs')
const SVGO = require('svgo')
const svgoDefaultConfig = require(path.resolve(__dirname, 'svgo-config.js'))


/**
 * class to inline SVGs within html-webpack-plugin templates
 *
 */
class HtmlWebpackInlineSVGPlugin {

    constructor (options) {

        if (options && options.runPreEmit) {

            this.runPreEmit = true

        }

        this.userConfig = ''
        this.outputPath = ''

        this.files = []

    }


    /**
     * required to create a webpack plugin
     * @param {object} compiler - webpack compiler
     *
     */
    apply (compiler) {


        // Hook into the html-webpack-plugin processing

        compiler.plugin('compilation', (compilation) => {

            if (this.runPreEmit) {

                compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {

                    // get the custom config

                    this.getUserConfig(htmlPluginData)


                    // process the images

                    return this.processImages(htmlPluginData.html)
                        .then((html) => {

                            htmlPluginData.html = html || htmlPluginData.html

                            return typeof callback === 'function' ?
                                callback(null, htmlPluginData) :
                                htmlPluginData

                        })
                        .catch((err) => {

                            console.log(err)

                            return typeof callback === 'function' ?
                                callback(null, htmlPluginData) :
                                htmlPluginData

                        })

                })

            } else {

                compilation.plugin('html-webpack-plugin-after-emit', (htmlPluginData, callback) => {

                    // fetch the output path from webpack

                    this.outputPath = compilation.outputOptions &&
                        compilation.outputOptions.path ?
                        compilation.outputOptions.path :
                        ''

                    if (!this.outputPath) {

                        console.log(chalk.red('no output path found on compilation.outputOptions'))

                        return typeof callback === 'function' ?
                            callback(null, htmlPluginData) :
                            htmlPluginData

                    }


                    // get the custom config

                    this.getUserConfig(htmlPluginData)


                    // get the filename

                    const filename = htmlPluginData.outputName ? htmlPluginData.outputName : ''

                    if (!filename) {

                        console.log(chalk.red('no filename found on htmlPluginData.outputName'))

                        return typeof callback === 'function' ?
                            callback(null, htmlPluginData) :
                            htmlPluginData

                    }


                    // get the emitted HTML - prior to SVG's being inlined

                    const originalHtml = htmlPluginData.html.source()


                    // add filename and original html to the file array

                    this.files.push({
                        filename,
                        originalHtml,
                    })


                    // fire callback to pass control to any further plugins

                    return typeof callback === 'function' ?
                        callback(null, htmlPluginData) :
                        htmlPluginData

                })

            }

        })


        // hook after-emit so we can read the generated SVG assets within
        // the output directory

        if (!this.runPreEmit) {

            compiler.plugin('after-emit', (compilation, callback) => {

                if (!this.files.length) {

                    console.log(chalk.green('no files passed for SVG inline to process'))

                    return

                }


                // iterate over each file and inline it's SVGs
                // then return a callback if available

                return Promise.all(this.files.map(file => this.processImages(file.originalHtml)))
                    .then((htmlArray) => Promise.all(htmlArray.map((html, index) => this.updateOutputFile(html, this.files[index].filename))))
                    .then(() => typeof callback === 'function' ? callback() : null)
                    .catch((err) => console.log(chalk.red(err.message)))

            })

        }

    }


    /**
     * get the users custom config
     * @param {Object} htmlPluginData
     *
     */
    getUserConfig (htmlPluginData) {

        this.userConfig =
            htmlPluginData &&
            htmlPluginData.plugin.options &&
            _.isObject(htmlPluginData.plugin.options.svgoConfig) ?
            htmlPluginData.plugin.options.svgoConfig :
            {}

    }


    /**
     * once we've inlined all SVGs and generated the final html
     * we need to write it to the file output by html-webpack-plugin
     * Note: we can not simply update the callbacks html as we are
     * working with the emitted data due to allowing for webpack to first
     * resolve and output all files
     * @param {string} html - processed and updated html with inlined SVGs
     * @param {string} filename - the template file we are currently processing
     * @returns {Promise}
     *
     */
    updateOutputFile (html, filename) {

        if (!this.outputPath || !filename) return Promise.reject(new Error('outputPath & filename must be set to update output file'))

        else if (!html) return Promise.resolve()

        return new Promise((resolve, reject) => {


            // set the output file to the updated html

            fs.writeFile(path.resolve(this.outputPath, filename), html, (err) => {

                if (err) {

                    reject(err)

                    return

                }

                resolve()

            })

        })

    }


    /**
     * find all inline images and replace their html within the output
     * @param {string} html - generated html from html-webpack-plugin
     * @returns {Promise}
     *
     */
    processImages (html) {

        return new Promise((resolve, reject) => {

            const documentFragment = parse5.parseFragment(html, {
                locationInfo: true
            })


            // grab the images to process from the original DOM fragment

            const inlineImages = this.getInlineImages(documentFragment)


            // if we have no inlined images return the html

            if (!inlineImages.length) return resolve()


            // process the imageNodes

            this.updateHTML(html, inlineImages)
                .then((html) => resolve(html))
                .catch((err) => {

                    console.log(chalk.underline.red('processImages hit error'))
                    console.log(chalk.red(err))

                    reject(err)

                })

        })

    }


    /**
     * run the Promises in a synchronous order
     * allows us to ensure we have completed processing of an inline image
     * before the next ones Promise is called (via then chaining)
     * @param {object} html
     * @param {array} inlineImages
     * @returns {Promise}
     *
     */
    updateHTML (html, inlineImages) {

        return inlineImages.reduce((promise, imageNode) => {

            return promise
                .then((html) => {

                    return this.processImage(html)

                })
                .catch(err => console.log(err))

        }, Promise.resolve(html))

    }


    /**
     * get the first inline image and replace it with its inline SVG
     * @returns {Promise}
     *
     */
    processImage (html) {

        return new Promise((resolve, reject) => {


            // rebuild the document fragment each time with the updated html

            const documentFragment = parse5.parseFragment(html, {
                locationInfo: true,
            })

            const inlineImage = this.getFirstInlineImage(documentFragment)

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
    getInlineImages (documentFragment, inlineImages) {

        if (!inlineImages) inlineImages = []

        if (documentFragment.childNodes && documentFragment.childNodes.length) {

            documentFragment.childNodes.forEach((childNode) => {

                if (this.isNodeValidInlineImage(childNode)) {

                    inlineImages.push(childNode)

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
     * @returns {null|Object} - null if no inline image - parse5 documentFragment if there is
     *
     */
    getFirstInlineImage (documentFragment) {

        const inlineImages = this.getInlineImages(documentFragment)

        if (!inlineImages.length) return null

        return inlineImages[0]

    }


    /**
     * check if a node is a valid inline image
     * @param {Object} node - parse5 documentFragment
     * @returns {boolean}
     *
     */
    isNodeValidInlineImage (node) {

        return !!(
            node.nodeName === 'img' &&
            _.filter(node.attrs, { name: 'inline' }).length &&
            this.getImagesSrc(node))


    }


    /**
     * get an inlined images src
     * @param {Object} inlineImage - parse5 document
     * @returns {string}
     *
     */
    getImagesSrc (inlineImage) {

        const svgSrcObject = _.find(inlineImage.attrs, { name: 'src' })


        // image does not have a src attribute

        if (!svgSrcObject) return ''


        // grab the image src

        const svgSrc = svgSrcObject.value


        // image src attribute must not be blank and it must be referencing a file with a .svg extension

        return svgSrc && svgSrc.indexOf('.svg') !== -1 ? svgSrc : ''

    }


    /**
     * append the inlineImages SVG data to the output HTML and remove the original img
     * @param {string} html
     * @param {Object} inlineImage - parse5 document
     * @returns {Promise}
     *
     */
    processOutputHtml (html, inlineImage) {

        return new Promise((resolve, reject) => {

            const svgSrc = this.getImagesSrc(inlineImage)


            // if the image isn't valid resolve

            if (!svgSrc) return resolve(html)


            // read in the svg

            fs.readFile(path.resolve(this.outputPath, svgSrc), 'utf8', (err, data) => {

                if (err) reject(err)

                const configObj = Object.assign(svgoDefaultConfig, this.userConfig)

                const config = {}


                // pass all objects to the config.plugins array

                config.plugins = _.map(configObj, (value, key) => ({ [key]: value }));


                // create a new instance of SVGO
                // passing it the merged config, to optimize the svg

                const svgo = new SVGO(config)

                svgo.optimize(data)
                    .then((result) => {

                        const optimisedSVG = result.data

                        html = this.replaceImageWithSVG(html, inlineImage, optimisedSVG)

                        resolve(html)

                    })
                    .catch((err) => console.log(chalk.red(err.message)))

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
    replaceImageWithSVG (html, inlineImage, svg) {

        const start = inlineImage.__location.startOffset

        const end = inlineImage.__location.endOffset


        // remove the img tag and add the svg content

        return html.substring(0, start) + svg + html.substring(end)

    }

}

module.exports = HtmlWebpackInlineSVGPlugin
