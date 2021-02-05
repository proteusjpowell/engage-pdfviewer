const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		"engage-pdfviewer": ['./src/engage-pdfviewer.js']
	},
	devtool: 'source-map',
	devServer: {
		contentBase: './dist',
		allowedHosts: [
				'localhost',
				'.dev.proteus.co'
		]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			inject: true,
			template: "index.ejs",
			links: [
				'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css',
				'css/engage-pdfviewer.css'
			],
			scripts: [
				'https://unpkg.com/pdfjs-dist@2.2.228/build/pdf.min.js',
				'https://unpkg.com/pdfjs-dist@2.2.228/web/pdf_viewer.js',
			],
			title: 'Testing'
		}),
		new CopyWebpackPlugin([
			{from:'src/images',to:'images'},
			{from:'src/pdfs',to:'pdfs'},
			{from:'./src/engage-pdfviewer.css',to:'css'},
		])
	],
	output: {
		filename: '[name].js',
		library: 'EngagePDFViewer',
		libraryTarget: 'umd',
		libraryExport: "default",
		umdNamedDefine: true,
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
				],
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader',
				],
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
		],
	},
};
