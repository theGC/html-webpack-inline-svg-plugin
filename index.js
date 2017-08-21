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

let userConfig = {};

function HtmlWebpackInlineSVGPlugin (options) {

    assert.equal(options, undefined, 'The HtmlWebpackInlineSVGPlugin does not accept any options')

}

HtmlWebpackInlineSVGPlugin.prototype.apply = function (compiler) {

    // Hook into the html-webpack-plugin processing
    compiler.plugin('compilation', (compilation) => {

        compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {

            // build the custom config
            const configObj = Object.assign(svgoDefaultConfig,
                _.isObjectLike(htmlPluginData.plugin.options.svgoConfig) ?
                    htmlPluginData.plugin.options.svgoConfig :
                    {});

            // pass all objects to the config.plugins array
            userConfig.plugins = _.map(configObj, (value, key) => ({ [key]: value }));

            this.parseHtml(htmlPluginData.html)
                .then(documentFragment => this.getTagsToReplace(documentFragment, {
                    img: {
                        inline: true,
                        src: /\.svg$/
                    }
                }))
                .then(matchingNodes => this.getAssetsToInline(matchingNodes)
                    .then(assets => this.decorateAssetsWithCoordinates(assets, matchingNodes))
                )
                .then(replacementCoordinates => this.replaceHtml(htmlPluginData.html, replacementCoordinates))
                .then(html => {
                    htmlPluginData.html = html || htmlPluginData.html;
                    callback(null, htmlPluginData);
                })
                // TODO - bubble up errors appropriately instead of swallowing
                .catch(err => {
                    callback(null, htmlPluginData)
                });

        })

    })

}


/**
 * get a Document object from an html string
 * @param {string} htmlString
 * @returns {Promise<AST.Default.Document>}
 */
HtmlWebpackInlineSVGPlugin.prototype.parseHtml = function (htmlString) {
    const document = parse5.parseFragment(htmlString, {
        locationInfo: true
    });

    return Promise.resolve(document);
}

/**
 * iterate over a DocumentFragment and return only
 * the nodes which match the supplied descriptor
 * @param {AST.Default.Document} document
 * @param {object} descriptor
 * @returns {Promise<Array<AST.Default.Element>>}
 */
HtmlWebpackInlineSVGPlugin.prototype.getTagsToReplace = function (document, descriptor) {
    /** the syntax for the descriptor is:
     *  {
     *    <tag>: {
     *        <attribute>: <value boolean|RegExp>
     *    }
     *  }
     */

    const desiredTags = _.uniq(_.keys(descriptor));
    let result = [];

    let inspectChildrenForMatches = documentNode => {
        if (documentNode && documentNode.childNodes && documentNode.childNodes.length) {
            _.forEach(documentNode.childNodes, node => {
                // for each child node, check if it matches our predicate and
                // add it to result if it does
                if (_.includes(desiredTags, node.nodeName)) {
                    let filter = descriptor[node.nodeName];
                    if (_.isObjectLike(filter) && _.every(filter, (predicate, predicateKey) => {
                        return _.some(node.attrs, attr => {
                            if (_.isRegExp(predicate)) {
                                return attr.name === predicateKey && predicate.test(attr.value);
                            } else if (_.isBoolean(predicate)) {
                                return attr.name === predicateKey;
                            } else {
                                return false;
                            }
                        })
                    })) {
                        // we found a node whose attributes match one of our predicates!
                        result.push(node);
                    }
                }

                // recurse over any of the child's own children
                if (node.childNodes && node.childNodes.length) {
                    inspectChildrenForMatches(node);
                }
            });
        }
    };

    inspectChildrenForMatches(document);

    return Promise.resolve(result);
}

/**
 * assemble an array containing key-value-pairs
 * of svg paths with the optimized svg content
 * @param {Array<AST.Default.Element>} matchingNodes
 * @returns {Array<object>}
 */
HtmlWebpackInlineSVGPlugin.prototype.getAssetsToInline = function (matchingNodes) {

    /** construct a promise fulfilled by the following
     *  Array<{
     *      <key>: <svgPath>,
     *      <value>: <optimizedSvg>
     *  }>
     **/
    return Promise.all(_.map(matchingNodes, node => {
        let sourcePath = _.find(node.attrs, { name: 'src' }).value;

        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(sourcePath), 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
    
                const svgo = new SVGO(userConfig);
    
                svgo.optimize(data, result => {
                    if (result.error) {
                        return reject(result.error);
                    }
    
                    return resolve({
                        key: sourcePath,
                        value: result.data
                    });
                });
            });
        });
    }));
}


/**
 * conflate array of key-value-pairs of svg paths and content
 * with the array of elements containing inline svg references
 * @param {Array<object>} assets
 * @param {Array<AST.Default.Element>} matchingNodes
 * @returns {Array<object>}
 */
HtmlWebpackInlineSVGPlugin.prototype.decorateAssetsWithCoordinates = function (assets, matchingNodes) {
    
    /** the output of this function is an array of "replacement coordinates"
     *  coordinates take the form of:
     *  {
     *    start: <number>,
     *    end: <number>,
     *    content: <string>
     *  }
     **/
    let coordinates = _.map(matchingNodes, node => {
        let asset = _.find(node.attrs, { name: 'src' }).value;
        let assetContent = _.find(assets, { key: asset });

        return {
            start: node.__location.startOffset,
            end: node.__location.endOffset,
            content: assetContent.value
        }
    });

    // if for some reason we didn't have content for the asset, remove it from coordinates
    return Promise.resolve(_.filter(coordinates, coordinate => coordinate.content !== undefined));
}

/**
 * @param {string} html
 * @param {Array<object>} coordinates
 * @returns {string}
 */
HtmlWebpackInlineSVGPlugin.prototype.replaceHtml = function (html, coordinates) {
    
    let firstReplacementIndex = coordinates[0].start;
    let lastReplacementIndex = coordinates[coordinates.length - 1].end;

    let prefix = html.substring(0, firstReplacementIndex);
    let suffix = html.substring(lastReplacementIndex + 1);

    let newBody = _.map(coordinates, (coordinate, index, collection) => {
        let segment = coordinate.content;

        if (index < collection.length - 1) {
            segment += html.substring(coordinate.end, collection[index + 1].start);
        }

        return segment;
    }).join('');

    return Promise.resolve(prefix + newBody + suffix);
}

module.exports = HtmlWebpackInlineSVGPlugin
