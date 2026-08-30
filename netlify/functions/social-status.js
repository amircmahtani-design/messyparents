/* ============================================================================
   SOCIAL — DASHBOARD STATUS

   Everything the /social/ header needs in one authenticated call: whether
   publishing is locked, whether Meta is connected, how many guides are
   available, how many packages exist in each state, when the guide data was
   last read, and anything that went wrong reading it.

   The lock state is reported from scripts/lib/social/config.js — the same
   function the publish adapter asks — so the banner cannot say "enabled" while
   the server would refuse, or the other way round.
   ========================================================================== */

const { guard, json, listPackages } = require("../../scripts/lib/social/server");
const CFG = require("../../scripts/lib/social/config");
const { loadGuides } = require("../../scripts/lib/social/guides");
const Sel = require("../../scripts/lib/social/select");
const REFS = require("../../scripts/lib/social/refs");
const PROMPT = require("../../scripts/lib/social/artprompt");

exports.handler = guard("GET", async ({ db }) => {
  const loaded = await loadGuides(db);
  const eligible = Sel.eligibleGuides(loaded);
  const packages = await listPackages(db);

  const count = (s) => packages.filter(p => p.status === s).length;

  let refs = { version: null, count: 0, missing: [] };
  try {
    const m = REFS.loadManifest();
    refs = { version: m.version, count: m.library.length, missing: REFS.missingFiles(m) };
  } catch (e) {
    refs = { version: null, count: 0, missing: [{ id: "manifest", expected: e.message }] };
  }

  return json(200, {
    publishing: {
      enabled: CFG.publishingEnabled(),
      metaConnected: CFG.metaConfigured(),
      reasons: CFG.lockReasons()
    },
    guides: {
      total: loaded.guides.length,
      eligible: eligible.length,
      ineligible: loaded.guides.length - eligible.length,
      hidden: (loaded.hiddenGuides || []).length,
      source: loaded.source,
      refreshedAt: new Date().toISOString(),
      warnings: loaded.warnings || []
    },
    packages: {
      total: packages.length,
      draft: count(CFG.STATES.DRAFT),
      needsReview: count(CFG.STATES.NEEDS_REVIEW),
      approvedHeld: count(CFG.STATES.APPROVED_HELD),
      rejected: count(CFG.STATES.REJECTED),
      published: count(CFG.STATES.PUBLISHED),
      tests: packages.filter(p => p.isTest).length,
      withErrors: packages.filter(p => (p.validation || []).some(f => f.level === "error")).length
    },
    /* The artwork engine, reported the same way the publishing lock is: one
       function answers, and the banner cannot say "connected" while the
       server would refuse. The key itself is never returned — `configured` is
       a boolean derived from its presence and nothing more. */
    artwork: {
      engineConfigured: Boolean(process.env.OPENAI_API_KEY),
      imageModel: process.env.OPENAI_IMAGE_MODEL || PROMPT.DEFAULT_IMAGE_MODEL,
      promptVersion: PROMPT.PROMPT_VERSION,
      manifestVersion: refs.version,
      referenceCount: refs.count,
      missingReferences: refs.missing,
      queued: packages.filter(p => (p.artwork || {}).status === "QUEUED").length,
      generating: packages.filter(p => (p.artwork || {}).status === "GENERATING").length,
      ready: packages.filter(p => (p.artwork || {}).status === "READY").length,
      failed: packages.filter(p => (p.artwork || {}).status === "FAILED").length
    },

    animation: { status: "NOT_CONFIGURED", note: "See SOCIAL-README.md → Adding animation later." }
  });
});
