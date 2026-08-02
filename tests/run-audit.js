/* Standalone audit runner — needs only the base `playwright` package (no
   @playwright/test). Handy when the full test runner isn't installed.

     node tests/run-audit.js            (or: npm run audit:standalone)

   Boots the static server, launches Chromium, runs the shared audit, writes
   the report to test-results/, prints a summary, and exits non-zero if any
   "error" severity issues were found. */
const path = require("path");
const { runAudit, writeReport } = require("./audit-core");

const PORT = process.env.AUDIT_PORT ? Number(process.env.AUDIT_PORT) : 4173;
const BASE = "http://localhost:" + PORT;

(async () => {
  // Start the static server (it begins listening on require).
  process.env.AUDIT_PORT = String(PORT);
  require("./static-server");
  await new Promise((r) => setTimeout(r, 400));

  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (e) {
    console.error("Could not load Playwright. Run `npm install` first (or `npx playwright install chromium`).");
    process.exit(2);
  }

  const browser = await chromium.launch();
  let totals;
  try {
    const issues = await runAudit(browser, BASE);
    totals = writeReport(issues);
  } finally {
    await browser.close();
  }

  console.log(`\nAudit complete: ${totals.error} errors, ${totals.warn} warnings, ${totals.info} info`);
  console.log("Report: " + path.resolve(__dirname, "..", "test-results", "audit-report.md") + "\n");
  process.exit(totals.error > 0 ? 1 : 0);
})();
