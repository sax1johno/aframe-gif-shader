const path = require('path');

module.exports = {
  output : {
    path     : path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename : 'aframe-gif-component.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/, 
        use: {
          loader: "babel-loader",
          options: {
            exclude: "/node_modules/",
            presets: ['@babel/preset-env'],
          }
        }        
      }
    ]
  }
}