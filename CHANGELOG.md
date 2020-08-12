## v2.3.0

* BREAKING CHANGE: On the webpack configuration file the `svgoConfig` option must now go inside `HtmlWebpackInlineSVGPlugin({})` instead of `HtmlWebpackPlugin({})`. An error is thrown at webpack build time otherwise.
* The defaults for the `svgo` module aren't hardcoded anymore and –excepting the `cleanupIDs` option– the defaults are now set by the own module `svgo` and not `html-webpack-inline-svg-plugin`.

## v2.2.0

* Ability added to load SVGs from an URL (`<img inline src="https://host.com/image.svg">`).

## v2.0.1

* added `inlineAll` option to inline all svgs the parser finds

## v2.0.0

* support webpack 4
* support html-webpack-plugin v4
* remove broken html tests as not supported by html-webpack-plugin
* upgrade parse5 to v5
