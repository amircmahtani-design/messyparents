/* ============================================================================
   SOCIAL — READ ONE PACKAGE, WITH ITS SOURCE GUIDE

   GET ?id=…

   Returns the package and the guide it came from, so the dashboard can show
   Amir the approved words beside the social copy without a second round trip.
   That side-by-side is the whole point: checking that nothing was invented
   should not require opening the site in another tab.
   ========================================================================== */

const { guard, json, readPackage } = require("../../scripts/lib/social/server");
const { loadGuides } = require("../../scripts/lib/social/guides");

exports.handler = guard("GET", async ({ db, event }) => {
  const id = (event.queryStringParameters || {}).id;
  if (!id) return json(400, { error: "id is required" });

  const pkg = await readPackage(db, id);
  const loaded = await loadGuides(db);
  const g = (loaded.guides || []).find(x => x.slug === pkg.guideSlug) || null;

  return json(200, {
    package: pkg,
    guide: g ? {
      slug: g.slug, title: g.title, url: g.url, topic: g.topic, ages: g.ages,
      summary: g.summary, panel: g.panel, image: g.image
    } : null,
    guideMissing: !g
  });
});
