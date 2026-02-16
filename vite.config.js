import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  cacheDir: "node_modules/.vite-cache",
  plugins: [react()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.jpg", "**/*.png", "**/*.hdr"],
  base: "./",

  build: {
    external: ["three"],                  // ye theek hai (three.js ko bundle se bahar rakha)
    target: ["chrome89", "edge89", "firefox89", "safari15"],
    commonjsOptions: {
      transformMixedEsModules: true,
    },

    // ────────────────────────────────────────────────
    // Terser ko yahan enable kar rahe hain
    minify: 'terser',                     // ← Ye line sabse zaroori – esbuild ki jagah terser

    terserOptions: {                      // ← Ye optional lekin bohot faydemand
      compress: {
        drop_console: true,               // production mein console.log, console.info etc. remove
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,                        // 2 baar compression chalao → size thoda aur kam
        // booleans: true,                // true/false ko !0 / !1 jaise short kar de (optional)
      },
      mangle: {
        toplevel: true,                   // top-level variables/functions bhi short names de
        // reserved: ['someImportantVar'], // agar koi naam mat change karna to yahan list karo
      },
      format: {
        comments: false,                  // production mein comments hata de (size saving)
      },
    },

    // Optional extra settings (recommend)
    reportCompressedSize: true,           // build ke end mein gzip size bhi batayega
    // sourcemap: false,                  // production mein false kar do (size kam hota hai)
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
});