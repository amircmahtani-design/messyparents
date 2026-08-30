/* ============================================================================
   SOCIAL — THE REFERENCE LIBRARY

   GET  (authenticated, read-only)

   Returns exactly what the generator selects from: assets/img/refs/manifest.json
   read through scripts/lib/social/refs.js, plus, for every slide family, the
   references that family's next image request WOULD attach.

   THAT SECOND HALF IS THE POINT. A References tab that lists seven approved
   posters while the generator quietly uses something else is decoration. Here
   the tab and the generator call the same function — REFS.selectFor() — so if
   the tab shows the warning poster against the warning family, that poster is
   what gets attached to the warning request. The tab is a view of the wiring,
   not a description of it.

   It also reports:

     • which manifest entries have no file behind them, by exact path, so a
       missing poster is named rather than silently replaced;
     • whether an image engine is configured at all, without ever revealing
       the key — a boolean, derived from the presence of OPENAI_API_KEY.
   ========================================================================== */

const { guard, json } = require("../../scripts/lib/social/server");
const REFS = require("../../scripts/lib/social/refs");
const PROMPT = require("../../scripts/lib/social/artprompt");

exports.handler = guard("GET", async () => {
  let manifest, error = null;
  try { manifest = REFS.loadManifest({ fresh: true }); }
  catch (e) {
    return json(500, { error: e.message, code: e.code || "MANIFEST_UNREADABLE" });
  }

  const view = REFS.libraryView(manifest);
  const missing = REFS.missingFiles(manifest);

  /* What each family would actually send. Any family whose poster is missing
     reports the error instead of a selection — loudly, by name. */
  const families = REFS.FAMILIES.map(family => {
    try {
      const sel = REFS.selectFor({ family, guide: { slug: "example", topic: "", title: "" }, manifest });
      return {
        family,
        posterId: sel.poster.id,
        characterIds: sel.characters.map(c => c.id),
        sceneId: sel.scene ? sel.scene.id : null,
        brandId: sel.brand.id,
        logoAllowed: REFS.LOGO_FAMILIES.indexOf(family) >= 0,
        attachedIds: sel.ids,
        attachedCount: sel.ids.length,
        safeArea: PROMPT.SAFE_AREAS[family] || null
      };
    } catch (e) {
      return { family, error: e.message, code: e.code || "MISSING_REFERENCE" };
    }
  });

  return json(200, {
    manifest: {
      version: view.version,
      updated: view.updated,
      groups: view.groups,
      count: view.references.length
    },
    references: view.references,
    families,
    missing,
    prompt: {
      version: PROMPT.PROMPT_VERSION,
      system: PROMPT.SYSTEM_PROMPT,
      prohibitions: PROMPT.PROHIBITIONS
    },
    /* Presence only. The key itself never leaves the server, is never logged
       and is never written to Firestore. */
    engine: {
      configured: Boolean(process.env.OPENAI_API_KEY),
      imageModel: process.env.OPENAI_IMAGE_MODEL || PROMPT.DEFAULT_IMAGE_MODEL,
      orchestratorModel: process.env.OPENAI_MODEL || "gpt-4o",
      note: Boolean(process.env.OPENAI_API_KEY)
        ? "Connected. Slide artwork is generated from these references and the exact wording is drawn over it afterwards."
        : "Not configured for this site. Slides fall back to the composed approved-artwork layout, which uses the same references locally and still contains no generated wording."
    },
    error
  });
});
