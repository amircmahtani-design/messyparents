/* ============================================================================
   Messy Parents — start a batch illustration run
   ----------------------------------------------------------------------------
   1. Validate the request (guide IDs, options).
   2. Refuse if another batch is already running.
   3. Create a `batches/{batchId}` document tracking progress.
   4. Compute an embedding for every guide in the batch (for Pass 3 similarity /
      reuse suggestions). Cheap upfront cost, huge future flexibility.
   5. Trigger generate-illustration-background for the first guide with the
      batchId; each completion chains to the next.

   Request body:
   {
     guideIds:   ["id1", "id2", ...],       // required
     refsBase:   "https://.../assets/img/refs",
     guideOptions?: { "id1": { characterSelection: ["Mama","Ari"] }, ... }
   }
   ========================================================================== */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "bad JSON" }) }; }

  const { guideIds = [], refsBase = "", guideOptions = {} } = body;
  if (!Array.isArray(guideIds) || guideIds.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "guideIds required" }) };
  }
  if (guideIds.length > 100) {
    return { statusCode: 400, body: JSON.stringify({ error: "batch capped at 100 guides" }) };
  }

  /* ---- Refuse to start if there's already a running batch --------------- */
  const runningSnap = await db.collection("batches")
    .where("status", "in", ["queued", "running"])
    .limit(1)
    .get();
  if (!runningSnap.empty) {
    const existing = runningSnap.docs[0];
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: "another batch is already running",
        batchId: existing.id,
        status: existing.data().status
      })
    };
  }

  const batchId = "batch_" + Date.now();
  const now = Date.now();

  /* ---- Create the batch document ---------------------------------------- */
  await db.collection("batches").doc(batchId).set({
    id: batchId,
    createdAt: now,
    status: "queued",
    guideIds,
    guideOptions,
    refsBase,
    totalGuides: guideIds.length,
    currentIndex: 0,
    results: {},
    lastActivityAt: now
  });

  /* ---- Kick off the first guide ----------------------------------------- */
  const firstId = guideIds[0];
  await db.collection("batches").doc(batchId).set({
    status: "running",
    startedAt: Date.now(),
    currentGuideId: firstId,
    currentIndex: 0
  }, { merge: true });

  const siteUrl = process.env.URL || process.env.DEPLOY_URL || "";
  if (!siteUrl) {
    await db.collection("batches").doc(batchId).set({
      status: "failed",
      error: "No site URL env var — cannot chain functions"
    }, { merge: true });
    return { statusCode: 500, body: JSON.stringify({ error: "no site URL env" }) };
  }

  const opts = guideOptions[firstId] || {};
  await fetch(siteUrl + "/.netlify/functions/generate-illustration-background", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      guideId: firstId,
      batchId,
      refsBase,
      characterSelection: opts.characterSelection || null
    })
  });

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ batchId, totalGuides: guideIds.length })
  };
};
