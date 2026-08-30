/* ============================================================================
   SOCIAL — WHICH GUIDES ARE ELIGIBLE

   Eligibility is not a new rule. It is the site's existing rule, asked once:

     a guide is eligible for Instagram exactly when a reader could open it

   which is what scripts/lib/data.js load() already returns as `guides`. That
   list has already had age-band visibility applied by scripts/lib/ages.js, so
   a guide sitting behind a switched-off band is invisible here for free — and
   stays invisible, because this module never re-derives the rule.

   The only thing added on top is `noindex`, which load() surfaces as
   status === "hidden": a guide Amir has deliberately kept out of search should
   not be advertised on Instagram either.

   NOTHING IN THIS FILE WRITES. The social system reads the guide collection
   and never touches it.
   ========================================================================== */

function isEligible(guide) {
  if (!guide || !guide.id || !guide.slug) return false;
  if (guide.status === "hidden" || guide.noindex) return false;
  if (!String(guide.title || "").trim()) return false;
  /* A guide with no panel content at all would produce a carousel of one
     slide. It is not broken, it is just not ready. */
  const p = guide.panel || {};
  const has = (k) => p[k] && Array.isArray(p[k].items) && p[k].items.filter(Boolean).length;
  return Boolean(String(p.quick || guide.summary || "").trim() || has("normal") || has("helped") || has("warn"));
}

function eligibleGuides(loaded) {
  return (loaded.guides || []).filter(isEligible);
}

/* Why a guide is NOT eligible, so the dashboard can say so rather than simply
   omitting it and leaving Amir wondering. */
function ineligibleReason(guide) {
  if (!guide || !guide.id || !guide.slug) return "missing an id or slug";
  if (guide.status === "hidden" || guide.noindex) return "set to noindex in Studio";
  if (!String(guide.title || "").trim()) return "has no title";
  return "has no quick answer and no panel items yet";
}

/* --------------------------------------------------------------------------
   SEARCH AND FILTER
   ------------------------------------------------------------------------ */
const fold = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").trim();

function filterGuides(guides, { q = "", topic = "", age = "" } = {}) {
  const needle = fold(q);
  return guides.filter(g => {
    if (topic && g.topic !== topic) return false;
    if (age && !(g.ages || []).includes(age)) return false;
    if (!needle) return true;
    return fold(g.title).includes(needle) || fold(g.slug).includes(needle) ||
           fold(g.summary).includes(needle);
  });
}

/* --------------------------------------------------------------------------
   DUPLICATES

   One live package per guide. Regenerating is an explicit act — the dashboard
   asks, and the server refuses a second package for the same guide unless
   `replace` is set. A rejected package does not block a new one; an approved
   and held one does, because replacing it silently would discard a decision.
   ------------------------------------------------------------------------ */
function packagesByGuide(packages) {
  const map = new Map();
  (packages || []).forEach(p => {
    if (!p || !p.guideSlug) return;
    const list = map.get(p.guideSlug) || [];
    list.push(p);
    map.set(p.guideSlug, list);
  });
  return map;
}

function blockingPackageFor(slug, packages) {
  const list = packagesByGuide(packages).get(slug) || [];
  return list.find(p => p.status !== "REJECTED") || null;
}

/* --------------------------------------------------------------------------
   ROTATION

   Used when generating several at once: avoid two consecutive packages on the
   same topic. It orders the selection, it never decides what publishes.
   ------------------------------------------------------------------------ */
function spreadTopics(guides) {
  const byTopic = new Map();
  guides.forEach(g => {
    const t = g.topic || "";
    if (!byTopic.has(t)) byTopic.set(t, []);
    byTopic.get(t).push(g);
  });
  const queues = Array.from(byTopic.values());
  const out = [];
  let moved = true;
  while (moved) {
    moved = false;
    for (const q of queues) {
      if (q.length) { out.push(q.shift()); moved = true; }
    }
  }
  return out;
}

module.exports = {
  isEligible, eligibleGuides, ineligibleReason,
  filterGuides, packagesByGuide, blockingPackageFor, spreadTopics
};
