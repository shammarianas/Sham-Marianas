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
        manualChunks: {
          // React core libraries
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          // Three.js and 3D libraries
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          // Firebase
          firebase: ['firebase'],
          // Stripe
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          // GSAP
          gsap: ['gsap', '@gsap/react'],
          // UI libraries
          ui: ['swiper', 'aos', 'react-icons'],
          // Editor related
          editor: ['react-quill', 'quill'],
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