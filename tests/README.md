# Site health audit (Playwright)

An automated check that loads every public page (desktop **and** mobile) and
reports anything that looks broken — so you can spot problems before your
visitors do.

## What it checks

- **JavaScript errors** and uncaught exceptions on every page
- **Broken images** (any picture that fails to load)
- **Dead internal links** (a menu/link pointing at a page that doesn't exist)
- **Failed resources** (missing CSS/JS = error; other 404s = warning)
- **Horizontal overflow** (content spilling off the side of the page)
- **Overlaps** (e.g. the search bar sitting on top of the hero illustration)
- **Accessibility basics** (missing `alt` text, missing `<h1>`/`<title>`,
  duplicate `id`s, buttons/links with no readable label, missing `lang`)

## How to run

```bash
npm install            # first time only (installs Playwright)
npx playwright install chromium   # first time only (downloads the browser)
npm test               # runs the audit
```

Then read the report:

```
test-results/audit-report.md      <- the human-readable list of issues
test-results/issues.json          <- the same data as JSON (for tooling)
```

`npm run test:report` opens Playwright's interactive HTML report.

### No test runner? Standalone mode

If `@playwright/test` isn't available, the same audit runs with just the base
`playwright` package:

```bash
npm run audit:standalone
```

## How to read the results

| Severity | Meaning |
|----------|---------|
| 🔴 **error** | Something is genuinely broken — fix it. `npm test` exits non-zero if any exist. |
| 🟠 **warning** | Worth a look (layout/overlap/accessibility), but not fatal. |
| 🔵 **info** | Environment-only noise. When you run locally without `assets/js/firebase-config.js`, or with Google Fonts blocked, you'll see 404 / connection notices here. These **do not** occur on the live site — safe to ignore. |

## Notes

- The audit serves the site itself (see `tests/static-server.js`) on port 4173,
  so you don't need to start anything separately.
- To audit against real Firestore data, add your `assets/js/firebase-config.js`
  before running; otherwise it audits the bundled/default content.
