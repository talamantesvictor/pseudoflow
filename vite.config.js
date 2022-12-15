import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

export default defineConfig({
   clearScreen: false,
   server: {
      strictPort: true,
      host: true
   },
   envPrefix: ["VITE_", "TAURI_"],
   build: {
      target: ["es2021", "chrome100", "safari13"],
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG
   },
   plugins: [
      svelte({
         preprocess: sveltePreprocess(),
      }),
   ]
});
