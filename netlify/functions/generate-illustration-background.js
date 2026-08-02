/* ============================================================================
   Family Illustrator — persistent, session-based generator (Responses API).

   Behaves like ChatGPT's own image conversation:
     • Four CANONICAL SESSIONS: family, mama, papa, ari — each stored in
       Firestore `character_sessions/{key}` as { response_id, established, last_url }.
     • FIRST call for a session establishes the canon: it uploads only that
       session's canonical reference images + a binding "character lock" system
       prompt, and generates the first illustration.
     • EVERY LATER call continues from the stored response_id (no re-upload) —
       so faces / hair / clothing / style stay fixed; only pose/action/props change.
     • CONSISTENCY PASS: after each generation, a second pass feeds the result
       back with the canonical references and corrects ONLY character fidelity,
       without changing composition, pose or expression.
     • Output is transparent PNG (characters only, no scenery unless asked).

   Adding a future character (Grandma, Dog…) = add a key to CANON below. No other
   change needed.

   Env vars: OPENAI_API_KEY, FIREBASE_SERVICE_ACCOUNT, FIREBASE_STORAGE_BUCKET
   ========================================================================== */
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}
const db = admin.firestore();
const bucket = admin.storage().bucket();
const KEY = process.env.OPENAI_API_KEY;
// Orchestrator model (reads references, reasons, continues the session).
// Override with the OPENAI_MODEL env var to use a newer model on your account.
// The image itself is always drawn by the built-in image tool (gpt-image-1).
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

/* Canonical reference images per session (filenames in assets/img/refs/). */
const CANON = {
  family: { refs: ["mama.png", "papa.png", "ari-baby.png", "first-steps-high-five.png"], size: "1536x1024",
            who: "the whole family — Mama, Papa and baby Ari" },
  mama:   { refs: ["mama.png"], size: "1024x1024", who: "Mama" },
  papa:   { refs: ["papa.png"], size: "1024x1024", who: "Papa" },
  ari:    { refs: ["ari-baby.png"], size: "1024x1024", who: "baby Ari" }
};

const LOCK_PROMPT = (who) =>
  "You are the single illustrator for a children's-book brand. The uploaded reference images are NOT inspiration — " +
  "they are BINDING definitions of fixed, recurring characters (" + who + "). In every image you ever make in this " +
  "conversation you MUST reproduce the exact same characters: identical faces, hairstyles, beard, clothing, body " +
  "proportions, colours, textures and the exact hand-drawn ink + soft-watercolour illustration technique. " +
  "You may ONLY change pose, expression, action, props and composition. Never redesign a character. " +
  "Always output on a fully transparent background — only the character(s), no scenery or backdrop unless explicitly asked. " +
  "No text, letters, words, numbers or logos anywhere.";

const CORRECTION_PROMPT =
  "Correct only character consistency. Do not change the composition. Do not change the poses. " +
  "Do not change the expressions. Restore the characters so they match the canonical reference images as closely " +
  "as possible — same faces, hair, beard, clothing, proportions, colours and illustration technique. " +
  "Keep the transparent background. No text anywhere.";

function imageTool(size) {
  return { type: "image_generation", background: "transparent", output_format: "png", size: size || "1024x1024", quality: "high" };
}
function imgInput(url) { return { type: "input_image", image_url: url }; }

async function callResponses(payload) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || "Responses API error");
  return j;
}
function extractImage(resp) {
  const out = resp && resp.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      if (item.type === "image_generation_call" && item.result) return item.result;
      if (item.result && typeof item.result === "string") return item.result;
    }
  }
  return null;
}

exports.handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return; }
  const { guideId, sessionKey = "family", scene = "", refsBase = "" } = body;
  if (!guideId) return;

  const canon = CANON[sessionKey] || CANON.family;
  const refUrls = canon.refs.map(n => (refsBase || "").replace(/\/$/, "") + "/" + n);
  const job = db.collection("illustration_jobs").doc(guideId);
  const sessRef = db.collection("character_sessions").doc(sessionKey);

  try {
    await job.set({ status: "working", session: sessionKey, ts: Date.now() });
    const snap = await sessRef.get();
    const sess = snap.exists ? snap.data() : {};

    /* ---- 1) GENERATE ---- */
    let gen;
    if (!sess.response_id) {
      // establish the permanent canon (upload references once)
      gen = await callResponses({
        model: MODEL,
        instructions: LOCK_PROMPT(canon.who),
        input: [{ role: "user", content: [
          { type: "input_text", text:
            "These images define the permanent characters. Establish them as canon, then draw " + canon.who +
            ": " + (scene || "a simple friendly portrait") + ". Transparent background, characters only." },
          ...refUrls.map(imgInput)
        ]}],
        tools: [imageTool(canon.size)]
      });
    } else {
      // continue the existing illustration session — no re-upload
      gen = await callResponses({
        model: MODEL,
        previous_response_id: sess.response_id,
        input: [{ role: "user", content: [
          { type: "input_text", text:
            "Draw the same characters again — only change pose/action/expression/props/composition: " +
            (scene || "a new friendly moment") + ". Transparent background, characters only." }
        ]}],
        tools: [imageTool(canon.size)]
      });
    }
    let img = extractImage(gen);
    let respId = gen.id;
    if (!img) throw new Error("No image returned from the generation step.");

    /* ---- 2) CONSISTENCY PASS (continue from the generation, re-show canon) ---- */
    try {
      const corr = await callResponses({
        model: MODEL,
        previous_response_id: respId,
        input: [{ role: "user", content: [
          { type: "input_text", text: CORRECTION_PROMPT },
          ...refUrls.map(imgInput)
        ]}],
        tools: [imageTool(canon.size)]
      });
      const cimg = extractImage(corr);
      if (cimg) { img = cimg; respId = corr.id; }
    } catch (_) { /* keep the first image if correction fails */ }

    /* ---- upload + persist ---- */
    const buffer = Buffer.from(img, "base64");
    const path = `guides/${guideId}-${Date.now()}.png`;
    const file = bucket.file(path);
    await file.save(buffer, { contentType: "image/png", metadata: { cacheControl: "public,max-age=31536000" } });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;

    await sessRef.set({ response_id: respId, established: true, last_url: url, who: canon.who, updated: Date.now() }, { merge: true });
    await job.set({ status: "done", url, session: sessionKey, ts: Date.now() });
  } catch (e) {
    await db.collection("illustration_jobs").doc(guideId)
      .set({ status: "error", error: String((e && e.message) || e), ts: Date.now() });
  }
};
