/* ============================================================================
   AGE-RANGE VISIBILITY — one source of truth for which age bands are public.

   THE PROBLEM THIS SOLVES

   Two age bands (12–18 months and 18–24 months) have guides written, ages
   tagged, URLs assigned and illustrations approved, but are not ready to show
   to readers yet. Deleting them would throw away work and break every URL the
   moment they came back. Hard-coding "if age is one of these two, skip it" in
   the build, the pills, the sitemap, the search index and the guide runtime
   would put the same decision in seven files, and the seventh would be the one
   nobody remembered when it was time to turn them on.

   So the decision lives here, once, and everything else asks.

   WHERE THE ANSWER COMES FROM

     1. meta/seo.ageVisibility in Firestore — a plain map of age label -> bool,
        written by Studio (Site -> Search & AI -> "Which ages are public").
        This is the switch. It is what Amir touches.

     2. DEFAULT_VISIBILITY below — used only for a band the map says nothing
        about. It is what makes the two bands start OFF on a site that has
        never had the map saved, and on a build that could not read Firestore.

   An age band that appears in neither is public. New bands are visible by
   default; nothing has to be edited here to add one.

   WHAT "HIDDEN" MEANS FOR A GUIDE

   A guide is hidden when it has age tags and EVERY one of them is hidden.
   A guide tagged both 4–6 months and 18–24 months stays public, and is shown
   under 4–6 months only — its hidden tags are stripped from the public view
   so no breadcrumb, filter or landing page can point at a band that is off.

   A guide with no age tags at all is unaffected. It was never on an age
   landing page and this must not be the thing that removes it from the site.

   NOTHING HERE DELETES ANYTHING. Hidden guides keep their documents, their
   ages, their slugs and their illustrations. Turning a band back on and
   rebuilding restores its pages, links, sitemap entries and structured data
   with no other change.
   ========================================================================== */

"use strict";

/* The bands that start OFF. Studio's saved map overrides this in both
   directions — this is the fallback, not the switch. */
const DEFAULT_VISIBILITY = {
  "12–18 months": false,
  "18–24 months": false
};

/* Age labels are written with an en-dash ("12–18 months") but get typed,
   pasted and stored with a hyphen often enough that matching on the exact
   string is a bug waiting to happen — a saved key of "12-18 months" would
   silently fail to match the band it names and the toggle would do nothing.
   Every comparison goes through this. */
function normLabel(s) {
  return String(s == null ? "" : s)
    .replace(/[\u2010-\u2015]/g, "-")   /* – — ‒ ― etc -> - */
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/* --------------------------------------------------------------------------
   resolve(allAges, saved)

   allAges  every age band the site knows about, in display order.
   saved    meta/seo.ageVisibility, or null/undefined when there is none.

   Returns a small object the rest of the codebase asks instead of deciding
   for itself.
   ------------------------------------------------------------------------ */
function resolve(allAges, saved) {
  const all = (Array.isArray(allAges) ? allAges : []).filter(Boolean);

  /* Defaults first, then anything saved, both keyed by normalised label so a
     hyphen/en-dash mismatch cannot make a toggle a no-op. */
  const vis = new Map();
  for (const k of Object.keys(DEFAULT_VISIBILITY)) {
    vis.set(normLabel(k), DEFAULT_VISIBILITY[k] !== false);
  }
  if (saved && typeof saved === "object") {
    for (const k of Object.keys(saved)) vis.set(normLabel(k), saved[k] !== false);
  }

  /* Only a band the site actually knows about can be hidden. An unrecognised
     label on a guide (a typo, or a band removed from the list) is treated as
     visible, because the alternative is a guide silently vanishing from the
     site because of a spelling mistake. */
  const known = new Set(all.map(normLabel));

  const isVisible = (label) => {
    const k = normLabel(label);
    if (!known.has(k)) return true;
    return vis.has(k) ? vis.get(k) : true;
  };
  const isHidden = (label) => !isVisible(label);

  const visible = all.filter(isVisible);
  const hidden = all.filter(isHidden);

  /* The age tags a reader is allowed to see on a guide. */
  const visibleAgesOf = (ages) =>
    (Array.isArray(ages) ? ages : []).filter(Boolean).filter(isVisible);

  /* A guide disappears from the public site only when it has age tags and all
     of them are off. See the note at the top about untagged guides. */
  const isGuideHidden = (ages) => {
    const list = (Array.isArray(ages) ? ages : []).filter(Boolean);
    return list.length > 0 && visibleAgesOf(list).length === 0;
  };

  /* The map as Studio should render it: every known band, with its current
     state, whatever the saved document happens to contain. */
  const asMap = () => {
    const out = {};
    for (const a of all) out[a] = isVisible(a);
    return out;
  };

  return {
    all, visible, hidden,
    isVisible, isHidden,
    visibleAgesOf, isGuideHidden,
    asMap,
    /* True when nothing is switched off, i.e. the site behaves exactly as it
       did before this file existed. */
    allPublic: hidden.length === 0
  };
}

module.exports = { resolve, normLabel, DEFAULT_VISIBILITY };
