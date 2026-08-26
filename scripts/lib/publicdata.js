/* ============================================================================
   THE PUBLIC DATA FILES

   Small, generated, CDN-cached JSON. These are what the browse pages read
   instead of the complete guide catalogue.

   THE BUDGET, AND WHY IT IS SPLIT IN TWO

   assets/js/guides.js was 113KB at 31 guides — around 3.6KB a guide, almost
   all of it article prose. Extrapolated:

        31 guides    113KB
       100 guides    365KB
       300 guides    1.1MB
       500 guides    1.8MB

   ...downloaded on every page, including a guide page that had already been
   served the one article it needed.

   Splitting it by what each page genuinely uses:

     guide-index.json    id, slug, title, topic, read, ages, featured.
                         Everything needed to draw a card and to filter by
                         topic or age. ~130 bytes a guide.

     guide-search.json   summary, target keywords, and a short body excerpt —
                         the text a query is matched against. ~450 bytes a
                         guide. Fetched only when somebody actually searches.

   At 500 guides that is roughly 65KB and 225KB, and the second one is only
   paid for by readers who type something. Both compress well: they are highly
   repetitive JSON, so gzip takes them down by around 70%.

   WHAT IS DELIBERATELY NOT IN HERE

   No article bodies. No panel content. No callouts. No original questions. No
   internal source ids. No Studio metadata. No SEO audit fields. No references.
   The excerpt is capped hard, and tests/verify.js fails the build if the
   per-guide average creeps past the budget.
   ========================================================================== */

"use strict";

const { plain, clamp } = require("./data");

/* How much body text goes into the search blob. Enough that a distinctive
   phrase in an opening paragraph is still findable; short enough that it
   cannot become a way of shipping the article. Body matches score 1-2 points
   against a title's 20, so this is a tiebreaker, not the ranking. */
const EXCERPT_CHARS = 220;

/* --------------------------------------------------------------------------
   guide-index.json — the card and filter layer.
   ------------------------------------------------------------------------ */
function guideIndex(guides) {
  return {
    generated: new Date().toISOString(),
    count: guides.length,
    guides: guides.map((g) => {
      const row = {
        id: g.id,
        title: g.title,
        topic: g.topic,
        read: g.read || 3,
        ages: g.ages
      };
      /* Only carried when it differs from the id, which is the common case
         and saves a duplicated string on every row. */
      if (g.slug && g.slug !== g.id) row.slug = g.slug;
      if (g.featured) row.featured = true;
      if (g.subcategory) row.subcategory = g.subcategory;
      return row;
    })
  };
}

/* --------------------------------------------------------------------------
   guide-search.json — the matching layer, keyed by id so it merges onto the
   index without repeating it.

     s  summary        the card summary, already visible on the site
     k  keywords       Studio's target queries, joined
     t  text           a capped plain-text excerpt of the body
   ------------------------------------------------------------------------ */
function guideSearch(guides) {
  const text = {};
  for (const g of guides) {
    const row = {};
    if (g.summary) row.s = g.summary;
    if (g.keywords && g.keywords.length) row.k = g.keywords.join(" ");
    const excerpt = clamp(plain(g.body), EXCERPT_CHARS);
    if (excerpt) row.t = excerpt;
    if (Object.keys(row).length) text[g.id] = row;
  }
  return { generated: new Date().toISOString(), count: guides.length, text };
}

/* --------------------------------------------------------------------------
   site-settings.json — the editable wording, topic labels and pill icons.

   Not loaded by a normal page: all of this is baked into the HTML by
   scripts/lib/bake.js. It exists for the two off-path cases in guide.js —
   rendering a guide that has no generated page yet, and the once-per-session
   freshness check — which need the same strings the build used in order to
   produce identical markup.
   ------------------------------------------------------------------------ */
function siteSettings(settings, topics, ages, iconFor) {
  const icons = {};
  for (const t of topics) icons[t.id] = iconFor(t.id);
  return {
    generated: new Date().toISOString(),
    text: settings.text || {},
    topics: topics.map((t) => ({ id: t.id, label: t.label })),
    icons,
    ages,
    sections: settings.sections
  };
}

/* --------------------------------------------------------------------------
   Facets — written inline into the browse pages rather than fetched.

   The filter rows show a count next to each collapsed choice ("Sleeping · 12
   guides"). Those counts used to require the whole catalogue in memory, which
   is a lot of network for twelve integers. A few hundred bytes inline gets
   them on screen with the first paint instead, and lets the catalogue script
   load lazily without anything popping in afterwards.
   ------------------------------------------------------------------------ */
function facets(guides, topics, ages, iconFor) {
  const live = guides.filter((g) => !g.noindex);
  const counts = { topic: {}, age: {} };
  const icons = {};

  for (const t of topics) {
    counts.topic[t.id] = live.filter((g) => g.topic === t.id).length;
    icons[t.id] = iconFor(t.id);
  }
  for (const a of ages) {
    counts.age[a] = live.filter((g) => g.ages.includes(a)).length;
  }

  return {
    topics: topics.map((t) => ({ id: t.id, label: t.label })),
    ages,
    icons,
    counts,
    total: live.length
  };
}

module.exports = { guideIndex, guideSearch, siteSettings, facets, EXCERPT_CHARS };
