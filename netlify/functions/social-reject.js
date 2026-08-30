/* ============================================================================
   SOCIAL — REJECT, OR SEND BACK TO EDITING

   POST { id, reason?, toEditing?: bool }

   Rejecting clears any approval and records the reason. `toEditing` is the
   milder version — it takes an approved package back to NEEDS_REVIEW so it can
   be changed, which is the same transition an edit performs automatically.

   Either way the approval hash is cleared, because an approval that no longer
   corresponds to a decision is worse than no approval at all.
   ========================================================================== */

const { guard, json, col, readPackage, stamp } = require("../../scripts/lib/social/server");
const CFG = require("../../scripts/lib/social/config");

exports.handler = guard("POST", async ({ db, body, user }) => {
  if (!body.id) return json(400, { error: "id is required" });
  const pkg = await readPackage(db, body.id);

  const status = body.toEditing ? CFG.STATES.NEEDS_REVIEW : CFG.STATES.REJECTED;

  await col(db).doc(pkg.id).set(stamp({
    status,
    rejectedReason: body.toEditing ? null : (String(body.reason || "").slice(0, 500) || null),
    approvedHash: null, approvedAt: null, approvedBy: null
  }, user), { merge: true });

  return json(200, { id: pkg.id, status });
});
