// @ts-check
const { defineConfig } = require("@playwright/test");

/* Playwright config for the site health audit.
   - Boots the tiny static server in tests/static-server.js
   - Runs a single audit spec that crawls every page
   - Writes a human-readable report to test-results/audit-report.md
     (plus issues.json and the standard Playwright HTML report) */
module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/html", open: "never" }],
    ["json", { outputFile: "test-results/playwright-results.json" }]
  ],
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "node tests/static-server.js",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  }
});
