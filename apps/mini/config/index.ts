import { defineConfig } from "@tarojs/cli"

export default defineConfig({
  compiler: "webpack5",
  date: "2026-07-20",
  designWidth: 750,
  deviceRatio: {
    375: 2,
    640: 1.17,
    750: 1,
    828: 0.905
  },
  framework: "react",
  outputRoot: "dist",
  plugins: ["@tarojs/plugin-platform-weapp"],
  projectName: "gscombat-mini",
  sourceRoot: "src"
})
