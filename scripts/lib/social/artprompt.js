/* ============================================================================
   SOCIAL — THE IMAGE PROMPT BUILDER

   ONE place builds every prompt sent to the image model. Not a string in the
   Netlify function, not a template literal in the renderer, not a per-family
   copy that drifts. This file, versioned, so that PROMPT_VERSION recorded on a
   slide tells you exactly which words produced the artwork on it.

   WHAT THE MODEL IS FOR, AND WHAT IT IS NOT FOR

   It draws. It composes, textures and decorates. It is handed the approved
   poster for the family, the character sheets, one approved scene and the
   brand board, and asked to make an illustrated base in that language.

   It does not write. Every readable word on a finished slide — the headline,
   the labels, the warning, the CTA, the URL, the logo — is drawn afterwards by
   scripts/lib/social/templates.js from text that has already been through the
   grounding and safety checks. The model is explicitly forbidden from drawing
   letters, and a base that comes back with letters in it is rejected rather
   than shown (see artwork.js looksLikeItHasText).

   That split is not a stylistic preference. It is the only arrangement in
   which a medical warning can be both illustrated and exact.

   TEXT-SAFE AREAS. Each family declares the region the overlay will occupy, in
   plain language and as a fraction of the canvas. The model is told to leave
   it visually calm — a painted field or paper, not a face and not fine detail
   — so the deterministic type lands on something it can be read against.
   ========================================================================== */

/* Bump this when the wording below changes in a way that would produce
   different artwork. It is written onto every generated slide and it is part
   of the approval hash, so a prompt change invalidates approvals — which is
   correct: the picture Amir approved is not the picture this would now make. */
const PROMPT_VERSION = "mpc-social-art-v2";

/* The default image model. Overridable by OPENAI_IMAGE_MODEL, recorded on
   every slide, and part of the approval hash. */
const DEFAULT_IMAGE_MODEL = "gpt-image-1";

/* --------------------------------------------------------------------------
   THE SYSTEM PROMPT

   Sent verbatim with every request, ahead of the family-specific brief. The
   brief asked for this wording specifically; it is reproduced exactly and any
   change is a versioned change.
   ------------------------------------------------------------------------ */
const SYSTEM_PROMPT =
  "Create an illustrated MPC poster base using the attached images as strict visual and " +
  "character references. Preserve the established Mama, Papa and Ari identities, including " +
  "faces, hair, clothing palette, proportions and hand-drawn finish. Do not introduce realistic " +
  "people or replacement characters. Do not draw readable words, letters, captions, labels, " +
  "logos or watermarks. Leave the specified text-safe area visually calm. Use expressive painted " +
  "shapes, torn cream paper, hand-drawn marks, confident asymmetry and an editorial " +
  "children's-book finish. This is background and illustration artwork only; exact wording will " +
  "be added programmatically.";

/* --------------------------------------------------------------------------
   THE TONE INSTRUCTION

   Sent with every request, right after the system prompt.

   The first version of this builder asked for "deep blue and orange" and
   "confident asymmetry" and got something nobody wanted: huge rigid all-caps
   over full-width red and dark-blue banners, symmetrical figures staring
   outward, commanding phrases filling the frame. Wartime notice, not parenting
   notebook. The palette words were doing it — "deep blue" and "orange" with no
   values attached land on navy and vermilion, which is the propaganda poster's
   colour pair — and so was asking for "confident" composition without ever
   saying warm.

   So the values are now stated as hex, taken from assets/css/tokens.css, and
   the aesthetic to avoid is named explicitly. A model will not avoid a genre it
   was never told about.
   ------------------------------------------------------------------------ */
const TONE_PROMPT =
  "Create a warm Messy Parents Collection editorial illustration, not an advertisement or " +
  "propaganda poster. Avoid military recruitment imagery, political poster composition, " +
  "patriotic colour blocking, rigid proclamation layouts and commanding all-caps typography. " +
  "Use the softer MPC palette: cream #FBF0D3, paper #F7ECD2, drawn blue #3F6FA3, pale blue " +
  "#C9DCED, drawn orange #E2601F and charcoal #211D18. Warning coral #D4553A may be used " +
  "sparingly only for warning emphasis. The scene must be materially different from the other " +
  "slides in this package and must visually express this slide's specific grounded concept.";

/* The palette, as values. Repeated in the body of every prompt because a model
   given a colour NAME picks the saturated version of it. */
