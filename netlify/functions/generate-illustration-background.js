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
const PROMPT_VER  = "messy-parents-image-v2";
const MAX_RETRIES = 2;

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

  // ---- 1) Sample corner regions
  const OFFSET = 4;
  const cornerPts = [
    [OFFSET,           OFFSET],
    [w - 1 - OFFSET,   OFFSET],
    [OFFSET,           h - 1 - OFFSET],
    [w - 1 - OFFSET,   h - 1 - OFFSET],
    [OFFSET,           Math.floor(h / 2)],
    [w - 1 - OFFSET,   Math.floor(h / 2)],
    [Math.floor(w / 2), OFFSET],
    [Math.floor(w / 2), h - 1 - OFFSET]
  ];
  const samples = cornerPts.map(([x, y]) => {
    const i = (y * w + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  });

  // ---- 2) Median → background colour candidate
  const median = c => {
    const arr = samples.map(s => s[c]).sort((a, b) => a - b);
    return arr[Math.floor(arr.length / 2)];
  };
  const bgR = median(0), bgG = median(1), bgB = median(2);

  // Variance check — do the samples agree?
  const dist = (s) => Math.hypot(s[0] - bgR, s[1] - bgG, s[2] - bgB);
  const spread = samples.reduce((m, s) => Math.max(m, dist(s)), 0);
  const hasSolidBackground = spread < 40;
  const isGreenish = bgG - Math.max(bgR, bgB) > 8;  // any green dominance

  // ---- 3) Adaptive chroma-key against the SAMPLED colour
  if (hasSolidBackground && isGreenish) {
    const TOL_FULL = 60;   // within this distance → fully transparent
    const TOL_EDGE = 120;  // within this distance → feathered
    const SPAN = TOL_EDGE - TOL_FULL;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const dr = r - bgR, dg = g - bgG, db = b - bgB;
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);

      if (distance <= TOL_FULL) {
        d[i + 3] = 0;
      } else if (distance <= TOL_EDGE) {
        // Feather the alpha
        const t = (distance - TOL_FULL) / SPAN;
        d[i + 3] = Math.round(d[i + 3] * t);
        // Despill: pull the green channel down toward max(R,B) to remove
        // the sampled colour's tint from edge pixels
        if (g > Math.max(r, b)) d[i + 1] = Math.max(r, b);
      }
    }
    return { b64: PNG.sync.write(png).toString("base64"), width: w, height: h };
  }

  // ---- 4) Fallback: the old green-dominance heuristic
  const FULL_GREEN = 100;
  const EDGE_GREEN = 20;
  const SPAN = FULL_GREEN - EDGE_GREEN;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const green = g - Math.max(r, b);
    if (green >= FULL_GREEN) {
      d[i + 3] = 0;
    } else if (green > EDGE_GREEN) {
      const t = (green - EDGE_GREEN) / SPAN;
      d[i + 3] = Math.round(d[i + 3] * (1 - t));
      d[i + 1] = Math.min(g, Math.max(r, b));
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

async function planScene(guide, characterSelection) {
  const guideText = [
    "TITLE: "     + (guide.title || ""),
    "EYEBROW: "   + ((guide.panel && guide.panel.eyebrow) || ""),
    "SUMMARY: "   + ((guide.panel && guide.panel.summary) || ""),
    "CATEGORY: "  + (guide.category || guide.topic || ""),
    "AGE RANGE: " + (guide.age || guide.ageRange || "")
  ].join("\n");

  const charConstraint = (characterSelection && characterSelection.length)
    ? ("\n\nMANDATORY CHARACTER SELECTION: This illustration MUST include exactly these characters and only these characters: " +
       characterSelection.join(", ") +
       ". Do not add anyone else, do not drop anyone. Build the visual moment around this specific set.")
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
    "prop whenever characters touch or carry objects." + charConstraint;

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

function buildGenerationPrompt(brief, retryNotes, userInstructions) {
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

async function generateImage(brief, refUrls, retryNotes, userInstructions) {
  const size = (brief.characters && brief.characters.length >= 3) ? "1536x1024" : "1024x1024";
  const prompt = buildGenerationPrompt(brief, retryNotes, userInstructions);

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
  const { guideId, refsBase = "", sceneOverride = "", briefOverride = null, characterSelection = null, userInstructions = "" } = body;
  if (!guideId) return;

  const job = db.collection("illustration_jobs").doc(guideId);

  try {
    await job.set({ status: "planning", ts: Date.now(), promptVersion: PROMPT_VER });

    /* Fetch the guide so the planner has real content to work from */
    const gSnap = await db.collection("guides").doc(guideId).get();
    const guide = gSnap.exists ? gSnap.data() : { title: sceneOverride || guideId };
    if (sceneOverride) guide.title = sceneOverride;

    /* STAGE 1 · PLAN (or accept the user's edited brief) */
    let brief = briefOverride || await planScene(guide, characterSelection);
    // If the user edited a brief AND also toggled character chips, honour the chips
    if (briefOverride && characterSelection && characterSelection.length) {
      brief = { ...brief, characters: characterSelection };
    }
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

      const gen = await generateImage(brief, refUrls, retryNotes, userInstructions);

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
