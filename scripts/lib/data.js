/* ============================================================================
   THE GUIDE DATA MODEL — one source of truth, three ways in.

   The live site reads guides from Firestore. The build needs the same data, so
   it reads Firestore too, over the REST API with the same public API key the
   browser uses (guides are `allow read: if true` in firestore.rules).

   If that read fails for any reason — network, quota, a bad key, Firestore
   down mid-deploy — the build MUST still produce a complete site rather than
   failing the deploy and taking the live site with it. So there are three
   sources, tried in order:

     1. Firestore            (what visitors actually see)
     2. assets/js/guides.js  (the bundled copy the browser falls back to)
     3. data/guides.json     (the seed file)

   Whichever wins, everything downstream sees the same normalised shape.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ageSlug, guideUrl } = require("./site");
/* The shared renderer also knows how to turn Studio's section list into the
   guide's prose, and everything downstream — word counts, meta descriptions,
   the audit, the search excerpt — has to see the same words the reader gets. */
const R = require("../../assets/js/guide-render.js");

const ROOT = path.resolve(__dirname, "..", "..");

/* ---------------------------------------------------------------------------
   Firestore REST decoding.

   Firestore's REST API returns every value wrapped in its type, e.g.
   { stringValue: "hi" } or { arrayValue: { values: [...] } }. This turns that
   back into ordinary JavaScript.
   ------------------------------------------------------------------------ */
function decodeValue(v) {
  if (v == null) return null;
  if ("stringValue"  in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue"  in v) return v.doubleValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue"    in v) return null;
  if ("arrayValue"   in v) return (v.arrayValue.values || []).map(decodeValue);
  if ("mapValue"     in v) return decodeFields(v.mapValue.fields || {});
  return null;
}
function decodeFields(fields) {
  const out = {};
  for (const k of Object.keys(fields || {})) out[k] = decodeValue(fields[k]);
  return out;
}

function readFirebaseConfig() {
  try {
    const src = fs.readFileSync(path.join(ROOT, "assets/js/firebase-config.js"), "utf8");
    const ctx = { window: {} };
    vm.createContext(ctx);
    vm.runInContext(src, ctx, { timeout: 2000 });
    return ctx.window.FIREBASE_CONFIG || null;
  } catch (e) { return null; }
}

async function fetchCollection(cfg, name) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${cfg.projectId}` +
    `/databases/(default)/documents/${name}?pageSize=1000&key=${cfg.apiKey}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const json = await res.json();
  const out = {};
  (json.documents || []).forEach(d => {
    const id = d.name.split("/").pop();
    out[id] = decodeFields(d.fields || {});
    // Firestore's own update time is a real, unfabricated "last changed"
    // signal. Kept separately so it can be used as a lastmod fallback.
    if (d.updateTime) out[id].__updateTime = d.updateTime;
  });
  return out;
}

/* Read the bundled guides.js by evaluating it with just enough of a fake DOM
   that its trailing DOMContentLoaded handler does not throw. */
function readBundledGuides() {
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
  return {
    guides: ctx.GUIDES || [],
    topics: (ctx.TOPICS || []).map(t => ({ id: t.id, label: t.label })),
    ages: ctx.AGES || []
  };
}

/* ---------------------------------------------------------------------------
   Normalisation — the model described in SEO_AI_ARCHITECTURE.md §"Guide data".

   Editable SEO values live in one nested `seo` object on the guide document.
   Keeping them together means Studio writes one place, the build reads one
   place, and a guide can be inspected at a glance to see what has and has not
   been optimised yet.

   NOTHING here invents a value. A field with no real content stays empty and
   the renderer simply omits whatever depends on it. An empty metaDescription
   falls back to the guide's own visible quick answer, which is not invention —
   it is the same words the reader sees.
   ------------------------------------------------------------------------ */

const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, " ");
const collapse  = (s) => String(s || "").replace(/\s+/g, " ").trim();

/* HTML entities that appear in the guide copy. Meta descriptions and JSON-LD
   need the plain characters, not the entities. */
