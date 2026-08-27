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
       baked into the prompt as absolute constraints. Solid GREEN background
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
const EMBED_MODEL = "text-embedding-3-small";
const PROMPT_VER  = "messy-parents-image-v2";
/* One corrective retry, not two. Every extra attempt costs a full image
   generation AND a full vision QA call, and a human approves the result by hand
   anyway — a third automated go at it roughly doubled the worst-case wait
   without meaningfully improving what landed in the review panel. */
const MAX_RETRIES = 1;

/* Compute a semantic embedding for a guide and save it back for Pass 3
   similarity searches. Silent-fail: never blocks or breaks generation. */
async function backfillEmbedding(guideId, g) {
  try {
    const text = [
      g.title || "",
      (g.panel && g.panel.eyebrow) || "",
      (g.panel && g.panel.summary) || g.summary || "",
      g.topic || "",
      (g.age || g.ageRange || "")
    ].filter(Boolean).join(" — ");
    if (!text.trim()) return;
    const r = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ input: text, model: EMBED_MODEL })
    });
    const j = await r.json();
    const vec = j?.data?.[0]?.embedding;
    if (!vec) return;
    await db.collection("guides").doc(guideId).set({
      embedding: vec,
      embeddingText: text,
      embeddingModel: EMBED_MODEL,
      embeddingAt: Date.now()
    }, { merge: true });
  } catch (_) { /* silent — Pass 3 will just skip similarity for guides without embeddings */ }
}

/* ---------- CANON: what a canonical Messy Parents illustration looks like -- */

const CHARACTER_BIBLE = {
  mama: "MAMA — woman with auburn/brown wavy hair pulled into a LOOSE MESSY BUN with soft strands falling out. She wears a BLUE RIBBED KNIT TURTLENECK sweater and BLUE JEANS that show the family's 'messy' brand: paint splatters, small stains and a visible knee patch. Round rosy pink cheeks, soft warm closed-eyed smile, warm friendly face. Never wears glasses.",
  papa: "PAPA — man with BLACK TOUSLED / spiky hair and a FULL THICK BLACK BEARD. He wears a GREY HOODIE (often lightly paint-stained) and BLUE JEANS with paint splatters and small doodled marks — the same 'messy' look as Mama. Kind tired eyes. NEVER wears glasses — Papa has no glasses, ever. He is often holding a white mug that reads 'DADA NEED COFFEE' — that mug is his signature prop and appears when it makes narrative sense, but it is NOT required in every illustration.",
  ari:  "ARI — chubby baby GIRL with SOFT BROWN HAIR (not blonde), big round rosy pink cheeks and a wide open-mouth cheerful smile with tongue visible. HER SIGNATURE OUTFIT is a PINK floral-print sleeveless romper covered in tiny scattered rose-pink flowers, with a LARGE PINK BOW at the chest — the pink romper and the pink chest bow are BINDING parts of her identity and are ALWAYS present in every illustration. Her HEAD is variable — she may wear a small gold paper crown, a soft headband, a pink hair bow, or nothing at all. Any of these is correct and none is required. Never carries a wooden spoon unless the scene brief explicitly requests it."
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
  "No floating decorative elements: NO soap bubbles, NO sparkles, NO floating hearts, NO stars, NO speech bubbles, NO thought bubbles, NO whimsical particles or emojis. Only draw physical objects that are actually part of the scene brief.",
  "No unrequested extra people, unexplained props, extra fingers or extra limbs. Simple environmental context (a rug, a couch) is fine when it grounds the scene, but do not add clutter — extra toys, books or objects — that are not called for by the brief.",
  "Every hand, arm and object must have an understandable owner and a natural position — hands and arms must not merge or belong to the wrong person.",
  "Ari should look cheerful, curious or mischievous unless the scene brief specifically requires discomfort. Do not make the baby look sick, distressed or frightened for a normal developmental or feeding topic.",
  "Do not make the parents look alarmed for a normal topic — keep medical and safety topics reassuring, not scary.",
  "TECHNICAL BACKGROUND REQUIREMENT — this is not aesthetic, it is required for the pipeline: the ENTIRE background behind the characters MUST be pure saturated bright green, RGB (0, 255, 0), hex #00FF00. Fill the whole canvas outside the characters with this exact bright green. Do NOT use muted green, sage green, olive, khaki, beige, cream, paper-tone, warm off-white, or any 'book-appropriate' subtle background. Do NOT add texture, watercolour wash, paper grain, gradient, vignette or scenery. The green must be flat, uniform and unmistakably #00FF00. Bright green must NEVER appear anywhere on the characters, their clothes, hair, skin or props — only on the background."
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

/* Generation quality. "high" roughly doubles the wall-clock of every image
   call, and there are up to two per job.

   Medium is the right default here, not just a draft setting: the hero slot on
   a guide page is capped at 530x285 CSS pixels, so even a 1024px medium render
   is already well beyond what any visitor sees. Note there is deliberately NO
   "re-render at high quality once approved" step — image generation is not
   deterministic, so a second pass would hand back a DIFFERENT picture rather
   than a sharper copy of the one you approved.

   Pass quality:"high" in the request, or set OPENAI_IMAGE_QUALITY, when a
   particular image needs it. */
const DRAFT_QUALITY = process.env.OPENAI_IMAGE_QUALITY || "medium";

function imageTool(size, quality) {
  return {
    type: "image_generation",
    model: IMAGE_MODEL,
    output_format: "png",
    size: size || "1024x1024",
    quality: quality || DRAFT_QUALITY
  };
}

function imgInput(url) { return { type: "input_image", image_url: url }; }

/* ---------- reference inlining ---------------------------------------------
   The Responses API used to be handed plain https:// URLs for every reference
   image, which meant OpenAI had to go and download five PNGs from our own site
   before it could start drawing — and again for the QA pass, and again for
   every retry. Once the reference set grew to include the 3MB brand board and
   the ~1.6MB approved scenes, that fetch started exceeding OpenAI's own
   download timeout and the whole job failed with:

     "Unable to download content from the provided URL before the timeout."

   We now fetch the references ourselves and send them inline as base64 data
   URLs. OpenAI makes no outbound request at all, so its timeout cannot fire.
   The bytes are cached in module scope: references never change, so a warm
   function instance fetches each one exactly once.                          */

const REF_CACHE = new Map();
const REF_FETCH_TIMEOUT_MS = 8000;

async function fetchAsDataUrl(url) {
  if (REF_CACHE.has(url)) return REF_CACHE.get(url);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REF_FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    const type = r.headers.get("content-type") || "image/png";
    const dataUrl = "data:" + type.split(";")[0] + ";base64," + buf.toString("base64");
    REF_CACHE.set(url, dataUrl);
    return dataUrl;
  } finally {
    clearTimeout(timer);
  }
}

