/* ============================================================================
   SOCIAL — LIST GUIDES

   Read-only. Returns the guides a package could be made from, plus the ones
   that were skipped and why, plus the topic and age vocabularies so the
   dashboard's filters come from the data rather than from a hard-coded list.

   Eligibility is scripts/lib/social/select.js, which is a thin reading of
   scripts/lib/data.js load() — so age-band visibility applies here exactly as
   it applies to the public site, without this file knowing the rule exists.
   ========================================================================== */

const { guard, json, listPackages } = require("../../scripts/lib/social/server");
const D = require("../../scripts/lib/data");
const Sel = require("../../scripts/lib/social/select");

exports.handler = guard("GET", async ({ db, event }) => {
  const loaded = await D.load();
  const packages = await listPackages(db);
  const q = (event.queryStringParameters || {});

  const eligible = Sel.filterGuides(Sel.eligibleGuides(loaded), {
    q: q.q || "", topic: q.topic || "", age: q.age || ""
  });

  const rows = eligible.map(g => {
    const blocking = Sel.blockingPackageFor(g.slug, packages);
    const p = g.panel || {};
    const n = (k) => (p[k] && Array.isArray(p[k].items) ? p[k].items.filter(Boolean).length : 0);
    return {
      id: g.id, slug: g.slug, title: g.title, topic: g.topic, ages: g.ages,
      url: g.url, hasHero: Boolean(g.image),
      fields: { quick: Boolean(p.quick), normal: n("normal"), helped: n("helped"), warn: n("warn"), dont: n("dont") },
      packageId: blocking ? blocking.id : null,
      packageStatus: blocking ? blocking.status : null
    };
  });

  const skipped = (loaded.guides || [])
    .filter(g => !Sel.isEligible(g))
    .map(g => ({ slug: g.slug, title: g.title, reason: Sel.ineligibleReason(g) }));

  return json(200, {
    guides: rows,
    skipped,
    topics: (loaded.topics || []).map(t => ({ id: t.id, label: t.label })),
    ages: loaded.ages || [],
    source: loaded.source,
    warnings: loaded.warnings || []
  });
});
