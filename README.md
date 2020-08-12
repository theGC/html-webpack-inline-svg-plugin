html-webpack-inline-svg-plugin
========================================
[![npm version](https://badge.fury.io/js/html-webpack-inline-svg-plugin.svg)](https://badge.fury.io/js/html-webpack-inline-svg-plugin) [![Build status](https://travis-ci.org/theGC/html-webpack-inline-svg-plugin.svg)](https://travis-ci.org/theGC/html-webpack-inline-svg-plugin)

Converts .svg files into inlined `<svg>` tags within the output html of templates parsed by [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin).


## Table of Contents

1. [Overview](#overview)
1. [Features](#features)
1. [Installation](#installation)
1. [Usage](#usage)
   1. [Getting To Your SVGs](#getting-to-your-svgs)
   1. [Sample Project Structure](#sample-project-structure)
   1. [Default Config](#default-config)
   1. [Incorrect File Paths Or URLs](#incorrect-file-paths-or-urls)
   1. [Duplicated Attributes](#duplicated-attributes)
1. [Config](#config)
1. [Versions](#versions)
1. [Contribution](#contribution)
1. [License](#license)


## Overview

By inlining SVGs you can combine them with techniques such as: [Icon System with SVG Sprites](https://css-tricks.com/svg-sprites-use-better-icon-fonts/).

As of version 1.0.0 **by default** this plugin processes SVG files after all template and image files have been written to their corresponding output directory. This allows it to work alongside loaders, after webpack resolves all file locations.

> Please note: to use **aliases** you will need to install loaders to resolve your svg paths and parse the templates html. Check [Getting To Your SVGs](#getting-to-your-svgs) section for more info.

**As of version 1.1.0** the plugin can also be run prior to the output of your templates. This allows you to reference image files from the root of your project which can help with getting to certain files, i.e. within your `node_modules` directory. More info is provided below: [Setting `runPreEmit` option](#setting-runpreemit-option).

The plugin relies on [SVGO](https://github.com/svg/svgo) to optimise SVGs. Check [Config](#config) for more details.


## Features

* Optimises/minimizes the output SVG.
* Allows for deep nested SVGs.
* Supports webpack aliases for file locations.
* Ignores broken tags (in case you are outputting templates for various parts of the page).
* Performs no html decoding (supports language tags, i.e. `<?php echo 'foo bar'; ?>`).
* Can load image files locally and from an online URL with the `allowFromUrl` option.


## Installation

Install the plugin with npm:

```shell
$ npm install --save-dev html-webpack-inline-svg-plugin
```

or [Yarn](https://yarnpkg.com/):

```shell
$ yarn add --dev html-webpack-inline-svg-plugin
```

## Usage

Require the plugin in your webpack config:

```javascript
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');
```

Add the plugin to your webpack config as follows:

```javascript
plugins: [
    new HtmlWebpackPlugin(),
    new HtmlWebpackInlineSVGPlugin()
]
```

Add `img` tags with `inline` attribute and `.svg` file as `src` to your template/s that the html-webpack-plugin is processing (the default is `index.html`).

```html
<!-- Works: below img tag will be removed and replaced by the content of the svg in its src -->
<img inline src="images/icons.svg">

<!-- Ignored: this img will not be touched as it has no inline attribute -->
<img src="images/foo.svg">

<!-- Broken: the plugin will ignore this src as it is not an svg -->
<img inline src="images/i-will-be-ignored.png">
```

### Getting To Your SVGs

> Breaking change: As of version 1.0.0 the plugin waits for webpack to resolve image locations and write them to disk. If you were using a version prior to 1.0.0 then it is likely you'll need to update the src paths to your inline SVGs to reflect this change. See below for more info.

There are three ways of working with your `<img>` **src** attributes and this plugin:

1. If you are **not working with loaders** to allow webpack to parse and resolve the `img` tags `src` attributes within your *html-webpack-plugin* templates. Use paths that are relative to your **svg** images from the **output** location of the template that is referencing it.

1. **Alternatively use loaders** such as [html-loader](https://github.com/webpack-contrib/html-loader) to parse the html templates, and [file-loader](https://github.com/webpack-contrib/file-loader) or something similar, to resolve the paths of your `img` tags `src` attributes. As the plugin works after webpack has emitted all its assets and *html-webpack-plugin* has output your templates, it will read the SVGs that webpack places in your output directory, and replace any **inlined img tags** with this content.

1. **Set the `runPreEmit` flag** and reference files relative to your `package.json` file. This feature is only available with version >= 1.1.0. Check [Config](#config) and the `runPreEmit` option for more info.


### Sample Project Structure

```
my-project
├── package.json
├── webpack-config.js
├── node_modules
└── src
    ├── index.html
    └── images
        ├── icons.svg
        └── foo.svg
```

### Default Config

With the above structure inlining `icons.svg` would look like:

```html
<img inline src="images/icons.svg">
```

If an alias was in place for the images directory, i.e.

```javascript
'img': path.join(__dirname, 'src', 'images')
```

Then the svg can be inlined with: `<img inline src="~img/icons.svg">`. This method would require the use of **loaders** on your templates as shown above in point 2.

### Incorrect file paths or URLs

If for any reason the path to a local SVG file is incorrect, or the file fails to be read, or an image retrieved with an URL fails to download, the webpack build process will fail with an error, like `ENOENT`.

### Duplicated attributes

All the attributes of a `<img/>` element excepting `src` and `inline` will be copied to the inlined `<svg/>` element. Attributes like `id` or `class` will be copied to the resulting root of the `<svg/>` element and if the original SVG file already had these attributes they will be duplicated (and not replaced) on the resulting `<svg/>` element, though the attributes coming from the `<img/>` will appear first and [any subsequent duplicated attribute from the original SVG will be ignored by the browser](https://stackoverflow.com/questions/26341507/can-an-html-element-have-the-same-attribute-twice).

For example:

```html
<img inline src="images/icons.svg" id="myImageIMG" class="square"> <!-- img element to be replaced  -->

<svg id="myImageSVG">...</svg> <!-- icons.svg file to be inlined  -->
```

will result in:

```html
<svg id="myImageIMG" class="square" id="myImageSVG">...</svg>
```

The broswer will use `id="myImageIMG"` and not `id="myImageSVG"`. It's however a better approach if you avoid having any duplicated attribute at all and only putting the required ones on the `<img>` element.


## Config

The plugin accepts the below options:

- `runPreEmit`: defaults to `false`. If you aren't using **loaders** to resolve file locations, and would prefer to reference image paths relative to the **root** of your project (where your `package.json` file resides) then set the plugins `runPreEmit` config option to `true`:

   ```javascript
   plugins: [
       new HtmlWebpackPlugin(),
       new HtmlWebpackInlineSVGPlugin({
           runPreEmit: true,
       })
   ]
   ```

   The plugin will now run prior to **html-webpack-plugin** saving your templates to your output directory. It will also expect all `<img inline` **src** attributes to be relative to your `package.json` file.

   Therefore with the above project structure, and `runPreEmit` set to `true`, inlining icons.svg would look like:

   ```html
   <img inline src="src/images/icons.svg">
   ```

- `inlineAll`: defaults to `false`. It will inline all SVG images on the template without the need of the `inline` attribute on every image:

   ```javascript
   plugins: [
       new HtmlWebpackPlugin(),
       new HtmlWebpackInlineSVGPlugin({
           inlineAll: true
       })
   ]
   ```

   If `inlineAll` option is enabled you can use the `inline-exclude` attribute to exclude a particular image from being inlined:

   ```html
   <div>
       <img src="src/images/icon1.svg"> <!-- it will be inlined -->
       <img inline-exclude src="src/images/icon2.svg"> <!-- it won't be inlined -->
   </div>
   ```

- `allowFromUrl`: defaults to `false`. It allows to use SVG images coming from an URL online in addition to local files:

   ```javascript
   plugins: [
       new HtmlWebpackPlugin(),
       new HtmlWebpackInlineSVGPlugin({
           allowFromUrl: true
       })
   ]
   ```
   
   For example:
   
    ```html
   <div>
       <img inline src="https://badge.fury.io/js/html-webpack-inline-svg-plugin.svg"> <!-- it will be inlined from the online SVG -->
   </div>
   ```

- `svgoConfig`: defaults to `[]`. [SVGO](https://github.com/svg/svgo) is used to optimise the SVGs inlined. You can configure SVGO by setting this `svgoConfig` array with the [SVGO plugins](https://github.com/svg/svgo#what-it-can-do) you need in the same way it's done in this [SVGO official Node.js example](https://github.com/svg/svgo/blob/master/examples/test.js).

   Note `svgoConfig` is an array of `Object`s that will be assigned to the `.plugins` SVGO config variable by `html-webpack-inline-svg-plugin`. You don't need to pass an `Object` with a `plugins` property assigned an array of SVGO plugins, just pass the array:

   ```javascript
   plugins: [
       new HtmlWebpackPlugin(),
       new HtmlWebpackInlineSVGPlugin({
           svgoConfig: [
               {
                   removeViewBox: false
               },
               {
                   inlineStyles: {
                       onlyMatchedOnce: false
                   }
               }
           ]
       })
   ]
   ```

   `html-webpack-inline-svg-plugin` modifies one SVGO default: `cleanupIDs`, from `true` to `false`, since IDs allow to reference individual symbols. You can still override this or any other SVGO plugin default configuration with this `svgoConfig` option.


## Versions

The latest version of this package supports webpack 4. All versions marked v2.x.x will target webpack 4 and html-webpack-plugin v4.

For webpack 3 and html-webpack-plugin v3 support use v1.3.0 of this package.

### v2.x.x
- Support webpack v4.
- Support html-webpack-plugin v4.

### v1.3.0
- Support webpack v3.
- Support html-webpack-plugin v3.


## Contribution

You're free to contribute to this project by submitting issues and/or pull requests. This project is test-driven, so keep in mind that every change and new feature must be covered by tests.

I'm happy for someone to take over the project as I don't find myself using it any longer due to changes in workflow. Therefore others are likely to be in a better position to support this project and roll out the right enhancements.


## License

This project is licensed under [MIT](https://github.com/theGC/html-webpack-inline-svg-plugin/blob/master/LICENSE).
