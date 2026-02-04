import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "development",
  output: {
    filename: "main.js",
    path: new URL("dist", import.meta.url).pathname,
    clean: true,
  },
  devtool: "eval-source-map",
  devServer: {
    compress: false,
    hot: true,
    open: true,
    watchFiles: ["./src/template.html"],
  },
});
