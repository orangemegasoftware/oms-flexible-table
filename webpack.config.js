const path = require('path');

module.exports = {
  entry: './src/index.js',  // Entry point for your component code
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'OmsFlexibleTable',          // Name of your library
    libraryTarget: 'umd',                 // Use UMD for compatibility
    globalObject: 'this',                 // Ensure compatibility in different environments
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',             // Treat React as an external dependency
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',              // Use Babel for JS/JSX files
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],  // Use style and css loaders for CSS
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: 'production',
};
