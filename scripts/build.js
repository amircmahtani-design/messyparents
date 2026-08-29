#!/usr/bin/env node
/* ============================================================================
   THE BUILD

   Runs on Netlify, on every deploy, and whenever Studio triggers a rebuild.
   It never runs on Amir's machine and never needs a terminal.

   What it does, in order:

     1. Reads every guide (Firestore first, bundled copy as a fallback).
     2. Writes a real, complete HTML page for each one at /guides/<slug>/.
     3. Writes topic and age landing pages.
     4. Bakes crawlable guide links into the home, popular and all-guides pages
        so no guide is an orphan.
     5. Writes sitemap.xml, robots.txt, llms.txt and _redirects from that same
        data, so they can never disagree with each other.
     6. Runs the SEO audit and writes a private report.

   THE ONE RULE: this script must not fail a deploy. Priority 1 in the brief is
   "do not break the live website", and a build that throws takes the whole site
   down with it. Every risky step is wrapped, every failure degrades to
   something sensible, and the process always exits 0. Problems are reported
   loudly in the build log and in the audit instead.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const S = require("./lib/site");
const { load, plain, clamp } = require("./lib/data");
const H = require("./lib/head");
const { runAudit, writeAuditPage } = require("./lib/audit");
const R = require("../assets/js/guide-render.js");
const B = require("./lib/bake");
const PD = require("./lib/publicdata");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ---------------------------------------------------------------------------
   ASSET VERSIONING

   The stylesheets and scripts were cached for a week, with hand-maintained
   `?v=11` query strings that had to be remembered on every edit and were
   already out of step across pages (guides.js was ?v=9 on four pages and ?v=10
   on two).

   Every reference is now stamped with a hash of the file's actual contents, so
   the URL changes if and only if the file does. That makes them safe to cache
   for a year as immutable (see _headers), which means a returning reader
   re-downloads a stylesheet only when it has genuinely changed — and gets the
   new one immediately when it has, with no manual version bump to forget.
   ------------------------------------------------------------------------ */
const assetHashes = new Map();
function assetHash(rel) {
  if (assetHashes.has(rel)) return assetHashes.get(rel);
  let h = "0";
  try {
    h = crypto.createHash("sha1")
      .update(fs.readFileSync(path.join(ROOT, rel)))
      .digest("hex").slice(0, 10);
  } catch (e) { /* referenced but missing: leave it unversioned */ }
  assetHashes.set(rel, h);
  return h;
}

/* Rewrite every /assets/** reference in a page to carry its content hash.
   Any hand-written ?v= is replaced, so the two schemes cannot disagree. */
function stampAssets(html) {
  return html.replace(
    /((?:href|src)=")(\/?(?:\.\.\/)?assets\/(?:css|js)\/[A-Za-z0-9._-]+\.(?:css|js))(?:\?[^"]*)?"/g,
    (m, pre, url) => {
      const rel = url.replace(/^\.\.\//, "").replace(/^\//, "");
      return `${pre}${url}?v=${assetHash(rel)}"`;
    });
}

const log = (...a) => console.log("[seo]", ...a);
const problems = [];
const note = (msg) => { problems.push(msg); console.warn("[seo] !", msg); };

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

/* ---------------------------------------------------------------------------
   Template plumbing
   ------------------------------------------------------------------------ */

/* Replace the content between <!-- MPC:NAME:START --> and <!-- MPC:NAME:END -->.
   Markers are left in place so the operation is repeatable. */
function marker(html, name, content) {
  const re = new RegExp(
    `(<!--\\s*MPC:${name}:START\\s*-->)[\\s\\S]*?(<!--\\s*MPC:${name}:END\\s*-->)`
  );
  if (!re.test(html)) { note(`Template marker MPC:${name} not found — skipped.`); return html; }
  return html.replace(re, (_m, a, b) => a + "\n" + content + "\n" + b);
}

/* Generated pages live two levels deep (/topics/sleeping/), so any relative
   href or src in the template would resolve against the wrong directory. This
   rewrites them to root-absolute. Absolute, external, anchor and data URLs are
   left exactly as they are. */
function absolutise(html) {
  /* Only attributes that genuinely hold a URL. `content` is deliberately NOT
     in this list: on a <meta> tag it holds prose ("width=device-width"), and
     rewriting it corrupts the viewport and the app title. The meta URLs that
     do matter are written absolute by head.js in the first place. */
  return html.replace(
    /(\s(?:href|src|action|data-default)=")(?!https?:|data:|mailto:|tel:|\/|#|\{)([^"]+)"/g,
    (m, pre, url) => `${pre}/${url.replace(/^\.\//, "")}"`);
}

/* Insert (or refresh) the generated SEO block just before </head> on the
   hand-written pages, which have no marker of their own. */
function injectHead(html, block) {
  const wrapped = `<!-- MPC:SEO:START -->\n${block}\n<!-- MPC:SEO:END -->`;
  if (/<!--\s*MPC:SEO:START\s*-->/.test(html)) {
    return html.replace(/<!--\s*MPC:SEO:START\s*-->[\s\S]*?<!--\s*MPC:SEO:END\s*-->/, wrapped);
  }
  return html.replace(/<\/head>/i, wrapped + "\n</head>");
}

const titleOf = (html) => {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : S.SITE_NAME;
};
const descOf = (html) => {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? m[1].trim() : S.TAGLINE;
};

/* ---------------------------------------------------------------------------
   Main
   ------------------------------------------------------------------------ */

