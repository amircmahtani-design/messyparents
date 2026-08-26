#!/usr/bin/env node
/* ============================================================================
   RUNTIME SIMULATION

   Runs the public scripts, in Node, against the JSON the build actually wrote.

   `npm run verify` reads what landed on disk. `npm test` drives a real browser.
   This sits between them: it executes the rewritten client code, which is the
   part with no coverage otherwise, and checks that filtering and searching
   still return the right guides now that they read a metadata index instead of
   the full catalogue.

   Run with:  node tests/runtime-sim.js   (or as part of npm run verify)
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeWindow, makeEl } = require("./dom-stub");

const ROOT = path.resolve(__dirname, "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const readJs = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; return true; }
  fail++;
  failures.push(detail ? `${name} — ${detail}` : name);
  return false;
}
const tick = () => new Promise(r => setTimeout(r, 5));

async function main() {
  const index = readJson("data/guide-index.json");
  const search = readJson("data/guide-search.json");
  const settings = readJson("data/site-settings.json");
  const bundle = require("../data/guides-bundle.js");

  /* The facets the build writes inline. Read them out of the real page so the
     simulation cannot drift from what is actually served. */
  const homeHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const facets = JSON.parse(
    /window\.MPC_FACETS=(\{[\s\S]*?\});window\.MPC_T=/.exec(homeHtml)[1]);

  const json = {
    "/data/guide-index.json": index,
    "/data/guide-search.json": search,
    "/data/site-settings.json": settings
  };

  /* ---------------------------------------------------------------------
     1. The catalogue.
     ------------------------------------------------------------------ */
  console.log("\nCatalogue\n---------");
  const win = makeWindow({ json });
  win.MPC_FACETS = facets;
  vm.createContext(win);
  vm.runInContext(readJs("assets/js/mpc-runtime.js"), win);
  vm.runInContext(readJs("assets/js/mpc-catalogue.js"), win);

  const C = win.MPC.catalogue;
  check("The catalogue initialises", !!C);
  check("Topics come from the inline facets", C.topics.length === bundle.TOPICS.length);
  check("Counts are answerable before any fetch",
    C.count("", { topic: "sleeping" }) === facets.counts.topic.sleeping);
  check("The total is answerable before any fetch", C.count("", {}) === facets.total);
  check("The index has not been fetched yet", !C.hasIndex());

  await C.loadIndex();
  await tick();
  check("The index loads", C.hasIndex());
  check("Every indexable guide is in it",
    C.all().length === index.guides.length && index.guides.length > 0);

  /* Filtering must match the bundle exactly — this is the same list the build
     baked into the topic landing pages. */
  for (const tp of bundle.TOPICS) {
    const fromIndex = C.search("", { topic: tp.id }).map(g => g.id).sort();
    const fromBundle = bundle.GUIDES.filter(g => g.topic === tp.id).map(g => g.id).sort();
    check(`Topic filter "${tp.id}" returns the right guides`,
      JSON.stringify(fromIndex) === JSON.stringify(fromBundle),
      `${fromIndex.length} vs ${fromBundle.length}`);
  }
  for (const age of bundle.AGES.slice(0, 3)) {
    const fromIndex = C.search("", { age }).map(g => g.id).sort();
    const fromBundle = bundle.GUIDES.filter(g => g.ages.includes(age)).map(g => g.id).sort();
    check(`Age filter "${age}" returns the right guides`,
      JSON.stringify(fromIndex) === JSON.stringify(fromBundle));
  }

  /* Title-only search, before the search text has loaded. */
  check("Search works on titles before the search text arrives",
    C.search("nap", {}).length > 0 && !C.hasSearchText());

  await C.loadSearchText();
  await tick();
  check("The search text loads", C.hasSearchText());

  /* The queries a parent actually types. Each must find its guide, and find it
     first — this is the check that would catch the excerpt being cut too short
     or the keywords being dropped from the index. */
  const QUERIES = [
    ["nap", "wont-nap"],
    ["blocked nose", "blocked-nose-newborn"],
    ["drinking less milk", "drinking-less-milk"],
    ["smile", "is-that-a-real-smile"]
  ];
  for (const [q, expected] of QUERIES) {
    const hits = C.search(q, {});
    const found = hits.some(g => g.id === expected);
    check(`Search "${q}" finds ${expected}`, found,
      `got ${hits.slice(0, 3).map(g => g.id).join(", ") || "(nothing)"}`);
    if (found) {
      check(`Search "${q}" ranks ${expected} first`, hits[0].id === expected,
        `first was ${hits[0].id}`);
    }
  }
  check("A nonsense query returns nothing",
    C.search("qwertyuiop", {}).length === 0);
  check("Search and filter combine",
    C.search("nap", { topic: "sleeping" }).every(g => g.topic === "sleeping"));

  /* A card built from an index row must be byte-identical to the baked one. */
  const guidesHtml = fs.readFileSync(path.join(ROOT, "guides.html"), "utf8");
  const first = C.all()[0];
  const card = C.cardHTML(first);
  check("A card built in the browser matches the one baked into the page",
    guidesHtml.includes(card.split("\n")[0]),
    card.split("\n")[0].slice(0, 90));

  /* ---------------------------------------------------------------------
     2. The page scripts — do they run at all.
     ------------------------------------------------------------------ */
  console.log("\nPage scripts\n------------");

  function pageWindow(ids, extraSelectors) {
    const w = makeWindow({
      ids,
      selectors: Object.assign({ ".rows": makeEl("div"), ".site-head": makeEl("header") },
        extraSelectors || {}),
      json
    });
    w.MPC_FACETS = facets;
    vm.createContext(w);
    vm.runInContext(readJs("assets/js/mpc-runtime.js"), w);
    vm.runInContext(readJs("assets/js/mpc-catalogue.js"), w);
    return w;
  }

  /* Home */
  try {
    const w = pageWindow(["grid", "resultsTitle", "resultsHint", "resetBtn",
      "seeAll", "heroSearch", "heroQ", "topicRow", "ageRow",
      "topicSummary", "ageSummary", "year"]);
    vm.runInContext(readJs("assets/js/home.js"), w);
    await tick(); await tick();
    check("home.js runs without throwing", true);

    /* Type into the search box and make sure the grid gets redrawn. */
    w.byId.heroQ.value = "nap";
    w.byId.heroQ.dispatch("input");
    await tick(); await tick(); await tick();
    check("home.js redraws the grid on a search",
      w.byId.grid.innerHTML.includes('class="card"'),
      w.byId.grid.innerHTML.slice(0, 80));
    check("home.js caps the home grid at four",
      (w.byId.grid.innerHTML.match(/class="card"/g) || []).length <= 4);
  } catch (e) {
    check("home.js runs without throwing", false, e.message);
  }

  /* All guides */
  try {
    const w = pageWindow(["grid", "resultsTitle", "resultsCount", "resetBtn",
      "q", "searchForm", "topicRow", "ageRow", "topicSummary", "ageSummary", "year"]);
    vm.runInContext(readJs("assets/js/guides-search.js"), w);
    await tick(); await tick();
    check("guides-search.js runs without throwing", true);

    w.byId.q.value = "milk";
    w.byId.q.dispatch("input");
    await tick(); await tick(); await tick();
    check("guides-search.js renders results",
      w.byId.grid.innerHTML.includes('class="card"'),
      w.byId.grid.innerHTML.slice(0, 80));
    check("guides-search.js reports a count",
      /\d+ guide/.test(w.byId.resultsCount.textContent),
      w.byId.resultsCount.textContent);
  } catch (e) {
    check("guides-search.js runs without throwing", false, e.message);
  }

  /* Popular — should do nothing when the grids are already baked. */
  try {
    const w = pageWindow(["featured", "byTopic", "year"]);
    const populated = makeEl("div");
    populated.querySelector = () => makeEl("a");     // pretends a .card is present
    w.byId.featured.querySelector = () => makeEl("a");
    w.byId.byTopic.querySelector = () => makeEl("a");
    vm.runInContext(readJs("assets/js/popular.js"), w);
    await tick(); await tick();
    check("popular.js leaves a baked grid alone",
      w.byId.featured.innerHTML === "");
  } catch (e) {
    check("popular.js runs without throwing", false, e.message);
  }

  /* ---------------------------------------------------------------------
     3. The guide page — the one that matters most.
     ------------------------------------------------------------------ */
  console.log("\nGuide page\n----------");
  try {
    const article = makeEl("div");
    const panel = makeEl("div");
    panel._attrs["data-guide-hash"] = "lrusmu";
    panel._classes.push("gpanel");
    article.querySelector = (s) => (/gpanel/.test(s) ? panel : null);
    article.querySelectorAll = () => [];

    let fetched = 0;
    const w = makeWindow({ ids: ["article", "year"], json });
    w.byId.article = article;
    w.document.getElementById = (id) => (id === "article" ? article : w.byId[id] || null);
    w.MPC_GUIDE_ID = "blocked-nose-newborn";
    w.MPC_FS = { p: "messy-parents", k: "test-key" };
    w.location = { search: "", pathname: "/guides/blocked-nose-newborn/" };
    const baseFetch = w.fetch;
    w.fetch = (url, opts) => {
      if (/firestore\.googleapis\.com/.test(String(url))) fetched++;
      return baseFetch(url, opts);
    };
    vm.createContext(w);
    vm.runInContext(readJs("assets/js/mpc-runtime.js"), w);
    vm.runInContext(readJs("assets/js/guide.js"), w);
    await tick(); await tick();

    check("guide.js runs without throwing", true);
    check("A pre-rendered guide page does not touch the DOM on load",
      article.innerHTML === "");

    /* The freshness check is deferred, so it must NOT have fired synchronously
       and must never be a collection read. */
    await tick(); await tick(); await tick();
    check("The freshness check fires at most one document read", fetched <= 1,
      `${fetched} requests`);
  } catch (e) {
    check("guide.js runs without throwing", false, e.message);
  }

  /* ---------------------------------------------------------------------
     4. A GUIDE ADDED IN STUDIO SINCE THE LAST DEPLOY.

     This is the path Amir is on every time he writes a new guide, and it is
     the one with no static output to fall back on. Netlify rewrites the clean
     URL to guide.html, which arrives with an EMPTY #article and has to fetch
     the guide itself.

     The whole flow is simulated: an unbuilt slug, the real guide.html that the
     build wrote, and a stubbed Firestore that answers with a REST-shaped
     document. If any link in that chain breaks, a newly written guide shows
     "We can't find that one" — which is exactly what the redirect rule exists
     to prevent.
     ------------------------------------------------------------------ */
  console.log("\nA guide added since the last deploy\n-----------------------------------");
  try {
    const fallbackHtml = fs.readFileSync(path.join(ROOT, "guide.html"), "utf8");

    /* The config must be IN the served file. guide.js cannot look anything up
       without it, and guide.html is the surface that needs it most. */
    const fsCfg = /window\.MPC_FS=(\{[\s\S]*?\});/.exec(fallbackHtml);
    check("guide.html carries the Firestore config", !!fsCfg,
      "without it, every new guide 'does not exist' until the next deploy");
    check("guide.html has no baked guide id",
      !/window\.MPC_GUIDE_ID/.test(fallbackHtml));
    check("guide.html still has an empty #article to fill",
      /<div id="article"><\/div>/.test(fallbackHtml));

    /* Encode a real guide the way Firestore's REST API would return it. */
    const encode = (v) => {
      if (v === null || v === undefined) return { nullValue: null };
      if (typeof v === "string") return { stringValue: v };
      if (typeof v === "boolean") return { booleanValue: v };
      if (typeof v === "number") return Number.isInteger(v)
        ? { integerValue: String(v) } : { doubleValue: v };
      if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
      const fields = {};
      for (const k of Object.keys(v)) fields[k] = encode(v[k]);
      return { mapValue: { fields } };
    };

    const brandNew = JSON.parse(JSON.stringify(bundle.GUIDES[1]));
    brandNew.id = "a-guide-written-this-morning";
    brandNew.title = "A guide written this morning";
    const fsDoc = { fields: {} };
    for (const k of Object.keys(brandNew)) fsDoc.fields[k] = encode(brandNew[k]);

    const article = makeEl("div");
    article.querySelector = () => null;      // nothing pre-rendered — the point
    article.querySelectorAll = () => [];

    let docReads = 0, queryReads = 0, sdkLoads = 0, rendererLoads = 0;
    const w = makeWindow({ ids: ["article", "year"], json });
    w.byId.article = article;
    w.document.getElementById = (id) => (id === "article" ? article : w.byId[id] || null);
    w.MPC_FS = fsCfg ? JSON.parse(fsCfg[1]) : null;
    w.location = { search: "", pathname: "/guides/a-guide-written-this-morning/" };

    const base = w.fetch;
    w.fetch = (url, opts) => {
      const u = String(url);
      if (/firebasejs|gstatic/.test(u)) sdkLoads++;
      if (/:runQuery/.test(u)) { queryReads++; return Promise.resolve({ ok: true, json: () => Promise.resolve([]) }); }
      if (/\/documents\/guides\//.test(u)) {
        docReads++;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(fsDoc) });
      }
      return base(u, opts);
    };
    /* The renderer is injected as a <script>; serve the real file. */
    w.document.createElement = (tag) => {
      const el = makeEl(tag);
      if (tag === "script") {
        Object.defineProperty(el, "src", {
          set(v) {
            rendererLoads++;
            vm.runInContext(readJs(v.split("?")[0].replace(/^\//, "")), w);
            /* guide.js assigns s.onload rather than adding a listener. */
            setTimeout(() => { if (el.onload) el.onload(); el.dispatch("load"); }, 0);
          },
          get() { return ""; }
        });
      }
      return el;
    };

    vm.createContext(w);
    vm.runInContext(readJs("assets/js/mpc-runtime.js"), w);
    vm.runInContext(readJs("assets/js/guide.js"), w);
    for (let i = 0; i < 12; i++) await tick();

    check("The new guide is fetched with exactly one document read",
      docReads === 1, `${docReads} document reads, ${queryReads} queries`);
    check("No Firebase SDK is loaded to do it", sdkLoads === 0);
    check("The renderer is fetched on demand", rendererLoads === 1,
      `${rendererLoads} loads`);
    check("The guide is rendered into the page",
      /class="gpanel/.test(article.innerHTML),
      article.innerHTML.slice(0, 100) || "(empty)");
    check("It is NOT marked noindex — it exists",
      !w.document.head.children.some(c => c.content === "noindex, follow"));
    check("The page title becomes the guide's own",
      /A guide written this morning/.test(w.document.title || ""),
      w.document.title);

    /* And the opposite case: a slug that genuinely does not exist must still
       mark itself, or a dead URL returning 200 could enter the index. */
    const gone = makeEl("div");
    gone.querySelector = () => null;
    gone.querySelectorAll = () => [];
    const w2 = makeWindow({ ids: ["article", "year"], json });
    w2.byId.article = gone;
    w2.document.getElementById = (id) => (id === "article" ? gone : w2.byId[id] || null);
    w2.MPC_FS = w.MPC_FS;
    w2.location = { search: "", pathname: "/guides/no-such-guide/" };
    w2.fetch = (url) => /firestore/.test(String(url))
      ? Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) })
      : Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) });
    vm.createContext(w2);
    vm.runInContext(readJs("assets/js/mpc-runtime.js"), w2);
    vm.runInContext(readJs("assets/js/guide.js"), w2);
    for (let i = 0; i < 12; i++) await tick();
    check("A slug that does not exist marks itself noindex",
      w2.document.head.children.some(c => c.content === "noindex, follow"));
    check("...and says so rather than showing a blank page",
      /can\u2019t find that one/.test(gone.innerHTML), gone.innerHTML.slice(0, 80));
  } catch (e) {
    check("The new-guide path works", false, e.message + "\n" + (e.stack || "").split("\n")[1]);
  }

  /* ------------------------------------------------------------------ */
  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach(f => console.log("  \u2717 " + f));
  }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
}

main().catch(err => {
  console.error("Runtime simulation crashed:", err && err.stack || err);
  process.exit(1);
});
