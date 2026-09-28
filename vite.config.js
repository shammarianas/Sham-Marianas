import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import compression from 'vite-plugin-compression';

export default defineConfig({
  cacheDir: "node_modules/.vite-cache",
  plugins: [
    react(),
    // Add compression plugin here
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10KB se chhoti files compress nahi hogi
      deleteOriginFile: false, // original files bhi rakhni hain
    }),
    // Optional: Brotli compression for even better results
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    })
  ],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.jpg", "**/*.png", "**/*.hdr"],
  base: "/",

  build: {
    external: ["three"],                  // ye theek hai (three.js ko bundle se bahar rakha)
    target: ["chrome89", "edge89", "firefox89", "safari15"],
    commonjsOptions: {
      transformMixedEsModules: true,
    },

    // Terser enable kar rahe hain
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },

    // Manual chunks for code splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          const isPackage = (packageName) =>
            normalizedId.includes(`/node_modules/${packageName}/`);

          // Keep React and Vite's lazy-load helper in the core vendor chunk.
          // This prevents the JSX runtime from being pulled into Three.js.
          if (
            normalizedId.includes("vite/preload-helper") ||
            normalizedId.includes("commonjsHelpers") ||
            [
              "react",
              "react-dom",
              "react-router-dom",
              "react-helmet-async",
              "scheduler",
            ].some(isPackage)
          ) {
            return "vendor";
          }

          if (
            ["three", "@react-three/fiber", "@react-three/drei"].some(
              isPackage
            )
          ) {
            return "three";
          }

          if (isPackage("firebase") || normalizedId.includes("/node_modules/@firebase/")) {
            return "firebase";
          }

          if (["@stripe/stripe-js", "@stripe/react-stripe-js"].some(isPackage)) {
            return "stripe";
          }

          if (["gsap", "@gsap/react"].some(isPackage)) {
            return "gsap";
          }

          if (["swiper", "aos", "react-icons"].some(isPackage)) {
            return "ui";
          }

          if (["react-quill", "quill"].some(isPackage)) {
            return "editor";
          }
        },
      },
    },

    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // 1000KB warning limit
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
