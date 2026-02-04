import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  output: {
    filename: "main.js",
    path: new URL("dist", import.meta.url).pathname,
    clean: true,
  },
  devtool: "source-map",
});
