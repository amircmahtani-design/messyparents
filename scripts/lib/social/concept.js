/* ============================================================================
   SOCIAL — WHAT THIS PARTICULAR SLIDE IS A PICTURE OF

   The failure this file exists to fix: every slide in a package was getting the
   same picture. The reference selection was correct — the poster changed with
   the family — but everything that decided the SCENE was constant. The cast was
   mama+papa+ari on seven frames out of nine, the approved scene was the same
   one on all nine, and the art note was a generic phrase like "the whole family
   together". So the renderer drew one seated line-up nine times and the words
   changed on top of it. One poster with different captions pasted on.

   A slide family is not a visual concept. "Warning" tells you the slide is a
   warning; it does not tell you that THIS warning is about fewer wet nappies
   and a refused bottle, and that the picture should therefore be one parent
   checking the baby with a nappy and a bottle beside them — not the same happy
   spoon-waving family that was on the cover.

   ---------------------------------------------------------------------------
   GROUNDING

   A concept is derived from the slide's OWN approved content:

     • the guide's topic and title
     • the source field the slide came from (panel.helped.items, panel.warn…)
     • the objects those exact words mention, via compose.js objectFor()

   The scene sentences themselves are a fixed, authored vocabulary in this file
   — the same status as the interface wording in compose.js CHROME. They are
   DRAWING INSTRUCTIONS, they are never rendered as words, and they are never
   used to make a claim: nothing here says the family did anything. It says what
   the illustration shows. A guide with no "what helped us" panel gets no
   helped slide at all, so there is no concept to invent.

   ---------------------------------------------------------------------------
   WHAT IT DECIDES

     action     a stable identifier, e.g. "bottle-offered-refused"
     scene      what the picture shows, for the image prompt
     cast       which of Mama, Papa and Ari appear — often ONE parent
     exclude    which of them must NOT appear, said explicitly to the model
     objects    the things that belong in the scene
     crop       how close, so adjacent slides are not the same distance away
     mood       so a warning is calm and a cover is not

   `fingerprint` folds all of that into one hash. It goes into the artwork cache
   key, so two slides that mean different things cannot share an image, and a
   punctuation edit cannot change it.
   ========================================================================== */

const crypto = require("crypto");

const sha = (s) => crypto.createHash("sha256").update(String(s), "utf8").digest("hex");
const clean = (v) => String(v == null ? "" : v).replace(/\s+/g, " ").trim();
const CAST = ["mama", "papa", "ari"];

/* --------------------------------------------------------------------------
   THE SCENE VOCABULARY

   Keyed by slide KIND, not by family — which is the whole correction. `quick`
   and `normal` share the quick-check family and its poster reference, and they
   must not share a picture: one is a parent noticing something, the other is a
   set of objects on a table.

   Within a kind, the variant is chosen by the PRIMARY OBJECT the slide's own
   words mention, so a feeding guide and a sleep guide get different pictures
   out of the same slot. `*` is the fallback for a topic none of the object
   rules match, and it is deliberately still specific about cast and crop.
   ------------------------------------------------------------------------ */
