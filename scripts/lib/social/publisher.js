/* ============================================================================
   SOCIAL — THE PUBLISHING ADAPTER

   This is the seam where Instagram will eventually be attached. Today it is
   deliberately hollow.

   READ THIS BEFORE CHANGING ANYTHING HERE.

   The adapter's contract is that `publish()` cannot reach Meta. It enforces
   that in three ways, in this order:

     1. assertPublishingAllowed() runs FIRST — before a client is built, before
        a payload is assembled, before anything is read. If the lock is closed
        the function throws and nothing further in this file executes.

     2. There is no Meta transport in this repository. `callGraph` below is a
        stub that throws. No URL for graph.facebook.com appears anywhere in
        scripts/ or netlify/, and tests/social-publishing-lock.js greps the
        tree to keep it that way.

     3. Even with the lock open, `publish()` refuses without credentials, and
        credentials are read from the environment at call time rather than held
        in module state — so a token cannot be smuggled in by a previous call.

   WHEN THE TIME COMES, the work is: implement callGraph against Meta's
   documented endpoints (POST /{ig-user-id}/media then /media_publish), keep
   the assert as the first line of publish(), and add a test that the assert
   still runs first. Nothing above this file needs to change.
   ========================================================================== */

const { assertPublishingAllowed, publishingEnabled, metaConfigured, PUBLISH_IMAGE_FORMAT } = require("./config");
const { hashMatches } = require("./hash");
const { STATES } = require("./config");

/* The transport. Not implemented on purpose. */
async function callGraph() {
  const e = new Error(
    "NOT_IMPLEMENTED: there is no Meta transport in this repository. " +
    "See SOCIAL-README.md → Connecting Meta later."
  );
  e.code = "NOT_IMPLEMENTED";
  throw e;
}

/* What a publish WOULD send, built without sending it. Used by the dashboard
   so Amir can see exactly what the payload will look like, and by tests, and
   it is the reason none of this needs to be written twice later. */
function buildPayload(pkg) {
  const slides = (pkg.slides || []).map((s, i) => ({
    kind: s.kind,
    /* Meta requires a publicly reachable JPEG. In preview mode there is no
       rendered asset yet, so this is the path a render would write to. */
    image_url: s.renderedUrl || null,
    expectedFormat: PUBLISH_IMAGE_FORMAT,
    is_carousel_item: true,
    position: i + 1
  }));

  return {
    kind: "carousel",
    caption: [pkg.caption, (pkg.hashtags || []).map(h => "#" + h).join(" ")]
      .filter(Boolean).join("\n\n"),
    children: slides,
    destination: pkg.destinationUrl,
    scheduledFor: pkg.scheduledFor,
    note: "Preview only. This payload has not been sent anywhere."
  };
}

/* The one entry point. It is not reachable with the lock closed. */
async function publish(pkg, { env } = {}) {
  /* 1 — the lock, first, always. */
  assertPublishingAllowed(env);

  /* 2 — approval, verified against content rather than trusted as a flag. */
  if (!pkg || pkg.status !== STATES.APPROVED_HELD) {
    const e = new Error("NOT_APPROVED: only an approved package can be published.");
    e.code = "NOT_APPROVED"; throw e;
  }
  if (!hashMatches(pkg)) {
    const e = new Error("HASH_MISMATCH: the content changed after it was approved.");
    e.code = "HASH_MISMATCH"; throw e;
  }

  /* 3 — rendered JPEG assets must exist and be public. */
  const missing = (pkg.slides || []).filter(s => !s.renderedUrl);
  if (missing.length) {
    const e = new Error(`NO_ASSETS: ${missing.length} slide(s) have no rendered image.`);
    e.code = "NO_ASSETS"; throw e;
  }

  return callGraph(buildPayload(pkg));
}

/* A description of the adapter, for the dashboard's status panel. */
function adapterStatus(env) {
  return {
    implemented: false,
    transport: "none",
    lockOpen: publishingEnabled(env),
    credentials: metaConfigured(env),
    imageFormat: PUBLISH_IMAGE_FORMAT,
    note: "No Meta transport exists in this repository."
  };
}

module.exports = { publish, buildPayload, adapterStatus, callGraph };
