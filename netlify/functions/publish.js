/* ============================================================================
   Messy Parents — publish (trigger a Netlify build)
   ----------------------------------------------------------------------------
   Why this function exists.

   The build hook used to live in localStorage under "mpc.netlifyBuildHook".
   That works, but it is per-browser and per-device: paste it on the laptop and
   the iPad still says "Saved. Not published yet", clear site data and it is
   gone, and there is nothing to tell you it has gone except pages that quietly
   stop updating. Every save then lands in Firestore and never reaches the live
   site.

   The original note in studio/index.html rejected storing it in Firestore, and
   it was right to: meta/* is publicly readable, and a build hook is a
   write-only URL that anyone holding it can use to burn your build minutes.

   Netlify environment variables are the third option — server-side only, never
   sent to a browser, set once for the whole site rather than once per device.
   Studio POSTs here, this function holds the secret and forwards the trigger.

   Set NETLIFY_BUILD_HOOK in Site configuration -> Environment variables to the
   hook URL from Site configuration -> Build & deploy -> Build hooks.

   Access: a Firebase ID token is required, verified against the same service
   account the other functions use, so a stranger who finds this endpoint
   cannot spend your build minutes.
   ========================================================================== */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const json = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  const hook = (process.env.NETLIFY_BUILD_HOOK || "").trim();
  if (!hook) {
    return json(500, {
      error: "NETLIFY_BUILD_HOOK is not set",
      hint: "Netlify -> Site configuration -> Environment variables. Value comes from Build & deploy -> Build hooks."
    });
  }
  if (!/^https:\/\/api\.netlify\.com\/build_hooks\//.test(hook)) {
    return json(500, { error: "NETLIFY_BUILD_HOOK does not look like a Netlify build hook URL" });
  }

  /* Signed-in Studio users only. */
  const authz = event.headers.authorization || event.headers.Authorization || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7).trim() : "";
  if (!token) return json(401, { error: "missing ID token" });

  let user;
  try {
    user = await admin.auth().verifyIdToken(token);
  } catch (e) {
    return json(401, { error: "invalid ID token" });
  }

  try {
    const r = await fetch(hook, { method: "POST" });
    if (!r.ok) return json(502, { error: "build hook responded HTTP " + r.status });
    console.log("build triggered by", user.email || user.uid);
    return json(200, { ok: true, triggeredBy: user.email || user.uid });
  } catch (e) {
    return json(502, { error: "could not reach the build hook: " + String((e && e.message) || e) });
  }
};