const SCENES = {

  /* ---- the cover: the hook. More than one character is fine here. ------ */
  cover: [
    { on: ["bottle", "spoon"], action: "bottle-offered-refused",
      scene: "Mama sitting on the floor holding a bottle out towards Ari, who is " +
             "turning her face away and putting one hand up; Papa is beside them, " +
             "leaning in and watching with a puzzled expression",
      cast: ["mama", "papa", "ari"], objects: ["bottle"],
      crop: "three-quarter length, floor level, the group filling the lower half",
      mood: "recognisable, faintly comic, not distressed" },
    { on: ["moon", "sun", "clock"], action: "night-handover",
      scene: "Papa standing holding Ari against his shoulder in a dim room, Mama " +
             "sitting on the edge of the bed behind him rubbing her eyes",
      cast: ["mama", "papa", "ari"], objects: ["moon"],
      crop: "three-quarter length, low warm light",
      mood: "tired and tender" },
    { on: ["tooth", "thermometer", "skin", "sick", "nose"], action: "checking-baby-close",
      scene: "Mama holding Ari on her lap and looking closely at her face, Papa " +
             "crouched beside them with a hand on Ari's back",
      cast: ["mama", "papa", "ari"], objects: [],
      crop: "waist-up, close, the two adults framing the baby",
      mood: "attentive, calm" },
    { on: ["*"], action: "parents-and-baby-reacting",
      scene: "Mama and Papa sitting on the floor either side of Ari, both reacting " +
             "to her at the same moment, one of them mid-gesture",
      cast: ["mama", "papa", "ari"], objects: [],
      crop: "three-quarter length, floor level",
      mood: "warm, slightly chaotic" }
  ],

  /* ---- the quick answer: ONE parent and Ari, telling the answer as a
         small moment. Never the full line-up. ------------------------------ */
  quick: [
    { on: ["bottle"], action: "distracted-mid-feed",
      scene: "one parent sitting cross-legged with Ari on their lap mid-feed, the " +
             "bottle lowered and forgotten because Ari has twisted round to look at " +
             "something out of frame",
      cast: ["one-parent", "ari"], objects: ["bottle", "toy"],
      crop: "waist-up, close and intimate, cropped by the left edge",
      mood: "unbothered, a little amused" },
    { on: ["spoon"], action: "spoon-considered",
      scene: "one parent holding a spoon just out of reach while Ari leans forward " +
             "with her mouth open, a bowl on the floor between them",
      cast: ["one-parent", "ari"], objects: ["spoon"],
      crop: "waist-up, close", mood: "curious" },
    { on: ["moon", "sun", "clock"], action: "clock-watching",
      scene: "one parent sitting on the floor beside a cot at night with Ari awake " +
             "in their arms, looking sideways at a clock",
      cast: ["one-parent", "ari"], objects: ["moon", "clock"],
      crop: "waist-up, low light", mood: "resigned, gentle" },
    { on: ["tooth", "nose", "mouth"], action: "gum-and-nose-check",
      scene: "one parent holding Ari up facing them, tilting her chin gently to look " +
             "at her mouth, Ari squirming",
      cast: ["one-parent", "ari"], objects: ["tooth", "nose"],
      crop: "head and shoulders, very close", mood: "practical" },
    { on: ["*"], action: "one-parent-noticing",
      scene: "one parent sitting with Ari on their knee, both looking at the same " +
             "thing off to one side",
      cast: ["one-parent", "ari"], objects: [],
      crop: "waist-up, close", mood: "attentive" }
  ],

  /* ---- the clue slide: OBJECTS, not people. This is the strongest
         differentiator in the whole package and it was being ignored. ------ */
  normal: [
    { on: ["*"], action: "object-clues-no-figures",
      scene: "NO full figures. A loose scatter of the everyday objects listed below, " +
             "each drawn separately on its own scrap of torn cream paper at a " +
             "different angle and a different size, as if laid out on a table. One " +
             "small drawing of Ari's head and shoulders tucked into a lower corner, " +
             "reacting to them",
      cast: ["ari-bust"], objects: [], usesSlideObjects: true,
      crop: "flat-lay, looking down, objects large and generously spaced",
      mood: "curious, tidy-ish" }
  ],

  /* ---- what helped us: ONE character performing the action the guide's own
         first item describes. --------------------------------------------- */
  helped: [
    { on: ["home"], action: "dim-quiet-room",
      scene: "one parent feeding Ari in a dim, quiet room, a low lamp behind them, " +
             "the rest of the room simplified almost to nothing",
      cast: ["one-parent", "ari"], objects: ["home", "bottle"],
      crop: "waist-up, warm pool of light, plenty of empty paper around them",
      mood: "calm, hushed" },
    { on: ["bottle"], action: "checking-the-teat",
      scene: "one parent holding a bottle up to the light and squinting at the teat, " +
             "Ari on the floor beside them reaching for it",
      cast: ["one-parent", "ari"], objects: ["bottle"],
      crop: "waist-up, the bottle held high and large in frame",
      mood: "practical, absorbed" },
    { on: ["clock", "eye", "book"], action: "reading-the-week",
      scene: "one parent sitting at a low table with an open notebook, pencil in " +
             "hand, Ari playing on the floor at their feet",
      cast: ["one-parent", "ari"], objects: ["book", "clock"],
      crop: "three-quarter length seen from slightly above",
      mood: "thoughtful" },
    { on: ["pause", "smile", "heart"], action: "pausing-and-waiting",
      scene: "one parent sitting back on their heels with both hands open and relaxed " +
             "in their lap, deliberately not reaching, Ari looking at them",
      cast: ["one-parent", "ari"], objects: [],
      crop: "waist-up, a lot of space between them",
      mood: "patient" },
    { on: ["*"], action: "one-parent-doing-the-thing",
      scene: "one parent mid-action with Ari, doing the practical thing the labels " +
             "describe, the objects for it within reach",
      cast: ["one-parent", "ari"], objects: [], usesSlideObjects: true,
      crop: "waist-up", mood: "practical, warm" }
  ],

  /* ---- the warning: attentive, never dramatic, and NOT the happy family. */
  warn: [
    { on: ["nappy", "drop", "bottle"], action: "checking-nappy-and-feed",
      scene: "one parent kneeling and looking carefully at Ari lying calmly in front " +
             "of them, a nappy and a bottle set down on the floor nearby; the parent's " +
             "expression is attentive, the baby's is neutral and comfortable",
      cast: ["one-parent", "ari"], objects: ["nappy", "bottle"],
      crop: "three-quarter, looking slightly down at the scene, generous empty paper above",
      mood: "serious and completely calm — no tears, no pain, no medical equipment" },
    { on: ["thermometer", "sick", "skin", "sleepy"], action: "hand-on-forehead",
      scene: "one parent sitting with Ari held against their chest, resting the back of " +
             "a hand on her forehead; Ari is drowsy but comfortable",
      cast: ["one-parent", "ari"], objects: ["thermometer"],
      crop: "head and shoulders, close and quiet",
      mood: "serious and completely calm — no tears, no pain, no medical equipment" },
    { on: ["phone"], action: "reaching-for-the-phone",
      scene: "one parent sitting on the floor holding Ari in one arm and picking up a " +
             "phone with the other, unhurried",
      cast: ["one-parent", "ari"], objects: ["phone"],
      crop: "waist-up", mood: "serious and completely calm" },
    { on: ["*"], action: "attentive-parent-and-baby",
      scene: "one parent holding Ari and watching her closely, everything else in the " +
             "picture stripped away",
      cast: ["one-parent", "ari"], objects: [], usesSlideObjects: true,
      crop: "waist-up, close", mood: "serious and completely calm" }
  ],

  /* ---- don't: a gentle stop, one parent. ------------------------------- */
  dont: [
    { on: ["*"], action: "gentle-stop",
      scene: "one parent sitting back with both palms open in a soft 'leave it' gesture, " +
             "the object of the guide set down on the floor between them and Ari, who is " +
             "unbothered",
      cast: ["one-parent", "ari"], objects: [], usesSlideObjects: true,
      crop: "waist-up, the two of them off-centre with empty paper on one side",
      mood: "gentle, never scolding" }
  ],

  /* ---- the close: the natural home of the full family. ----------------- */
  close: [
    { on: ["*"], action: "family-together-resting",
      scene: "Mama and Papa slumped comfortably together on a sofa with Ari between " +
             "them, all three relaxed, mugs and a muslin around them",
      cast: ["mama", "papa", "ari"], objects: ["heart"],
      crop: "wide, the whole sofa in frame, seen straight on",
      mood: "warm, affectionate, end-of-day" }
  ],

  /* ---- Story frames. Deliberately DIFFERENT scenes from their carousel
         equivalents, because a Story is a different post. ----------------- */
  hook: [
    { on: ["bottle", "spoon"], action: "vertical-bottle-standoff",
      scene: "a tall, close view of one parent crouching low in front of Ari, holding " +
             "a bottle at Ari's eye level while she leans back away from it",
      cast: ["one-parent", "ari"], objects: ["bottle"],
      crop: "vertical, tight, the two of them stacked one above the other",
      mood: "recognisable, faintly comic" },
    { on: ["*"], action: "vertical-parent-and-baby",
      scene: "a tall, close view of one parent lifting Ari up in front of them, both " +
             "faces visible",
      cast: ["one-parent", "ari"], objects: [], usesSlideObjects: true,
      crop: "vertical, tight", mood: "warm" }
  ],
  cta: [
    { on: ["*"], action: "family-close-vertical",
      scene: "Mama and Papa sitting close together on the floor with Ari on Mama's lap, " +
             "all three leaning in, seen from slightly above",
      cast: ["mama", "papa", "ari"], objects: ["heart"],
      crop: "vertical, the group stacked in the lower two-thirds",
      mood: "warm, settled" }
  ]
};

