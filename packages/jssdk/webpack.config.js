const webpack            = require('webpack');
const path               = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin     = require('uglifyjs-webpack-plugin');
const publicPath         = '/';
const jsName             = process.env.NODE_ENV !== 'production' ? 'tp-sdk.js' : 'tp-sdk.min.js';
const CompressionPlugin = require("compression-webpack-plugin");

var plugins = [
    new webpack.DefinePlugin({
        'process.env': {
            BROWSER:  JSON.stringify(true),
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
        }
    }),
    new CleanWebpackPlugin([ 'build/' ], {
        root: __dirname,
        verbose: true,
        dry: false
    }),
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(new UglifyJsPlugin({
        uglifyOptions: {
            ecma: 7,
            mangle: {keep_fnames: true, keep_classnames: true, safari10: true},
        }
    }));
    plugins.push(
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$/,
            threshold: 10240,
            minRatio: 0.8
        })
    );
    plugins.push(
        new webpack.optimize.AggressiveMergingPlugin()
    );
}

module.exports = {
    entry: ['idempotent-babel-polyfill', './main.js'],
    resolve: {
        modules: ['node_modules', path.join(__dirname, 'src')],
        extensions: ['.js']
    },
    plugins,
    output: {
        path: `${__dirname}/build/`,
        library: 'tpSdk',
        libraryTarget:'window',
        filename: jsName,
        publicPath
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', query: {plugins: ['transform-class-properties', 'transform-object-rest-spread'], presets: ['env']}, exclude: [/node_modules/, /public/] },
        ]
    },
    devtool: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'electron'? 'source-map' : false
};
