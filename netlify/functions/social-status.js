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
const D = require("../../scripts/lib/data");
const Sel = require("../../scripts/lib/social/select");

exports.handler = guard("GET", async ({ db }) => {
  const loaded = await D.load();
  const eligible = Sel.eligibleGuides(loaded);
  const packages = await listPackages(db);

  const count = (s) => packages.filter(p => p.status === s).length;

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
    animation: { status: "NOT_CONFIGURED", note: "See SOCIAL-README.md → Adding animation later." }
  });
});
