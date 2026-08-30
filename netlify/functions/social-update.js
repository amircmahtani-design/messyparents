/* ============================================================================
   SOCIAL — EDIT A PACKAGE

   POST { id, patch: { caption?, hashtags?, slides?, story?, scheduledFor? } }

   THE IMPORTANT PART: any edit to content that approval covers clears the
   approval. Not "warns about". Clears it, and moves the package back to
   NEEDS_REVIEW.

   That is not a courtesy — it is what makes the approval hash meaningful. If a
   package could be edited while keeping its APPROVED_HELD status, the hash
   would still catch it at publish time, but Amir would believe he had approved
   something he had not seen. Invalidating here means the dashboard and the
   truth never disagree.

   The browser may not set `status` to APPROVED_HELD or PUBLISHED through this
   endpoint. Those are not status updates; approval is its own function, and
   publishing does not exist in this phase.
   ========================================================================== */

const { guard, json, col, readPackage, stamp } = require("../../scripts/lib/social/server");
const CFG = require("../../scripts/lib/social/config");
const V = require("../../scripts/lib/social/validate");
const Safety = require("../../scripts/lib/social/safety");
const { loadGuides } = require("../../scripts/lib/social/guides");
const W = require("../../scripts/lib/social/workflow");

exports.handler = guard("POST", async ({ db, body, user }) => {
  if (!body.id) return json(400, { error: "id is required" });
  const before = await readPackage(db, body.id);

  if (!W.isClientRequestable(body.status)) {
    return json(403, {
      error: `"${body.status}" cannot be set from the browser.`,
      hint: body.status === CFG.STATES.APPROVED_HELD
        ? "Approval goes through social-approve, which computes the content hash on the server."
        : "Publishing is disabled in this phase."
    });
  }

  const step = W.applyEdit(before, body.patch || {}, body.status);
  if (!Object.keys(step.patch).length && !body.status) return json(400, { error: "nothing to change" });

  /* Re-validate against the live guide, so a hand-edit is checked exactly as
     hard as a generated one. Amir may write whatever he likes; he is simply
     told what it trips. */
  const loaded = await loadGuides(db);
  const guide = (loaded.guides || []).find(g => g.slug === before.guideSlug) || null;
  const validation = V.validatePackage(step.after)
    .concat(guide ? Safety.lintPackage(step.after, guide) : []);

  const write = stamp(Object.assign({}, step.patch, {
    status: step.status,
    validation,
    approvedHash: step.after.approvedHash || null,
    approvedAt: step.after.approvedAt || null,
    approvedBy: step.after.approvedBy || null
  }), user);

  await col(db).doc(body.id).set(write, { merge: true });

  return json(200, {
    id: body.id,
    status: step.status,
    contentChanged: step.contentChanged,
    approvalNote: step.approvalNote,
    validation,
    canApprove: V.canApprove(validation)
  });
});
