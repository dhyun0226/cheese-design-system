import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  use: {
    baseURL: "http://127.0.0.1:48176",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node tests/upload-server.mjs",
      url: "http://127.0.0.1:48179/health",
      reuseExistingServer: false,
    },
    {
      command:
        "npm run build:test && vite preview --config vite.test.config.ts --outDir artifacts/browser-site --host 127.0.0.1 --port 48176 --strictPort",
      url: "http://127.0.0.1:48176",
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