const PALETTE = [
  "cream ground #FBF0D3 and #FDF8EC",
  "paper #F7ECD2 for torn pieces",
  "charcoal ink #211D18, hand-drawn charcoal #2B2622 for line work",
  "soft drawn blue #3F6FA3 for painted patches and clothing",
  "pale blue #C9DCED and blue wash #E7F0FB for soft fields",
  "drawn orange #E2601F for warm accents, used in small amounts",
  "warm amber #C07F1E and amber fill #FDF1D8",
  "warning coral #D4553A and soft warning fill #F9E2DA — WARNING SLIDES ONLY, and even " +
    "there as a soft patch rather than a filled banner"
].join("; ");

/* --------------------------------------------------------------------------
   WHAT THE ATTACHED IMAGES ARE

   The model is told what each attachment is FOR. Handing it five pictures
   without saying which one is identity and which one is palette is how a
   character ends up wearing the brand board's colours.
   ------------------------------------------------------------------------ */
function referenceLegend(selection) {
  const lines = [];
  lines.push(`1. POSTER REFERENCE (${selection.poster.name}) — the composition, ` +
    "scale contrast, torn-paper treatment and colour blocking to imitate. Copy its ENERGY " +
    "and its layout language. Do not copy its subject matter and do not copy any lettering " +
    "from it; the lettering in that reference is exactly what you must leave out.");

  selection.characters.forEach((c, i) => {
    lines.push(`${i + 2}. CHARACTER SHEET — ${c.name}. ${c.note || ""} This is an identity ` +
      "reference and it is binding: the face, hair, facial hair, skin tone, clothing colours " +
      "and body proportions in the finished artwork must match it. Do not restyle, age, " +
      "beautify or reinterpret this character.");
  });

  let n = selection.characters.length + 2;
  if (selection.scene) {
    lines.push(`${n}. APPROVED SCENE (${selection.scene.name}) — an already-approved finished ` +
      "illustration. Match its line quality, shading, colour handling and level of detail. " +
      "It shows the standard the output is measured against.");
    n++;
  }
  lines.push(`${n}. BRAND REFERENCE BOARD — paper tone and line quality. Take the TEXTURE from ` +
    "here, but take the COLOUR from the hex values listed under PALETTE below: the board is " +
    "printed at a higher saturation than the artwork should be. The logo visible on this board " +
    "is a reference, NOT something to draw.");

  return lines.join("\n");
}

/* --------------------------------------------------------------------------
   PER-FAMILY BRIEFS

   `meaning` says what the slide is about, so the picture is about the same
   thing. `composition` describes the arrangement, taken from the approved
   poster for that family. `safe` is the region the deterministic overlay will
   occupy, described twice — in words for the model and as a box for the
   renderer, so the two cannot disagree.
   ------------------------------------------------------------------------ */
const SAFE_AREAS = {
  /* x, y, w, h as fractions of the canvas. */
  "cover-hook":     { box: { x: 0.04, y: 0.03, w: 0.92, h: 0.44 }, where: "the top 45% of the canvas" },
  "quick-check":    { box: { x: 0.04, y: 0.03, w: 0.92, h: 0.34 }, where: "the top third of the canvas, and a horizontal strip across the bottom 12%" },
  "what-helped-us": { box: { x: 0.04, y: 0.03, w: 0.92, h: 0.30 }, where: "the top 30% of the canvas, and a vertical column down the right-hand 34%" },
  "warning":        { box: { x: 0.04, y: 0.04, w: 0.92, h: 0.26 }, where: "the top quarter of the canvas, and a horizontal strip across the bottom 26%" },
  "dont":           { box: { x: 0.04, y: 0.04, w: 0.92, h: 0.30 }, where: "the top 30% of the canvas, and a strip across the bottom 24%" },
  "save-cta":       { box: { x: 0.04, y: 0.04, w: 0.92, h: 0.34 }, where: "the top third of the canvas, and a strip across the bottom 18%" },
  "story-reel":     { box: { x: 0.05, y: 0.10, w: 0.90, h: 0.34 }, where: "the band between 10% and 44% of the canvas height, plus the bottom 14% above the reply bar" }
};

