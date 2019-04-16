const path = require("path");

module.exports = {
  mode: "development",
  entry: ["@babel/polyfill", "./src/app.js"],
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  //This is to configurate webpack-dev-server
  devServer: {
      contentBase: path.join(__dirname, "public"),
      historyApiFallback: true
  }
};
