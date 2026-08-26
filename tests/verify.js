#!/usr/bin/env node
/* ============================================================================
   VERIFY THE BUILD OUTPUT

   Run with: npm run verify   (after npm run build)

   This is not a replacement for the Playwright audit in tests/audit.spec.js —
   that one drives a real browser and catches rendering problems. This one
   reads what the build actually wrote to disk and checks the things that
   matter to a crawler, which is exactly the layer a browser test cannot see:
   whether the HTML arriving over the wire already contains the content, the
   canonical, the title and the links.

   Every check prints a line. Failures are counted and the exit code reflects
   them, so this can be wired into CI later without changing anything.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const R = require("../assets/js/guide-render.js");
const S = require("../scripts/lib/site");

let pass = 0, fail = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) { pass++; return true; }
  fail++;
  failures.push(detail ? `${name} — ${detail}` : name);
  return false;
}
function section(title) { console.log("\n" + title + "\n" + "-".repeat(title.length)); }
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readIf = (rel) => exists(rel) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : null;

/* Load the bundled guides the same way the site does. */
function loadClient() {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/guides.js"), "utf8");
  const ctx = {
    console,
    document: {
      addEventListener() {}, querySelector() { return null; },
      querySelectorAll() { return []; },
      documentElement: { style: { setProperty() {} } }
    }
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { timeout: 5000 });
  return ctx;
}

const client = loadClient();
const GUIDES = client.GUIDES;

/* ==========================================================================
   1. The server and the browser must render a card identically.

   If these ever diverge, the page silently reflows on load and — much worse —
   a crawler and a reader are being served different markup, which is the
   definition of cloaking. Worth asserting rather than hoping.
   ======================================================================== */
section("Card markup parity (build vs browser)");
{
  let mismatches = 0, sample = "";
  for (const g of GUIDES) {
    const fromClient = client.cardHTML(g);
    const fromBuild = R.cardHTML(g, {
      iconHTML: client.ICONS[g.topic] || client.ICONS.feeding,
      topicLabel: (id) => client.topicById(id).label
    });
    if (fromClient !== fromBuild) {
      mismatches++;
      if (!sample) sample = `\n    build:  ${JSON.stringify(fromBuild)}\n    client: ${JSON.stringify(fromClient)}`;
    }
  }
  check(`All ${GUIDES.length} cards render identically`, mismatches === 0,
    `${mismatches} differ${sample}`);
}

/* ==========================================================================
   2. Every guide is a real page.
   ======================================================================== */