/* --------------------------------------------------------------------------
   PER-FAMILY BRIEFS

   The brief now says how to ARRANGE a slide. WHAT the slide is a picture of
   comes from concept.js and is inserted per request — which is the correction:
   a brief that described "the family" produced the family nine times.

   `composition` is deliberately different from family to family in its
   geometry: where the paper sits, how close the figures are, whether there are
   figures at all. Adjacent slides must not be the same distance from the same
   people.
   ------------------------------------------------------------------------ */
const BRIEFS = {
  "cover-hook": {
    meaning: "A parent is stopped mid-scroll by a question they recognise from their own week.",
    composition:
      "Cream paper ground. One large soft patch of drawn blue #3F6FA3 painted loosely across the " +
      "lower third with an uneven, brushy top edge — a patch, NOT a full-width band and NOT a " +
      "rectangle. A torn piece of paper #F7ECD2 sits askew in the upper area with irregular, " +
      "hand-torn edges. The characters sit on and over the blue patch, cropped by the bottom " +
      "edge, overlapping the torn paper. Scatter a few small hand-drawn marks — two or three " +
      "short orange strokes, one small outlined heart. Place things off-centre and slightly " +
      "crooked. Leave real cream breathing room; do not fill every corner."
  },
  "quick-check": {
    meaning: "The short answer, or the ordinary things worth checking first.",
    composition:
      "Warm cream ground, mostly empty. Two or three small irregular torn paper scraps and one " +
      "soft pale-blue #C9DCED wash placed unevenly, none of them touching the edges as a full " +
      "band. The subject sits low and to one side rather than centred. Loose hand-drawn circles " +
      "around one or two objects, a small scribbled underline, one short curved arrow. Generous " +
      "empty cream in the upper area."
  },
  "what-helped-us": {
    meaning: "One ordinary thing this family actually did, shown as a moment.",
    composition:
      "Cream ground with a warm amber #FDF1D8 wash bleeding softly into one corner and a small " +
      "pale-blue patch in another. A single quiet scene, generously spaced, occupying the lower " +
      "left or lower centre. Nothing symmetrical. A couple of small hand-drawn arrows or dots " +
      "trailing between elements. This slide should feel calmer and emptier than the others."
  },
  "warning": {
    meaning: "When to stop reading and call a doctor. Serious, and completely calm.",
    composition:
      "Cream ground. A soft, irregular patch of warning coral #D4553A or soft warning fill " +
      "#F9E2DA in the upper area with a rough painted edge — a torn patch, NOT a full-width " +
      "banner, NOT a rectangle, and it must not run edge to edge. The scene sits below it, " +
      "quiet and close, with plenty of paper around it. One or two relevant everyday objects " +
      "drawn small on their own scraps of paper near the foot. No dark blue field anywhere on " +
      "this slide — coral and cream only, with charcoal line work."
  },
  "dont": {
    meaning: "The one thing that reliably makes this harder, and the calmer alternative.",
    composition:
      "Cream ground with one soft blue #C9DCED patch low on one side. The scene is off-centre " +
      "with real empty space beside it. Two small circled object vignettes on torn paper near " +
      "the foot, each with a single loose hand-drawn diagonal stroke through it in coral — a " +
      "sketched line, not a heavy graphic cross. Nothing shaming, nothing shouted."
  },
  "save-cta": {
    meaning: "Keep this for the night you need it.",
    composition:
      "Warm cream, the softest and most generous slide in the package. A gentle amber #FDF1D8 " +
      "wash low in the frame. The scene sits low and centred-ish, relaxed. A long loose " +
      "hand-drawn blue arrow curving in from one side, a small outlined heart, two or three " +
      "sparks. The upper half is mostly empty paper."
  },
  "story-reel": {
    meaning: "One idea, one picture, one tap. Read in under two seconds.",
    composition:
      "Vertical 9:16. Cream ground with a torn paper piece across the upper middle, edges " +
      "irregular, and a soft drawn-blue #3F6FA3 patch behind the lower part of the scene with a " +
      "brushy top edge. The scene is stacked in the lower half and cropped by the bottom edge. " +
      "Nothing important in the top 13% or the bottom 13%. Small hand-drawn marks around the " +
      "figures. Vertical, intimate and close — not a wide poster turned on its side."
  }
};

/* --------------------------------------------------------------------------
   PROHIBITIONS

   Repeated on every request because these are the failures that make output
   unusable rather than merely imperfect.
   ------------------------------------------------------------------------ */
