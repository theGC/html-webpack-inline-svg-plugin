
Inline SVG extension for the HTML Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/html-webpack-inline-svg-plugin.svg)](https://badge.fury.io/js/html-webpack-inline-svg-plugin) [![Build status](https://travis-ci.org/theGC/html-webpack-inline-svg-plugin.svg)](https://travis-ci.org/theGC/html-webpack-inline-svg-plugin)

Convert .svg files into inline SVG tags within the output html of templates parsed by [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin).

By inlining SVGs you can combine them with techniques such as: [Icon System with SVG Sprites](https://css-tricks.com/svg-sprites-use-better-icon-fonts/).

As of version 1.0.0 this plugin processes SVG files after all template and image files have been written to their corresponding output directory. This allows it to work alongside loaders, after webpack resolves all file locations.

> Please note: to use aliases or relative paths you will need to install loaders to resolve your svg paths and parse the templates html. More info is provided below in: [Getting to your SVGs](#getting-to-your-svgs)

The plugin relies on [svgo](https://github.com/svg/svgo) to optimise SVGs. You can configure it's settings, check [config](#config) for more details.

## Installation

Install the plugin with npm:
```shell
$ npm install --save-dev html-webpack-inline-svg-plugin
```

**or** [yarn](https://yarnpkg.com/):
```shell
$ yarn add html-webpack-inline-svg-plugin --dev
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

Add `img` tags with `inline` attribute and `.svg` file as src to your template/s that the html-webpack-plugin is processing (the default is `index.html`).

```html
<!-- Works: below img tag will be removed and replaced by the content of the svg in its src -->
<img inline src="images/icons.svg">

<!-- Ignored: this img will not be touched as it has no inline attribute -->
<img src="images/foo.svg">

<!-- Broken: the plugin will ignore this src as it is not an svg -->
<img inline src="images/i-will-be-ignored.png">
```

## Getting to your SVGs

> Breaking change: As of version 1.0.0 the plugin waits for webpack to resolve image locations and write them to disk. If you were using a version prior to 1.0.0 then it is likely you'll need to update the src paths to your inline SVGs to reflect this change. See below for more info.

There are two ways of working with your `<img>` **src** attributes and this plugin.

1.  **If you are not working with loaders** to allow webpack to parse and resolve the `img` tags `src` attributes within your *html-webpack-plugin* templates. Use paths that are relative to your **svg** images from the **output** location of the template that is referencing it.
2. **Alternatively use loaders** such as [html-loader](https://github.com/webpack-contrib/html-loader) to parse the html templates, and [file-loader](https://github.com/webpack-contrib/file-loader) or something similar, to resolve the paths of your `img` tags `src` attributes. As the plugin works after webpack has emitted all its assets and the *html-webpack-plugin* has output your templates, it will read the SVGs that webpack places in your output directory, and replace any inline SVGs with this content.

```
my-project
-- package.json
-- webpack-config.js
-- <node_modules>
-- <src>
---- index.html
---- <images>
------ icons.svg
------ foo.svg
```

With the above structure inlining icons.svg would look like: `<img inline src="images/icons.svg">`

If an alias was in place for the images directory, i.e.
```'img': path.join(__dirname, 'src', 'images')```
Then the svg can be inlined with: `<img inline src="~img/icons.svg">`. This method would require the use of **loaders** on your templates as shown above in point 2.

## Config

To configure SVGO (module used to optimise your SVGs), add an `svgoConfig` object to your `html-webpack-plugin` config:

```javascript
plugins: [
    new HtmlWebpackPlugin({
        svgoConfig: {
            removeTitle: false,
            removeViewBox: true,
        },
    }),
    new HtmlWebpackInlineSVGPlugin()
]
```

For a full list of the SVGO config (default) params we are using check out: [svgo-config.js](svgo-config.js). The config you set is merged with our defaults, it does not replace it.

## Features

* Optimises / minimizes the output SVG
* Allows for deep nested SVGs
* Supports webpack aliases for file locations
* Ignores broken tags - incase you are outputting templates for various parts of the page
* Performs no html decoding so supports language tags, i.e. `<?php echo 'foo bar'; ?>`

## Known Issues

* none currently

## Contribution

You're free to contribute to this project by submitting issues and/or pull requests. This project is test-driven, so keep in mind that every change and new feature should be covered by tests.

## License

This project is licensed under [MIT](https://github.com/theGC/html-webpack-inline-svg-plugin/blob/master/LICENSE).