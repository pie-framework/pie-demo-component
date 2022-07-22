import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "pie-demo",
  testing: {
    testRegex: "__tests__/.*.(spec|e2e).ts"
  },
  rollupPlugins: {
    before: [],
    after: []
  },
  copy: [
    { src: "../src/ebsr.html", dest: "ebsr.html" },
    {
      src: "../node_modules/docson/public/templates/box.html",
      dest: "assets/html/box.html"
    },
    {
      src: "../node_modules/docson/public/templates/signature.html",
      dest: "assets/html/signature.html"
    },
    {
      src: "../node_modules/docson/public/css/docson.css",
      dest: "assets/docson.css"
    }
  ],
  outputTargets: [
    {
      type: "dist"
    },
    {
      type: "www",
      serviceWorker: null
    }
  ],
  bundles: [{ components: ["pie-demo"] }]
};
