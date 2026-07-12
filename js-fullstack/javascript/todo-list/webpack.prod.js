import path from "node:path";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(import.meta.dirname, "../../../build/todo-list"),
    publicPath: "/odin-projects/todo-list/",
    clean: true,
  },
  devtool: "source-map",
});
