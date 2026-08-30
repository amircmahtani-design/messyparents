/* ============================================================================
   SOCIAL — APPROVE (AND HOLD)

   POST { id, expectedHash? }

   Approval is a server-side signature over content, not a status the browser
   can set. This function:

     1. re-reads the package from Firestore, ignoring anything the browser
        sent about its contents;
     2. re-runs validation and the content checks, and refuses if anything is
        an error;
     3. computes the content hash HERE, over the stored document;
     4. writes APPROVED_HELD with that hash, who approved it and when.

   `expectedHash`, when supplied, is the hash the dashboard computed from what
   was on screen. If it disagrees with the server's, the package changed under
   Amir between opening it and pressing the button, and approval is refused.
   That closes the last gap: approving something you were not looking at.

   APPROVED_HELD IS A TERMINAL STATE IN THIS PHASE. There is no scheduler, no
   queue drain and no publish function that will act on it. Approving means
   "these exact words are fine when we do go live" and nothing more.
   ========================================================================== */

const { guard, json, col, readPackage, stamp } = require("../../scripts/lib/social/server");
const CFG = require("../../scripts/lib/social/config");
const V = require("../../scripts/lib/social/validate");
const Safety = require("../../scripts/lib/social/safety");
const D = require("../../scripts/lib/data");
const W = require("../../scripts/lib/social/workflow");

exports.handler = guard("POST", async ({ db, body, user }) => {
  if (!body.id) return json(400, { error: "id is required" });

  const pkg = await readPackage(db, body.id);

  const loaded = await D.load();
  const guide = (loaded.guides || []).find(g => g.slug === pkg.guideSlug) || null;
  const findings = V.validatePackage(pkg).concat(guide ? Safety.lintPackage(pkg, guide) : []);

  /* The decision itself is scripts/lib/social/workflow.js, so it can be tested
     without a Firebase project. The hash it returns is computed from the
     STORED package — never from anything the request sent. */
  const decision = W.decideApproval(pkg, findings, body.expectedHash);

  if (!decision.ok) {
    return json(decision.status, {
      error: decision.error, code: decision.code,
      findings: decision.findings, validation: findings, serverHash: decision.hash,
      hint: decision.code === "CHANGED" ? "Reload it, read it again, then approve." : undefined
    });
  }
  if (decision.already) {
    return json(200, { id: pkg.id, status: pkg.status, approvedHash: pkg.approvedHash,
      note: "Already approved and held." });
  }
  const hash = decision.hash;

  await col(db).doc(pkg.id).set(stamp({
    status: CFG.STATES.APPROVED_HELD,
    approvedHash: hash,
    approvedAt: new Date().toISOString(),
    approvedBy: user.email || null,
    rejectedReason: null,
    validation: findings,
    /* Recorded so that a package approved during preview mode is honest about
       the fact that publishing was never available when it was approved. */
    approvedWhilePublishingDisabled: !CFG.publishingEnabled()
  }, user), { merge: true });

  return json(200, {
    id: pkg.id,
    status: CFG.STATES.APPROVED_HELD,
    approvedHash: hash,
    held: true,
    publishing: { enabled: CFG.publishingEnabled(), reasons: CFG.lockReasons() },
    note: "Approved and held. Nothing will publish — publishing is disabled and there is no scheduler."
  });
});
