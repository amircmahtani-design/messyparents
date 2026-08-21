/* ============================================================================
   Messy Parents — illustration generator (background, brand-safe)
   ----------------------------------------------------------------------------
   Four-stage pipeline. Every stage is designed to fail SAFELY: if anything
   drifts off-brand, the job is left in a state where the human has to approve
   before it can be attached to a guide. Nothing silently commits.

     STAGE 1 · PLAN
       Vision model reads the guide's title + panel copy and returns a
       structured scene brief JSON (single moment, characters needed,
       expressions, props, tone). Not a poster — one editorial illustration.

     STAGE 2 · REFERENCES
       Assemble fresh reference set for THIS generation from
       assets/img/refs/manifest.json:
         - Every character named in the brief (papa.png, mama.png, ari.png)
         - brand-reference-board.png  (palette + logo language)
         - One approved finished scene chosen by semantic similarity
       References are sent every single call — no session chaining, no
       drift-prone "canon already established" shortcut.

     STAGE 3 · GENERATE
       gpt-image-2 (configurable) via the Responses API, with hard rules
       ("Papa never has glasses", "no text", "no new characters", etc.)
       baked into the prompt as absolute constraints. Solid magenta background
       so transparency is done reliably in code, not by the model.

     STAGE 4 · QA + RETRY
       Vision model inspects the generated image against the references and
       returns structured JSON with per-character identity checks. Pixel-level
       alpha channel is verified in code (not just AI's word). If anything
       fails, up to two corrective retries listing the exact detected issues.
       If it still fails, the best attempt is saved with the QA verdict so
       the human sees what went wrong.

   Env vars: OPENAI_API_KEY, FIREBASE_SERVICE_ACCOUNT, FIREBASE_STORAGE_BUCKET
             OPENAI_IMAGE_MODEL (default: gpt-image-2)
             OPENAI_MODEL       (default: gpt-4o)
   ========================================================================== */

const admin = require("firebase-admin");
const { PNG } = require("pngjs");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}
const db     = admin.firestore();
const bucket = admin.storage().bucket();

const KEY         = process.env.OPENAI_API_KEY;
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const ORCH_MODEL  = process.env.OPENAI_MODEL       || "gpt-4o";
const PROMPT_VER  = "messy-parents-image-v2";
const MAX_RETRIES = 2;

/* ---------- CANON: what a canonical Messy Parents illustration looks like -- */

const CHARACTER_BIBLE = {
  mama: "MAMA — woman with auburn/brown wavy hair in a loose messy bun, warm light-blue ribbed knit sweater, blue jeans, rosy cheeks, warm friendly face, natural eyebrows. Never wears glasses.",
  papa: "PAPA — man with black tousled hair and a full black beard, grey hoodie, blue jeans, kind tired eyes, natural eyebrows. NEVER wears glasses — Papa has no glasses, ever.",
  ari:  "ARI — chubby baby girl with wispy blonde hair, big rosy cheeks, wide open-mouth smile, white floral-print sleeveless romper. Hair varies naturally between no accessory, a small pink bow, a soft headband, or a palm-tree ponytail. A gold paper crown is OCCASIONAL and only appears if the scene brief explicitly requests it. Never carries a wooden spoon unless the scene brief explicitly requests it."
};

const STYLE_BIBLE =
  "Hand-drawn editorial illustration in the Messy Parents Collection house style: " +
  "expressive black ink linework, soft watercolour fill, warm muted cosy palette, " +
  "cream paper highlights, gently imperfect edges, simplified shapes, affectionate " +
  "observational humour. Must feel drawn by the same illustrator as the approved " +
  "reference scenes — not a stock cartoon, not a vector illustration, not 3D.";

