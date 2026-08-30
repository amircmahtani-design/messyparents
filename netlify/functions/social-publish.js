/* ============================================================================
   SOCIAL — PUBLISH (DISABLED)

   This endpoint exists so that the lock is testable and so that the shape of
   the future call is visible. It cannot publish.

   Every request lands on assertPublishingAllowed() inside the adapter before
   anything else happens, and that throws while SOCIAL_PUBLISHING_ENABLED is
   not exactly "true" — which it is not, and which it defaults to when the
   variable is absent entirely.

   There is deliberately NO caller for this function anywhere in the codebase:
   no scheduled function in netlify.toml, no retry, no timeout, no client
   button. tests/social-publishing-lock.js asserts that too, because a lock
   nobody can reach is stronger than a lock everybody can.

   With `dryRun: true` it returns the payload that WOULD be sent, built without
   contacting anything. That is the only branch that returns 200.
   ========================================================================== */

const { guard, json, readPackage } = require("../../scripts/lib/social/server");
const CFG = require("../../scripts/lib/social/config");
const Pub = require("../../scripts/lib/social/publisher");

exports.handler = guard("POST", async ({ db, body }) => {
  const locked = !CFG.publishingEnabled() || !CFG.metaConfigured();

  if (body.dryRun) {
    const pkg = await readPackage(db, body.id);
    return json(200, {
      dryRun: true,
      published: false,
      locked,
      reasons: CFG.lockReasons(),
      adapter: Pub.adapterStatus(),
      payload: Pub.buildPayload(pkg),
      note: "Nothing was sent. This is what the request would contain."
    });
  }

  /* The real path. It throws; guard() turns PUBLISHING_DISABLED into a 423. */
  const pkg = await readPackage(db, body.id);
  await Pub.publish(pkg);

  /* Unreachable while the lock is closed. Kept so the shape is obvious. */
  return json(200, { published: true });
});
