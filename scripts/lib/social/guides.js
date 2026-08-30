/* ============================================================================
   SOCIAL — READING THE GUIDES FROM INSIDE A NETLIFY FUNCTION

   WHY THIS EXISTS, AND WHY load() IS NOT USED HERE.

   `scripts/lib/data.js` load() is the right thing for the BUILD: it runs in a
   checkout, with the whole repository on disk, and it reads

       assets/js/firebase-config.js     (fs.readFileSync)
       data/guides-bundle.js            (require.resolve + require.cache)
       assets/js/guides.js              (fs.readFileSync)
       data/guides.json                 (fs.readFileSync)

   None of that survives inside a Netlify function. The function is bundled by
   esbuild into a single file in a Lambda: the data files are not shipped
   alongside it, `__dirname` is not the repository root, and `require.resolve`
   on a relative path throws. Every one of those reads fails, every fallback
   fails after it, and load() politely returns an empty guide list with a
   warning — which is exactly what an empty dashboard looks like.

   So the functions read Firestore directly, through the Admin SDK they have
   already initialised with the service account. That is also simply better:
   it is the authoritative copy rather than the public REST view, it needs no
   API key, and it cannot be affected by a file that did or did not get
   deployed.

   WHAT IS REUSED, DELIBERATELY

     normaliseGuide()  from scripts/lib/data.js — the same function the build
                       uses, so a guide has exactly the same shape here as it
                       does on the public site. Not a copy of it.
     AGES.resolve()    from scripts/lib/ages.js — the same visibility rule, so
                       a band switched off in Studio is invisible to Instagram
                       for free, and stays that way when the rule changes.

   Only the READING is different. The meaning of a guide is not.

   NOTHING HERE WRITES. The social system reads the guide collection and never
   touches it.
   ========================================================================== */

const { normaliseGuide } = require("../data");
const AGES = require("../ages");

/* Keep the guide's already-approved longform headings available to the social
   composer. These are the strongest hooks in the catalogue; losing them here
   silently turns every cover into the flatter SEO-title fallback. */
function attachLongform(normalised, raw) {
  const headings = (Array.isArray(raw && raw.longform) ? raw.longform : [])
    .map(s => (s && s.h ? String(s.h).replace(/\s+/g, " ").trim() : ""))
    .filter(Boolean);
  return headings.length ? Object.assign({}, normalised, { longformHeadings: headings }) : normalised;
}

/* Read a whole collection into a plain object keyed by document id. */
async function readCollection(db, name) {
  const snap = await db.collection(name).get();
  const out = {};
  snap.forEach(doc => {
    const data = doc.data() || {};
    if (!data.id) data.id = doc.id;
    out[doc.id] = data;
  });
  return out;
}

/* The age bands the site knows about.

   load() takes this list from data/guides-bundle.js, which is not available
   here. Deriving it from the guides' own tags gives the same answer for every
   band that is actually in use, and it is what AGES.resolve() means by "a band
   the site actually knows about" — an unrecognised label stays visible, so a
   band nobody has tagged yet cannot hide anything.

   Sorted by the first number in the label, which puts them in the order a
   reader expects: 0–1, 2–3, 4–6, 7–9, 10–12, 12–18, 18–24. */
function agesFromGuides(rawGuides) {
  const seen = new Set();
  rawGuides.forEach(g => (Array.isArray(g.ages) ? g.ages : []).forEach(a => {
    if (a) seen.add(String(a));
  }));
  const leading = (s) => {
    const m = String(s).match(/\d+/);
    return m ? Number(m[0]) : 999;
  };
  return Array.from(seen).sort((a, b) => leading(a) - leading(b) || a.localeCompare(b));
}

/* Topics: the saved list wins, exactly as it does in load(). Falling back to
   the topic ids the guides actually carry means the filter is never empty. */
function topicsFrom(meta, rawGuides) {
  const saved = meta.topics && Array.isArray(meta.topics.items) ? meta.topics.items : null;
  if (saved && saved.length) {
    return saved.filter(t => t && t.id)
      .map(t => ({ id: String(t.id), label: t.label || t.id, icon: t.icon || "" }));
  }
  const seen = [];
  rawGuides.forEach(g => {
    if (g.topic && !seen.includes(g.topic)) seen.push(g.topic);
  });
  return seen.map(id => ({ id, label: id, icon: "" }));
}

/* --------------------------------------------------------------------------
   The same shape load() returns, so nothing downstream has to care which one
   it got: { guides, allGuides, hiddenGuides, topics, ages, meta, source,
   warnings }.
   ------------------------------------------------------------------------ */
async function loadGuides(db) {
  const warnings = [];
  let rawById = {}, pages = {}, meta = {};

  try {
    const [g, p, m] = await Promise.all([
      readCollection(db, "guides"),
      readCollection(db, "pages").catch(() => ({})),
      readCollection(db, "meta").catch(() => ({}))
    ]);
    rawById = g; pages = p; meta = m;
  } catch (e) {
    warnings.push(`Could not read Firestore: ${e.message}`);
  }

  const rawGuides = Object.values(rawById)
    .filter(g => g && g.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) ||
      String(a.title).localeCompare(String(b.title)));

  if (!rawGuides.length && !warnings.length) {
    warnings.push("Firestore returned no guides.");
  }

  const topics = topicsFrom(meta, rawGuides);
  const allAges = agesFromGuides(rawGuides);
  const everyGuide = rawGuides.map(g => attachLongform(normaliseGuide(g, { topics }), g));

  const visibility = AGES.resolve(allAges, (meta.seo && meta.seo.ageVisibility) || null);

  const hiddenGuides = everyGuide.filter(g => visibility.isGuideHidden(g.ages));
  const guides = everyGuide
    .filter(g => !visibility.isGuideHidden(g.ages))
    .map(g => {
      if (visibility.allPublic) return g;
      const visibleAges = visibility.visibleAgesOf(g.ages);
      if (visibleAges.length === g.ages.length) return g;
      /* A guide living in both a visible and a hidden band stays, with the
         hidden tag stripped from its public shape — the same thing load()
         does, for the same reason. */
      return Object.assign({}, g, { ages: visibleAges, allAges: g.ages });
    });

  return {
    guides, allGuides: everyGuide, hiddenGuides,
    topics, ages: visibility.visible, allAgeBands: visibility.all,
    pages, meta,
    source: "firestore (admin)",
    warnings
  };
}

module.exports = { loadGuides, agesFromGuides, topicsFrom, attachLongform };