const HARD_RULES = [
  "Reproduce Mama, Papa and Ari EXACTLY as the character reference sheets show them — identical faces, hair, beard, clothing, proportions, skin tones, colours.",
  "Papa NEVER has glasses.",
  "Do not redesign, beautify, age, modernise or reinterpret any character.",
  "No written words, letters, headings, labels, logos, borders, numbers or captions anywhere in the image.",
  "No furniture, scenery, decorative shapes, extra people, unexplained props, extra fingers or extra limbs.",
  "Every hand, arm and object must have an understandable owner and a natural position — hands and arms must not merge or belong to the wrong person.",
  "Ari should look cheerful, curious or mischievous unless the scene brief specifically requires discomfort. Do not make the baby look sick, distressed or frightened for a normal developmental or feeding topic.",
  "Do not make the parents look alarmed for a normal topic — keep medical and safety topics reassuring, not scary.",
  "Solid bright magenta background (#FF00FF, one flat colour). No gradient, no texture, no scenery, no checkerboard. Magenta never appears on the characters themselves."
];

/* ---------- helpers --------------------------------------------------------- */

async function callResponses(payload) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || ("Responses API error: HTTP " + r.status));
  return j;
}

function imageTool(size) {
  return {
    type: "image_generation",
    model: IMAGE_MODEL,
    output_format: "png",
    size: size || "1024x1024",
    quality: "high"
  };
}

function imgInput(url) { return { type: "input_image", image_url: url }; }

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

function extractText(resp) {
  // Concatenate any text produced by the model, wherever it lives.
  const out = resp && resp.output;
  let s = "";
  if (Array.isArray(out)) {
    for (const item of out) {
      if (item.type === "message" && Array.isArray(item.content)) {
        for (const c of item.content) if (c.type === "output_text" && c.text) s += c.text;
      } else if (item.type === "output_text" && item.text) s += item.text;
    }
  }
  return s.trim();
}

/** Pull the first JSON object out of a text blob, tolerating code fences. */
function parseJSONLoose(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  const first = cleaned.indexOf("{");
  const last  = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { return null; }
}

/* ---------- transparency: chroma-key the magenta background in code -------- */
/* gpt-image-2 does not support native transparent output. We generate on a
   solid #FF00FF background — a colour the warm character palette never uses —
   and remove it here. Reliable, and lets us actually VERIFY alpha in code. */
function cutoutMagenta(b64) {
  const png = PNG.sync.read(Buffer.from(b64, "base64"));
  const d = png.data;
  const tol2 = 90 * 90;
  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - 255, dg = d[i + 1] - 0, db = d[i + 2] - 255;
    if (dr * dr + dg * dg + db * db <= tol2) d[i + 3] = 0;
  }
  return { b64: PNG.sync.write(png).toString("base64"), width: png.width, height: png.height };
}

/** How much of the image border is actually transparent? Sanity check. */
function borderTransparencyRatio(b64) {
  const png = PNG.sync.read(Buffer.from(b64, "base64"));
  const { width: w, height: h, data: d } = png;
  let seen = 0, transparent = 0;
  const check = (x, y) => {
    const i = (y * w + x) * 4;
    seen++;
    if (d[i + 3] === 0) transparent++;
  };
  for (let x = 0; x < w; x++) { check(x, 0); check(x, h - 1); }
  for (let y = 0; y < h; y++) { check(0, y); check(w - 1, y); }
  return seen ? transparent / seen : 0;
}

/* ---------- STAGE 1: PLAN --------------------------------------------------- */

