import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __FORMAT_VERSION__: JSON.stringify(pkg.formatVersion),
    __MIN_FORMAT_VERSION__: JSON.stringify(pkg.minFormatVersion),
  },
   publicDir: 'static',
   clearScreen: false,
   server: {
      strictPort: true,
      host: true
   },
   envPrefix: ['VITE_', 'TAURI_PLATFORM', 'TAURI_ARCH', 'TAURI_FAMILY', 'TAURI_PLATFORM_VERSION', 'TAURI_PLATFORM_TYPE', 'TAURI_DEBUG'],
   css: {
      preprocessorOptions: {
         scss: {
            silenceDeprecations: ['legacy-js-api']
         }
      }
   },
   resolve: {
      mainFields: ['browser', 'module', 'main']
   },
   optimizeDeps: {
      exclude: ['konva']
   },
   build: {
      target: ["es2021", "chrome100", "safari13"],
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG
   },
   plugins: [
      svelte({
         preprocess: vitePreprocess()
      }),
   ]
});