section("Generated guide pages");
{
  let missing = 0, noTitle = 0, noCanon = 0, badH1 = 0, noContent = 0,
      noRobots = 0, badSchema = 0, relPaths = 0, dupTitles = 0;
  const titles = new Map();

  for (const g of GUIDES) {
    const rel = `guides/${g.id}/index.html`;
    const html = readIf(rel);
    if (!html) { missing++; continue; }

    const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
    if (!title || /^Guide —/.test(title)) noTitle++;
    if (titles.has(title)) dupTitles++;
    titles.set(title, g.id);

    const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || "";
    if (canon !== `${S.ORIGIN}/guides/${g.id}/`) noCanon++;

    const h1s = html.match(/<h1[^>]*>/g) || [];
    if (h1s.length !== 1) badH1++;

    /* The actual answer must be in the HTML, not fetched later. */
    const quick = (g.panel && g.panel.quick || "").slice(0, 40);
    if (quick && !html.includes(quick.slice(0, 30))) noContent++;

    if (!/<meta name="robots" content="index, follow/.test(html)) noRobots++;

    const ld = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
    try {
      const parsed = JSON.parse(String(ld).replace(/\\u003C/g, "<"));
      const article = (parsed["@graph"] || []).find(n => n["@type"] === "Article");
      if (!article || !article.headline || !article.url) badSchema++;
    } catch (e) { badSchema++; }

    /* A relative asset path two directories deep resolves to nothing. */
    if (/\s(?:href|src)="(?!https?:|data:|mailto:|\/|#)[^"]+"/.test(html)) relPaths++;
  }

  check(`All ${GUIDES.length} guides have a page`, missing === 0, `${missing} missing`);
  check("Every page has its own <title>", noTitle === 0, `${noTitle} still generic`);
  check("Every <title> is unique", dupTitles === 0, `${dupTitles} duplicated`);
  check("Every canonical points at its own clean URL", noCanon === 0, `${noCanon} wrong`);
  check("Exactly one <h1> per page", badH1 === 0, `${badH1} pages wrong`);
  check("The answer is in the served HTML", noContent === 0, `${noContent} pages missing it`);
  check("Every page is indexable", noRobots === 0, `${noRobots} not marked index,follow`);
  check("Article schema is valid on every page", badSchema === 0, `${badSchema} bad`);
  check("No relative asset paths survive", relPaths === 0, `${relPaths} pages have them`);
}

/* ==========================================================================
   3. Nothing is orphaned, nothing is invented.
   ======================================================================== */
section("Crawlable links and honesty checks");
{
  const guidesHtml = readIf("guides.html") || "";
  const linked = new Set((guidesHtml.match(/href="\/guides\/([^/"]+)\//g) || [])
    .map(m => m.replace(/href="\/guides\//, "").replace(/\/$/, "")));
  const orphans = GUIDES.filter(g => !linked.has(g.id));
  check("Every guide is linked from /guides.html", orphans.length === 0,
    `${orphans.length} orphaned: ${orphans.slice(0, 3).map(g => g.id).join(", ")}`);

  check("Topic landing pages are linked", /href="\/topics\//.test(guidesHtml));
  check("Age landing pages are linked", /href="\/ages\//.test(guidesHtml));

  /* No guide has a real date yet, so no page may claim one. */
  let invented = 0;
  for (const g of GUIDES) {
    const html = readIf(`guides/${g.id}/index.html`) || "";
    if (/"datePublished"|"dateModified"/.test(html)) invented++;
  }
  check("No fabricated publish/modified dates", invented === 0,
    `${invented} pages assert a date that does not exist in the data`);

  /* Internal raw-question ids are provenance for Amir, not citations. */
  let leaked = 0;
  for (const g of GUIDES) {
    const html = readIf(`guides/${g.id}/index.html`) || "";
    if (/RAW-\d{8}-/.test(html)) leaked++;
  }
  check("Internal source ids never reach the page", leaked === 0, `${leaked} pages leak them`);

  /* Schema must not describe invisible breadcrumbs. */
  let ghostCrumbs = 0;
  for (const g of GUIDES) {
    const html = readIf(`guides/${g.id}/index.html`) || "";
    const hasSchema = /"BreadcrumbList"/.test(html);
    const hasVisible = /class="crumb"/.test(html);
    if (hasSchema !== hasVisible) ghostCrumbs++;
  }
  check("BreadcrumbList only when breadcrumbs are visible", ghostCrumbs === 0,
    `${ghostCrumbs} pages disagree`);
}

/* ==========================================================================
   4. Landing pages.
   ======================================================================== */
section("Topic and age landing pages");
{
  const topics = client.TOPICS.map(t => t.id);
  const ages = client.AGES;
  let missingT = 0, missingA = 0, thin = 0;

  for (const id of topics) {
    const html = readIf(`topics/${id}/index.html`);
    if (!html) { missingT++; continue; }
    const cards = (html.match(/class="card"/g) || []).length;
    if (cards === 0) thin++;
  }
  for (const a of ages) {
    const slug = S.ageSlug(a);
    const html = readIf(`ages/${slug}/index.html`);
    if (!html) { missingA++; continue; }
    if ((html.match(/class="card"/g) || []).length === 0) thin++;
  }
  check(`All ${topics.length} topic pages exist`, missingT === 0, `${missingT} missing`);
  check(`All ${ages.length} age pages exist`, missingA === 0, `${missingA} missing`);
  check("No empty archive pages published", thin === 0, `${thin} are empty`);

  /* A landing page must not duplicate the hub's full link list. */
  const t = readIf(`topics/${topics[0]}/index.html`) || "";
  check("Landing pages do not repeat the browse-links block",
    !/browse-links/.test(t));
}

/* ==========================================================================
   5. sitemap.xml, robots.txt, _redirects, llms.txt
   ======================================================================== */
section("Sitemap, robots, redirects");
{
  const sm = readIf("sitemap.xml") || "";
  const locs = (sm.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => m.replace(/<\/?loc>/g, ""));
  check("sitemap.xml exists", !!sm);
  check("Sitemap is well-formed XML", /^<\?xml[\s\S]*<\/urlset>\s*$/.test(sm));
  check("Sitemap has no duplicates", new Set(locs).size === locs.length,
    `${locs.length - new Set(locs).size} duplicated`);
  check("Sitemap contains every guide",
    GUIDES.every(g => locs.includes(`${S.ORIGIN}/guides/${g.id}/`)));
  check("Sitemap excludes query-string URLs", !locs.some(l => l.includes("?")));
  check("Sitemap excludes private routes",
    !locs.some(l => S.PRIVATE_ROUTES.some(p => l.includes(p))));
  check("Sitemap excludes the audit page", !locs.some(l => l.includes("seo-audit")));
  check("No fabricated <lastmod>", !/<lastmod>/.test(sm) ||
    (sm.match(/<lastmod>([^<]+)<\/lastmod>/g) || []).every(m => /\d{4}-\d{2}-\d{2}/.test(m)));

  const robots = readIf("robots.txt") || "";
  check("robots.txt exists", !!robots);
  check("OAI-SearchBot is explicitly allowed",
    /User-agent: OAI-SearchBot\nAllow: \//.test(robots));
  check("Bingbot is explicitly allowed", /User-agent: Bingbot\nAllow: \//.test(robots));
  check("Googlebot is explicitly allowed", /User-agent: Googlebot\nAllow: \//.test(robots));
  check("Studio and Editor are blocked",
    /Disallow: \/studio\//.test(robots) && /Disallow: \/editor\//.test(robots));
  check("The audit page is blocked", /Disallow: \/seo-audit\.html/.test(robots));
  check("Public guides are not blocked", !/Disallow: \/guides/.test(robots));
  check("Sitemap is declared", robots.includes(`Sitemap: ${S.ORIGIN}/sitemap.xml`));

  const red = readIf("_redirects") || "";
  check("_redirects exists", !!red);
  check("Every legacy ?id= URL redirects",
    GUIDES.every(g => red.includes(`/guide.html  id=${g.id}  /guides/${g.id}/  301!`)));
  check("There is a catch-all for deleted guides", /\/guide\.html\s+id=:id/.test(red));
  /* A redirect that points at another redirect costs a round trip and leaks
     ranking signals. Every target must be a real destination. */
  const targets = (red.match(/^\S+\s+\S+\s+(\S+)\s+301/gm) || []);
  check("No redirect chains", !targets.some(line => {
    const to = line.trim().split(/\s+/).slice(-2)[0];
    return red.includes(`\n${to}  `) || red.includes(`\n${to}\t`);
  }));

  /* A guide that does not exist must return a real 404, not a styled page with
     HTTP 200 — otherwise dead URLs get indexed as though they were real. */
  check("Unknown slugs fall back to guide.html so new guides render",
    /\/guides\/\*\s+\/guide\.html\s+200/.test(red));
  check("That fallback is the last rule",
    red.trim().split("\n").filter(l => l.trim() && !l.trim().startsWith("#")).pop()
      .includes("/guide.html  200"));
  check("A guide that does not exist marks itself noindex",
    /noindex, follow/.test(readIf("assets/js/guide-page.js") || ""));

  const llms = readIf("llms.txt") || "";
  check("llms.txt exists and lists guides", llms.includes("## Guides") &&
    llms.includes(`${S.ORIGIN}/guides/${GUIDES[0].id}/`));
  check("llms.txt makes no citation claims", !/cite|guarantee/i.test(llms));
}

/* ==========================================================================
   6. The private surfaces stay private.
   ======================================================================== */
section("Private surfaces");
{
  const audit = readIf("seo-audit.html") || "";
  check("seo-audit.html exists", !!audit);
  check("seo-audit.html is noindex", /<meta name="robots" content="noindex/.test(audit));

  const legacy = readIf("guide.html") || "";
  check("Legacy guide.html cannot compete for the canonical",
    /<meta name="robots" content="noindex/.test(legacy));

  const nf = readIf("404.html") || "";
  check("404 page is noindex", /<meta name="robots" content="noindex/.test(nf));
}

/* ==========================================================================
   7. Nothing on the hand-written pages regressed.
   ======================================================================== */
section("Hand-written pages");
{
  for (const p of ["index.html", "guides.html", "popular.html", "about.html", "books.html"]) {
    const html = readIf(p) || "";
    const name = p.replace(".html", "");
    check(`${name}: canonical present`, /<link rel="canonical"/.test(html));
    check(`${name}: og:image present`, /property="og:image"/.test(html));
    check(`${name}: viewport intact`,
      /content="width=device-width, initial-scale=1"/.test(html));
  }
  const idx = readIf("index.html") || "";
  check("Home page carries Organization + WebSite schema",
    /"Organization"/.test(idx) && /"WebSite"/.test(idx));
  check("Home page grid has real cards", (idx.match(/class="card"/g) || []).length >= 4);
}

/* ======================================================================== */
console.log("\n" + "=".repeat(60));
console.log(`${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("\nFailures:");
  failures.forEach(f => console.log("  ✗ " + f));
}
console.log("=".repeat(60));
process.exit(fail ? 1 : 0);
