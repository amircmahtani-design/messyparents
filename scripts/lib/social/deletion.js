/* ============================================================================
   SOCIAL — THE DELETION POLICY

   The decision that matters, kept out of the Netlify handler so it can be
   tested without a Firebase project — the same split as workflow.js. The
   handler does IO; this file decides whether the IO is allowed to happen.

   THE RULE, IN ONE LINE: a package may be deleted when its status is exactly
   REJECTED and the caller has named the guide it is deleting.

   Everything else is a refusal with a code, including the cases people assume
   are fine: a draft nobody wants, a package that was rejected and then sent
   back to editing, an approved package the operator has changed their mind
   about. Rejecting is free and reversible; deleting is neither, so it gets
   the narrow door.

   WHAT MAY BE DELETED, PHYSICALLY

   Only files under the package's own prefix — social/<packageId>/. That
   prefix is DERIVED here from the package id, never read from the document,
   so a corrupted or hand-edited `assetPath` pointing at guides/hero.png
   cannot be used to delete a guide illustration. ownedPaths() drops anything
   outside the prefix rather than trusting it.
   ========================================================================== */

const { STATES, STORAGE_PREFIX } = require("./config");

/* The one prefix a deletion may touch. Guide illustrations live under
   guides/, the references under refs/, the book under book/ — none of them
   are reachable from here. */
function packagePrefix(packageId) {
  return `${STORAGE_PREFIX}${packageId}/`;
}

/* May this package be deleted, and did the caller name it correctly? */
function decideDeletion(pkg, confirmSlug) {
  if (!pkg) {
    return { ok: false, status: 404, code: "NOT_FOUND", error: "package not found" };
  }

  if (pkg.status !== STATES.REJECTED) {
    return {
      ok: false, status: 409, code: "NOT_REJECTED", packageStatus: pkg.status,
      error: `Only a rejected package can be deleted. This one is ${pkg.status}.`,
      hint: pkg.status === STATES.APPROVED_HELD
        ? "Return it to editing or reject it first — deleting an approved package would discard a decision silently."
        : "Reject it first."
    };
  }

  const given = String(confirmSlug == null ? "" : confirmSlug).trim();
  if (!given || given !== String(pkg.guideSlug || "")) {
    return {
      ok: false, status: 400, code: "CONFIRMATION_MISMATCH",
      error: "The confirmation does not match this package.",
      expected: { guideSlug: pkg.guideSlug, guideTitle: pkg.guideTitle }
    };
  }

  return { ok: true, status: 200, prefix: packagePrefix(pkg.id) };
}

/* The generated media this package is allowed to own, taken from the document
   and then filtered against the prefix derived from its id. A path outside it
   is ignored — not followed, not reported as deleted. */
function ownedPaths(pkg) {
  if (!pkg || !pkg.id) return [];
  const want = packagePrefix(pkg.id);
  const out = new Set();
  const collect = (frame) => {
    const p = frame && frame.art && frame.art.assetPath;
    if (typeof p === "string" && p.indexOf(want) === 0) out.add(p);
  };
  (pkg.slides || []).forEach(collect);
  (((pkg.story || {}).frames) || []).forEach(collect);
  return Array.from(out);
}

/* Filter a listing from the bucket the same way. Belt and braces: the listing
   was made with the prefix, and this asserts it. */
function withinPrefix(paths, packageId) {
  const want = packagePrefix(packageId);
  return (paths || []).filter(p => typeof p === "string" && p.indexOf(want) === 0);
}

module.exports = { decideDeletion, ownedPaths, withinPrefix, packagePrefix };
