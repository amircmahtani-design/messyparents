/* ============================================================================
   SOCIAL — THE STATE MACHINE

   The decisions that matter, kept out of the Netlify handlers so they can be
   tested without a Firebase project: what an edit does to an approval, and
   whether an approval may be granted.

   The handlers do IO. This file decides. Nothing here reaches the network, so
   tests/social-approval.js can exercise every transition directly.
   ========================================================================== */

const { STATES, CLIENT_REQUESTABLE_STATES } = require("./config");
const { contentHash } = require("./hash");
const { blocking } = require("./validate");

/* Fields a browser may write. Anything else in a patch is ignored rather than
   rejected, so a newer dashboard sending an extra key cannot corrupt a
   package — and an older one cannot smuggle a status in as a content field. */
const EDITABLE = ["caption", "hashtags", "slides", "story", "scheduledFor",
  "destinationUrl", "destination", "note"];

function sanitisePatch(patch) {
  const out = {};
  EDITABLE.forEach(k => { if (patch && patch[k] !== undefined) out[k] = patch[k]; });
  return out;
}

/* --------------------------------------------------------------------------
   AN EDIT

   If the edit changes anything the approval hash covers, and the package was
   approved, the approval is CLEARED and the package returns to review.

   Not warned about. Cleared. The hash would catch it later anyway, but by then
   Amir would believe he had approved something he had never seen — and the
   dashboard would agree with him. Clearing it here is what keeps the screen
   and the truth in step.
   ------------------------------------------------------------------------ */
function applyEdit(before, patch, requestedStatus, derive) {
  const clean = sanitisePatch(patch);
  const after = Object.assign({}, before, clean);

  /* DERIVED CONTENT IS STILL CONTENT.

     The two platform captions are built from the shared caption, the hashtags
     and the destination, so an edit to any of those changes what would
     actually be posted. They have to be rebuilt BEFORE the hashes are
     compared: rebuilding them afterwards would let a package sit in
     APPROVED_HELD carrying copy nobody approved, and the next hash check
     would then fail for reasons nobody could see on screen. */
  if (typeof derive === "function") {
    const derived = derive(after) || {};
    Object.keys(derived).forEach(k => { after[k] = derived[k]; clean[k] = derived[k]; });
  }

  /* Compare hashes, not keys: re-saving identical text is not an edit. */
  const contentChanged = contentHash(before) !== contentHash(after);

  let status = requestedStatus || before.status;
  let approvalNote = null;
  let clearedApproval = false;

  if (contentChanged && before.status === STATES.APPROVED_HELD) {
    status = STATES.NEEDS_REVIEW;
    approvalNote = "Approval was cleared because the content changed.";
    clearedApproval = true;
  }

  if (clearedApproval) {
    after.approvedHash = null; after.approvedAt = null; after.approvedBy = null;
  }
  after.status = status;

  return { after, patch: clean, status, contentChanged, clearedApproval, approvalNote };
}

/* A status a browser is allowed to ask for. APPROVED_HELD and PUBLISHED are
   not on the list: approval is its own endpoint that hashes server-side, and
   publishing does not exist in this phase. */
function isClientRequestable(status) {
  return !status || CLIENT_REQUESTABLE_STATES.includes(status);
}

/* --------------------------------------------------------------------------
   AN APPROVAL

   The hash is computed from the STORED package. `expectedHash` is what the
   dashboard computed from what was on screen; when the two disagree the
   package moved under Amir between opening it and pressing the button, and
   approval is refused rather than granted over content he did not read.
   ------------------------------------------------------------------------ */
function decideApproval(pkg, findings, expectedHash) {
  if (!pkg) return { ok: false, code: "NOT_FOUND", status: 404, error: "package not found" };

  if (pkg.status === STATES.APPROVED_HELD) {
    return { ok: true, already: true, status: 200, hash: pkg.approvedHash, newStatus: STATES.APPROVED_HELD };
  }

  const hash = contentHash(pkg);

  if (expectedHash && expectedHash !== hash) {
    return {
      ok: false, code: "CHANGED", status: 409, hash,
      error: "This package changed since you opened it."
    };
  }

  const blockers = blocking(findings);
  if (blockers.length) {
    return { ok: false, code: "INVALID", status: 422, findings: blockers, hash,
      error: "This package has problems that have to be fixed first." };
  }

  return { ok: true, status: 200, hash, newStatus: STATES.APPROVED_HELD };
}

module.exports = { applyEdit, decideApproval, isClientRequestable, sanitisePatch, EDITABLE };
