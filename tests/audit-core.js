/* ============================================================================
   SITE HEALTH AUDIT — shared core
   Used by both:
     - tests/audit.spec.js   (the Playwright test runner: `npm test`)
     - tests/run-audit.js     (standalone runner: `npm run audit:standalone`)

   Crawls every public page (desktop + mobile) and records anything that looks
   broken, then writes a readable report to test-results/.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const PAGES = [
  "index.html", "popular.html", "guides.html",
  "about.html", "books.html", "404.html"
];
const VIEWPORTS = {
  desktop: { width: 1366, height: 900 },
  mobile:  { width: 390,  height: 844 }
};

// Noise that only appears in local/offline preview, not on the live site.
const BENIGN = [
  /firebase-config\.js/i, /fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i,
  /ERR_TUNNEL/i, /ERR_NAME_NOT_RESOLVED/i, /ERR_INTERNET_DISCONNECTED/i,
  /ERR_CONNECTION/i, /ERR_FAILED/i, /gstatic\.com/i
];
const isBenign = (s) => BENIGN.some((r) => r.test(s || ""));

async function runAudit(browser, baseURL) {
  /** @type {{severity:string,page:string,type:string,detail:string}[]} */
  const issues = [];
  const add = (severity, page, type, detail) =>
    issues.push({ severity, page, type, detail: String(detail || "") });
  const linkTargets = new Set();

  // Discover a real guide URL so guide.html gets audited too.
  let guideUrl = null;
  {
    const p = await browser.newPage();
    try {
      await p.goto(baseURL + "/guides.html", { waitUntil: "networkidle", timeout: 15000 });
      const href = await p.$eval(".card", (el) => el.getAttribute("href")).catch(() => null);
      if (href) guideUrl = href;
    } catch (e) { /* handled below */ }
    await p.close();
  }
  const urls = [...PAGES];
  if (guideUrl) urls.push(guideUrl);
  else add("warn", "guides.html", "audit", "No guide cards found — guide.html was not audited.");

  for (const url of urls) {
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      const label = url + " @" + vpName;
      const page = await browser.newPage({ viewport: vp });
      const consoleErrs = [], pageErrs = [], netErrs = [];
      page.on("console", (m) => { if (m.type() === "error") consoleErrs.push(m.text()); });
      page.on("pageerror", (e) => pageErrs.push(e.message));
      page.on("response", (r) => { if (r.status() >= 400) netErrs.push(r.status() + " " + r.url()); });

      let resp;
      try {
        resp = await page.goto(baseURL + "/" + url, { waitUntil: "networkidle", timeout: 15000 });
      } catch (e) {
        add("error", label, "navigation", "Failed to load: " + (e.message || e));
        await page.close();
        continue;
      }
      if (resp && resp.status() >= 400) add("error", label, "http", "Page returned HTTP " + resp.status());
      await page.waitForTimeout(500);

      pageErrs.forEach((t) => add("error", label, "js-error", t));
      consoleErrs.forEach((t) => {
        // A bare "Failed to load resource" console line carries no URL — the
        // actual failing resource is captured (with its URL + severity) by the
        // response handler below, so don't double-count it as an error here.
        const benign = isBenign(t) || /Failed to load resource/i.test(t);
        add(benign ? "info" : "error", label, "console-error", t);
      });
      netErrs.forEach((t) => {
        if (isBenign(t)) return add("info", label, "network", t);
        // A real missing script/style is serious; other 404s are a warning.
        add(/\.(js|css)(\?|$)/i.test(t) ? "error" : "warn", label, "network", t);
      });

      const dom = await page.evaluate(() => {
        const imgs = Array.from(document.images);
        const broken = imgs
          .filter((i) => i.getAttribute("src") && (!i.complete || i.naturalWidth === 0))
          .map((i) => i.currentSrc || i.src);
        const noAlt = imgs.filter((i) => !i.hasAttribute("alt")).map((i) => i.getAttribute("src") || i.getAttribute("data-default") || "(no src)");
        const seen = {}, dupIds = [];
        document.querySelectorAll("[id]").forEach((e) => {
          const id = e.id; seen[id] = (seen[id] || 0) + 1; if (seen[id] === 2) dupIds.push(id);
        });
        const internal = Array.from(document.querySelectorAll("a[href]"))
          .map((a) => a.getAttribute("href"))
          .filter((h) => h && !/^(https?:|#|mailto:|tel:)/i.test(h) && (h.endsWith(".html") || h.includes(".html?")));
        const namelessBtns = Array.from(document.querySelectorAll("button, a"))
          .filter((el) => !el.textContent.trim() && !el.getAttribute("aria-label") &&
            !el.querySelector("img[alt]:not([alt=''])") && !el.getAttribute("title"))
          .map((el) => el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""));
        return {
          broken, noAlt, dupIds, internal, namelessBtns,
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          hasTitle: !!document.title.trim(),
          hasH1: !!document.querySelector("h1"),
          lang: document.documentElement.getAttribute("lang") || ""
        };
      });

      dom.broken.forEach((s) => add("error", label, "broken-image", s));
      dom.noAlt.forEach((s) => add("warn", label, "img-missing-alt", s));
      dom.dupIds.forEach((id) => add("warn", label, "duplicate-id", "#" + id));
      dom.namelessBtns.forEach((b) => add("warn", label, "control-no-accessible-name", b));
      if (dom.scrollW - dom.innerW > 2)
        add("warn", label, "horizontal-overflow",
          "content " + dom.scrollW + "px wider than " + dom.innerW + "px viewport (page scrolls sideways)");
      if (!dom.hasTitle) add("warn", label, "missing-title", "");
      if (!dom.hasH1) add("warn", label, "missing-h1", "");
      if (!dom.lang) add("warn", label, "missing-lang", "<html> has no lang attribute");

      if (vpName === "desktop") dom.internal.forEach((h) => linkTargets.add(h));

      if ((url === "guides.html" || url === "popular.html") && vpName === "desktop") {
        const ov = await page.evaluate(() => {
          const s = document.querySelector(".search");
          const a = document.querySelector(".page-hero-art img");
          if (!s || !a) return null;
          const r1 = s.getBoundingClientRect(), r2 = a.getBoundingClientRect();
          return {
            ix: Math.round(Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left)),
            iy: Math.round(Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top))
          };
        });
        if (ov && ov.ix > 4 && ov.iy > 4)
          add("warn", label, "overlap", "search bar overlaps hero image by " + ov.ix + "×" + ov.iy + "px");
      }

      await page.close();
    }
  }

  // Every internal link must point at a file that exists.
  for (const href of linkTargets) {
    const filePart = href.split("?")[0].replace(/^\//, "");
    try {
      const r = await fetch(baseURL + "/" + filePart);
      if (!r.ok) add("error", filePart, "dead-link", "internal link target returns HTTP " + r.status);
    } catch (e) {
      add("error", filePart, "dead-link", "could not fetch: " + (e.message || e));
    }
  }

  return issues;
}

