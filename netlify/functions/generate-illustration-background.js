/* Netlify BACKGROUND function (the "-background" suffix lets it run up to 15 min,
   long enough for image generation — a normal function times out at ~10s).

   Flow: Studio POSTs {guideId, prompt, refs} -> this generates the image with
   OpenAI, uploads it to Firebase Storage, and writes the result to
   Firestore `illustration_jobs/{guideId}`. The Studio listens for that doc.

   Netlify env vars needed:
     OPENAI_API_KEY            your OpenAI key
     FIREBASE_SERVICE_ACCOUNT  full JSON of a Firebase service-account key
     FIREBASE_STORAGE_BUCKET   e.g. messy-parents.firebasestorage.app
*/
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}
const db = admin.firestore();
const bucket = admin.storage().bucket();

exports.handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return; }
  const { guideId, prompt, refs = [] } = body;
  if (!guideId || !prompt) return;
  const job = db.collection("illustration_jobs").doc(guideId);

  try {
    await job.set({ status: "working", ts: Date.now() });

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("size", "1536x1024");
    form.append("quality", "medium");

    let attached = 0;
    for (const url of refs) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        const type = r.headers.get("content-type") || "image/png";
        const name = (url.split("/").pop() || "ref.png").split("?")[0];
        form.append("image[]", new Blob([buf], { type }), name);
        attached++;
      } catch { /* skip a bad ref */ }
    }
    if (!attached) throw new Error("Could not load any reference images.");

    const resp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error?.message || "OpenAI request failed.");
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned by OpenAI.");

    const buffer = Buffer.from(b64, "base64");
    const path = `guides/${guideId}-${Date.now()}.png`;
    const file = bucket.file(path);
    await file.save(buffer, { contentType: "image/png", metadata: { cacheControl: "public,max-age=31536000" } });
    // Firebase Storage download URL — works with the public-read rule (no ACL / token needed).
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;

    await job.set({ status: "done", url, ts: Date.now() });
  } catch (e) {
    await db.collection("illustration_jobs").doc(guideId)
      .set({ status: "error", error: String((e && e.message) || e), ts: Date.now() });
  }
};
