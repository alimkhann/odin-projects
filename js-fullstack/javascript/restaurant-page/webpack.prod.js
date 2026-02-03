import path from "node:path";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(import.meta.dirname, "../../../build/restaurant-page"),
    publicPath: "/odin-projects/restaurant-page/",
    clean: true,
  },
});