function writeReport(all, dir) {
  dir = dir || path.resolve(__dirname, "..", "test-results");
  fs.mkdirSync(dir, { recursive: true });

  const order = { error: 0, warn: 1, info: 2 };
  const sorted = [...all].sort((a, b) => (order[a.severity] - order[b.severity]) || a.page.localeCompare(b.page));
  const count = (s) => all.filter((i) => i.severity === s).length;

  fs.writeFileSync(path.join(dir, "issues.json"), JSON.stringify({
    generated: new Date().toISOString(),
    totals: { error: count("error"), warn: count("warn"), info: count("info") },
    issues: sorted
  }, null, 2));

  const icon = { error: "🔴", warn: "🟠", info: "🔵" };
  const heading = {
    error: "Errors (fix these)",
    warn: "Warnings (worth a look)",
    info: "Info (environment-only, safe to ignore locally)"
  };
  let md = "# Site health audit\n\n";
  md += `_Generated ${new Date().toISOString()}_\n\n`;
  md += `**${count("error")} errors · ${count("warn")} warnings · ${count("info")} info**\n\n`;
  if (!all.length) md += "No issues found. 🎉\n";
  for (const sev of ["error", "warn", "info"]) {
    const rows = sorted.filter((i) => i.severity === sev);
    if (!rows.length) continue;
    md += `\n## ${icon[sev]} ${heading[sev]} — ${rows.length}\n\n`;
    md += "| Type | Page | Detail |\n|------|------|--------|\n";
    for (const r of rows) md += `| ${r.type} | ${r.page} | ${r.detail.replace(/\|/g, "\\|").slice(0, 300)} |\n`;
  }
  fs.writeFileSync(path.join(dir, "audit-report.md"), md);
  return { error: count("error"), warn: count("warn"), info: count("info") };
}

module.exports = { PAGES, VIEWPORTS, runAudit, writeReport };
