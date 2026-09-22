import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  base: "./",
  plugins: [react(), vue()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: { input: { main: "index.html", vue: "vue.html" } },
  },
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
});
