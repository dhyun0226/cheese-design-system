import { defineConfig, mergeConfig } from "vite";
import site from "./vite.config";

// Test the production bundling path. Fixtures are emitted only into this
// ignored QA directory, never into the public Pages artifact in dist/.
export default mergeConfig(
  site,
  defineConfig({
    build: {
      outDir: "artifacts/browser-site",
      rollupOptions: { input: { forms: "tests/fixtures/forms.html", business: "tests/fixtures/business.html" } },
    },
  }),
);