/** Inline a list of reference URLs. If one cannot be fetched we fall back to
    the plain URL for that image rather than failing the whole generation. */
async function inlineRefs(urls) {
  return Promise.all((urls || []).map(async (u) => {
    if (/^data:/.test(u)) return u;
    try { return await fetchAsDataUrl(u); }
    catch (e) { console.error("ref inline failed, falling back to URL:", u, String(e)); return u; }
  }));
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

/* ---------- transparency: adaptive corner-sampled chroma-key --------------- */
/* gpt-image-2 doesn't support native transparent output. We ASK it for a solid
   bright green (#00FF00) background, but in practice the model often renders a
   muted "book-appropriate" green/khaki/beige instead of pure #00FF00.
   Naive fixed-colour chroma-keying fails on those muted backgrounds.

   This adaptive algorithm:
   1) Samples 8 corner-region pixels to determine what the AI ACTUALLY used
      as the background colour.
   2) Validates the samples agree (low variance) → we have a solid background.
   3) Chroma-keys against THAT specific colour, with generous tolerance and
      proper despill of the sampled hue.
   4) Falls back to the old green-dominance heuristic if corners disagree
      (e.g. the AI put scenery in a corner). */
function cutoutMagenta(b64) {
  const png = PNG.sync.read(Buffer.from(b64, "base64"));
  const d = png.data;
  const w = png.width, h = png.height;
  const n = w * h;

  /* ---- 1) What colour did the model ACTUALLY use behind the characters?
     Sample the border ring rather than eight scattered points: the border is
     background by definition unless the model drew edge-to-edge scenery. */
  const bs = [];
  const push = (x, y) => { const i = (y * w + x) * 4; bs.push([d[i], d[i+1], d[i+2]]); };
  const step = Math.max(1, Math.floor(Math.max(w, h) / 64));
  for (let x = 0; x < w; x += step) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y += step) { push(0, y); push(w - 1, y); }

  const med = (c) => { const a = bs.map(s => s[c]).sort((p, q) => p - q); return a[a.length >> 1]; };
  const bgR = med(0), bgG = med(1), bgB = med(2);

  /* ---- 2) Tolerance depends on what we found.
     A true #00FF00 chroma key is miles from anything in the artwork, so it can
     take a generous tolerance. A cream or paper-toned background — which is
     what the model produces whenever it ignores the green instruction — sits
     close to skin tones and highlights, so it needs a tight one. */
  const isGreenKey = (bgG - Math.max(bgR, bgB)) > 60;
  const TOL_FULL = isGreenKey ? 60 : 26;
  const TOL_EDGE = isGreenKey ? 120 : 58;
  const SPAN = TOL_EDGE - TOL_FULL;

  const dist = (i) => {
    const dr = d[i] - bgR, dg = d[i+1] - bgG, db = d[i+2] - bgB;
    return Math.sqrt(dr*dr + dg*dg + db*db);
  };

  /* ---- 3) Flood fill inward from the border.
     This is the part that matters. The old code keyed out every pixel in the
     image matching the background colour, which is why a cream background was
     unusable: it would also punch holes through cream paper highlights, skin
     and Papa's mug. Only background CONNECTED TO THE EDGE is removed, so
     colour matches sealed inside the artwork are left alone. */
  const bg = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;

  const seed = (x, y) => {
    const px = y * w + x;
    if (bg[px]) return;
    if (dist(px * 4) > TOL_EDGE) return;
    bg[px] = 1; stack[sp++] = px;
  };
  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

  while (sp > 0) {
    const px = stack[--sp];
    const x = px % w, y = (px / w) | 0;
    if (x > 0)     { const q = px - 1; if (!bg[q] && dist(q*4) <= TOL_EDGE) { bg[q] = 1; stack[sp++] = q; } }
    if (x < w - 1) { const q = px + 1; if (!bg[q] && dist(q*4) <= TOL_EDGE) { bg[q] = 1; stack[sp++] = q; } }
    if (y > 0)     { const q = px - w; if (!bg[q] && dist(q*4) <= TOL_EDGE) { bg[q] = 1; stack[sp++] = q; } }
    if (y < h - 1) { const q = px + w; if (!bg[q] && dist(q*4) <= TOL_EDGE) { bg[q] = 1; stack[sp++] = q; } }
  }

  /* ---- 4) Cut, feather the rim, and despill the background hue out of the
     half-transparent edge pixels so nothing carries a green or cream halo. */
  for (let px = 0; px < n; px++) {
    if (!bg[px]) continue;
    const i = px * 4;
    const dd = dist(i);
    if (dd <= TOL_FULL) {
      d[i+3] = 0;
    } else {
      const tt = (dd - TOL_FULL) / SPAN;
      d[i+3] = Math.round(d[i+3] * Math.min(1, tt));
      if (isGreenKey && d[i+1] > Math.max(d[i], d[i+2])) d[i+1] = Math.max(d[i], d[i+2]);
    }
  }

  return { b64: PNG.sync.write(png).toString("base64"), width: w, height: h };
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

/* When the human has already typed the scene, the planner has nothing to add.
   It was being asked to invent a visual moment and then told, in the same
   breath, to take the user's sentence "more or less verbatim" — a full model
   round trip to hand back what we already had. This builds the same brief
   shape deterministically, in zero API calls.

   Character resolution, in order:
     1. the chips the user actually clicked (Mama / Papa / Ari)
     2. failing that, the names mentioned in the description itself
     3. failing that, the whole family                                       */

const NAME_PATTERNS = {
  Mama: /\b(mama|mamma|mummy|mum|mother|mom)\b/i,
  Papa: /\b(papa|pappa|daddy|dad|father)\b/i,
  Ari:  /\b(ari|baby|infant|toddler|she|her)\b/i
};

function charactersFromText(text) {
  const found = [];
  for (const name of ["Mama", "Papa", "Ari"]) {
    if (NAME_PATTERNS[name].test(text)) found.push(name);
  }
  return found;
}

function briefFromDescription(guide, characterSelection, userVisualDescription) {
  const desc = (userVisualDescription || "").trim();
  let characters = (characterSelection && characterSelection.length)
    ? characterSelection.slice()
    : charactersFromText(desc);
  if (!characters.length) characters = ["Mama", "Papa", "Ari"];

  return {
    guideTopic:   guide.title || "parenting moment",
    /* The guide still supplies the concern — it is what QA checks the finished
       image against — but the visual moment is the user's, word for word. */
    parentConcern: ((guide.panel && guide.panel.summary) || guide.summary || guide.title || desc),
    coreMeaning:   ((guide.panel && guide.panel.summary) || guide.title || desc),
    visualMoment:  desc,
    characters,
    characterActions: {},
    expressions: {},
    props: [],
    ariAccessory: "none",
    tone: ["warm", "observational"],
    composition: "characters centred with breathing room",
    medicalIntensity: "none",
    mustShow: [desc],
    mustAvoid: ["glasses on Papa", "text", "extra characters"],
    _source: "user-description"
  };
}


/* The advice the guide actually gives its readers. The planner used to see only
   the title and summary, so it had no idea what the guide was telling parents to
   DO — which is how a safe-sleep guide whose own bullets read "on her back",
   "flat", "firm mattress, not a sofa or your bed", "nothing else in the cot at
   all" ended up illustrated with the baby asleep between both parents in an
   adult bed, on a pillow. The picture contradicted the advice printed directly
   beside it. These bullets are now binding on the planner, the drawing prompt
   and the QA reviewer alike. */
function guideAdvice(guide) {
  const p = (guide && guide.panel) || {};
  const items = (col) => (p[col] && Array.isArray(p[col].items) ? p[col].items : []);
  return {
    recommended: [].concat(items("normal"), items("helped")),
    cautions:    items("warn"),
    prohibited:  items("dont")
  };
}

function adviceBlock(guide) {
  const a = guideAdvice(guide);
  const lines = [];
  if (a.recommended.length) lines.push("THIS GUIDE RECOMMENDS:\n" + a.recommended.map(s => "  - " + s).join("\n"));
  if (a.cautions.length)    lines.push("THIS GUIDE WARNS ABOUT:\n"  + a.cautions.map(s => "  - " + s).join("\n"));
  if (a.prohibited.length)  lines.push("THIS GUIDE SAYS DO NOT:\n"  + a.prohibited.map(s => "  - " + s).join("\n"));
  return lines.join("\n\n");
}

async function planScene(guide, characterSelection, userVisualDescription) {
  const advice = adviceBlock(guide);
  const guideText = [
    "TITLE: "     + (guide.title || ""),
    "EYEBROW: "   + ((guide.panel && guide.panel.eyebrow) || ""),
    "SUMMARY: "   + ((guide.panel && guide.panel.summary) || ""),
    "CATEGORY: "  + (guide.category || guide.topic || ""),
    "AGE RANGE: " + (guide.age || guide.ageRange || ""),
    advice ? ("\n" + advice) : ""
  ].filter(Boolean).join("\n");

  const charConstraint = (characterSelection && characterSelection.length)
    ? ("\n\nMANDATORY CHARACTER SELECTION: This illustration MUST include exactly these characters and only these characters: " +
       characterSelection.join(", ") +
       ". Do not add anyone else, do not drop anyone. Build the visual moment around this specific set.")
    : "";

  const userDescBlock = (userVisualDescription && userVisualDescription.trim())
    ? ("\n\nUSER-DIRECTED VISUAL — the human author has described exactly what they want to see. Take this as the visualMoment more or less verbatim, only refine wording. Everything else (parentConcern, characters, expressions) should be derived to fit this exact scene:\n\"" + userVisualDescription.trim() + "\"")
    : "";

  const instruction =
    "You are the visual director for The Messy Parents Collection. Your job is to " +
    "pick the SINGLE visual moment that makes a parent read the guide and think " +
    "'yes, that is exactly my situation.'\n\n" +
    "Think in this order, and DO NOT skip a step:\n" +
    "1. PROBLEM: What specific parenting concern, question or frustration is this " +
    "guide addressing? State it in one sentence.\n" +
    "2. VISUAL EVIDENCE: What would a parent actually see happening at home when " +
    "this concern is live? (e.g. baby refusing a bottle by turning her head away; " +
    "baby crying at 3am while a bleary parent stands over the crib; baby smearing " +
    "food; parent holding a thermometer.) The visual must depict the ACTUAL BEHAVIOUR " +
    "the guide is about — never a tangentially related happy moment.\n" +
    "3. EMOTIONAL FRAME: What are the parents feeling? For 'why is my baby doing/" +
    "not doing X' guides they are mildly worried, puzzled or resigned — not alarmed, " +
    "not delighted. The illustration reassures the reader through calm parent body " +
    "language WHILE showing the real behaviour, not by pretending nothing is wrong.\n" +
    "4. COMPOSITION: Now design the single frame — who is in it, what they are doing, " +
    "expressions, props.\n\n" +
    "COMMON FAILURE TO AVOID: 'baby not drinking milk' shown as a happy baby eating " +
    "a banana. That misses the concern entirely — happy baby with banana = no problem = " +
    "the illustration disagrees with the guide's premise. The correct visual is baby " +
    "TURNING AWAY from the milk bottle while a parent looks mildly puzzled, holding " +
    "the bottle out. Show the refusal, not a substitute activity.\n\n" +
    "SAFETY CONTRADICTION CHECK — this overrides every other consideration. The " +
    "guide's own advice bullets are listed below the brief. The illustration must " +
    "NEVER depict a practice those bullets advise against. If the guide says the baby " +
    "should sleep flat, on her back, alone in her cot with nothing else in it, then do " +
    "NOT design a scene showing her asleep in an adult bed, on a sofa, propped up, on " +
    "her front, or among pillows, duvets, bumpers or toys — however warm that scene " +
    "would look. A cosy illustration that contradicts the safety advice printed beside " +
    "it is worse than no illustration at all. When a guide is about doing something " +
    "safely, either show it done correctly, or choose a moment that sidesteps the " +
    "practice entirely (a parent settling the baby, a parent listening at the door).\n\n" +
    "Other rules: Do not design a poster or reproduce the slide. Do not place titles, " +
    "body copy, labels or logos inside the illustration. Use only the characters who " +
    "genuinely improve the visual idea — do NOT automatically include all three family " +
    "members. Humour must come from recognisable parenting behaviour, not slapstick.\n\n" +
    "Return ONLY valid JSON matching this schema — no prose, no code fences:\n\n" +
    "{\n" +
    '  "guideTopic": string,\n' +
    '  "parentConcern": string,  // one sentence: the specific worry/question\n' +
    '  "coreMeaning": string,\n' +
    '  "visualMoment": string,   // must directly depict parentConcern\n' +
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
    "prop whenever characters touch or carry objects." + charConstraint + userDescBlock;

  const resp = await callResponses({
    model: ORCH_MODEL,
    input: [{ role: "user", content: [
      { type: "input_text", text: instruction + "\n\n---\n" + guideText }
    ]}]
  });

  const brief = parseJSONLoose(extractText(resp));
  if (!brief || !Array.isArray(brief.characters) || brief.characters.length === 0) {
    // Safe fallback so we never hard-fail: a warm generic family moment.
    const fallbackChars = (characterSelection && characterSelection.length)
      ? characterSelection
      : ["Mama", "Papa", "Ari"];
    return {
      guideTopic:   guide.title || "parenting moment",
      coreMeaning:  ((guide.panel && guide.panel.summary) || guide.title || ""),
      visualMoment: "Warm family moment relevant to the guide topic",
      characters:   fallbackChars,
      characterActions: {},
      expressions: { Mama: "warm, gentle", Papa: "warm, gentle", Ari: "cheerful" },
      props: [],
      ariAccessory: "none",
      tone: ["warm", "gentle"],
      composition: "characters centred with breathing room",
      medicalIntensity: "none",
      mustShow: [],
      mustAvoid: ["glasses on Papa", "text", "extra characters"],
      _fallback: true
    };
  }
  // Defensive override: if the user explicitly picked characters, force the
  // brief to match — the planner sometimes ignores the mandatory instruction.
  if (characterSelection && characterSelection.length) {
    brief.characters = characterSelection;
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
  const charUrls = [];
  const chosen = { characters: [], brand: null, approved: null };

  // 1) Character sheets — identity comes first
  for (const c of chars) {
    const file = manifest.characters[c];
    if (file) {
      const u = base + "/" + file;
      refs.push(u); charUrls.push(u); chosen.characters.push(file);
    }
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
  return { urls: refs, characterUrls: charUrls, chosen };
}

/* ---------- ICON MODE ------------------------------------------------------
   For small object illustrations (pram, bottle, car seat) in book pages.
   No character references, no identity risk. Same brand style but simpler.
   Icon subject is either explicit (user typed "pram") or inferred from
   the guide's context. */

async function planIconScene(guide, iconSubject, userVisualDescription) {
  const subject = (iconSubject || "").trim();
  const desc    = (userVisualDescription || "").trim();

  // If both are empty, ask the LLM to infer from the guide's text
  let finalSubject = subject;
  if (!finalSubject && !desc) {
    try {
      const guideText = [
        (guide.title || ""),
        ((guide.panel && guide.panel.eyebrow) || ""),
        ((guide.panel && guide.panel.summary) || guide.summary || "")
      ].filter(Boolean).join(" — ");
      const resp = await callResponses({
        model: ORCH_MODEL,
        input: [{ role: "user", content: [{ type: "input_text",
          text: "You are picking a single ICON to illustrate a section of a parenting book. " +
                "Given this guide text, name ONE clear physical object (2-4 words max) that " +
                "would work as a small stand-alone illustration. Reply with ONLY the object " +
                "name, no other words.\n\n" + guideText
        }]}]
      });
      finalSubject = (extractText(resp) || "baby bottle").trim().split("\n")[0].slice(0, 60);
    } catch (_) { finalSubject = "baby bottle"; }
  }

  return {
    guideTopic:   guide.title || "parenting icon",
    coreMeaning:  desc || finalSubject,
    visualMoment: desc || ("A single " + finalSubject + " icon"),
    iconSubject:  finalSubject || desc,
    userDescription: desc,
    tone: ["friendly", "clean"],
    composition: "one object centred, breathing room around it",
    mustShow: [finalSubject || desc].filter(Boolean),
    mustAvoid: ["people", "characters", "text", "background scenery"]
  };
}

function assembleIconReferences(manifest, refsBase) {
  const base = (refsBase || "").replace(/\/$/, "");
  const refs = [];
  const chosen = { brand: null };
  if (manifest.brand) {
    refs.push(base + "/" + manifest.brand);
    chosen.brand = manifest.brand;
  }
  return { urls: refs, characterUrls: [], chosen };
}

function buildIconPrompt(brief, retryNotes, userInstructions) {
  const subject = brief.iconSubject || brief.visualMoment || "an object";
  const parts = [
    "Draw ONE small icon in The Messy Parents Collection house style.",
    "",
    "STYLE: hand-drawn expressive black ink linework with soft watercolour fill, " +
    "warm muted palette, cream paper highlights, gently imperfect edges. " +
    "Match the exact same illustrator as the brand reference board provided.",
    "",
    "SUBJECT: " + subject + (brief.userDescription ? "  (" + brief.userDescription + ")" : ""),
    "",
    "HARD RULES:",
    "1. Draw ONLY the requested object. No people, no characters, no Mama, no Papa, no Ari, no baby.",
    "2. No text, letters, numbers, labels, logos or captions anywhere.",
    "3. No background scenery, environment, furniture or supporting objects — just the icon itself.",
    "4. Object should be centred with generous breathing room.",
    "5. Solid bright GREEN background (#00FF00, one flat colour). No gradient, no texture. " +
    "Green NEVER appears on the object itself — only on the background.",
    "6. Consistent line weight and watercolour treatment matching the brand board."
  ];
  if (retryNotes) parts.push("", "CORRECTIVE RETRY — fix these issues from the previous attempt:", retryNotes);
  if (userInstructions && userInstructions.trim()) {
    parts.push("", "USER OVERRIDE — apply exactly:", userInstructions.trim());
  }
  return parts.join("\n");
}

async function qaIcon(b64, refUrls, brief) {
  const instruction =
    "You are the QA reviewer for a children's-book icon. Compare the GENERATED image " +
    "against the BRAND REFERENCE. Return ONLY valid JSON:\n\n" +
    "{\n" +
    '  "subjectMatches": bool,       // is the requested object actually drawn?\n' +
    '  "styleMatches": bool,          // ink linework + watercolour, matching brand?\n' +
    '  "containsPeople": bool,        // any humans/characters visible? (should be false)\n' +
    '  "containsText": bool,          // any letters/labels? (should be false)\n' +
    '  "isSingleObject": bool,        // one focused icon vs cluttered scene?\n' +
    '  "backgroundIsClean": bool,     // solid colour, no scenery?\n' +
    '  "issues": [string],\n' +
    '  "decision": "accept" | "retry",\n' +
    '  "altText": string              // short plain-English description of the icon, e.g. "A blue baby stroller"\n' +
    "}\n\n" +
    "RETRY if: subject wrong or missing; people/characters appear; text appears; " +
    "multiple objects or scenery clutter the icon; background isn't clean.\n\n" +
    "REQUESTED SUBJECT: " + (brief.iconSubject || brief.visualMoment);

  const gen = "data:image/png;base64," + b64;
  const resp = await callResponses({
    model: ORCH_MODEL,
    input: [{ role: "user", content: [
      { type: "input_text", text: instruction },
      { type: "input_text", text: "BRAND REFERENCE:" },
      ...refUrls.map(imgInput),
      { type: "input_text", text: "GENERATED ICON:" },
      imgInput(gen)
    ]}]
  });

  const qa = parseJSONLoose(extractText(resp));
  if (!qa) return { decision: "retry", issues: ["QA response was not valid JSON"], _empty: true };
  // Map to the same shape the rest of the pipeline expects
  qa.sceneMeaningMatches = qa.subjectMatches !== false;
  qa.identity = {};
  qa.anatomyIsCoherent = true;
  qa.propsAreCorrect = qa.subjectMatches !== false;
  qa.containsUnrequestedText = qa.containsText === true;
  qa.containsUnrequestedObjects = qa.isSingleObject === false;
  qa.toneIsAppropriate = qa.styleMatches !== false;
  return qa;
}

/* Aspect ratio → gpt-image-2 size string. gpt-image-2 supports:
   1024x1024, 1024x1536 (portrait), 1536x1024 (landscape) */
function aspectRatioToSize(aspectRatio, brief) {
  const ar = (aspectRatio || "auto").toLowerCase();
  if (ar === "portrait")  return "1024x1536";
  if (ar === "landscape") return "1536x1024";
  if (ar === "fullpage")  return "1024x1536"; // full page ≈ portrait
  if (ar === "square")    return "1024x1024";
  // auto: character scenes with 3 characters go landscape, else square
  if (brief && brief.characters && brief.characters.length >= 3) return "1536x1024";
  return "1024x1024";
}

/* ---------- STAGE 3: generate ---------------------------------------------- */

function buildGenerationPrompt(brief, retryNotes, userInstructions, advice) {
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
    "PARENT'S CONCERN (this is the specific worry the guide addresses — the image must depict this literally): " + (brief.parentConcern || brief.coreMeaning || ""),
    "VISUAL MOMENT: " + brief.visualMoment,
    "COMPOSITION:   " + (brief.composition || "characters centred with breathing room"),
    "ACTIONS + EXPRESSIONS:",
    actLines,
    propsLine,
    ariAcc,
    "",
    "NARRATIVE CHECK before drawing: does this scene show the parent's actual concern? " +
    "If the concern is 'baby not eating', SHOW the refusal, not a happy substitute activity. " +
    "If the concern is 'baby not sleeping', SHOW an awake unsettled baby, not a peaceful one. " +
    "Parents' expressions should reflect mild puzzlement or gentle concern for a 'why/is-this-normal' guide — never alarmed, never delighted.",
    "",
    "HARD RULES (all must hold):",
    ...HARD_RULES.map((r, i) => (i + 1) + ". " + r)
  ];

  if (advice) {
    parts.push(
      "",
      "THE ADVICE THIS ILLUSTRATION SITS BESIDE — the image must not contradict it:",
      advice,
      "",
      "If any element of the scene would show a practice the bullets above advise " +
      "against, change that element. This outranks the scene brief."
    );
  }
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
  if (userInstructions && userInstructions.trim()) {
    parts.push(
      "",
      "USER OVERRIDE — the human author has specifically requested this change. " +
      "Apply it exactly while preserving the rest of the scene brief and all hard rules:",
      userInstructions.trim()
    );
  }
  return parts.join("\n");
}

async function generateImage(brief, refUrls, retryNotes, userInstructions, advice, quality) {
  const size = aspectRatioToSize(brief.aspectRatio, brief);
  const prompt = (brief.mode === "icon")
    ? buildIconPrompt(brief, retryNotes, userInstructions)
    : buildGenerationPrompt(brief, retryNotes, userInstructions, advice);

  const resp = await callResponses({
    model: ORCH_MODEL,
    tools: [imageTool(size, quality)],
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

async function qaImage(b64, refUrls, brief, advice) {
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
    '  "contradictsGuideAdvice": bool,  // does the image show a practice the guide advises against?\n' +
    '  "issues": [string],\n' +
    '  "decision": "accept" | "retry",\n' +
    '  "altText": string  // A single plain-English sentence describing what is happening in the image, for use as accessibility alt-text on the website. Focus on WHO is in the scene and WHAT they are doing. Do NOT mention brand elements (paint stains, mug branding) or style (watercolour). Max 140 characters. Example: "A mother gently offers a bottle to her baby daughter, who turns her head away with a puzzled look."\n' +
    "}\n\n" +
    "IDENTITY RULES — read carefully, this is where errors happen:\n" +
    "• MAMA identity = auburn/brown wavy hair in a LOOSE MESSY BUN with strands falling out, BLUE RIBBED TURTLENECK sweater, paint-stained blue jeans (with a knee patch), rosy cheeks, no glasses.\n" +
    "• PAPA identity = BLACK TOUSLED hair, FULL BLACK BEARD, grey hoodie, paint-stained/messy blue jeans, NO GLASSES ever. The 'DADA NEED COFFEE' mug is his signature but is OPTIONAL — don't flag him identity=false if he's not holding it.\n" +
    "• ARI identity = BROWN hair (not blonde), big rosy cheeks, wide open-mouth smile, PINK floral-print romper with a LARGE PINK BOW at the chest. " +
    "The pink romper and chest bow are BINDING. Her HEAD accessory (crown, headband, hair bow, or nothing) is VARIABLE and MUST NOT be treated as an identity mismatch — do NOT flag Ari as identity=false because her head accessory differs from any reference or from the brief. Only mark Ari identity=false if her face, hair colour, or the pink floral romper have changed.\n" +
    "• BRAND STYLE: hand-drawn ink linework + soft watercolour fill, warm muted palette, gently imperfect edges. Papa's and Mama's jeans should look 'lived in' — small paint stains, patches or scribble marks are correct, not defects.\n\n" +
    "NARRATIVE ALIGNMENT — this is what sceneMeaningMatches must actually check:\n" +
    "The scene brief contains a `parentConcern` field describing the SPECIFIC worry, " +
    "question or behaviour the guide addresses. The image must depict that concern " +
    "literally and recognisably. Mark sceneMeaningMatches=false if the image shows " +
    "a tangentially related happy moment instead of the actual concern.\n" +
    "Example failure: guide is 'why is my baby not drinking milk', image shows baby " +
    "happily eating a banana → sceneMeaningMatches=FALSE. The correct image would " +
    "show baby turning away FROM the bottle. A happy baby with a substitute activity " +
    "contradicts the guide's premise.\n" +
    "Example failure: guide is 'is this sleep regression?', image shows baby " +
    "peacefully asleep → sceneMeaningMatches=FALSE. Correct: baby awake and unsettled " +
    "at night while a bleary parent stands by.\n" +
    "Parent expressions should match the concern: for 'why/is-this-normal' guides, " +
    "parents look mildly puzzled or gently concerned — NOT alarmed, NOT delighted, " +
    "NOT indifferent.\n\n" +
    "AUTOMATIC RETRY if any of the following are true: a required character does " +
    "not match the identity rules above; Papa has glasses; Ari's face/hair colour/romper " +
    "have changed; a wooden spoon appears without being requested; arms/hands/held " +
    "objects are confused; the baby looks ill or distressed for a normal topic; " +
    "text or a logo appears; sceneMeaningMatches is false per the NARRATIVE ALIGNMENT " +
    "rules above; the image contains floating decorative elements " +
    "(soap bubbles, sparkles, hearts, stars, particles, speech bubbles) that were " +
    "not in the brief's `props` or `mustShow` — these count as containsUnrequestedObjects=true.\n\n" +
    "DO NOT retry over: variation in Ari's head accessory (a crown, headband, bow, or nothing are all acceptable); Papa not holding his coffee mug; paint stains being subtle or absent from jeans; minor pose differences; minor colour variations that don't affect identity.\n\n" +
    "SAFETY CONTRADICTION — check this before anything else. The guide's own advice " +
    "bullets are given below. Set contradictsGuideAdvice=true, and decision=\"retry\", if " +
    "the image depicts a practice those bullets advise against. Worked example: a guide " +
    "whose bullets read 'on her back, every sleep', 'flat — not propped or inclined', " +
    "'firm mattress, not a sofa or your bed', 'nothing else in the cot at all', " +
    "illustrated with the baby lying between both parents in an adult bed on a pillow " +
    "→ contradictsGuideAdvice=TRUE. The picture is charming and it tells the reader to " +
    "do the exact opposite of the advice beside it. This is a hard failure regardless " +
    "of how good the characters, style or composition are.\n\n" +
    (advice ? ("GUIDE ADVICE:\n" + advice + "\n\n") : "") +
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
  if (qa.contradictsGuideAdvice === true)     notes.push("- CRITICAL: the scene shows a practice this guide advises against. Redesign the moment so it agrees with the guide's own bullets, or pick a moment that avoids the practice entirely.");
  for (const i of qa.issues || []) notes.push("- " + i);
  return notes.join("\n") || "- Match the character references more closely.";
}

/* ---------- MAIN: orchestrate all four stages ------------------------------ */

const MANIFEST_CACHE = new Map();

async function loadManifest(refsBase) {
  const url = (refsBase || "").replace(/\/$/, "") + "/manifest.json";
  if (MANIFEST_CACHE.has(url)) return MANIFEST_CACHE.get(url);
  const r = await fetch(url);
  if (!r.ok) throw new Error("Could not load refs manifest at " + url);
  const j = await r.json();
  MANIFEST_CACHE.set(url, j);
  return j;
}

exports.handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return; }
  const {
    guideId,
    refsBase = "",
    sceneOverride = "",
    briefOverride = null,
    characterSelection = null,
    userInstructions = "",
    batchId = null,
    userVisualDescription = "",
    mode = "character",
    aspectRatio = "auto",
    iconSubject = "",
    forcePlan = false,
    quality = null
  } = body;
  if (!guideId) return;

  const job = db.collection("illustration_jobs").doc(guideId);

  try {
    const describedByUser = mode !== "icon" && !briefOverride && !forcePlan &&
                            !!(userVisualDescription || "").trim();
    await job.set({
      status: describedByUser ? "generating" : "planning",
      plannerSkipped: describedByUser,
      ts: Date.now(),
      promptVersion: PROMPT_VER
    });

    /* Fetch the guide so the planner has real content to work from */
    const gSnap = await db.collection("guides").doc(guideId).get();
    const guide = gSnap.exists ? gSnap.data() : { title: sceneOverride || guideId };
    if (sceneOverride) guide.title = sceneOverride;

    /* Fire-and-forget: compute this guide's semantic embedding if missing.
       Used later by Pass 3 for "this looks similar to X" reuse suggestions.
       Doesn't block generation, silent failure. ~$0.0001 per call. */
    if (!guide.embedding || guide.embeddingModel !== EMBED_MODEL) {
      backfillEmbedding(guideId, guide).catch(err => console.error("embed:", err));
    }

    /* STAGE 1 · PLAN (or accept the user's edited brief, or icon-mode brief) */
    let brief;
    if (mode === "icon") {
      brief = await planIconScene(guide, iconSubject, userVisualDescription);
    } else {
      const typed = (userVisualDescription || "").trim();
      if (briefOverride) {
        brief = briefOverride;
      } else if (typed && !forcePlan) {
        /* SKIP STAGE 1 — the user described the scene, so there is nothing
           for the planner to decide. Saves a full model round trip. */
        brief = briefFromDescription(guide, characterSelection, typed);
      } else {
        brief = await planScene(guide, characterSelection, userVisualDescription);
      }
      // If the user edited a brief AND also toggled character chips, honour the chips
      if (briefOverride && characterSelection && characterSelection.length) {
        brief = { ...brief, characters: characterSelection };
      }
    }
    brief.mode = mode;
    brief.aspectRatio = aspectRatio;
    await job.set({ status: "generating", brief, ts: Date.now() }, { merge: true });

    /* STAGE 2 · REFERENCES — icons need only the brand board, not characters */
    /* The guide's own bullets, threaded through drawing and review alike. */
    const advice = (mode === "icon") ? "" : adviceBlock(guide);

    const manifest = await loadManifest(refsBase);
    const { urls: rawRefUrls, characterUrls: rawCharUrls, chosen } = (mode === "icon")
      ? assembleIconReferences(manifest, refsBase)
      : assembleReferences(brief, manifest, refsBase);

    /* Fetch the reference bytes ourselves and pass them inline. See the note
       on inlineRefs() above — handing OpenAI URLs is what made this function
       start failing with "Unable to download content from the provided URL
       before the timeout". Cached, so this costs nothing on a warm instance. */
    const refUrls = await inlineRefs(rawRefUrls);

    /* The QA pass only checks character identity, so it gets the character
       sheets alone — no brand board, no approved scene. Roughly halves the
       payload on every review and every retry. */
    const qaRefUrls = (mode === "icon")
      ? refUrls
      : (rawCharUrls && rawCharUrls.length
          ? await inlineRefs(rawCharUrls)
          : refUrls);

    /* STAGE 3 + 4 · GENERATE with QA retry loop */
    let attempt = 0, retryNotes = "", best = null, bestQA = null, bestBorderRatio = 0;
    let accepted = false, finalB64 = null, finalQA = null;

    while (attempt <= MAX_RETRIES) {
      attempt++;
      await job.set({ status: "generating", attempt, ts: Date.now() }, { merge: true });

      const gen = await generateImage(brief, refUrls, retryNotes, userInstructions, advice, quality);

      /* transparency in code, then verify alpha */
      const cut = cutoutMagenta(gen.b64);
      const borderRatio = borderTransparencyRatio(cut.b64);
      const transparencyOk = borderRatio > 0.85; // most of the border should be alpha=0

      /* vision QA */
      await job.set({ status: "reviewing", attempt, ts: Date.now() }, { merge: true });
      let qa;
      try { qa = (brief.mode === "icon")
        ? await qaIcon(cut.b64, qaRefUrls, brief)
        : await qaImage(cut.b64, qaRefUrls, brief, advice); }
      catch (e) { qa = { decision: "retry", issues: ["QA call failed: " + (e.message || e)] }; }

      qa.transparencyOk = transparencyOk;
      qa.borderTransparencyRatio = Number(borderRatio.toFixed(3));
      if (!transparencyOk) qa.issues = (qa.issues || []).concat(["Border is not transparent (ratio " + qa.borderTransparencyRatio + ")."]);

      /* track the best attempt so we can surface it if all retries fail */
      if (!best || (transparencyOk && borderRatio > bestBorderRatio)) {
        best = cut.b64; bestQA = qa; bestBorderRatio = borderRatio;
      }

      /* A safety contradiction is never acceptable, whatever else QA thought. */
      if (qa.contradictsGuideAdvice === true) qa.decision = "retry";

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
      imageQuality: quality || DRAFT_QUALITY,
      orchestratorModel: ORCH_MODEL,
      promptVersion: PROMPT_VER,
      ts: Date.now()
    }, { merge: true });

    /* ---------- BATCH: update batch record and chain to the next guide ------- */
    if (batchId) {
      try { await afterBatchStep(batchId, guideId, {
        status: accepted ? "awaiting-approval" : "awaiting-approval-with-issues",
        url, qa: finalQA, brief, accepted, attempts: attempt
      }); } catch (e) { console.error("batch chain error:", e); }
    }

  } catch (e) {
    await job.set({
      status: "error",
      error: String((e && e.message) || e),
      promptVersion: PROMPT_VER,
      ts: Date.now()
    }, { merge: true });
    if (batchId) {
      try { await afterBatchStep(batchId, guideId, {
        status: "error", error: String((e && e.message) || e)
      }); } catch (e2) { console.error("batch chain error:", e2); }
    }
  }
};

/* ============================================================================
   BATCH CHAIN — runs after each generation when a batchId is set.
   Updates the batch record, then triggers the next pending guide by POSTing
   back to this same function URL. If all done, marks the batch completed.
   ========================================================================== */

async function afterBatchStep(batchId, guideId, result) {
  const batchRef = db.collection("batches").doc(batchId);

  // Save this guide's result AND advance the currentIndex
  await batchRef.set({
    results: { [guideId]: { ...result, finishedAt: Date.now() } },
    lastActivityAt: Date.now()
  }, { merge: true });

  // Reload the batch to find what's next
  const snap = await batchRef.get();
  if (!snap.exists) return;
  const batch = snap.data();

  // Respect user abort
  if (batch.status === "aborted") return;

  // Find the next guide whose result isn't recorded yet
  const done = batch.results || {};
  const nextGuideId = (batch.guideIds || []).find(id => !done[id]);

  if (!nextGuideId) {
    // Batch complete
    const summary = summariseBatch(batch);
    await batchRef.set({
      status: "completed",
      finishedAt: Date.now(),
      summary
    }, { merge: true });
    return;
  }

  // Trigger the next guide. Fire-and-forget — Netlify background function
  // returns immediately, our current invocation ends, next one starts fresh.
  const nextIndex = (batch.guideIds.indexOf(nextGuideId));
  await batchRef.set({
    status: "running",
    currentIndex: nextIndex,
    currentGuideId: nextGuideId
  }, { merge: true });

  const siteUrl = process.env.URL || process.env.DEPLOY_URL || "";
  if (!siteUrl) { console.error("no site URL env for chaining"); return; }

  await fetch(siteUrl + "/.netlify/functions/generate-illustration-background", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      guideId: nextGuideId,
      batchId,
      refsBase: batch.refsBase || "",
      characterSelection: (batch.guideOptions && batch.guideOptions[nextGuideId] && batch.guideOptions[nextGuideId].characterSelection) || null
    })
  });
}

function summariseBatch(batch) {
  const results = batch.results || {};
  let ok = 0, withIssues = 0, errored = 0;
  for (const id in results) {
    const s = results[id].status;
    if (s === "awaiting-approval") ok++;
    else if (s === "awaiting-approval-with-issues") withIssues++;
    else if (s === "error") errored++;
  }
  return { total: (batch.guideIds || []).length, ok, withIssues, errored };
}
