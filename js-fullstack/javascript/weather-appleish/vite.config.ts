import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  return {
    base: mode === "production" ? "/odin-projects/weather-appleish/" : "/",
  };
});
