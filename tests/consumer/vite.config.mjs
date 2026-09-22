import { defineConfig } from "vite";
export default defineConfig({
  build: {
    reportCompressedSize: false,
    rollupOptions: {
      input: { react: "index.html", vue: "vue.html" },
      onwarn(warning, warn) {
        // This consumer is a client-only app. The distributed React entry
        // separately retains its directive for RSC-aware frameworks.
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes("use client")
        )
          return;
        warn(warning);
      },
    },
  },
});
