/* ============================================================================
   SOCIAL — DELETE A REJECTED PACKAGE, PERMANENTLY

   POST { id, confirmSlug, confirmTitle? }

   The Rejected tab used to be eternal: rejecting something moved it to a list
   it could never leave, so the list grew and stopped being read. This is the
   way out, and it is deliberately narrow.

   FIVE THINGS THIS WILL NOT DO

     1. It will not delete anything that is not EXACTLY in REJECTED. Not a
        draft, not a package awaiting review, and certainly not an approved
        one. Any other status is a 409 with the status named.

     2. It will not delete without confirmation. `confirmSlug` must match the
        package's own guide slug, so a mis-clicked id cannot destroy the wrong
        package — the browser has to have read the thing it is deleting.

     3. It will not delete the SOURCE. The guide, the guide's hero
        illustration, the character sheets, the poster references and the
        brand assets are never touched. The only files removed are the ones
        this package generated, and the only place it can look for them is
        social/<packageId>/ — a prefix scripts/lib/social/artwork.js builds
        and this function re-derives rather than trusting a stored path.

     4. It will not let the browser near Firestore. The rules say
        `allow write: if false` for social packages; every deletion goes
        through this authenticated function and the Admin SDK, exactly like
        every other mutation in this system.

     5. It will not pretend. If a storage object cannot be removed, the
        response says which ones and the document is still deleted, because a
        package the operator has rejected twice should not come back because
        of a bucket permission.

   tests/social-delete.js exercises the allowed case and every refused one.
   ========================================================================== */

const { guard, json, col, readPackage, app } = require("../../scripts/lib/social/server");
const DEL = require("../../scripts/lib/social/deletion");

exports.handler = guard("POST", async ({ db, body, user }) => {
  if (!body.id) return json(400, { error: "id is required" });

  const pkg = await readPackage(db, body.id);

  /* 1 and 2 — the policy, which lives in scripts/lib/social/deletion.js so it
     can be tested without a Firebase project. It refuses anything that is not
     exactly REJECTED, and anything the caller has not named correctly. */
  const decision = DEL.decideDeletion(pkg, body.confirmSlug);
  if (!decision.ok) {
    return json(decision.status, {
      error: decision.error, code: decision.code,
      status: decision.packageStatus, hint: decision.hint, expected: decision.expected
    });
  }

  /* 3 — its own generated media, and nothing else. */
  const bucket = app().storage().bucket();
  const prefix = decision.prefix;
  const removed = [], failed = [];

  const del = async (path) => {
    try { await bucket.file(path).delete({ ignoreNotFound: true }); removed.push(path); }
    catch (e) { failed.push({ path, error: String(e.message || e) }); }
  };

  /* Everything under the package's own folder, discovered rather than trusted.
     A file the document forgot about is still this package's file. */
  let listed = [];
  try {
    const [files] = await bucket.getFiles({ prefix });
    listed = files.map(f => f.name).filter(n => n.indexOf(prefix) === 0);
  } catch (e) {
    failed.push({ path: prefix, error: "could not list: " + String(e.message || e) });
  }

  const paths = DEL.withinPrefix(
    Array.from(new Set(listed.concat(DEL.ownedPaths(pkg)))), pkg.id);
  for (const p of paths) await del(p);

  /* 4 — the document. */
  await col(db).doc(pkg.id).delete();

  return json(200, {
    deleted: true,
    id: pkg.id,
    guideSlug: pkg.guideSlug,
    guideTitle: pkg.guideTitle,
    mediaRemoved: removed.length,
    mediaFailed: failed,
    deletedBy: (user && user.email) || null,
    note: "The package and its generated social media are gone. The guide, its illustration " +
      "and every shared reference asset are untouched."
  });
});
