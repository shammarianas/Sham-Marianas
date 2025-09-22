import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
// import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
// import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: "node_modules/.vite-cache",
  plugins: [react()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.jpg", "**/*.png", "**/*.hdr"],
  base: "./",
  build: {
    external: ["three"],
    target: ["chrome89", "edge89", "firefox89", "safari15"],
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    "process.env": {},
    Buffer: ["buffer", "Buffer"],
    global: "globalThis",
    "process.browser": true,
  },
  resolve: {
    alias: {
      buffer: resolve(__dirname, "node_modules/buffer/"),
      aos: resolve(__dirname, "node_modules/aos/dist/aos.js"),
      "aos/dist/aos.css": resolve(__dirname, "node_modules/aos/dist/aos.css"),
    },
  },
  optimizeDeps: {
    force: true,
    include: ["buffer", "react-quill", "quill", "aos"],
    exclude: ["ethers", "@stripe/stripe-js", "@stripe/react-stripe-js"],
  },
  // resolve: {
  //   alias: {
  //     buffer: "buffer",
  //   },
  // },
});