/* The warning STORY frame is the carousel warning seen differently, not the
   same picture again. */
SCENES["story-warn"] = [
  { on: ["*"], action: "vertical-attentive-check",
    scene: "a tall, close view of one parent's hands and face as they look down at Ari " +
           "lying calmly across their lap, the relevant everyday objects set on the " +
           "floor beside them",
    cast: ["one-parent", "ari"], objects: [], usesSlideObjects: true,
    crop: "vertical, close, looking down over the parent's shoulder",
    mood: "serious and completely calm" }
];

/* --------------------------------------------------------------------------
   WHICH PARENT

   When a concept asks for "one parent", the choice is deterministic from the
   guide slug AND the slide index, so a package alternates between Mama and Papa
   instead of showing the same adult on every frame. Ari is always Ari.
   ------------------------------------------------------------------------ */
function pickParent(guide, index) {
  const s = String((guide && guide.slug) || "") + "#" + index;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (Math.abs(h | 0) % 2) === 0 ? "mama" : "papa";
}

/* --------------------------------------------------------------------------
   DERIVING ONE CONCEPT
   ------------------------------------------------------------------------ */

/* The objects this slide's own words mention, in order, de-duplicated.
   `objectOf` is compose.js objectFor(), passed in to avoid a require cycle. */
function objectsOf(slide, objectOf) {
  const out = [];
  const push = (o) => { if (o && out.indexOf(o) < 0) out.push(o); };
  (slide.items || []).forEach(it => push(objectOf(it && (it.source || it.label))));
  (slide.sourceText || []).forEach(t => push(objectOf(t)));
  return out;
}