function decodeEntities(s) {
  return String(s || "")
    .replace(/&rsquo;|&#8217;/g, "\u2019").replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201d").replace(/&ldquo;/g, "\u201c")
    .replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
const plain = (html) => collapse(decodeEntities(stripTags(html)));

/* Trim to a length without cutting a word in half. */
function clamp(text, max) {
  const t = collapse(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:\u2013\u2014-]+$/, "") + "\u2026";
}

function normaliseGuide(raw, ctx) {
  const g = JSON.parse(JSON.stringify(raw || {}));
  const seo = g.seo || {};
  const panel = g.panel || {};

  const id = String(g.id || "").trim();
  /* The public slug. Defaults to the Firestore document id, which is what
     every existing URL already uses, so nothing moves unless Amir renames it
     deliberately in Studio. */
  const slug = String(seo.slug || g.slug || id).trim();

  const title = collapse(decodeEntities(g.title || ""));
  const quick = plain(panel.quick || "");
  const summary = plain(g.summary || "");

  /* The short answer a retrieval system is most likely to lift. The quick
     answer box is written to stand alone already, so it is the first choice;
     the card summary is the fallback. Both are visible on the page. */
  const shortAnswer = quick || summary;

  const ages = Array.isArray(g.ages) ? g.ages.filter(Boolean) : [];

  return {
    /* identity */
    id, slug,
    url: guideUrl(slug),
    /* previous slugs are kept so old URLs can be redirected forever */
    previousSlugs: Array.isArray(seo.previousSlugs) ? seo.previousSlugs.filter(Boolean) : [],

    /* the question and its answers */
    question: title,
    title,
    summary,
    shortAnswer,
    quick,
    body: R.bodyHTML(g),
    callout: g.callout || null,
    panel,

    /* classification */
    topic: g.topic || (ctx.topics[0] && ctx.topics[0].id) || "",
    subcategory: collapse(g.subcategory || ""),
    stage: collapse(g.stage || ""),
    ages,
    ageSlugs: ages.map(ageSlug),
    keywords: Array.isArray(g.keywords) ? g.keywords.filter(Boolean) : [],
    related: Array.isArray(g.related) ? g.related.filter(Boolean) : [],
    featured: !!g.featured,
    read: Number(g.read) || 3,
    order: Number(g.order) || 0,
    medical: !!g.medical,

    /* provenance */
    originalQuestions: Array.isArray(g.originalQuestions) ? g.originalQuestions.filter(Boolean) : [],
    /* internal raw-question ids — provenance for Amir, never shown or cited */
    internalSourceIds: Array.isArray(g.sources) ? g.sources.filter(Boolean) : [],
    /* real outbound references, added during the content pass */
    references: Array.isArray(seo.references) ? seo.references.filter(r => r && r.url) : [],

    /* search metadata — empty until optimised, never invented */
    seoTitle: collapse(seo.title || ""),
    metaDescription: collapse(seo.description || ""),
    canonicalOverride: collapse(seo.canonical || ""),
    noindex: !!seo.noindex,
    /* dates: absent means absent. The renderer omits the schema property
       entirely rather than guessing one. */
    publishedDate: collapse(seo.publishedDate || ""),
    updatedDate: collapse(seo.updatedDate || ""),
    firestoreUpdateTime: g.__updateTime || "",

    /* imagery */
    image: panel.hero || "",
    imageAlt: collapse(seo.imageAlt || panel.heroAlt || ""),

    /* per-guide overrides for the optional visible sections (see render.js).
       undefined means "use the site default". */
    showDetail:      seo.showDetail,
    showQuestions:   seo.showQuestions,
    showBreadcrumbs: seo.showBreadcrumbs,
    showRelated:     seo.showRelated,

    status: seo.noindex ? "hidden" : "published",

    /* computed helpers used by the renderer and the audit */
    computed: {
      /* The <title>. A guide-specific SEO title wins; otherwise the question
         itself, which is what a parent typed into Google in the first place. */
      metaTitle: clamp(seo.title || title, 65),
      /* The description. Uses the guide's own visible words when it has not
         been written yet. */
      metaDescription: clamp(seo.description || shortAnswer || summary, 155),
      bodyWords: plain(R.bodyHTML(g)).split(/\s+/).filter(Boolean).length,
      panelWords: plain(
        [panel.quick, summary,
         (panel.normal && panel.normal.items || []).join(" "),
         (panel.helped && panel.helped.items || []).join(" "),
         (panel.warn   && panel.warn.items   || []).join(" "),
         (panel.dont   && panel.dont.items   || []).join(" ")
        ].join(" ")
      ).split(/\s+/).filter(Boolean).length
    }
  };
}

/* ---------------------------------------------------------------------------
   load() — returns { guides, topics, ages, pages, settings, source, warnings }
   and never throws.
   ------------------------------------------------------------------------ */
async function load({ preferBundled = false } = {}) {
  const warnings = [];
  const bundled = readBundledGuides();

  let rawGuides = null, pages = {}, meta = {};
  let source = "bundled";

  const cfg = readFirebaseConfig();
  if (!preferBundled && cfg && cfg.projectId && cfg.apiKey && typeof fetch === "function") {
    try {
      const [gd, pg, mt] = await Promise.all([
        fetchCollection(cfg, "guides"),
        fetchCollection(cfg, "pages").catch(() => ({})),
        fetchCollection(cfg, "meta").catch(() => ({}))
      ]);
      const arr = Object.values(gd);
      if (arr.length) {
        arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) ||
          String(a.title).localeCompare(String(b.title)));
        rawGuides = arr;
        pages = pg; meta = mt;
        source = "firestore";
      } else {
        warnings.push("Firestore returned no guides — built from the bundled copy instead.");
      }
    } catch (e) {
      warnings.push(`Could not read Firestore (${e.message}) — built from the bundled copy instead.`);
    }
  }

  if (!rawGuides) {
    rawGuides = bundled.guides;
    if (!rawGuides.length) {
      try {
        rawGuides = JSON.parse(fs.readFileSync(path.join(ROOT, "data/guides.json"), "utf8"));
        source = "guides.json";
      } catch (e) { rawGuides = []; }
    }
  }

  /* Topics: Studio can rename or replace them, so prefer the saved list. */
  let topics = bundled.topics;
  const savedTopics = meta.topics && Array.isArray(meta.topics.items) ? meta.topics.items : null;
  if (savedTopics && savedTopics.length) {
    topics = savedTopics
      .filter(t => t && t.id)
      .map(t => ({ id: String(t.id), label: t.label || t.id, icon: t.icon || "" }));
  }

  const ctx = { topics };
  const guides = rawGuides
    .filter(g => g && g.id)
    .map(g => normaliseGuide(g, ctx));

  /* Site-wide settings that the renderer needs to match the live page exactly
     (the quick-answer label, the notepad lines, the band illustration) plus
     the SEO section defaults. All editable in Studio. */
  const siteText = (pages.site && pages.site.text) || {};
  const guideText = (pages.guide && pages.guide.text) || {};
  const seoDefaults = (meta.seo) || {};

  const settings = {
    text: Object.assign({}, siteText, guideText),
    /* Which optional sections appear on a guide page, site-wide.
       See SEO_AI_ARCHITECTURE.md → "The four switches". */
    sections: {
      related:     seoDefaults.showRelated     !== false,   // default ON
      /* Default ON. Every guide carries 150-350 words of original prose that
         the panel template never displayed, so the indexable page used to be
         ~130 words of bullets. This renders it below the panel, which is sized
         to the viewport — so first paint is unchanged and you only reach it by
         scrolling. Untick it in Studio to turn it back off. */
      detail:      seoDefaults.showDetail      !== false,   // default ON
      questions:   seoDefaults.showQuestions   === true,    // default OFF
      breadcrumbs: seoDefaults.showBreadcrumbs === true     // default OFF
    },
    verification: {
      google: collapse(seoDefaults.googleVerification || ""),
      bing:   collapse(seoDefaults.bingVerification || "")
    },
    footer: meta.footer || null
  };

  return {
    guides, topics, ages: bundled.ages, pages, meta,
    settings, source, warnings
  };
}

module.exports = { load, normaliseGuide, plain, clamp, decodeEntities, stripTags };