async function planScene(guide) {
  const guideText = [
    "TITLE: "     + (guide.title || ""),
    "EYEBROW: "   + ((guide.panel && guide.panel.eyebrow) || ""),
    "SUMMARY: "   + ((guide.panel && guide.panel.summary) || ""),
    "CATEGORY: "  + (guide.category || guide.topic || ""),
    "AGE RANGE: " + (guide.age || guide.ageRange || "")
  ].join("\n");

  const instruction =
    "You are the visual director for The Messy Parents Collection. Read the guide " +
    "and identify the single clearest, warmest, most lightly humorous visual moment " +
    "that communicates its meaning. Do not design a poster or reproduce the slide. " +
    "Do not place titles, body copy, labels or logos inside the illustration. " +
    "Use only the characters who genuinely improve the visual idea — do NOT " +
    "automatically include all three family members. Keep medical and safety topics " +
    "reassuring, not frightening. Humour must come from recognisable parenting " +
    "behaviour. Return ONLY valid JSON matching this schema — no prose, no code " +
    "fences:\n\n" +
    "{\n" +
    '  "guideTopic": string,\n' +
    '  "coreMeaning": string,\n' +
    '  "visualMoment": string,\n' +
    '  "characters": ["Mama"|"Papa"|"Ari"],\n' +
    '  "characterActions": { "Mama"?: string, "Papa"?: string, "Ari"?: string },\n' +
    '  "expressions":       { "Mama"?: string, "Papa"?: string, "Ari"?: string },\n' +
    '  "props": [string],\n' +
    '  "ariAccessory": "none" | "pink bow" | "soft headband" | "palm-tree ponytail" | "crown",\n' +
    '  "tone": [string],\n' +
    '  "composition": string,\n' +
    '  "medicalIntensity": "none" | "low" | "moderate",\n' +
    '  "mustShow": [string],\n' +
    '  "mustAvoid": [string]\n' +
    "}\n\n" +
    "Explicitly resolve arm positions, who holds Ari, and which hand holds each " +
    "prop whenever characters touch or carry objects.";

  const resp = await callResponses({
    model: ORCH_MODEL,
    input: [{ role: "user", content: [
      { type: "input_text", text: instruction + "\n\n---\n" + guideText }
    ]}]
  });

  const brief = parseJSONLoose(extractText(resp));
  if (!brief || !Array.isArray(brief.characters) || brief.characters.length === 0) {
    // Safe fallback so we never hard-fail: a warm generic family moment.
    return {
      guideTopic:   guide.title || "parenting moment",
      coreMeaning:  ((guide.panel && guide.panel.summary) || guide.title || ""),
      visualMoment: "Warm family moment relevant to the guide topic",
      characters:   ["Mama", "Papa", "Ari"],
      characterActions: {},
      expressions: { Mama: "warm, gentle", Papa: "warm, gentle", Ari: "cheerful" },
      props: [],
      ariAccessory: "none",
      tone: ["warm", "gentle"],
      composition: "family group, characters centred with breathing room",
      medicalIntensity: "none",
      mustShow: [],
      mustAvoid: ["glasses on Papa", "text", "extra characters"],
      _fallback: true
    };
  }
  return brief;
}

/* ---------- STAGE 2: choose references ------------------------------------- */

/** Pick the approved scene most semantically similar to the brief. Simple
    keyword overlap — cheap and good enough. */
function pickApprovedScene(brief, approvedList) {
  const hay = (brief.composition + " " + brief.visualMoment + " " + (brief.characters||[]).join(" ")).toLowerCase();
  const score = (name) => {
    const n = name.toLowerCase();
    let s = 0;
    if (hay.includes("write") || hay.includes("book") || hay.includes("note")) if (n.includes("writing")) s += 3;
    if (hay.includes("milk") || hay.includes("bottle") || hay.includes("feed")) if (n.includes("milk")) s += 3;
    if (hay.includes("doctor") || hay.includes("safety") || hay.includes("check")) if (n.includes("doctor")) s += 3;
    // busier family compositions
    const chars = (brief.characters || []).length;
    if (chars >= 3 && n.includes("popular")) s += 2;
    if (chars >= 3 && n.includes("family")) s += 1;
    return s;
  };
  let best = approvedList[0], bestScore = -1;
  for (const n of approvedList) { const s = score(n); if (s > bestScore) { bestScore = s; best = n; } }
  return best;
}