async function main() {
  const t0 = Date.now();
  const data = await load();
  const { guides, topics, ages, settings, meta } = data;

  data.warnings.forEach(note);
  log(`${guides.length} guides from ${data.source}`);

  /* -------------------------------------------------------------------------
     AGE RANGES THAT ARE SWITCHED OFF

     `ages` and `guides` above are already the public view — scripts/lib/data.js
     applied the switch before anything here saw the data, so every landing
     page, pill row, sitemap entry, search index, breadcrumb and prev/next link
     below is correct without a single extra check.

     The two things that still need saying out loud are the build log (so a
     deploy shows what it held back) and the 404 rules further down (so a
     hidden guide's own URL stops resolving).
     ---------------------------------------------------------------------- */
  const hiddenAges = data.ageVisibility.hidden;
  const hiddenGuides = data.hiddenGuides;
  if (hiddenAges.length) {
    log(`age ranges switched off: ${hiddenAges.join(", ")} ` +
        `— ${hiddenGuides.length} guide(s) held back, ${guides.length} published`);
    log("  (Studio -> Site -> Ages. Nothing is deleted.)");
  }

  if (!guides.length) {
    note("No guides available from any source. Leaving the existing site untouched.");
    return;
  }

  /* -------------------------------------------------------------------------
     WHEN FIRESTORE COULD NOT BE READ

     This used to be a soft landing: the build fell back to the bundled copy,
     and anything newer than that copy still appeared on the live site anyway,
     because every page read the guides collection in the browser.

     That is no longer true. The public site is static, so what this build
     writes IS the site. A build that falls back to the bundle after Amir has
     added guides publishes a site that is missing them from the guide list,
     the search index, the topic and age pages and the sitemap. The guides
     themselves still resolve — _redirects rewrites their URLs to guide.html,
     which fetches them one document at a time — but they are effectively
     unfindable until a good build runs.

     So this is now shouted rather than mentioned, and there is a switch for
     refusing to publish at all. Set MPC_REQUIRE_FIRESTORE=1 in Netlify's
     environment variables and a failed read exits non-zero, which makes
     Netlify keep the PREVIOUS deploy live instead of replacing it with a
     regressed one. That is off by default, because the original decision —
     never fail a deploy — was deliberate and is Amir's to change.
     ---------------------------------------------------------------------- */
  if (data.source !== "firestore") {
    const bundleAge = (function () {
      try {
        const st = fs.statSync(path.join(ROOT, "data/guides-bundle.js"));
        return Math.round((Date.now() - st.mtimeMs) / 86400000);
      } catch (e) { return null; }
    })();

    note(`Firestore could not be read — built from ${data.source} instead.`);
    console.warn("[seo] ==========================================================");
    console.warn("[seo]  THIS BUILD DID NOT SEE FIRESTORE.");
    console.warn("[seo]");
    console.warn(`[seo]  It published ${guides.length} guides from the ${data.source} copy` +
      (bundleAge != null ? `, last changed ${bundleAge} day(s) ago.` : "."));
    console.warn("[seo]  Any guide added or edited in Studio since then is NOT in the");
    console.warn("[seo]  guide list, the search index, the landing pages or the sitemap.");
    console.warn("[seo]  Their own URLs still work.");
    console.warn("[seo]");
    console.warn("[seo]  Fix: trigger another deploy. If it keeps happening, check the");
    console.warn("[seo]  Firebase project and the key in assets/js/firebase-config.js.");
    console.warn("[seo]  To make a failed read keep the previous deploy live instead of");
    console.warn("[seo]  publishing this one, set MPC_REQUIRE_FIRESTORE=1 in Netlify.");
    console.warn("[seo] ==========================================================");

    if (process.env.MPC_REQUIRE_FIRESTORE === "1") {
      console.error("[seo] MPC_REQUIRE_FIRESTORE=1 — refusing to publish a build that " +
        "could not read Firestore. The previous deploy stays live.");
      process.exitCode = 1;
      return;
    }
  }

  const byId = new Map(guides.map(g => [g.id, g]));
  const topicLabel = (id) => {
    const t = topics.find(x => x.id === id);
    return t ? t.label : id;
  };
  const iconFor = (g) => {
    const t = topics.find(x => x.id === g.topic);
    if (t && t.icon) {
      /* Mirrors topicIconMarkup() in mpc-store.js: a Studio-uploaded icon can
         be an image path or a short emoji glyph. */
      const v = String(t.icon).trim();
      if (/^(https?:|data:|\.?\/|assets\/)/i.test(v) || /\.(webp|png|jpe?g|svg|gif)$/i.test(v)) {
        const abs = /^(https?:|data:|\/)/i.test(v) ? v : "/" + v.replace(/^\.?\//, "");
        return `<img src="${R.esc(R.img(abs, 120))}" alt="" aria-hidden="true">`;
      }
      return `<span class="pill-ico" aria-hidden="true">${R.esc(v)}</span>`;
    }
    /* Matches the ICONS map in guides.js exactly. */
    return `<img src="/assets/img/icons/${g.topic}.webp" alt="" aria-hidden="true">`;
  };
  const t = (key, fallback) => {
    const v = settings.text[key];
    return (v == null || String(v).trim() === "") ? fallback : String(v);
  };

  const renderOpts = (g) => ({ t, iconHTML: iconFor(g), topicLabel, iconFor });

  /* =========================================================================
     BAKING — Studio's editable content, resolved here instead of in the
     browser.

     Everything below this line used to require the Firebase SDK, a Firestore
     connection and a read of the `pages` and `meta` collections before a
     public page could show the right words, footer, hero illustration, topic
     pills or book list. It is the same data, applied once per deploy, from the
     same source. See scripts/lib/bake.js.
     ====================================================================== */

  /* The merged text map for a page: site-wide values, then that page's own,
     which win. Same precedence as buildTextMap() in the old mpc-store.js. */
  function textFor(pageId) {
    const site = (data.pages.site && data.pages.site.text) || {};
    const own = (data.pages[pageId] && data.pages[pageId].text) || {};
    const out = {};
    for (const src of [site, own]) {
      for (const k of Object.keys(src)) {
        const v = src[k];
        if (v != null && String(v).trim() !== "") out[k] = String(v);
      }
    }
    return out;
  }

  /* The handful of strings that page scripts build themselves (result counts,
     empty states, the "See all" link) rather than reading out of the markup.
     Those cannot be baked into an element, so they are written inline as a
     small object. Filtered to the prefixes the scripts actually use, so a long
     prose override on some other key is not shipped with them. */
  const SCRIPT_TEXT = /^(results|empty|related|search)\./;
  function scriptText(pageId) {
    const all = textFor(pageId), out = {};
    for (const k of Object.keys(all)) if (SCRIPT_TEXT.test(k)) out[k] = all[k];
    return out;
  }

  const facetData = PD.facets(guides, topics, ages, (id) => {
    const g = guides.find(x => x.topic === id);
    return g ? iconFor(g) : `<img src="/assets/img/icons/${id}.webp" alt="" aria-hidden="true">`;
  });

  const pillTopics = topics.map(tp => ({
    id: tp.id, label: tp.label, iconHTML: facetData.icons[tp.id] || ""
  }));

  /* Firestore project + key, inline. guide.js needs these for the two
     off-path cases (a guide with no generated page yet, and the once-per-
     session freshness check) and fetches ONE document over REST with them.
     They are the same public values that were already being served in
     firebase-config.js — which every page loaded, and which is now loaded by
     none of them. */
  const fbCfg = (function () {
    try {
      const src = read("assets/js/firebase-config.js");
      const p = /projectId:\s*"([^"]+)"/.exec(src);
      const k = /apiKey:\s*"([^"]+)"/.exec(src);
      return (p && k) ? { p: p[1], k: k[1] } : null;
    } catch (e) { return null; }
  })();
  /* Alongside it, the age bands that are switched off.

     guide.js needs this for exactly one reason. _redirects rewrites any
     /guides/<slug>/ it did not generate to guide.html, which then looks the
     slug up in Firestore and renders whatever it finds — which is what lets a
     guide saved in Studio five minutes ago work before the next deploy. Without
     this list that same path would happily render a guide whose age range is
     off, straight from Firestore, on its real public URL. The build writes
     explicit 404 rules for every hidden slug it knows about; this covers the
     one it cannot know about, a guide moved into a hidden band since the last
     deploy. Empty array when nothing is hidden. */
  const runtimeInline =
    (fbCfg ? `window.MPC_FS=${JSON.stringify(fbCfg)};` : "") +
    `window.MPC_HIDDEN_AGES=${JSON.stringify(hiddenAges)};`;

  /* ---- critical CSS, inlined ---------------------------------------------
     First Contentful Paint was 2.7s on a phone against 0.7s on desktop, and
     almost none of that was download: the two stylesheets are 11KB gzipped,
     about 55ms of transfer. The cost was the round trip. The browser had to
     receive the document, parse the head, ask for two more files, wait a full
     RTT on a 150ms link, and only then could it draw anything — while ~110KB
     of fonts competed for the same pipe.

     Inlined, the CSS arrives inside the document. There is nothing to ask for
     and nothing to wait on, so first paint happens as soon as the document is
     parsed.

     WHY THIS IS SAFE TO DO AT BUILD TIME, AND NOT BY HAND

     The stylesheets stay the real files and the only copies anyone edits.
     This reads them at deploy and pastes them in. There is no second source
     of truth and nothing to keep in step — which is the whole reason not to
     hand-maintain a "critical subset" instead. tokens.css exists because
     three blues and two creams once drifted apart in separate files; this
     would be that mistake again with worse consequences.

     FAIL-SAFE

     The repo always contains working stylesheet links inside the markers. If
     a file cannot be read, this returns the HTML untouched and the page ships
     with the links exactly as it does today. The worst case is the current
     behaviour, never a page with no CSS at all.

     IDEMPOTENT

     The build rewrites files in the checkout, and guide.html is written back
     over itself. After one pass the links are gone, so the file list is
     carried on the style tag in data-mpc-css and read back on the next pass.

     TWO THINGS THAT WOULD BREAK SILENTLY IF NOT HANDLED

     1. url() is resolved against the DOCUMENT once inlined, not against
        assets/css/. style.css asks for url("../img/paper.jpg"), which would
        become /img/paper.jpg — a 404, and the paper texture would vanish.
        Every relative url() is rewritten root-absolute here.
     2. style.css opens with @import url("tokens.css"). Inlined that resolves
        to /tokens.css, another 404. Any @import of a file being inlined is
        dropped, since its contents are already in the block.

     Comments are stripped from the inlined copy only — the files on disk keep
     every word. On this codebase that is worth 4.7KB gzipped per page, which
     is not a rounding error when it rides inside every document. */
  const CSS_MARK = /(<!--\s*MPC:CSS:START\s*-->)([\s\S]*?)(<!--\s*MPC:CSS:END\s*-->)/;

  function inlineCss(html, label) {
    const m = CSS_MARK.exec(html);
    if (!m) return html;                       /* no marker: nothing to do */

    const inner = m[2];
    const listed = (/data-mpc-css="([^"]*)"/.exec(inner) || [])[1];
    const files = listed
      ? listed.split(",").filter(Boolean)
      : [...inner.matchAll(/href="([^"]*assets\/css\/[^"?]+\.css)[^"]*"/g)]
          .map(x => x[1].replace(/^\//, ""));

    if (!files.length) { note(`${label}: CSS marker found but no stylesheet listed — left as links.`); return html; }

    let css = "";
    for (const rel of files) {
      let text;
      try { text = read(rel); }
      catch (e) { note(`${label}: could not read ${rel} (${e.message}) — CSS left as links.`); return html; }

      text = text.replace(/\/\*[\s\S]*?\*\//g, "");          /* comments      */
      /* Drop @imports of anything already being inlined; keep any other. */
      text = text.replace(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)\s*;/g, (whole, target) => {
        const abs = path.posix.normalize(path.posix.join(path.posix.dirname(rel), target));
        return files.includes(abs) ? "" : whole;
      });
      /* Relative url() -> root-absolute, resolved from the stylesheet's own
         folder before the document ever sees it. */
      text = text.replace(/url\(\s*(["']?)(?!data:|https?:|\/|#)([^"')]+)\1\s*\)/g,
        (whole, q, target) =>
          `url("/${path.posix.normalize(path.posix.join(path.posix.dirname(rel), target))}")`);
      text = text.replace(/\n\s*\n+/g, "\n").trim();
      css += text + "\n";
    }

    if (!/--cream\s*:/.test(css)) {
      note(`${label}: inlined CSS is missing the design tokens — left as links.`);
      return html;
    }
    return html.replace(CSS_MARK,
      `$1<style data-mpc-css="${files.join(",")}">\n${css}</style>$3`);
  }

  /* Applied to every generated and hand-written page. */
  function bakeCommon(html, pageId) {
    html = B.applyText(html, textFor(pageId));
    html = B.applyFooter(html, settings.footer);
    html = stampAssets(html);
    html = inlineCss(html, pageId || "page");
    return html;
  }

  /* Inline data for the browse scripts: pills, counts, and the script-built
     strings. A few hundred bytes, present before the deferred scripts run, so
     nothing pops in afterwards. */
  function inlineFacets(html, pageId) {
    const payload = `<script>window.MPC_FACETS=${JSON.stringify(facetData)};` +
      `window.MPC_T=${JSON.stringify(scriptText(pageId))};</script>`;
    if (/<!--\s*MPC:FACETS:START\s*-->/.test(html)) {
      return html.replace(/<!--\s*MPC:FACETS:START\s*-->[\s\S]*?<!--\s*MPC:FACETS:END\s*-->/,
        `<!-- MPC:FACETS:START -->${payload}<!-- MPC:FACETS:END -->`);
    }
    return html.replace(/<\/head>/i,
      `<!-- MPC:FACETS:START -->${payload}<!-- MPC:FACETS:END -->\n</head>`);
  }

  /* ---- 1. Guide pages -------------------------------------------------- */

  /* Baked once, not once per guide: the header, footer and editable wording
     are identical on all of them.

     MPC_FS goes into the TEMPLATE, not into each generated page, because the
     surface that needs it most is guide.html itself. A guide saved in Studio
     since the last deploy has no generated page, so _redirects rewrites its
     clean URL here — and without the project id and key, guide.js has nothing
     to look the guide up with and would show "We can't find that one" for a
     guide that exists. That is precisely the failure this architecture was
     built to avoid (see "HTTP status codes" in SEO_AI_ARCHITECTURE.md). */
  const guideTpl = (function () {
    let html = bakeCommon(absolutise(read("guide.html")), "guide");
    /* Both keys are stripped before being re-added, so running the build twice
       over the same tree replaces the block instead of stacking copies of it. */
    html = html.replace(/<script>window\.MPC_(?:FS|HIDDEN_AGES)=[\s\S]*?<\/script>\s*/g, "");
    return html.replace("</head>", `<script>${runtimeInline}</script>\n</head>`);
  })();

  /* guide.html is served, not just used as a template: _redirects rewrites any
     unknown /guides/<slug>/ to it so a guide saved since the last deploy still
     renders. So it needs the same baked wording, the same hashed asset URLs and
     the same Firestore config as everything else. Writing it back is safe to
     repeat — applyText restores from data-mpc-default before re-applying,
     stampAssets replaces any existing ?v=, and the MPC_FS block is stripped
     before it is re-added. */
  write("guide.html", guideTpl);

  let built = 0;

  for (const g of guides) {
    try {
      const on = (perGuide, siteDefault) =>
        (perGuide === undefined || perGuide === null) ? siteDefault : !!perGuide;

      const showCrumbs  = on(g.showBreadcrumbs, settings.sections.breadcrumbs);
      const showDetail  = on(g.showDetail,      settings.sections.detail);
      const showQs      = on(g.showQuestions,   settings.sections.questions);
      const showRelated = on(g.showRelated,     settings.sections.related);

      const crumbs = R.crumbTrail(g, {
        topicLabel,
        ageUrl: (label) => S.ageUrl(S.ageSlug(label))
      });

      /* The rendered panel, built once. The hero's src is lifted straight out
         of it a few lines down rather than recomputed, because a preload whose
         URL differs from the img's by even one character is not a head start —
         it is a second download of the same picture. */
      const panelHTML = R.panelMarkup(g, renderOpts(g));
      const heroSrc = (panelHTML.match(/<div class="g-art"><img src="([^"]+)"/) || [])[1] || "";

      const head = H.metaBlock({
        title: `${g.computed.metaTitle} \u2014 ${S.SITE_NAME}`,
        description: g.computed.metaDescription,
        canonical: g.canonicalOverride || g.url,
        image: g.image,
        imageAlt: g.imageAlt,
        noindex: g.noindex,
        type: "article",
        verification: settings.verification,
        schema: H.articleSchema(g, {
          topicLabel: topicLabel(g.topic),
          showBreadcrumbs: showCrumbs,
          crumbs
        })
      });

      /* PRELOAD THE ILLUSTRATION.

         It is already loading="eager" with fetchpriority="high", but the
         browser cannot act on either until the parser reaches the <img> — and
         on this page that is after the whole of the inlined stylesheet. A
         preload in the head starts the request in the first few hundred bytes
         of the document instead, which on a slow connection is most of the
         gap between "the picture is just there" and watching it arrive.

         It does NOT help the two slow cases that have nothing to do with the
         browser: a guide whose hero was attached after the last deploy (no
         baked image at all — guide.js has to fetch it), and the first ever
         request for a given transform, which Netlify generates on demand from
         Firebase Storage before it can be edge-cached. */
      let html = guideTpl;
      html = marker(html, "HEAD", head +
        (heroSrc ? `\n<link rel="preload" as="image" href="${heroSrc}" fetchpriority="high">` : ""));
      html = marker(html, "CRUMB",
        showCrumbs ? `<div class="gpage-crumb">${R.crumbHTML(crumbs)}</div>` : "");

      /* Everything below the panel. The panel itself is sized to the viewport
         by guide-page.js, so all of this starts below the fold and the
         one-screen guide is unchanged on first paint. */
      const extras = [];
      /* Previous and next in the library's own order. Written by the build as
         real links, so they are crawlable and every guide picks up two more
         inbound links from its neighbours. */
      const pos = guides.indexOf(g);
      extras.push(R.prevNextHTML(guides[pos - 1] || null, guides[pos + 1] || null, { t }));

      const detail = showDetail ? R.detailHTML(g, { t }) : "";
      const qs = showQs ? R.questionsHTML(g, { t }) : "";
      const refs = R.referencesHTML(g);
      if (detail || qs || refs) {
        extras.push(`<div class="g-extra">${detail}${qs}${refs}</div>`);
      }
      if (showRelated) {
        const rel = g.related.map(id => byId.get(id)).filter(Boolean);
        extras.push(`<div class="gpage-related">${
          rel.length ? R.relatedHTML(g, rel, renderOpts(g)) : ""
        }</div>`);
      }
      html = marker(html, "EXTRA", extras.join("\n"));

      /* The rendered guide, and the id so the client script knows which guide
         it is looking at without a query string. MPC_FS is already in the
         template above. */
      html = html.replace(
        '<div id="article"></div>',
        `<div id="article">\n${panelHTML}\n</div>\n` +
        `<script>window.MPC_GUIDE_ID=${JSON.stringify(g.id)};</script>`
      );

      write(path.join("guides", g.slug, "index.html"), html);
      built++;
    } catch (e) {
      note(`Could not build /guides/${g.slug}/ — ${e.message}`);
    }
  }
  log(`${built} guide pages written`);

  /* ---- 1b. Remove pages for guides that no longer exist -----------------
     On Netlify this is usually a no-op: every deploy starts from a fresh
     checkout, so there is nothing stale to find. It matters in two cases
     that do happen.

     A slug renamed in Studio leaves its old directory behind on any tree the
     build runs against twice. That directory still contains a complete,
     indexable page with its own canonical — a duplicate of the guide at its
     new address, which is exactly what the redirect machinery exists to
     prevent. And a deleted guide leaves a page nothing links to but search
     engines still hold.

     Only directories this build knows how to produce are ever removed, and
     only under /guides, /topics and /ages. Nothing else is touched. */
  function prune(dir, keep, label) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return 0;
    let removed = 0;
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (keep.has(entry.name)) continue;
      /* Only ever delete something that looks like our own output. */
      const page = path.join(full, entry.name, "index.html");
      if (!fs.existsSync(page)) continue;
      try {
        fs.rmSync(path.join(full, entry.name), { recursive: true, force: true });
        removed++;
      } catch (e) { note(`Could not remove stale ${label} /${entry.name}/ — ${e.message}`); }
    }
    return removed;
  }

  const staleGuides = prune("guides", new Set(guides.map(g => g.slug)), "guide");
  if (staleGuides) log(`${staleGuides} stale guide page(s) removed`);

  /* ---- 2. Topic and age landing pages ---------------------------------- */

  /* Baked once for all twelve landing pages: the wording, the footer, the
     hero illustration and the asset hashes are identical across them. Only
     the pills (which reflect the prefilter) and the cards differ. */
  const listTpl = inlineFacets(
    B.applyHero(
      bakeCommon(absolutise(read("guides.html")), "guides"),
      data.pages.guides, R.img),
    "guides");

  function landingPage({ url, file, h1, intro, list, prefilter, description }) {
    let html = listTpl;
    html = injectHead(html, H.metaBlock({
      title: `${h1} \u2014 ${S.SITE_NAME}`,
      description,
      canonical: url,
      type: "website",
      verification: settings.verification,
      schema: H.collectionSchema({ url, name: h1, description, guides: list })
    }));
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${H.esc(h1)} \u2014 ${S.SITE_NAME}</title>`);
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*"/i,
      `<meta name="description" content="${H.esc(description)}"`);

    html = html.replace(/(<h1 data-page-title>)[\s\S]*?(<\/h1>)/, `$1${H.esc(h1)}$2`);
    html = html.replace(/(<p data-page-subtitle>)[\s\S]*?(<\/p>)/, `$1${H.esc(intro)}$2`);

    /* Real cards in the HTML, plus the hash of what was baked so the client
       can leave them alone when they are already correct. */
    html = bakeGrid(html, "grid", list);
    /* The filter row, with this page's own filter already lit. It used to be
       built in the browser from TOPICS and AGES, which meant the whole guide
       catalogue had to load before five buttons could appear. */
    html = B.applyPills(html, pillTopics, ages, prefilter);
    /* A landing page is a leaf, not a hub: it must not repeat the full
       topic/age link list that lives on /guides.html. */
    html = marker(html, "BROWSELINKS", "");
    /* Tells the page script which filter this landing page represents, so the
       existing filter UI lights up correctly without a query string. */
    html = html.replace("</head>",
      `<script>window.MPC_PREFILTER=${JSON.stringify(prefilter)};</script>\n</head>`);

    write(file, html);
  }

  /* When a filter is active, guides.html renders searchGuides(), which sorts
     alphabetically by title. The baked cards have to be in that same order or
     the grid visibly reorders itself the moment the script runs — and the hash
     check would never match, so it would happen on every single visit. */
  const inClientOrder = (list) =>
    list.slice().sort((a, b) => a.title.localeCompare(b.title));

  const topicPages = [];
  for (const tp of topics) {
    const list = inClientOrder(guides.filter(g => g.topic === tp.id && !g.noindex));
    if (!list.length) continue;   // never publish an empty archive page
    const url = S.topicUrl(tp.id);
    topicPages.push({ url, label: tp.label, count: list.length });
    landingPage({
      url, file: path.join("topics", tp.id, "index.html"),
      h1: `${tp.label} guides`,
      intro: `Every ${tp.label.toLowerCase()} question we have written up, in three-minute answers.`,
      description: clamp(
        `${list.length} three-minute ${tp.label.toLowerCase()} guides for the first two years, ` +
        `written by parents. ${list.slice(0, 3).map(g => g.title).join(" ")}`, 155),
      list, prefilter: { topic: tp.id }
    });
  }

  const agePages = [];
  for (const age of ages) {
    const list = inClientOrder(guides.filter(g => g.ages.includes(age) && !g.noindex));
    if (!list.length) continue;
    const slug = S.ageSlug(age);
    const url = S.ageUrl(slug);
    agePages.push({ url, label: age, count: list.length });
    landingPage({
      url, file: path.join("ages", slug, "index.html"),
      h1: `Guides for ${age}`,
      intro: `The questions that come up at ${age}, answered in three minutes.`,
      description: clamp(
        `${list.length} three-minute guides for a baby of ${age} — feeding, sleeping, ` +
        `development, health and staying sane. Written by parents, not doctors.`, 155),
      list, prefilter: { age }
    });
  }
  const staleT = prune("topics", new Set(topics.map(tp => tp.id)), "topic");
  const staleA = prune("ages", new Set(ages.map(a => S.ageSlug(a))), "age");
  if (staleT || staleA) log(`${staleT} stale topic page(s), ${staleA} stale age page(s) removed`);
  log(`${topicPages.length} topic pages, ${agePages.length} age pages`);

  /* ---- 3. Crawlable links on the hand-written pages -------------------- */

  function cardsFor(list) {
    return list.map(g => R.cardHTML(g, { iconHTML: iconFor(g), topicLabel })).join("");
  }

  /* Put real cards inside a card-grid, wrapped in markers.

     The markers are what make this repeatable. The build rewrites files in the
     repo checkout, so on Netlify it always starts from a clean copy — but if it
     ever runs twice against the same tree (locally, or if a cache is warm), a
     plain string replacement would fail to find its anchor the second time and
     silently skip. Matching the opening tag plus an optional existing marker
     block means the second run overwrites the first rather than giving up.

     The hash lets the page script recognise that the HTML it was served is
     already the right list, and leave the DOM alone instead of rebuilding it. */
  function bakeGrid(html, id, list) {
    const re = new RegExp(
      `(<div class="card-grid" id="${id}"([^>]*)>)` +
      `(?:<!--MPC:CARDS:START-->[\\s\\S]*?<!--MPC:CARDS:END-->)?`
    );
    if (!re.test(html)) { note(`Could not find the #${id} card grid — no crawlable links baked into it.`); return html; }
    return html.replace(re, (_m, _open, attrs) => {
      const kept = String(attrs || "").replace(/\s*data-baked-hash="[^"]*"/g, "");
      return `<div class="card-grid" id="${id}"${kept} data-baked-hash="${bakedHash(list)}">` +
        `<!--MPC:CARDS:START-->${cardsFor(list)}<!--MPC:CARDS:END-->`;
    });
  }

  function bakePage(file, bake, meta) {
    try {
      let html = read(file);
      const pageId = (/<body[^>]*\sdata-mpc-page="([^"]*)"/.exec(html) || [])[1] || "";
      html = injectHead(html, H.metaBlock(Object.assign({
        title: titleOf(html),
        description: descOf(html),
        type: "website",
        verification: settings.verification
      }, meta)));
      /* Editable wording, footer and hashed asset URLs on every page. */
      html = bakeCommon(html, pageId);
      if (bake) html = bake(html, pageId);
      write(file, html);
    } catch (e) { note(`${file}: ${e.message}`); }
  }

  const featured = guides.filter(g => g.featured && !g.noindex);
  const homeList = featured.slice(0, 4);
  bakePage("index.html",
    (html, pageId) => {
      html = bakeGrid(html, "grid", homeList);
      html = B.applyPills(html, pillTopics, ages, {});
      /* The hero used to ship with no src at all — the real one lived in
         Firestore and was applied after Firebase had booted. It is the LCP
         element here, so it is now written into the HTML where the browser's
         preload scanner can find it before any script runs. */
      html = B.applyHero(html, data.pages.home, R.img);
      return inlineFacets(html, pageId);
    },
    { canonical: "/", schema: H.homeSchema() });

  const seen = new Set(featured.map(g => g.id));
  const oneEach = topics.map(tp =>
    guides.find(g => g.topic === tp.id && !seen.has(g.id) && !g.noindex)).filter(Boolean);
  bakePage("popular.html",
    (html, pageId) => {
      html = bakeGrid(bakeGrid(html, "featured", featured), "byTopic", oneEach);
      html = B.applyHero(html, data.pages.popular, R.img);
      return inlineFacets(html, pageId);
    },
    { canonical: "/popular.html" });

  const allList = guides.filter(g => !g.noindex);
  bakePage("guides.html", (html, pageId) => {
    html = bakeGrid(html, "grid", allList);
    html = B.applyPills(html, pillTopics, ages, {});
    html = B.applyHero(html, data.pages.guides, R.img);
    html = inlineFacets(html, pageId);
    /* The second row of topic/age links at the bottom of this page is gone.
       It existed only because the filter pills were <button>s and a crawler
       cannot follow a button, so the landing pages needed something to point
       at them. The pills are <a href> now and do that job themselves, so this
       was two rows of the same thing with one of them there for a machine. */
    return marker(html, "BROWSELINKS", "");
  }, { canonical: "/guides.html" });

  /* The About page's four illustration slots and the Our Books grid were both
     rendered in the browser from Firestore. Same data, baked. */
  bakePage("about.html",
    (html) => B.applyAbout(html, data.pages.about, R.img),
    { canonical: "/about.html" });
  bakePage("books.html",
    (html) => B.applyBooks(html, meta.books && meta.books.items, R.img),
    { canonical: "/books.html" });

  if (fs.existsSync(path.join(ROOT, "editorial.html"))) {
    bakePage("editorial.html", null, { canonical: "/editorial.html" });
  }
  /* The privacy notice. Baked like any other hand-written page so it gets a
     canonical, the shared wording, the hashed asset URLs and the inlined CSS —
     and so it is a real page in the sitemap rather than something only the
     cookie banner knows the address of. */
  if (fs.existsSync(path.join(ROOT, "privacy.html"))) {
    bakePage("privacy.html", null, { canonical: "/privacy.html" });
  }
  /* ---- Studio and the Editor -------------------------------------------
     Not public pages, so no metadata and no baking — but they ARE served, and
     their <script> tags were the only ones on the site with no cache-busting
     at all. /assets/js/* is cached hard, so a change to site-text.js simply did
     not reach Studio: the file on the server was right and the browser kept
     last week's. That is how the editorial page opened with no text boxes. */
  for (const f of ["studio/index.html", "editor/index.html"]) {
    try {
      if (!fs.existsSync(path.join(ROOT, f))) continue;
      const before = read(f);
      const after = stampAssets(before);
      if (after !== before) { write(f, after); log(`${f}: asset URLs stamped`); }
    } catch (e) { note(`${f}: ${e.message}`); }
  }

  /* A 404 must never invite indexing, whatever else it does. */
  try {
    let nf = read("404.html");
    nf = injectHead(nf, `<meta name="robots" content="noindex, follow">`);
    nf = bakeCommon(nf, "notfound");
    write("404.html", nf);
  } catch (e) { note("404.html: " + e.message); }

  /* ---- 3b. The generated public data files ------------------------------
     The whole point of the exercise: what a browse page reads instead of the
     complete guide catalogue. See scripts/lib/publicdata.js for the shape and
     the budget. */
  const indexList = guides.filter(g => !g.noindex);
  const idxJson = JSON.stringify(PD.guideIndex(indexList));
  const searchJson = JSON.stringify(PD.guideSearch(indexList));
  const settingsJson = JSON.stringify(
    PD.siteSettings(settings, topics, ages, (id) => facetData.icons[id] || ""));

  write("data/guide-index.json", idxJson);
  write("data/guide-search.json", searchJson);
  write("data/site-settings.json", settingsJson);

  const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
  const per = (s) => Math.round(Buffer.byteLength(s) / Math.max(1, indexList.length));
  log(`guide-index.json ${kb(idxJson)}KB (${per(idxJson)} B/guide), ` +
      `guide-search.json ${kb(searchJson)}KB (${per(searchJson)} B/guide), ` +
      `site-settings.json ${kb(settingsJson)}KB`);

  /* ---- 4. sitemap.xml -------------------------------------------------- */

  const urls = [];
  const push = (loc, lastmod, changefreq, priority) =>
    urls.push({ loc: S.absolute(loc), lastmod, changefreq, priority });

  /* lastmod must be true or absent. A guide's own updated date is used when it
     has one; otherwise Firestore's document update time, which is a real
     timestamp the CMS produced. If neither exists, no lastmod is emitted. */
  const lastmodFor = (g) => {
    const d = g.updatedDate || g.publishedDate || g.firestoreUpdateTime || "";
    if (!d) return "";
    const parsed = new Date(d);
    return isNaN(parsed) ? "" : parsed.toISOString().slice(0, 10);
  };

  const newest = (list) => {
    const dates = list.map(lastmodFor).filter(Boolean).sort();
    return dates.length ? dates[dates.length - 1] : "";
  };

  push("/", newest(guides), "weekly", "1.0");
  push("/guides.html", newest(guides), "weekly", "0.9");
  push("/popular.html", newest(featured), "weekly", "0.7");
  push("/about.html", "", "monthly", "0.6");
  push("/books.html", "", "monthly", "0.5");
  if (fs.existsSync(path.join(ROOT, "editorial.html"))) push("/editorial.html", "", "yearly", "0.4");
  if (fs.existsSync(path.join(ROOT, "privacy.html"))) push("/privacy.html", "", "yearly", "0.3");

  topicPages.forEach(p => push(p.url, newest(guides.filter(g => g.topic === p.url.split("/")[2])), "weekly", "0.7"));
  agePages.forEach(p => push(p.url, newest(guides.filter(g => g.ages.includes(p.label))), "weekly", "0.7"));

  /* Only canonical, indexable guides. No aliases, no noindexed guides. */
  guides.filter(g => !g.noindex && !g.canonicalOverride)
    .forEach(g => push(g.url, lastmodFor(g), "monthly", g.featured ? "0.9" : "0.8"));

  write("sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u =>
      "  <url>\n" +
      `    <loc>${H.esc(u.loc)}</loc>\n` +
      (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "") +
      (u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>\n` : "") +
      (u.priority ? `    <priority>${u.priority}</priority>\n` : "") +
      "  </url>"
    ).join("\n") +
    "\n</urlset>\n");
  log(`sitemap: ${urls.length} URLs`);

  /* ---- 5. robots.txt --------------------------------------------------- */

  write("robots.txt", buildRobots());

  /* ---- 6. _redirects --------------------------------------------------- */

  const redirects = [];
  redirects.push("# Generated by scripts/build.js. Edits here are overwritten on deploy.");
  redirects.push("# Slug history lives on each guide (seo.previousSlugs) in Firestore.");
  redirects.push("");
  redirects.push("# Old query-string guide URLs -> the permanent clean URL.");
  redirects.push("# Kept forever: these are the links already shared in WhatsApp threads.");
  guides.forEach(g => {
    redirects.push(`/guide.html  id=${g.id}  ${g.url}  301!`);
    if (g.slug !== g.id) redirects.push(`/guide.html  id=${g.slug}  ${g.url}  301!`);
  });
  redirects.push("");
  redirects.push("# Any other ?id= (a deleted guide) lands on the index rather than a dead end.");
  redirects.push("/guide.html  id=:id  /guides.html  301");
  redirects.push("");
  redirects.push("# Slugs that have been renamed. One hop, never a chain: every entry points");
  redirects.push("# at the guide's current URL, not at the slug that replaced it.");
  let renames = 0;
  guides.forEach(g => {
    g.previousSlugs.forEach(old => {
      if (old && old !== g.slug) { redirects.push(`/guides/${old}/  ${g.url}  301!`); renames++; }
    });
  });
  redirects.push("");
  redirects.push("# NO TRAILING-SLASH NORMALISATION RULES. This is deliberate.");
  redirects.push("#");
  redirects.push("# There used to be three:");
  redirects.push("#");
  redirects.push("#   /guides/:slug  /guides/:slug/  301!");
  redirects.push("#   /topics/:slug  /topics/:slug/  301!");
  redirects.push("#   /ages/:slug    /ages/:slug/    301!");
  redirects.push("#");
  redirects.push("# They took every guide, topic and age page off the site with");
  redirects.push("# ERR_TOO_MANY_REDIRECTS. Two things combined to do it.");
  redirects.push("#");
  redirects.push("# Netlify matches a request for /topics/feeding/ against the source");
  redirects.push("# /topics/:slug — the trailing slash does not stop it matching — so the");
  redirects.push("# rule sends the URL to the address it already asked for. And the !");
  redirects.push("# makes the redirect FORCED, which beats a real file at that path, so");
  redirects.push("# the generated page existing changed nothing.");
  redirects.push("#");
  redirects.push("# Writing the sources out one at a time does NOT fix it: an explicit");
  redirects.push("# /guides/teething -> /guides/teething/ loops for the same reason. Any");
  redirects.push("# rule shaped /x -> /x/ is a loop here.");
  redirects.push("#");
  redirects.push("# Nothing is needed in their place. Netlify resolves /topics/feeding/");
  redirects.push("# to topics/feeding/index.html by itself, and serves the same file for");
  redirects.push("# the slashless form. Ordinary directory-index behaviour.");
  redirects.push("");
  redirects.push("# ---------------------------------------------------------------------");
  redirects.push("# AGE RANGES THAT ARE SWITCHED OFF");
  redirects.push("#");
  redirects.push("# Studio -> Site -> Ages. The guides below");
  redirects.push("# are tagged only to bands that are currently off. Nothing has been deleted:");
  redirects.push("# their Firestore documents, ages, slugs and illustrations are all intact,");
  redirects.push("# and switching the band back on republishes them at these same URLs.");
  redirects.push("#");
  redirects.push("# While they are off their addresses must not resolve, or the one thing");
  redirects.push("# hiding them was for — nobody reading them yet — fails for anyone holding");
  redirects.push("# the link. A real 404 is the honest answer: it is what the site already");
  redirects.push("# does for an address that is not published, it keeps them out of the");
  redirects.push("# index without naming them in robots.txt, and it is what makes Google");
  redirects.push("# drop any that were indexed before.");
  redirects.push("#");
  redirects.push("# These sit ABOVE the catch-all below, which would otherwise rewrite them");
  redirects.push("# to guide.html and render them from Firestore. First match wins.");
  let hidden404 = 0;
  const hidden404Slugs = new Set();
  hiddenGuides.forEach(g => {
    [g.slug, g.id].concat(g.previousSlugs || []).forEach(slug => {
      if (!slug || hidden404Slugs.has(slug)) return;
      hidden404Slugs.add(slug);
      /* Both forms. Netlify resolves the slashless address to the same page, so
         a rule on only one of them leaves the other reachable. */
      redirects.push(`/guides/${slug}/  /404.html  404`);
      redirects.push(`/guides/${slug}  /404.html  404`);
      hidden404++;
    });
  });
  if (!hidden404) redirects.push("# (none — every age range is currently public)");
  redirects.push("");
  redirects.push("# ---------------------------------------------------------------------");
  redirects.push("# Slugs this build did not generate — must stay last.");
  redirects.push("#");
  redirects.push("# Not forced, so Netlify serves a real generated file whenever one exists");
  redirects.push("# and only falls through to here when it does not. Two things reach this");
  redirects.push("# line, and they need opposite treatment:");
  redirects.push("#");
  redirects.push("#   1. A guide added in Studio since the last deploy. It exists in");
  redirects.push("#      Firestore but has no page yet. It must render.");
  redirects.push("#   2. A slug that genuinely does not exist. It must not be indexed.");
  redirects.push("#");
  redirects.push("# Netlify cannot tell them apart — it does not know what is in Firestore.");
  redirects.push("# So this rewrites to guide.html, which does know: it reads the slug from");
  redirects.push("# the path and looks it up. Found, it renders the guide. Not found, it");
  redirects.push("# writes a noindex tag and shows the not-found message, so a dead URL");
  redirects.push("# still cannot end up in the index.");
  redirects.push("#");
  redirects.push("# This is the one place the architecture accepts a soft 404 rather than a");
  redirects.push("# hard one. The alternative was new guides 404ing until the next deploy,");
  redirects.push("# which is a far worse failure and one that happens far more often.");
  redirects.push("/guides/*  /guide.html  200");
  write("_redirects", redirects.join("\n") + "\n");
  log(`_redirects: ${guides.length} legacy URLs, ${renames} renamed slugs` +
      (hidden404 ? `, ${hidden404Slugs.size} hidden slug(s) 404ed` : ""));

  /* ---- 7. llms.txt ------------------------------------------------------
     Supplementary only. Proper HTML, the sitemap and structured data do the
     real work; this is a convenience index for retrieval systems that look for
     it. It makes no claims and guarantees nothing.
     ------------------------------------------------------------------- */

  const llms = [
    `# ${S.SITE_NAME}`, "",
    `> ${S.TAGLINE}`, "",
    "Short, practical guides to the first two years, written by two parents from the",
    "questions they actually asked. Not medical advice; each guide says plainly when",
    "to contact a doctor. Full detail is in the HTML pages listed below — this file",
    "is a convenience index, not a substitute for them.", "",
    "## About", "",
    `- [About us](${S.absolute("/about.html")}): who writes these and what they are not.`,
    fs.existsSync(path.join(ROOT, "editorial.html"))
      ? `- [How these guides happen](${S.absolute("/editorial.html")}): sourcing, review and corrections.` : "",
    `- [All guides](${S.absolute("/guides.html")})`, "",
    "## Guides", ""
  ].filter(Boolean);

  for (const tp of topics) {
    const list = guides.filter(g => g.topic === tp.id && !g.noindex);
    if (!list.length) continue;
    llms.push(`### ${tp.label}`, "");
    list.forEach(g => llms.push(`- [${g.title}](${S.absolute(g.url)}): ${g.shortAnswer || g.summary}`));
    llms.push("");
  }
  write("llms.txt", llms.join("\n") + "\n");

  /* ---- 8. IndexNow ------------------------------------------------------ */

  await indexNow(guides);

  /* ---- 9. Audit --------------------------------------------------------- */

  const audit = runAudit({
    guides, topics, ages, topicPages, agePages, settings, source: data.source,
    hiddenAges, hiddenGuides
  });
  audit.buildProblems = problems;
  writeAuditPage(ROOT, audit, { write });

  log(`done in ${Date.now() - t0}ms — ${audit.errors.length} errors, ${audit.warnings.length} warnings`);
  if (audit.errors.length) {
    console.warn("[seo] ---- SEO ERRORS ----");
    audit.errors.forEach(e => console.warn("[seo]   " + e.message));
    console.warn("[seo] Full report: /seo-audit.html (not indexable)");
  }
}

/* Hash of a baked list, so the client can tell whether the HTML it was served
   is already the right list and skip redrawing it. */
function bakedHash(list) {
  return R.hash(list.map(g => g.id + ":" + g.title).join("|"));
}

/* ---------------------------------------------------------------------------
   robots.txt

   Deliberate rather than generic. Public editorial content is open to search
   and answer engines; the two editing surfaces and the audit are not.
   ------------------------------------------------------------------------ */
function buildRobots() {
  const block = (agent) => [
    `User-agent: ${agent}`,
    "Allow: /",
    ...S.PRIVATE_ROUTES.map(r => `Disallow: ${r}`)
  ].join("\n") + "\n";

  return [
    "# ==========================================================================",
    "# robots.txt for The Messy Parents Collection",
    "# Generated by scripts/build.js — edit that file, not this one.",
    "#",
    "# The guides are public educational content and are meant to be findable and",
    "# quotable, in ordinary search and in AI answers alike. Everything public is",
    "# open. The only things closed are the two editing surfaces and the audit.",
    "# ==========================================================================",
    "",
    "# --- Google -------------------------------------------------------------",
    "# Googlebot needs the CSS and JS too, or it cannot render the page it is",
    "# judging. Nothing under /assets/ is blocked.",
    block("Googlebot"),
    "# Google's AI Overviews and AI Mode are served from the ordinary Google index,",
    "# so Googlebot access above is what makes the guides eligible. Google-Extended",
    "# is a separate control for Gemini model training and is intentionally left",
    "# unrestricted; blocking it would not affect search or AI Overviews either way.",
    block("Google-Extended"),
    "",
    "# --- Bing and Microsoft Copilot -----------------------------------------",
    "# Copilot grounds its answers in the Bing index, so Bingbot is the crawler",
    "# that matters for Copilot citation.",
    block("Bingbot"),
    "",
    "# --- ChatGPT Search ------------------------------------------------------",
    "# OAI-SearchBot is the crawler behind ChatGPT Search results and links. This",
    "# is the one that decides whether the site can be surfaced or cited there.",
    "# It is NOT the training crawler — do not conflate them.",
    block("OAI-SearchBot"),
    "# ChatGPT-User fetches a page when a user asks ChatGPT to open or check it.",
    block("ChatGPT-User"),
    "# GPTBot is OpenAI's model-training crawler. It has no effect on ChatGPT",
    "# Search visibility. It is allowed here; to opt out of training only, change",
    "# this one block to Disallow: / and leave OAI-SearchBot exactly as it is.",
    block("GPTBot"),
    "",
    "# --- Other answer engines ------------------------------------------------",
    block("PerplexityBot"),
    block("ClaudeBot"),
    block("Claude-SearchBot"),
    block("Applebot"),
    block("Applebot-Extended"),
    block("DuckDuckBot"),
    block("Amazonbot"),
    "",
    "# --- Everyone else --------------------------------------------------------",
    block("*"),
    `Sitemap: ${S.ORIGIN}/sitemap.xml`,
    ""
  ].join("\n");
}

/* ---------------------------------------------------------------------------
   IndexNow

   Notifies Bing (and therefore Copilot) that specific URLs have changed. Only
   fires when there is a key AND something has genuinely changed recently — a
   deploy that touches no content pings nothing, which is what the protocol
   asks for.
   ------------------------------------------------------------------------ */
async function indexNow(guides) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) { log("IndexNow: no INDEXNOW_KEY set — skipped."); return; }
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) { note("INDEXNOW_KEY is not a valid key format — skipped."); return; }

  /* The key file must be served from the site root for Bing to verify it. */
  write(`${key}.txt`, key + "\n");

  const since = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const changed = guides.filter(g => {
    const d = g.updatedDate || g.publishedDate || g.firestoreUpdateTime;
    if (!d) return false;
    const ts = new Date(d).getTime();
    return !isNaN(ts) && ts >= since;
  }).map(g => S.absolute(g.url));

  if (!changed.length) { log("IndexNow: nothing changed in the last 7 days — nothing sent."); return; }

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: S.ORIGIN.replace(/^https?:\/\//, ""),
        key,
        keyLocation: `${S.ORIGIN}/${key}.txt`,
        urlList: changed.slice(0, 10000)
      })
    });
    log(`IndexNow: submitted ${changed.length} URLs (HTTP ${res.status})`);
  } catch (e) {
    note(`IndexNow submission failed (${e.message}) — harmless, the sitemap still covers it.`);
  }
}

/* --------------------------------------------------------------------------
   Nothing above is allowed to take the site down.
   ------------------------------------------------------------------------ */
main().catch(err => {
  console.error("[seo] BUILD STEP FAILED — the site is being published unchanged.");
  console.error(err && err.stack || err);
}).finally(() => {
  /* Always 0, so a problem in this script cannot take the live site down —
     EXCEPT when the Firestore guard above has deliberately asked to fail, in
     which case failing is the safer outcome: Netlify keeps the last good
     deploy rather than replacing it with an incomplete one. */
  process.exit(process.exitCode === 1 ? 1 : 0);
});