const PROHIBITIONS = [
  "NO readable text of any kind. No words, letters, numbers, captions, labels, speech bubbles, " +
    "signage, book titles, mug slogans, packaging copy or handwriting. Not even decorative or " +
    "blurred lettering. Every word on the finished post is added afterwards by the website.",
  "NO logo, wordmark, badge, watermark, signature or brand lockup of any kind.",
  "NO military, wartime, patriotic, political or recruitment-poster look. No full-width command " +
    "banners, no edge-to-edge red or dark-blue fields, no rigid rectangular colour blocking, no " +
    "centred proclamation layout, no figures lined up symmetrically staring straight out at the " +
    "viewer, no heroic low-angle framing. This is a warm parenting notebook, not a notice.",
  "NO navy, royal blue, crimson or vermilion. The blues are #3F6FA3 and #C9DCED and the warm " +
    "accents are #E2601F and #C07F1E. Warning coral #D4553A only on a warning slide, and only " +
    "as a soft irregular patch.",
  "NO repeating the arrangement of the other slides in this package. If the previous slide had " +
    "three figures sitting in a row at the bottom, this one must not.",
  "NO photography, no photorealism, no 3D render, no stock imagery.",
  "NO generic parents and NO generic baby. The only people who may appear are Mama, Papa and " +
    "Ari exactly as drawn in the attached character sheets.",
  "NO additional or replacement characters. Do not add a sibling, a grandparent, a nurse, a " +
    "doctor, a friend or a second baby.",
  "NO changes to the characters' apparent ethnicity, hair, facial hair, clothing identity or " +
    "relative ages. Papa never wears glasses.",
  "NO distressed, crying, screaming or pained baby. NO medical equipment attached to the baby.",
  "NO extra limbs, extra fingers, merged arms or hands without an owner.",
  "NO frames, borders, page edges, drop shadows behind the whole image, or mock-up device " +
    "surrounds. The artwork fills the canvas edge to edge."
];

/* --------------------------------------------------------------------------
   THE BUILD
   ------------------------------------------------------------------------ */

/* A short, neutral description of the SUBJECT, taken from guide text that has
   already been approved. The model is given meaning so the picture is about
   the right thing — it is never asked for advice, and nothing it returns is
   used as words. */
/* The guide's question, for meaning only. It used to append the art note as
   well, which meant the scene was stated twice in one prompt — once here and
   once in the concept block — and a model reading a duplicated instruction
   weights it oddly. The concept block is the only place the scene is now
   described. */
function subjectLine(guide) {
  return String((guide && guide.title) || "").replace(/\s+/g, " ").trim().slice(0, 200);
}

/* Human-readable names for the object vocabulary in compose.js, so the prompt
   asks for "a baby bottle" rather than for the token "bottle". */
const OBJECT_WORDS = {
  bottle: "a baby's bottle", spoon: "a weaning spoon and a small bowl",
  thermometer: "a thermometer", nose: "a tissue and a nasal aspirator",
  mouth: "nothing in the mouth — just the baby's face", tooth: "a chilled teether",
  nappy: "a folded clean nappy", moon: "a night-time window and a low lamp",
  sun: "morning light through a window", clock: "a small clock",
  drop: "a beaker of water", weight: "a set of kitchen scales",
  eye: "nothing extra — a watchful expression", skin: "a soft muslin cloth",
  sleepy: "a blanket", sick: "a muslin over a shoulder",
  toy: "a small wooden toy just out of frame", home: "a low lamp and a quiet corner",
  pause: "hands resting open and still", smile: "nothing extra — a settled expression",
  heart: "two mugs and a blanket", phone: "a phone face down on the floor",
  book: "an open notebook and a pencil", person: "nothing extra"
};

const CHARACTER_WORDS = { mama: "Mama", papa: "Papa", ari: "Ari" };