function assembleReferences(brief, manifest, refsBase) {
  const base = (refsBase || "").replace(/\/$/, "");
  const chars = (brief.characters || []).map(c => c.toLowerCase());
  const refs = [];
  const chosen = { characters: [], brand: null, approved: null };

  // 1) Character sheets — identity comes first
  for (const c of chars) {
    const file = manifest.characters[c];
    if (file) { refs.push(base + "/" + file); chosen.characters.push(file); }
  }
  // 2) One approved finished scene — style and composition language
  if (manifest.approvedScenes && manifest.approvedScenes.length) {
    const pick = pickApprovedScene(brief, manifest.approvedScenes);
    refs.push(base + "/" + pick);
    chosen.approved = pick;
  }
  // 3) Brand board — palette and texture
  if (manifest.brand) {
    refs.push(base + "/" + manifest.brand);
    chosen.brand = manifest.brand;
  }
  return { urls: refs, chosen };
}

/* ---------- STAGE 3: generate ---------------------------------------------- */

function buildGenerationPrompt(brief, retryNotes) {
  const chars = (brief.characters || []);
  const bibleLines = chars.map(c => CHARACTER_BIBLE[c.toLowerCase()]).filter(Boolean).join("\n");
  const actions = brief.characterActions || {};
  const expr    = brief.expressions || {};
  const actLines = chars.map(c => {
    const a = actions[c] || "";
    const e = expr[c] || "";
    return c + ": " + [a, e ? "(" + e + ")" : ""].filter(Boolean).join(" ");
  }).join("\n");

  const propsLine = (brief.props && brief.props.length) ? ("PROPS: " + brief.props.join(", ")) : "PROPS: none";
  const ariAcc = brief.ariAccessory && brief.ariAccessory !== "none"
    ? "ARI'S HAIR: " + brief.ariAccessory
    : "ARI'S HAIR: no accessory";

  const parts = [
    "Create ONE standalone editorial illustration for The Messy Parents Collection.",
    "",
    "REFERENCE PRIORITY:",
    "1. Character sheets — identity and anatomy (BINDING).",
    "2. Approved finished scene — illustration finish, humour and composition language.",
    "3. Brand board — palette and texture.",
    "4. Guide meaning — from the scene brief below (never copy any slide layout or text).",
    "",
    "STYLE:",
    STYLE_BIBLE,
    "",
    "CHARACTERS PRESENT (only these, no others):",
    bibleLines,
    "",
    "SCENE:",
    "VISUAL MOMENT: " + brief.visualMoment,
    "COMPOSITION:   " + (brief.composition || "characters centred with breathing room"),
    "ACTIONS + EXPRESSIONS:",
    actLines,
    propsLine,
    ariAcc,
    "",
    "HARD RULES (all must hold):",
    ...HARD_RULES.map((r, i) => (i + 1) + ". " + r)
  ];

  if (brief.mustShow && brief.mustShow.length) parts.push("", "MUST SHOW: " + brief.mustShow.join("; "));
  if (brief.mustAvoid && brief.mustAvoid.length) parts.push("MUST AVOID: " + brief.mustAvoid.join("; "));

  if (retryNotes) {
    parts.push(
      "",
      "CORRECTIVE RETRY — previous attempt failed QA. Fix ONLY these issues and " +
      "preserve everything else that already passed:",
      retryNotes
    );
  }
  return parts.join("\n");
}

async function generateImage(brief, refUrls, retryNotes) {
  const size = (brief.characters && brief.characters.length >= 3) ? "1536x1024" : "1024x1024";
  const prompt = buildGenerationPrompt(brief, retryNotes);

  const resp = await callResponses({
    model: ORCH_MODEL,
    tools: [imageTool(size)],
    input: [{ role: "user", content: [
      { type: "input_text", text: prompt },
      ...refUrls.map(imgInput)
    ]}]
  });

  const img = extractImage(resp);
  if (!img) throw new Error("No image returned from generation step.");
  return { b64: img, size };
}

