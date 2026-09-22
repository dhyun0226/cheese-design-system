import { defineConfig, mergeConfig } from "vite";
import site from "./vite.config";

// Test the production bundling path. Fixtures are emitted only into this
// ignored QA directory, never into the public Pages artifact in dist/.
export default mergeConfig(
  site,
  defineConfig({
    preview: { proxy: { "/api/upload": "http://127.0.0.1:48179" } },
    build: {
      outDir: "artifacts/browser-site",
      rollupOptions: {
        input: {
          forms: "tests/fixtures/forms.html",
          business: "tests/fixtures/business.html",
          timeControls: "tests/fixtures/time-controls.html",
          dateNumberFields: "tests/fixtures/date-number-fields.html",
          scrollbars: "tests/fixtures/scrollbars.html",
          navigationPagination: "tests/fixtures/navigation-pagination.html",
          toastLayout: "tests/fixtures/toast-layout.html",
          searchValidation: "tests/fixtures/search-validation.html",
        },
      },
    },
  }),
);
