html-webpack-inline-svg-plugin
=

[![npm version](https://badge.fury.io/js/html-webpack-inline-svg-plugin.svg)](https://badge.fury.io/js/html-webpack-inline-svg-plugin) [![Build status](https://travis-ci.org/theGC/html-webpack-inline-svg-plugin.svg)](https://travis-ci.org/theGC/html-webpack-inline-svg-plugin)

Converts SVG files referenced by `<img>` elements into inlined `<svg>` elements within the output HTML of templates parsed by [`html-webpack-plugin`](https://github.com/jantimon/html-webpack-plugin).

## Table of Contents

1. [Overview](#overview)
1. [Installation](#installation)
1. [Usage](#usage)
   1. [Paths to SVG files](#paths-to-svg-files)
      1. [Relative to OUTPUT](#relative-to-output)
      1. [Relative to ROOT](#relative-to-root)
      1. [Relative to SOURCE](#relative-to-source)
   1. [Incorrect paths or URLs](#incorrect-paths-or-urls)
   1. [Duplicated attributes](#duplicated-attributes)
   1. [`webpack-dev-server`](#webpack-dev-server)
1. [Configuration](#configuration)
   1. [`runPreEmit`](#runPreEmit)
   1. [`inlineAll`](#inlineAll)
   1. [`allowFromUrl`](#allowFromUrl)
   1. [`svgoConfig`](#svgoConfig)
1. [Versions](#versions)
1. [Contributors](#contributors)

## Overview

When SVGs files are inlined into HTML the embedded SVGs can be customised with CSS and the [`fill`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill) rule, and they can also be combined in sprites. Check the css-tricks.com article [Icon System with SVG Sprites](https://css-tricks.com/svg-sprites-use-better-icon-fonts/) for an extended explanation.

`html-webpack-inline-svg-plugin` implements the below features:

* **Optimises and minimizes** the inlined SVG with [SVGO](https://github.com/svg/svgo).
* Supports **webpack aliases** for file paths (only when loaders are used).
* Supports the [**`webpack-dev-server`**](https://github.com/webpack/webpack-dev-server).
* Can load image files locally and **from an online URL** with the [`allowFromUrl`](#allowFromUrl) config option.
* Allows for **deep nested SVGs**.
* **Ignores broken tags** (in case you are outputting templates for various parts of the page).
* **Performs no-HTML decoding** (supports language tags, i.e. `<?php echo 'foo bar'; ?>`).

## Installation

Add and install the `html-webpack-inline-svg-plugin` dependency to `package.json` with npm:

```bash
npm i -D html-webpack-inline-svg-plugin
```

or with [Yarn](https://yarnpkg.com):

```bash
yarn add -D html-webpack-inline-svg-plugin
```

## Usage

Given the below reference folder structure:

```
my-project
├─ package.json
├─ webpack.config.js
├─ node_modules
├─ src
│  ├─ entry.html
│  └─ imagesSource
│     ├─ icon1.svg
│     └─ image1.png
├─ assets
│  └─ bar.svg
└─ output
   ├─ index.html
   └─ imagesOutput
      ├─ icon2.svg
      └─ image2.png
```

On your webpack config file add:

```js
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');

// ...

plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackInlineSVGPlugin(
    { /* ... */ } // ...Object with config options, if any. Pass nothing otherwise (not even empty object)
  )
]
```

Then, add `<img>` elements with the `inline` attribute to the templates that `html-webpack-plugin` will be processing. Check [Paths to SVG files](#paths-to-svg-files) to know what is the correct path to SVG files in `<img>` elements.

```html
<!-- ✅ Inlined: SVG file relative to OUTPUT -->
<img inline src="imagesOutput/icon2.svg">

<!-- ✅ Inlined: SVG file relative to SOURCE. webpack alias used. Loaders are required -->
<img inline src="~a/bar.svg">

<!-- ✅ Inlined: online URL. 'allowFromUrl' config option must be set to true -->
<img inline src="https://someserver.com/images/icon.svg">

<!-- ⭕ Ignored: the <img> element does not have the 'inline' attribute -->
<img src="imagesOutput/icon2.svg">

<!-- ✅ Inlined: the 'inlineAll' config option has been set to true -->
<img src="imagesOutput/icon2.svg">

<!-- ⭕ Ignored: it is not a SVG image -->
<img inline src="imagesOutput/image2.png">
```

### Paths to SVG files

There are three ways of referencing SVG files from `<img>` elements in your templates:

#### Relative to OUTPUT

If **loaders for the entry template are not used** SVG file paths must be relative to the HTML template that is referencing the SVG files within the webpack [**output**](https://webpack.js.org/configuration/output/#outputpath) folder:

```html
<!-- src/entry.html -->

<img inline src="imagesOutput/icon2.svg">
<img inline src="../src/imagesSource/icon1.svg">
<img inline src="../assets/bar.svg">
<img inline src="~a/bar.svg"> <!-- Will give an error because aliases are not supported without loaders -->
```
You have to make sure SVG files have been moved to the output directory by some mean.

In this way SVG files are inlined after all template and image files have been written to the [output directory](https://webpack.js.org/configuration/output/#outputpath), that is it, on `html-webpack-plugin`'s [`afterEmit`](https://github.com/jantimon/html-webpack-plugin#afteremit-hook) event.

#### Relative to ROOT

If **loaders for the entry template are still not used**, the **[`runPreEmit`](#runPreEmit) config option** can be used. Then, SVG file paths must be relative to the **project root** (where `package.json` is):

```html
<!-- src/entry.html -->

<img inline src="src/imagesSource/icon1.svg">
<img inline src="output/imagesOutput/icon2.svg">
<img inline src="assets/bar.svg">
<img inline src="~a/bar.svg"> <!-- Will give an error because aliases are not supported without loaders -->
```

In this way the plugin run prior to the output of templates, that is it, on `html-webpack-plugin`'s [`beforeEmit`](https://github.com/jantimon/html-webpack-plugin#beforeemit-hook) event. This allows to reference image files from the project root which can help with getting to certain files, like for example within the `node_modules` directory.

#### Relative to SOURCE

If **loaders are used** SVG file paths in `<img>` elements must be relative to the **source entry** template (the [`template` config option](https://github.com/jantimon/html-webpack-plugin#options) in `html-webpack-plugin`).

The usual loader's combo is the [`html-loader`](https://github.com/webpack-contrib/html-loader) with the [`file-loader`](https://github.com/webpack-contrib/file-loader) (`html-webpack-inline-svg-plugin` does not support yet webpack v5 [asset modules](https://webpack.js.org/guides/asset-modules)). By default `html-webpack-plugin` uses an [`ejs` loader](https://github.com/jantimon/html-webpack-plugin/blob/main/docs/template-option.md) if no loader is provided for the entry template. This default loader does not handle file imports. That is why we need the `html-loader` to parse the entry HTML template, loader that will fire an import event every time it parses a JavaScript, CSS or image import. Then, the `file-loader` will handle SVG image imports, webpack aliases, and finally copy the SVG files to the `output` folder.

Although SVG file paths are relative to the source template the files still need to be copied/emitted to the output folder (which will be done automatically by the `file-loader`):

```js
// webpack.config.js

const path = require('path')

resolve: {
  alias: {
  'a': path.join(__dirname, 'assets')
  }
},
module: {
  rules: [
    {
      test: /\.svg$/,
      loader: 'file-loader',
      options: {
        name: 'itCanBeWhatever/[name].[ext]' // It does not have to follow same path or file name than files in 'src'
      },
    },
    {
      test: /\.html$/,
      loader: 'html-loader'
    }
  ]
},
```
```html
<!-- src/entry.html -->

<img inline src="imagesSource/icon1.svg">
<img inline src="../output/imagesOutput/icon2.svg">
<img inline src="../assets/bar.svg">
<img inline src="~a/bar.svg">
```

### Incorrect paths or URLs

If for any reason the path to a local SVG file is incorrect, or the file fails to be read, or an image retrieved with an URL fails to download, the webpack build process will fail with an `ENOENT` error.

### Duplicated attributes

All the attributes of a `<img/>` element excepting `src` and `inline` will be copied to the inlined `<svg/>` element. Attributes like `id` or `class` will be copied to the resulting root of the `<svg/>` element and if the original SVG file already had these attributes they will be duplicated (and not replaced) on the resulting `<svg/>` element, though the attributes coming from the `<img/>` will appear first and [any subsequent duplicated attribute from the original SVG will be ignored by the browser](https://stackoverflow.com/questions/26341507/can-an-html-element-have-the-same-attribute-twice).

For example:

```html
<!-- src/entry.html -->
<img inline src="imagesSource/icon1.svg" id="myImageIMG" class="square">
```
```html
<!-- src/imagesSource/icon1.svg -->
<svg id="myImageSVG">...</svg>
```

will result in:

```html
<!-- output/index.html -->
<svg id="myImageIMG" class="square" id="myImageSVG">...</svg>
```

The broswer will use `id="myImageIMG"` and not `id="myImageSVG"`. It's however a better approach if you avoid having any duplicated attribute at all and only putting the required ones on the `<img>` element.

### `webpack-dev-server`

[Paths relative to SOURCE](#relative-to-source) is the simpler method for [`webpack-dev-server`](https://github.com/webpack/webpack-dev-server) to work with `html-webpack-inline-svg-plugin` because source files, files that are not in the output folder, are the ones referenced. Still, the `file-loader`'s [`emitFile`](https://v4.webpack.js.org/loaders/file-loader/#emitfile) option cannot ever be `false`.

[Paths relative to OUTPUT](#relative-to-output) or [Paths relative to ROOT](#relative-to-root) can also be used for `webpack-dev-server` as long as they point to SVG files that already exist without the need of a webpack run, that is it, files that are outside the output folder. However using long relative paths without aliases to point to such files could be a bit tedious.



Check [this issue](https://github.com/theGC/html-webpack-inline-svg-plugin/issues/19) in case you do not get the `webpack-dev-server` working.


## Configuration

The plugin accepts the below options:

### `runPreEmit`

Defaults to `false`.

If **loaders** are not used to resolve file locations, and you would prefer to reference SVG file paths relative to the project **root** (where `package.json` is) then set `runPreEmit` config option to `true`:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackInlineSVGPlugin({
    runPreEmit: true,
  })
]
```

The plugin will now run prior to `html-webpack-plugin` saving templates to the output directory. Therefore, inlining SVG files would look like:

```html
<!-- src/entry.html -->

<img inline src="src/imagesSource/icon1.svg">
```

### `inlineAll`

Defaults to `false`.

It will inline all SVG images on the template without the need of the `inline` attribute on every image:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackInlineSVGPlugin({
    inlineAll: true
  })
]
```

If `inlineAll` option is enabled you can use the `inline-exclude` attribute to exclude a particular image from being inlined:

```html
<!-- src/entry.html -->

<div>
  <img src="src/images/icon1.svg"> <!-- it will be inlined -->
  <img inline-exclude src="src/images/icon2.svg"> <!-- it won't be inlined -->
</div>
```

### `allowFromUrl`

Defaults to `false`.

It allows to use SVG images coming from an URL in addition to local files:

```js
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackInlineSVGPlugin({
    allowFromUrl: true
  })
]
```

For example:

```html
<!-- src/entry.html -->

<div>
  <img inline src="https://badge.fury.io/js/html-webpack-inline-svg-plugin.svg"> <!-- it will be inlined from the online SVG -->
</div>
```

### `svgoConfig`

Defaults to `[]`.

[SVGO](https://github.com/svg/svgo) is used to optimise the SVGs inlined. You can configure SVGO by setting this `svgoConfig` array with the [SVGO plugins](https://github.com/svg/svgo#what-it-can-do) you need in the same way it's done in this [SVGO official Node.js example](https://github.com/svg/svgo/blob/master/examples/test.js).

Note `svgoConfig` is an array of `Object`s that will be assigned to the `.plugins` SVGO config variable by `html-webpack-inline-svg-plugin`. You don't need to pass an `Object` with a `plugins` property assigned an array of SVGO plugins, just pass the array:

```js
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

The latest version of this package supports webpack 4. All versions marked v2.x.x will target webpack 4 and `html-webpack-plugin` v4.

For webpack 3 and `html-webpack-plugin` v3 support use v1.3.0 of this package.

### v2.x.x
- Support webpack v4.
- Support `html-webpack-plugin` v4.

### v1.3.0
- Support webpack v3.
- Support `html-webpack-plugin` v3.


## Contributors

You're free to contribute to this project by submitting issues and/or pull requests. This project is test-driven, so keep in mind that every change and new feature must be covered by tests.

I'm happy for someone to take over the project as I don't find myself using it any longer due to changes in workflow. Therefore others are likely to be in a better position to support this project and roll out the right enhancements.

<a href="https://github.com/theGC/html-webpack-inline-svg-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=theGC/html-webpack-inline-svg-plugin" />
</a>
