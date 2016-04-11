const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const PATHS = {
  entries: {
      main: path.join(__dirname, 'static/js/source/main.js'),
      room: path.join(__dirname, 'static/js/source/room.js')
  },
  build: path.join(__dirname, 'static/build')
};

module.exports = {
    entry: PATHS.entries,
    // devtool: "source-map",
    output: {
        path: PATHS.build,
        filename: '[name].min.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: "/node_modules/",
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.sass$/,
                loader: ExtractTextPlugin.extract("style-loader",
                                    "css-loader!postcss-loader!sass-loader")
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader",
                                    "css-loader!postcss-loader")
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true}),
        new webpack.DefinePlugin({
            'process.env':{
                'NODE_ENV': JSON.stringify('production')
             }
        }),
        new ExtractTextPlugin("[name].min.css"),
    ],
    postcss: [
        autoprefixer({
            browsers: ['last 2 versions']
        })
    ]
};
