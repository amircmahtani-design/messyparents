// @ts-check
/* Site health audit — Playwright test-runner entry point (`npm test`).
   All the crawling logic lives in ./audit-core.js so it can be shared with the
   standalone runner. This test writes the report and only fails on genuine
   "error" severity issues (warnings/info are reported but non-fatal).

     test-results/audit-report.md   <- the human-readable list of issues
     test-results/issues.json       <- the same data as JSON
*/
const { test, expect } = require("@playwright/test");
const { runAudit, writeReport } = require("./audit-core");

test("site health audit", async ({ browser, baseURL }) => {
  const issues = await runAudit(browser, baseURL || "http://localhost:4173");
  const totals = writeReport(issues);
  console.log(`\nAudit: ${totals.error} errors, ${totals.warn} warnings, ${totals.info} info` +
    ` → test-results/audit-report.md\n`);

  const errors = issues.filter((i) => i.severity === "error");
  const summary = errors.map((e) => `${e.type} — ${e.page} — ${e.detail}`).join("\n") || "(none)";
  expect.soft(errors, "Critical issues found:\n" + summary).toHaveLength(0);
});