function conceptBlock(slide) {
  const c = (slide && slide.concept) || null;
  if (!c) return [];
  const names = (list) => (list || []).map(n => CHARACTER_WORDS[n] || n).join(" and ");
  const objs = (c.objects || []).map(o => OBJECT_WORDS[o]).filter(Boolean);

  const out = [];
  out.push("THIS SLIDE'S VISUAL CONCEPT — the single most important instruction here");
  out.push(c.scene);
  out.push("");
  out.push(`WHO IS IN IT: ${names(c.cast) || "no full figures"}. ` +
    (c.exclude && c.exclude.length
      ? `${names(c.exclude)} ${c.exclude.length === 1 ? "does" : "do"} NOT appear on this slide at all. ` +
        "Do not add them, not in the background and not partly cropped."
      : ""));
  if (objs.length) out.push(`OBJECTS THAT BELONG IN IT: ${objs.join("; ")}. Draw these as real ` +
    "objects in the scene, at a size that reads at thumbnail scale. No interface icons, no symbols.");
  out.push(`CROP AND FRAMING: ${c.crop}.`);
  out.push(`MOOD: ${c.mood}.`);
  out.push("This concept was derived from the guide's own approved wording in " +
    `\`${c.from || "the guide"}\`. It must be materially different from the other slides in ` +
    "this package — a different cast, a different distance and a different arrangement, not the " +
    "same group re-posed.");
  return out;
}

function buildPrompt({ family, guide, selection, format, slide } = {}) {
  const brief = BRIEFS[family];
  if (!brief) {
    const err = new Error(`UNKNOWN_FAMILY: no art brief for "${family}".`);
    err.code = "UNKNOWN_FAMILY";
    throw err;
  }
  const safe = SAFE_AREAS[family];
  const f = format || { width: 1080, height: 1350, ratio: "4:5" };

  const parts = [];
  parts.push(SYSTEM_PROMPT);
  parts.push("");
  parts.push(TONE_PROMPT);
  parts.push("");
  parts.push("THE ATTACHED IMAGES, IN ORDER, AND WHAT EACH ONE IS FOR");
  parts.push(referenceLegend(selection));
  parts.push("");
  parts.push(`SLIDE TYPE: ${family}${slide && slide.kind ? ` (${slide.kind})` : ""}`);
  parts.push(`WHAT THIS SLIDE MEANS: ${brief.meaning}`);
  parts.push(`SUBJECT OF THE GUIDE (for meaning only — do not write any of it): ${subjectLine(guide)}`);
  parts.push("");
  parts.push(conceptBlock(slide).join("\n"));
  parts.push("");
  parts.push("COMPOSITION");
  parts.push(brief.composition);
  parts.push("");
  parts.push("PALETTE — use these values, not the saturated version of the colour name");
  parts.push(PALETTE);
  parts.push("");
  parts.push("TEXT-SAFE AREA");
  parts.push(
    `Leave ${safe.where} visually calm — flat painted colour, plain torn paper or an even wash. ` +
    "No faces, no hands, no fine detail and no busy texture there. Exact wording will be " +
    "composited over that region by the website, and it has to stay legible.");
  parts.push("");
  parts.push("CROP AND ASPECT RATIO");
  parts.push(
    `Compose for ${f.width}×${f.height} (${f.ratio}). Fill the canvas completely, edge to edge, ` +
    "with no border and no empty margin. Anything cropped by the edge should be cropped " +
    "deliberately and confidently.");
  parts.push("");
  parts.push("HARD PROHIBITIONS");
  parts.push(PROHIBITIONS.map(p => "• " + p).join("\n"));

  return parts.join("\n");
}

/* Everything recorded on a slide about how its artwork was made. This object
   goes into the approval hash, so changing any of it returns the package to
   review. */
function provenance({ family, selection, imageModel, format, slide }) {
  const c = (slide && slide.concept) || {};
  return {
    conceptId: c.id || null,
    conceptAction: c.action || null,
    conceptFingerprint: c.fingerprint || null,
    conceptVersion: c.conceptVersion || null,
    conceptObjects: (c.objects || []).slice(),
    conceptCast: (c.cast || []).slice(),
    promptVersion: PROMPT_VERSION,
    imageModel: imageModel || DEFAULT_IMAGE_MODEL,
    manifestVersion: selection.manifestVersion,
    referenceIds: selection.ids.slice(),
    posterId: selection.poster.id,
    sceneId: selection.scene ? selection.scene.id : null,
    characterIds: selection.characters.map(c => c.id),
    family,
    width: format.width,
    height: format.height
  };
}

module.exports = {
  PROMPT_VERSION, DEFAULT_IMAGE_MODEL, SYSTEM_PROMPT, TONE_PROMPT, PALETTE, PROHIBITIONS,
  BRIEFS, SAFE_AREAS, OBJECT_WORDS,
  buildPrompt, referenceLegend, conceptBlock, provenance, subjectLine
};
