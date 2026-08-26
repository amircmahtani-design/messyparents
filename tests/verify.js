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
const zlib = require("zlib");

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

/* The bundled catalogue, from its build-time-only home. It used to be
   assets/js/guides.js, which was also the public site's UI layer and had to be
   evaluated inside a fake DOM. It is data now, so require() is enough. */
function loadClient() {
  delete require.cache[require.resolve("../data/guides-bundle.js")];
  return require("../data/guides-bundle.js");
}

/* The card renderer the browser uses, lifted out of mpc-catalogue.js and run
   against the same facet shape the build writes inline. If this and the
   build's cardHTML ever drift, the baked-hash handshake fails and every grid
   silently rebuilds and reorders itself on every single visit. */
function loadBrowserCardRenderer(topics, icons) {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/mpc-catalogue.js"), "utf8");
  const ctx = {
    console, fetch: () => Promise.reject(new Error("no network in verify")),
    MPC_FACETS: {
      topics: topics.map(t => ({ id: t.id, label: t.label })),
      ages: [], icons, counts: { topic: {}, age: {} }, total: 0
    }
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { timeout: 5000 });
  return ctx.MPC.catalogue;
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
  const browser = loadBrowserCardRenderer(client.TOPICS, client.ICONS);
  let mismatches = 0, sample = "";
  for (const g of GUIDES) {
    /* The browser now draws from the generated index, not from the guide
       document, so it is given only the fields the index actually carries.
       That is the real test: if cardHTML needed something the index does not
       ship, this is where it shows up. */
    const fromClient = browser.cardHTML({
      id: g.id, slug: g.slug, title: g.title, topic: g.topic, read: g.read
    });
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

  /* The landing pages used to be reachable only through a second row of plain
     links baked at the bottom of the page, because the filter pills were
     <button>s and a crawler cannot follow a button. The pills are <a href> now
     and are the only links needed — so this checks the PILLS carry them, which
     is what makes the extra row safe to delete. */
  const topicPillLinks = (guidesHtml.match(/<a class="pill"[^>]*href="\/topics\//g) || []).length;
  const agePillLinks = (guidesHtml.match(/<a class="pill pill--age"[^>]*href="\/ages\//g) || []).length;
  check("Topic landing pages are linked from the filter pills", topicPillLinks > 0,
    `${topicPillLinks} found`);
  check("Age landing pages are linked from the filter pills", agePillLinks > 0,
    `${agePillLinks} found`);
  check("No duplicated second row of browse links", !/class="browse-links"/.test(guidesHtml));

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
  /* A redirect must never be able to point at itself. The wildcard form
     /guides/:slug -> /guides/:slug/ does exactly that the moment a generated
     page is missing, and the browser stops with ERR_TOO_MANY_REDIRECTS —
     turning a missing page into a dead site. Sources are named explicitly now
     so it cannot happen; this makes sure it stays that way. */
  {
    const lines = red.split("\n").map(l => l.trim())
      .filter(l => l && !l.startsWith("#"));
    const selfRefs = lines.filter(l => {
      const [from, to] = l.split(/\s+/);
      if (!from || !to) return false;
      if (from === to) return true;
      /* Same rule with only a trailing slash between them, via a placeholder
         or a wildcard: the loop case. */
      return /[:*]/.test(from) && from.replace(/\/$/, "") === to.replace(/\/$/, "");
    });
    check("No redirect can point at itself", selfRefs.length === 0,
      selfRefs.join(" | "));

    /* And specifically: no rule may differ from its target only by a trailing
       slash. Netlify matches /topics/feeding/ against the source /topics/:slug
       — the slash does not stop it matching — so /x -> /x/ redirects a URL to
       the address it already asked for. The ! on those rules made it forced,
       which beats a real file, so the generated page existing changed nothing.
       This took every guide, topic and age page off the live site.

       Writing the sources out explicitly does NOT help; /guides/teething ->
       /guides/teething/ loops identically. Netlify resolves the directory
       index on its own and needs no rule at all. */
    const slashLoops = lines.filter(l => {
      const [from, to] = l.split(/\s+/);
      return from && to && from.replace(/\/+$/, "") === to.replace(/\/+$/, "");
    });
    check("No rule differs from its target only by a trailing slash",
      slashLoops.length === 0, slashLoops.join(" | "));
  }

  check("A guide that does not exist marks itself noindex",
    /noindex, follow/.test(readIf("assets/js/guide.js") || ""));

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

/* ==========================================================================
   8. PERFORMANCE ARCHITECTURE

   These are the checks that stop this work being undone by accident. Every one
   of them describes something that used to be true and must never be true
   again — most importantly, that opening one guide downloaded the complete
   text of every guide.

   They are cheap, they read what the build actually wrote, and they fail
   loudly rather than degrading quietly, because the failure mode here is
   invisible: the site still works, it is just slow again.
   ======================================================================== */
section("Performance architecture");
{
  const PUBLIC_PAGES = [
    "index.html", "guides.html", "popular.html", "about.html",
    "books.html", "editorial.html", "404.html", "guide.html"
  ];
  const GENERATED = [];
  for (const g of GUIDES.slice(0, 5)) {
    const f = path.join("guides", (g.seo && g.seo.slug) || g.id, "index.html");
    if (exists(f)) GENERATED.push(f);
  }
  const topicSample = fs.existsSync(path.join(ROOT, "topics"))
    ? fs.readdirSync(path.join(ROOT, "topics")).slice(0, 2)
        .map(d => path.join("topics", d, "index.html")).filter(exists)
    : [];
  const ALL = PUBLIC_PAGES.concat(GENERATED, topicSample);

  /* ---- the headline rule ---------------------------------------------- */
  {
    /* The bundled catalogue is 109KB at 31 guides and would be well over a
       megabyte at 500. No public page may reference it — only the Node build
       and the two editing surfaces, which are noindexed. */
    const offenders = ALL.filter(f => {
      const html = readIf(f) || "";
      return /src="[^"]*(?:assets\/js\/guides\.js|guides-bundle\.js)/.test(html);
    });
    check("No public page ships the complete guide catalogue",
      offenders.length === 0, offenders.join(", "));
  }

  {
    /* The Firebase SDK is ~300KB from gstatic and used to be booted on every
       page by mpc-store.js, purely to read data that was already in the HTML. */
    const offenders = ALL.filter(f => {
      const html = readIf(f) || "";
      return /mpc-store\.js|firebase-config\.js|firebasejs\/|firebase-app\.js/.test(html);
    });
    check("No public page loads the Firebase SDK or the CMS data layer",
      offenders.length === 0, offenders.join(", "));
  }

  {
    /* A whole-collection read is the thing that does not scale: it is one
       request that grows with the library, on a page that needs one document. */
    const runtime = ["assets/js/mpc-runtime.js", "assets/js/mpc-catalogue.js",
      "assets/js/guide.js", "assets/js/home.js", "assets/js/guides-search.js",
      "assets/js/popular.js"];
    const offenders = runtime.filter(f => {
      const js = readIf(f) || "";
      return /getDocs\s*\(|collection\s*\(\s*db|documents\/guides\?|:runQuery[\s\S]{0,400}collectionId/.test(js)
        && !/limit"?\s*:\s*1/.test(js);
    });
    check("No public script performs a whole-collection Firestore read",
      offenders.length === 0, offenders.join(", "));
  }

  {
    /* Studio's preview shim is the DOM half of the old data layer. It is
       legitimate, but only inside an iframe Studio controls. */
    const offenders = ALL.filter(f => /mpc-preview\.js/.test(readIf(f) || ""));
    check("The Studio preview shim is not referenced by a public page",
      offenders.length === 0, offenders.join(", "));
  }

  /* ---- a guide page must be self-sufficient ---------------------------- */
  {
    let heavy = 0, noFs = 0, sample = "";
    for (const f of GENERATED) {
      const html = readIf(f) || "";
      const srcs = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
      /* Two files: the shared runtime and the guide behaviour. The renderer is
         fetched on demand and a generated page never needs it. */
      if (srcs.length > 2) { heavy++; if (!sample) sample = `${f}: ${srcs.join(" ")}`; }
      if (!/window\.MPC_GUIDE_ID/.test(html)) noFs++;
    }
    check("A generated guide page loads at most two scripts", heavy === 0, sample);
    check("Every generated guide page knows its own id", noFs === 0, `${noFs} do not`);

    /* Budgeted on transferred bytes, because that is what a phone on a train
       actually waits for. These files are heavily commented on purpose — the
       comments explain why the old architecture was wrong — and comments
       compress to almost nothing.

       The number that matters is not the absolute size but that it is now a
       CONSTANT. It was ~158KB uncompressed and grew with every guide added. */
    let raw = 0, gz = 0;
    for (const f of ["assets/js/mpc-runtime.js", "assets/js/guide.js"]) {
      const src = readIf(f) || "";
      raw += Buffer.byteLength(src);
      gz += zlib.gzipSync(Buffer.from(src), { level: 9 }).length;
    }
    check(`Guide-page JS transfers under 12KB gzipped (${(gz / 1024).toFixed(1)}KB, ` +
      `${(raw / 1024).toFixed(1)}KB raw)`, gz < 12 * 1024, `${gz} bytes gzipped`);

    /* The renderer is 16KB and a generated page must never need it. */
    check("The renderer is not on the critical path of a guide page",
      GENERATED.every(f => !/<script[^>]*src="[^"]*guide-render\.js/.test(readIf(f) || "")));
  }

  /* ---- the generated data files ---------------------------------------- */
  {
    const idxRaw = readIf("data/guide-index.json");
    const searchRaw = readIf("data/guide-search.json");
    check("data/guide-index.json is generated", !!idxRaw);
    check("data/guide-search.json is generated", !!searchRaw);

    if (idxRaw && searchRaw) {
      const idx = JSON.parse(idxRaw);
      const srch = JSON.parse(searchRaw);
      const live = GUIDES.filter(g => !(g.seo && g.seo.noindex));

      check("The index contains every indexable guide",
        idx.guides.length === live.length,
        `${idx.guides.length} indexed vs ${live.length} guides`);

      /* The whole point of the split. If a body ever leaks in here, the
         browse pages are back to downloading the library. */
      const FORBIDDEN = ["body", "panel", "callout", "originalQuestions",
        "sources", "medical", "seo", "references"];
      const leaked = new Set();
      for (const row of idx.guides) {
        for (const k of Object.keys(row)) if (FORBIDDEN.includes(k)) leaked.add(k);
      }
      check("The index carries no article content", leaked.size === 0,
        `leaked: ${[...leaked].join(", ")}`);

      const anyLong = idx.guides.some(r =>
        Object.values(r).some(v => typeof v === "string" && v.length > 300));
      check("No index field is article-sized", !anyLong);

      /* Budgets, per guide, so a regression shows up at 31 rather than at 300. */
      const idxPer = Buffer.byteLength(idxRaw) / Math.max(1, idx.guides.length);
      const srchPer = Buffer.byteLength(searchRaw) / Math.max(1, idx.guides.length);
      check(`Index stays under 300 B/guide (${Math.round(idxPer)} B)`, idxPer < 300);
      check(`Search text stays under 700 B/guide (${Math.round(srchPer)} B)`, srchPer < 700);

      /* At 500 guides these are the numbers that matter. */
      const at500 = (idxPer * 500) / 1024;
      check(`Index would be under 200KB at 500 guides (${at500.toFixed(0)}KB)`, at500 < 200);

      const excerpts = Object.values(srch.text).map(r => (r.t || "").length);
      const longest = Math.max(0, ...excerpts);
      check(`Search excerpts are capped (longest ${longest} chars)`, longest <= 260);

      /* Provenance must not leak into a public file. There is already a test
         that it never reaches a page; this extends it to the data layer. */
      check("No internal source ids in the public data",
        !/RAW-\d{8}/.test(idxRaw) && !/RAW-\d{8}/.test(searchRaw));
    }
  }

  /* ---- the browse pages ------------------------------------------------ */
  {
    for (const f of ["index.html", "guides.html"]) {
      const html = readIf(f) || "";
      const name = f.replace(".html", "");
      check(`${name}: filter pills are in the HTML`,
        (html.match(/class="pill(?: pill--age)?"/g) || []).length >= 10);
      /* The collapsed row summary is itself a .pill and is legitimately a
         button — it opens a row, it does not go anywhere. Only the filter
         pills need to be links. */
      check(`${name}: every filter pill is a followable link`,
        (html.match(/<a class="pill[^>]*data-(?:topic|age)=/g) || []).length >= 10 &&
        !/<button[^>]*class="pill"[^>]*data-(?:topic|age)=/.test(html));
      check(`${name}: facet counts are inline, not fetched`,
        /window\.MPC_FACETS=/.test(html));
    }
    const topicPage = topicSample[0] ? (readIf(topicSample[0]) || "") : "";
    if (topicPage) {
      check("Landing pages arrive with their filter already lit",
        /aria-pressed="true"/.test(topicPage));
    }
  }

  /* ---- resource hints and caching -------------------------------------- */
  {
    /* Every page opened a connection to firebasestorage.googleapis.com and no
       page ever fetched from it: illustrations are rewritten to
       /.netlify/images, which is this origin. */
    const offenders = ALL.filter(f =>
      /preconnect[^>]*firebasestorage/.test(readIf(f) || ""));
    check("No page preconnects to a host it never uses",
      offenders.length === 0, offenders.join(", "));

    /* THE TYPOGRAPHY IS NOT A PERFORMANCE LEVER.

       Baloo 2 is requested at 600, 700 and 800 and only ever renders at 700,
       so trimming it looks like free savings. It is not: a browser downloads a
       font file only when an element actually needs that weight, so the two
       unused weights were never fetched — they were only declared. The whole
       saving is about 260 bytes of text in a third-party stylesheet that is
       hard-cached anyway.

       Against that: if a future guide, a Studio-authored block or a restored
       .book-num ever renders the display face at another weight, the browser
       would substitute 700 and the heading would visibly thicken. A non-zero
       risk to the site's look for a rounding error in transfer size is a bad
       trade, so the font request is pinned exactly as it shipped.

       This check asserts the request is UNCHANGED. If it fails, somebody has
       altered the typography — which may be right, but it should be a
       deliberate design decision, not a performance one. */
    const FONT_URL = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800" +
      "&family=Patrick+Hand&family=Nunito:wght@400;600;700;800&display=swap";
    const fontPages = ALL.filter(f => /fonts\.googleapis\.com\/css2/.test(readIf(f) || ""));
    const altered = fontPages.filter(f => !(readIf(f) || "").includes(FONT_URL));
    check(`The font request is untouched on all ${fontPages.length} pages that use it`,
      altered.length === 0, altered.join(", "));

    const stamped = ALL.filter(f => {
      const html = readIf(f) || "";
      const refs = [...html.matchAll(/(?:href|src)="[^"]*assets\/(?:css|js)\/[^"]+"/g)];
      return refs.length && refs.some(m => !/\?v=[a-f0-9]{6,}/.test(m[0]));
    });
    check("Every CSS and JS reference carries a content hash",
      stamped.length === 0, stamped.join(", "));

    const headers = readIf("_headers") || "";
    check("Hashed assets are cached as immutable",
      /\/assets\/js\/\*\n\s*Cache-Control:[^\n]*immutable/.test(headers) &&
      /\/assets\/css\/\*\n\s*Cache-Control:[^\n]*immutable/.test(headers));
    check("The data files revalidate rather than sticking",
      /\/data\/\*\.json\n\s*Cache-Control:[^\n]*max-age=300/.test(headers));
    check("Generated HTML still revalidates on every visit",
      /\/guides\/\*\n\s*Cache-Control:[^\n]*must-revalidate/.test(headers));
  }

  /* ---- the LCP image --------------------------------------------------- */
  {
    let missing = [];
    for (const f of ["index.html", "guides.html", "popular.html"]) {
      const html = readIf(f) || "";
      const m = /<img[^>]*\bid="pageHeroImg"[^>]*>/.exec(html);
      if (!m || !/\ssrc="/.test(m[0])) missing.push(f);
    }
    /* It used to ship with no src at all, resolved from Firestore after the
       SDK had booted — so the largest image on the page could not be found by
       the preload scanner. */
    check("The hero image has a real src in the initial HTML",
      missing.length === 0, missing.join(", "));

    const lazyLcp = ["index.html", "guides.html", "popular.html"].filter(f => {
      const m = /<img[^>]*\bid="pageHeroImg"[^>]*>/.exec(readIf(f) || "");
      return m && /loading="lazy"/.test(m[0]);
    });
    check("The LCP image is never lazy-loaded", lazyLcp.length === 0, lazyLcp.join(", "));
  }

  /* ---- the guide-being-written-right-now path -------------------------
     Amir adds guides continuously, so the surface that renders a guide with no
     generated page yet is not an edge case — it is the normal state of the
     newest guide for a minute or two after every save. It has to work. */
  {
    const fallback = readIf("guide.html") || "";
    check("guide.html can reach Firestore for an unbuilt guide",
      /window\.MPC_FS=\{[^}]*"p":/.test(fallback),
      "without this every newly saved guide shows 'We can't find that one'");
    check("guide.html has an empty #article for the fallback to fill",
      /<div id="article"><\/div>/.test(fallback));
    check("guide.html carries no baked guide id",
      !/window\.MPC_GUIDE_ID/.test(fallback));
    check("guide.html loads the guide script",
      /<script[^>]*src="[^"]*assets\/js\/guide\.js/.test(fallback));
    check("The legacy/draft surface stays out of the index",
      /<meta name="robots" content="noindex/.test(fallback));

    const red = readIf("_redirects") || "";
    check("Unknown slugs still rewrite to it rather than 404ing",
      /\/guides\/\*\s+\/guide\.html\s+200/.test(red));

    /* Studio's live preview drives guide.html?draft=1 and the real guide URL. */
    const gjs = readIf("assets/js/guide.js") || "";
    check("Studio can still push a draft into a guide page",
      /window\.__renderPreview/.test(gjs));
    check("A draft preview does not try to look itself up",
      /params\.get\("draft"\)[\s\S]{0,60}return/.test(gjs));
  }

  /* ---- Studio's own script must not trip over itself -------------------
     `let longDraft = []` was declared below fillForm(), which uses it. Studio
     selects a guide during start-up, so the load ran while the variable was
     still in its temporal dead zone: a ReferenceError that aborted the load
     (no section boxes) AND stopped top-level execution, so the "+ Add another
     section" listener never attached. One cause, two symptoms, and nothing in
     the console unless you were looking.

     This checks every let/const at the top level of Studio's inline script is
     declared before the first function that mentions it. */
  {
    const studio = readIf("studio/index.html") || "";
    const blocks = [...studio.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => m[1]).filter(b => b.trim());
    const late = [];
    for (const b of blocks) {
      for (const m of b.matchAll(/^(?:let|const)\s+([A-Za-z_$][\w$]*)\s*=/gm)) {
        const name = m[1], declAt = m.index;
        /* the first function body above the declaration that names it */
        const before = b.slice(0, declAt);
        const re = new RegExp(`\\b${name}\\b`);
        for (const fn of before.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) {
          const body = before.slice(fn.index, before.indexOf("\n}", fn.index));
          if (re.test(body.slice(body.indexOf("{")))) { late.push(`${name} used by ${fn[1]}()`); break; }
        }
      }
    }
    check("No Studio variable is used above where it is declared",
      late.length === 0, late.join(" | "));

    /* Every function Studio's inline script CALLS must be one it defines, or
       one the browser provides. `renderLongform()` called esc() when Studio's
       escaper is escS() — a ReferenceError thrown inside fillForm(), which
       killed the section boxes AND everything after it, including loading the
       red box. Nothing in the UI said so.

       This is deliberately narrow: it checks the handful of short helper names
       that are easy to mistype, not every identifier. */
    {
      const js = blocks.join("\n");
      const defined = new Set();
      for (const m of js.matchAll(/(?:function\s+|(?:const|let|var)\s+)([A-Za-z_$][\w$]*)\s*(?:\(|=)/g)) {
        defined.add(m[1]);
      }
      const BUILTIN = new Set(["esc", "escS", "escapeHtml", "itemsToLines",
        "linesToItems", "markDirty", "renderLongform", "sectionsFromHTML"]);
      const missing = [];
      for (const name of BUILTIN) {
        const called = new RegExp(`(?<![\\w$.])${name}\\s*\\(`).test(js);
        if (called && !defined.has(name)) missing.push(name);
      }
      check("Studio calls no helper it does not define", missing.length === 0,
        `${missing.join(", ")} called but never defined`);
    }

    /* And the two escapes that only show up as literal text in the browser. */
    /* A \\uXXXX inside a JS string is fine; one sitting in markup renders as
       literal text, which is how "\\u26a0 Speak to your doctor if" reached the
       screen. Only the markup outside <script> is checked. */
    const markup = studio.replace(/<script[\s\S]*?<\/script>/g, "");
    check("No literal \\uXXXX escapes in Studio's markup",
      !/\\u[0-9a-fA-F]{4}/.test(markup));
  }

  /* ---- crawler parity is unaffected by all of the above ---------------- */
  {
    let thin = 0;
    for (const f of GENERATED) {
      const html = readIf(f) || "";
      /* Strip every script, then check the article is still there. This is the
         no-JavaScript view: what Googlebot, OAI-SearchBot and Bingbot get. */
      const noJs = html.replace(/<script[\s\S]*?<\/script>/g, "");
      const hasPanel = /class="gpanel/.test(noJs);
      const hasH1 = /<h1[\s>]/.test(noJs);
      const words = noJs.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      if (!hasPanel || !hasH1 || words < 120) thin++;
    }
    check("With every script removed, a guide page still has its article",
      thin === 0, `${thin} pages are thin without JS`);
  }
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