function pickScene(kind, objects) {
  const table = SCENES[kind] || SCENES.cover;
  for (const entry of table) {
    if (entry.on.indexOf("*") >= 0) continue;
    if (objects.some(o => entry.on.indexOf(o) >= 0)) return entry;
  }
  return table.find(e => e.on.indexOf("*") >= 0) || table[0];
}

/* Resolve "one-parent" and "ari-bust" into a real cast list. */
function resolveCast(entry, guide, index) {
  const out = [];
  entry.cast.forEach(c => {
    if (c === "one-parent") out.push(pickParent(guide, index));
    else if (c === "ari-bust") out.push("ari");
    else out.push(c);
  });
  return Array.from(new Set(out));
}

function conceptFor({ guide, slide, index = 0, objectOf } = {}) {
  const of = objectOf || (() => "");
  const kind = String(slide.kind || "cover");
  /* A Story warning frame has kind "warn" but must not reuse the carousel
     warning's picture, so it is looked up under its own key. */
  const lookup = (slide.family === "story-reel" && kind === "warn") ? "story-warn" : kind;

  const slideObjects = objectsOf(slide, of);
  const entry = pickScene(lookup, slideObjects);

  const cast = resolveCast(entry, guide, index);
  const exclude = CAST.filter(c => cast.indexOf(c) < 0);

  /* The objects the picture should contain: the concept's own, plus the ones
     this slide's approved words actually name when the concept asks for them. */
  const objects = Array.from(new Set(
    (entry.objects || []).concat(entry.usesSlideObjects ? slideObjects : [])
  )).slice(0, 5);

  const id = [
    String((guide && guide.topic) || "general"),
    lookup,
    entry.action
  ].join("/");

  const concept = {
    id,
    action: entry.action,
    scene: entry.scene,
    cast,
    exclude,
    objects,
    crop: entry.crop,
    mood: entry.mood,
    /* provenance: which approved field this picture was reasoned from */
    from: slide.sourceField || "",
    conceptVersion: CONCEPT_VERSION
  };

  concept.fingerprint = sha([
    CONCEPT_VERSION,
    clean((guide && guide.slug) || ""),
    kind,
    clean(slide.family),
    clean(slide.sourceField),
    id,
    entry.action,
    objects.join(","),
    cast.join(","),
    clean(slide.variant)
  ].join("|")).slice(0, 24);

  return concept;
}

/* Bump when the vocabulary above changes in a way that would produce a
   different picture. It is part of the fingerprint, so a change here
   invalidates cached artwork and returns approved packages to review — which
   is correct, because the picture would no longer be the approved one. */
const CONCEPT_VERSION = "mpc-concept-v1";

module.exports = { conceptFor, pickParent, objectsOf, pickScene, SCENES, CONCEPT_VERSION, CAST };
