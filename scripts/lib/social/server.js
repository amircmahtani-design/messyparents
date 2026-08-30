/* ============================================================================
   SOCIAL — SERVER HELPERS

   Shared by every netlify/functions/social-*.js. It lives under scripts/lib so
   that Netlify does not treat it as an endpoint of its own — every .js file in
   the functions directory becomes a public URL, and a shared module is not
   something anybody should be able to call.

   AUTHENTICATION follows the pattern already established by
   netlify/functions/publish.js: a Firebase ID token in the Authorization
   header, verified with the same service account, and then checked against the
   admin address. Nothing here trusts anything the browser says about itself.

   WRITES all happen through the Admin SDK, which bypasses security rules — so
   the rules can be as strict as they like (they say `allow write: if false`)
   and the server remains the only thing that can change a package. That is the
   whole reason approval cannot be forged from a browser console.
   ========================================================================== */

const admin = require("firebase-admin");
const CFG = require("./config");

/* The one account allowed in. Matches firestore.rules and storage.rules; the
   environment variable exists so a future second editor does not require a
   code change. Not a secret — it is already in the published rules. */
const ADMIN_EMAIL = (process.env.SOCIAL_ADMIN_EMAIL || "amircmahtani@gmail.com").toLowerCase();

let ready = false;
function app() {
  if (!ready) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    ready = true;
  }
  return admin;
}

const json = (statusCode, obj) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow"
  },
  body: JSON.stringify(obj)
});

/* Verify the caller. Returns the decoded token, or throws an object this
   module's `guard` turns into a 401/403. */
async function requireAdmin(event) {
  const authz = event.headers.authorization || event.headers.Authorization || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7).trim() : "";
  if (!token) { const e = new Error("missing ID token"); e.status = 401; throw e; }

  let user;
  try { user = await app().auth().verifyIdToken(token); }
  catch (err) { const e = new Error("invalid ID token"); e.status = 401; throw e; }

  if (String(user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    const e = new Error("not permitted"); e.status = 403; throw e;
  }
  return user;
}

/* Wrap a handler: method check, auth, JSON body, error shaping. Every social
   function is written as `exports.handler = guard("POST", async (ctx) => …)`
   so none of them can forget one of those steps. */
function guard(methods, fn) {
  const allowed = [].concat(methods);
  return async function (event) {
    if (!allowed.includes(event.httpMethod)) {
      return json(405, { error: `${allowed.join("/")} only` });
    }
    let user;
    try { user = await requireAdmin(event); }
    catch (e) { return json(e.status || 401, { error: e.message }); }

    let body = {};
    if (event.body) {
      try { body = JSON.parse(event.body); }
      catch (e) { return json(400, { error: "body is not JSON" }); }
    }

    try {
      return await fn({ event, user, body, db: app().firestore(), admin: app() });
    } catch (e) {
      if (e.code === "PUBLISHING_DISABLED") {
        return json(423, { error: e.message, code: e.code, reasons: e.reasons });
      }
      return json(500, { error: e.message || String(e) });
    }
  };
}

/* --------------------------------------------------------------------------
   PACKAGE ACCESS
   ------------------------------------------------------------------------ */
const col = (db) => db.collection(CFG.COLLECTION);

async function readPackage(db, id) {
  const snap = await col(db).doc(id).get();
  if (!snap.exists) { const e = new Error("package not found"); e.status = 404; throw e; }
  return Object.assign({ id: snap.id }, snap.data());
}

async function listPackages(db) {
  const snap = await col(db).orderBy("updatedAt", "desc").limit(500).get();
  const out = [];
  snap.forEach(d => out.push(Object.assign({ id: d.id }, d.data())));
  return out;
}

function stamp(patch, user) {
  return Object.assign({}, patch, {
    updatedAt: new Date().toISOString(),
    updatedBy: (user && user.email) || null
  });
}

module.exports = { app, json, guard, requireAdmin, col, readPackage, listPackages, stamp, ADMIN_EMAIL };