/* ---------- STAGE 4: QA + retry -------------------------------------------- */

async function qaImage(b64, refUrls, brief) {
  const instruction =
    "You are the QA reviewer for a children's-book illustration brand. Compare " +
    "the GENERATED image against the CHARACTER REFERENCES and the SCENE BRIEF. " +
    "Return ONLY valid JSON matching this schema — no prose:\n\n" +
    "{\n" +
    '  "identity": {\n' +
    '    "Mama": { "required": bool, "matches": bool, "issues": [string] },\n' +
    '    "Papa": { "required": bool, "matches": bool, "issues": [string] },\n' +
    '    "Ari":  { "required": bool, "matches": bool, "issues": [string] }\n' +
    "  },\n" +
    '  "sceneMeaningMatches": bool,\n' +
    '  "anatomyIsCoherent": bool,\n' +
    '  "propsAreCorrect": bool,\n' +
    '  "containsUnrequestedText": bool,\n' +
    '  "containsUnrequestedObjects": bool,\n' +
    '  "toneIsAppropriate": bool,\n' +
    '  "issues": [string],\n' +
    '  "decision": "accept" | "retry"\n' +
    "}\n\n" +
    "AUTOMATIC RETRY if any of the following are true: a required character does " +
    "not match the reference; Papa has glasses; Ari's design has changed; a crown " +
    "or spoon appears without being requested; arms/hands/held objects are " +
    "confused; the baby looks ill or distressed for a normal topic; text or a " +
    "logo appears; the image illustrates a generic scene instead of the brief's " +
    "actual meaning.\n\n" +
    "SCENE BRIEF:\n" + JSON.stringify(brief);

  const gen = "data:image/png;base64," + b64;
  const resp = await callResponses({
    model: ORCH_MODEL,
    input: [{ role: "user", content: [
      { type: "input_text", text: instruction },
      { type: "input_text", text: "CHARACTER REFERENCES:" },
      ...refUrls.map(imgInput),
      { type: "input_text", text: "GENERATED IMAGE:" },
      imgInput(gen)
    ]}]
  });

  const qa = parseJSONLoose(extractText(resp));
  if (!qa) return { decision: "retry", issues: ["QA response was not valid JSON"], _empty: true };
  return qa;
}

/** Convert a QA verdict into a concise instruction list for the retry prompt. */
function qaToRetryNotes(qa) {
  const notes = [];
  if (qa.identity) {
    for (const c of ["Mama", "Papa", "Ari"]) {
      const v = qa.identity[c];
      if (v && v.required && v.matches === false) {
        notes.push("- " + c + " identity drifted: " + ((v.issues || []).join("; ") || "does not match reference"));
      }
    }
  }
  if (qa.sceneMeaningMatches === false)       notes.push("- Illustration does not communicate the brief's visual moment.");
  if (qa.anatomyIsCoherent === false)         notes.push("- Anatomy is confused (hands/arms/held objects).");
  if (qa.propsAreCorrect === false)           notes.push("- Props are wrong or missing.");
  if (qa.containsUnrequestedText === true)    notes.push("- Remove all text, letters, numbers and logos.");
  if (qa.containsUnrequestedObjects === true) notes.push("- Remove objects not in the brief (glasses, wooden spoon, crown, extra people).");
  if (qa.toneIsAppropriate === false)         notes.push("- Tone is off — make it reassuring/warm, not alarmed or sad.");
  for (const i of qa.issues || []) notes.push("- " + i);
  return notes.join("\n") || "- Match the character references more closely.";
}

/* ---------- MAIN: orchestrate all four stages ------------------------------ */

async function loadManifest(refsBase) {
  const url = (refsBase || "").replace(/\/$/, "") + "/manifest.json";
  const r = await fetch(url);
  if (!r.ok) throw new Error("Could not load refs manifest at " + url);
  return await r.json();
}

exports.handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return; }
  const { guideId, refsBase = "", sceneOverride = "", briefOverride = null } = body;
  if (!guideId) return;

  const job = db.collection("illustration_jobs").doc(guideId);

  try {
    await job.set({ status: "planning", ts: Date.now(), promptVersion: PROMPT_VER });

    /* Fetch the guide so the planner has real content to work from */
    const gSnap = await db.collection("guides").doc(guideId).get();
    const guide = gSnap.exists ? gSnap.data() : { title: sceneOverride || guideId };
    if (sceneOverride) guide.title = sceneOverride;

    /* STAGE 1 · PLAN (or accept the user's edited brief) */
    const brief = briefOverride || await planScene(guide);
    await job.set({ status: "generating", brief, ts: Date.now() }, { merge: true });

    /* STAGE 2 · REFERENCES */
    const manifest = await loadManifest(refsBase);
    const { urls: refUrls, chosen } = assembleReferences(brief, manifest, refsBase);

    /* STAGE 3 + 4 · GENERATE with QA retry loop */
    let attempt = 0, retryNotes = "", best = null, bestQA = null, bestBorderRatio = 0;
    let accepted = false, finalB64 = null, finalQA = null;

    while (attempt <= MAX_RETRIES) {
      attempt++;
      await job.set({ status: "generating", attempt, ts: Date.now() }, { merge: true });

      const gen = await generateImage(brief, refUrls, retryNotes);

      /* transparency in code, then verify alpha */
      const cut = cutoutMagenta(gen.b64);
      const borderRatio = borderTransparencyRatio(cut.b64);
      const transparencyOk = borderRatio > 0.85; // most of the border should be alpha=0

      /* vision QA */
      await job.set({ status: "reviewing", attempt, ts: Date.now() }, { merge: true });
      let qa;
      try { qa = await qaImage(cut.b64, refUrls, brief); }
      catch (e) { qa = { decision: "retry", issues: ["QA call failed: " + (e.message || e)] }; }

      qa.transparencyOk = transparencyOk;
      qa.borderTransparencyRatio = Number(borderRatio.toFixed(3));
      if (!transparencyOk) qa.issues = (qa.issues || []).concat(["Border is not transparent (ratio " + qa.borderTransparencyRatio + ")."]);

      /* track the best attempt so we can surface it if all retries fail */
      if (!best || (transparencyOk && borderRatio > bestBorderRatio)) {
        best = cut.b64; bestQA = qa; bestBorderRatio = borderRatio;
      }

      if (qa.decision === "accept" && transparencyOk) {
        accepted = true; finalB64 = cut.b64; finalQA = qa; break;
      }
      retryNotes = qaToRetryNotes(qa);
      if (attempt > MAX_RETRIES) { finalB64 = best; finalQA = bestQA; break; }
    }

    /* Upload — but mark PENDING APPROVAL (not attached to guide until user OKs) */
    const buffer = Buffer.from(finalB64, "base64");
    const path = "guides-pending/" + guideId + "-" + Date.now() + ".png";
    const file = bucket.file(path);
    await file.save(buffer, {
      contentType: "image/png",
      metadata: { cacheControl: "public,max-age=31536000" }
    });
    const url = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name +
                "/o/" + encodeURIComponent(path) + "?alt=media";

    await job.set({
      status: accepted ? "awaiting-approval" : "awaiting-approval-with-issues",
      url,
      brief,
      qa: finalQA,
      accepted,
      attempts: attempt,
      referencesUsed: chosen,
      imageModel: IMAGE_MODEL,
      orchestratorModel: ORCH_MODEL,
      promptVersion: PROMPT_VER,
      ts: Date.now()
    }, { merge: true });

  } catch (e) {
    await job.set({
      status: "error",
      error: String((e && e.message) || e),
      promptVersion: PROMPT_VER,
      ts: Date.now()
    }, { merge: true });
  }
};
