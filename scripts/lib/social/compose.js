/* ============================================================================
   SOCIAL — PLANNING A PACKAGE FROM A GUIDE

   This is a re-renderer, not a writer. Every word it puts on a slide comes out
   of a field Amir already approved in Studio; the only transformation applied
   is SHORTENING, through condense.js, which can delete words and can capitalise
   a first letter and can do nothing else.

   That single constraint is what lets safety.js check the output mechanically:
   a composer that can only remove words cannot introduce one, so any word on a
   slide that is not in the source — or in the short fixed list of interface
   wording in safety.js CHROME_WORDS — is a bug with a name.

   ---------------------------------------------------------------------------
   WHAT CHANGED, AND WHY

   The previous version of this file produced one shape for every guide: cover,
   quick, panel, panel, panel, close, each of them a heading over a rounded
   card of bullet points. It was a website page cut into 1080-pixel pieces. The
   approved poster references are not that. They are posters: one idea, a
   headline in two or three colours at three different sizes, two to four short
   labels, and a large illustration that the type sits on top of.

   So a slide is no longer "a heading and some lines". It is:

     kicker    a very small category cue                       (optional)
     lines[]   the headline, as coloured pieces                {t, c}
     items[]   two to four SHORT labels, each with an object   {label, icon}
     band      one painted band of text across the slide       (optional)
     cta       a closing instruction                           (optional)

   and the artwork underneath it is a separate layer (see artwork.js). This
   file never chooses a colour value or a pixel; it chooses MEANING and LENGTH,
   and templates.js draws it.

   ---------------------------------------------------------------------------
   TWO NAMES FOR THE SAME SLIDE

   `kind` is the original discriminator — cover, quick, normal, helped, warn,
   dont, close. It is what the guide FIELD was, it is what the rest of the
   system has always keyed off, and existing tests assert the exact sequence it
   produces, so it stays.

   `family` is the new POSTER family — cover-hook, quick-check, what-helped-us,
   warning, dont, save-cta, story-reel. It is what selects the reference and
   the layout. Two kinds (quick and normal) share one family, because they are
   the same poster with different content in it.

   ---------------------------------------------------------------------------
   FIELD MAPPING (from scripts/lib/data.js normaliseGuide)

     title ................. cover headline, caption opening
     panel.eyebrow ......... cover kicker (falls back to topic • ages)
     panel.quick ........... the quick-answer slide and the caption's answer
     panel.normal.items[] .. the "usually normal" clue slide
     panel.helped.items[] .. "what helped us" — and the ONLY source for
                             first-person-plural wording anywhere
     panel.warn.items[] .... the warning slide, which is never optional
     panel.dont.items[] .... the "don't" slide, which is
     panel.hero/heroAlt .... the approved illustration
     summary, ages, topic .. supporting metadata

   A guide missing a field simply has no slide for it. Nothing is padded, and
   the carousel length follows the guide.
   ========================================================================== */

const { guideUrl } = require("../site");
const { taggedUrl } = require("./utm");
const { MAX_SLIDES, STATES, FORMATS, INSTAGRAM_HANDLE } = require("./config");
const { hasHelpedPanel } = require("./safety");
const { condense } = require("./condense");
const REFS = require("./refs");
const { conceptFor } = require("./concept");

/* --------------------------------------------------------------------------
   SHORTENING — the only transformation allowed

   Cut at a sentence end if there is one in range; otherwise at a word
   boundary, with an ellipsis. Never mid-word, never a new word. Kept for the
   caption and for places where a whole sentence is wanted; the SLIDES use
   condense(), which chooses a faithful span rather than truncating.
   ------------------------------------------------------------------------ */
function shorten(text, max) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;

  const window = s.slice(0, max);
  const sentence = window.match(/^[\s\S]*[.!?](?=\s|$)/);
  if (sentence && sentence[0].length > max * 0.45) return sentence[0].trim();

  const clause = window.lastIndexOf(" — ");
  if (clause > max * 0.45) return window.slice(0, clause).trim();

  const space = window.lastIndexOf(" ");
  return (space > 0 ? window.slice(0, space) : window).replace(/[,;:—–-]+$/, "").trim() + "…";
}

const clean = (v) => String(v == null ? "" : v).replace(/\s+/g, " ").trim();
const listOf = (panelPart) => {
  const items = (panelPart && Array.isArray(panelPart.items)) ? panelPart.items : [];
  return items.map(clean).filter(Boolean);
};
const wordCount = (s) => clean(s).split(/\s+/).filter(Boolean).length;

/* --------------------------------------------------------------------------
   BUDGETS

   These are POSTER budgets, not page budgets. The old file allowed 190
   characters of body text on a slide; at 1080px that is 42px type in a box,
   which is a paragraph on a phone. A headline that has to be readable at
   thumbnail size is eight to fourteen words, and a label is one to five.

   validate.js re-checks the rendered result, so these are the first line of
   defence rather than the only one.
   ------------------------------------------------------------------------ */
const BUDGET = {
  headlineWords: 9,       /* across all headline lines on one slide */
  headlineLines: 3,
  labelWords: 5,          /* one item label on a clue slide */
  warnLabelWords: 8,      /* a warning label may run longer — condense.js
                             refuses to truncate a warning's condition, and it
                             is right to: "call a doctor if the baby is floppy"
                             is not improved by losing "floppy". The renderer
                             sets these on two short lines instead. */
  itemsPerSlide: 4,       /* quick-check caps at four clues */
  helpedItems: 3,         /* "what helped us" is three actions, maximum */
  warnItems: 3,
  dontItems: 2,
  bandWords: 8,
  caption: 1400
};

/* The fixed interface wording. Every word here is listed in safety.js
   CHROME_WORDS, which is what tells the grounding check that these are ours
   rather than invented. Adding a phrase here means adding its words there. */
const CHROME = {
  quickLabel: "Quick answer",
  closeHeading: "Read the full guide",
  bioLine: "Full guide in bio",
  linkLine: "Link in bio",
  brand: "The Messy Parents Collection",
  handle: INSTAGRAM_HANDLE,
  site: "themessyparentscollection.com",
  captionCtaInstagram: "Read the full guide — link in bio.",
  captionCtaFacebook: "Read the full guide:",
  storyTap: "Tap for the full guide",
  moreInGuide: "more in the full guide"
};

/* The approved CTA library. Chosen by topic so the feed does not say the same
   thing seven times, and editable afterwards in the dashboard. Every word in
   it is in safety.js CHROME_WORDS. */
const CTA_LIBRARY = [
  { id: "next-3am",   topics: ["sleeping", "sanity"],     lines: ["Save this", "for the next", "3am."] },
  { id: "next-night", topics: ["sleeping"],               lines: ["Save this", "for the next", "long night."] },
  { id: "for-later",  topics: ["feeding", "development"], lines: ["Save this", "for later."] },
  { id: "before",     topics: ["health"],                 lines: ["Save this", "before", "you need it."] },
  { id: "send-it",    topics: ["sanity"],                 lines: ["Send this", "to the", "other parent."] },
  { id: "keep-it",    topics: [],                         lines: ["Keep this", "for the night", "you need it."] }
];

/* --------------------------------------------------------------------------
   SCHEDULING

   Three a week, Monday / Wednesday / Friday at 19:00 UTC. A SUGGESTION written
   onto the package for Amir to change; nothing acts on it in this phase, and
   nothing acts on it in a later phase either until the package is approved.
   ------------------------------------------------------------------------ */
const SLOT_DAYS = [1, 3, 5];
const SLOT_HOUR = 19;

function suggestSlot(from, offset = 0) {
  const start = from instanceof Date ? new Date(from) : new Date(from || Date.now());
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), SLOT_HOUR, 0, 0));
  let found = 0;
  for (let i = 1; i <= 120; i++) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!SLOT_DAYS.includes(d.getUTCDay())) continue;
    if (found === offset) return d.toISOString();
    found++;
  }
  return d.toISOString();
}

/* --------------------------------------------------------------------------
   HASHTAGS — built from the guide's own classification, capped at eight.
   ------------------------------------------------------------------------ */
const tagify = (s) => String(s || "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[‐-―]/g, " to ")
  .replace(/[^a-z0-9 ]+/g, "")
  .split(/\s+/).filter(Boolean).join("");

function hashtagsFor(guide, topics) {
  const out = ["themessyparentscollection"];
  const topicLabel = (topics || []).find(t => t.id === guide.topic);
  if (topicLabel) out.push(tagify(topicLabel.label));
  else if (guide.topic) out.push(tagify(guide.topic));

  (guide.ages || []).slice(0, 2).forEach(a => {
    const t = tagify(a);
    if (t) out.push(t);
  });
  (guide.keywords || []).slice(0, 3).forEach(k => {
    const t = tagify(k);
    if (t && t.length > 3) out.push(t);
  });
  out.push("parenting");
  return Array.from(new Set(out.filter(Boolean))).slice(0, 8);
}

/* --------------------------------------------------------------------------
   HEADLINES

   A headline is broken into two or three pieces so the renderer can set them
   at different sizes in different colours — the thing that makes the reference
   posters read as posters rather than as slides.

   THE BREAK IS BY LENGTH, NOT BY MEANING. Splitting on a comma or on "or"
   would sometimes produce a line of one word and a line of nine, and at 1080px
   that is a broken layout rather than a stylish one. Balancing by character
   count gives the stacked, shape-filling look the references have.

   No word is added, removed or reordered by this — it is the same string with
   some of its spaces promoted to line breaks.
   ------------------------------------------------------------------------ */
function splitBalanced(text, maxLines) {
  const words = clean(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const n = Math.max(1, Math.min(maxLines, Math.ceil(words.length / 3)));
  if (n === 1) return [words.join(" ")];
  if (words.length <= n) return words.slice();

  /* Minimise the LONGEST line, then the spread. Balancing greedily by a
     running character target produced "Call your doctor" / "if", because the
     first line crossed the target on the word before last. Choosing the best
     set of break points instead gives "Call your" / "doctor if" — which is
     what the reference posters do, and what makes a stacked headline read as
     a deliberate shape rather than as an accident of wrapping.

     Exhaustive over break positions. n is at most three and a headline is at
     most fourteen words, so this is a handful of combinations. */
  const lens = words.map(w => w.length);
  const lineLen = (a, b) => {          /* words[a..b] inclusive, with spaces */
    let t = b - a;                     /* the spaces */
    for (let i = a; i <= b; i++) t += lens[i];
    return t;
  };

  let best = null;
  const walk = (start, linesLeft, acc) => {
    if (linesLeft === 1) {
      const l = lineLen(start, words.length - 1);
      const all = acc.concat([[start, words.length - 1, l]]);
      const max = Math.max.apply(null, all.map(x => x[2]));
      const spread = max - Math.min.apply(null, all.map(x => x[2]));
      if (!best || max < best.max || (max === best.max && spread < best.spread)) {
        best = { max, spread, cuts: all };
      }
      return;
    }
    /* leave at least one word for each remaining line */
    for (let end = start; end <= words.length - linesLeft; end++) {
      walk(end + 1, linesLeft - 1, acc.concat([[start, end, lineLen(start, end)]]));
    }
  };
  walk(0, n, []);

  return best.cuts.map(c => words.slice(c[0], c[1] + 1).join(" "));
}

/* The colour runs, one per family, cycled across the headline pieces. These
   are token NAMES, not values — templates.js maps them to tokens.css. */
const COLOUR_RUNS = {
  "cover-hook":     ["ink", "orange", "blue"],
  "quick-check":    ["ink", "blue", "orange"],
  "what-helped-us": ["orange", "ink", "blue"],
  /* Coral on paper, not cream reversed out of a red banner. */
  "warning":        ["coral", "ink", "ink"],
  "dont":           ["coral", "ink", "ink"],
  "save-cta":       ["blue", "ink", "orange"],
  "story-reel":     ["ink", "blue", "orange"]
};

/* Apply the emphasis rule to a set of lines that did not come from
   splitBalanced — the CTA library, which arrives pre-broken. */
function withEmphasis(lines, family) {
  if (lines.length < 2 || EMPHASIS_FAMILIES.indexOf(family) < 0) return lines;
  const fits = (l) => l && wordCount(l.t) <= EMPHASIS_MAX_WORDS;
  const last = lines[lines.length - 1];
  if (fits(last)) last.em = true;
  else if (fits(lines[0])) lines[0].em = true;
  return lines;
}

/* WHICH FAMILIES MAY SHOUT ONE WORD.

   Every headline used to be set in caps, which is what made the whole system
   read as a proclamation. Now a headline is sentence case, and at most ONE
   line per headline may be uppercase — only where emphasis is the point, only
   when that line is one or two words, and never on a warning, where the job is
   to be taken seriously rather than to be loud. */
const EMPHASIS_FAMILIES = ["cover-hook", "dont", "save-cta"];
const EMPHASIS_MAX_WORDS = 2;

function headline(text, family, maxLines) {
  const run = COLOUR_RUNS[family] || COLOUR_RUNS["cover-hook"];
  const lines = splitBalanced(text, maxLines || BUDGET.headlineLines)
    .map((t, i) => ({ t, c: run[i % run.length] }));

  if (lines.length > 1 && EMPHASIS_FAMILIES.indexOf(family) >= 0) {
    /* The LAST line if it is short enough, otherwise the FIRST. Never a middle
       one: "Why is my BABY DRINKING less milk?" emphasises a fragment nobody
       would stress out loud, whereas "Why is my baby drinking LESS MILK?" is
       where the sentence actually lands. */
    const fits = (l) => l && wordCount(l.t) <= EMPHASIS_MAX_WORDS;
    const last = lines[lines.length - 1];
    if (fits(last)) last.em = true;
    else if (fits(lines[0])) lines[0].em = true;
  }
  return lines;
}

/* --------------------------------------------------------------------------
   OBJECT CLUES

   A label on a clue slide sits on a small torn-paper disc with ONE drawn
   object in it. The object is chosen from the label's own words against a
   fixed vocabulary; templates.js draws it as a hand-inked shape in the brand
   palette, so it is part of the artwork rather than a UI icon.

   No match means no disc — the renderer numbers that item instead, which is
   what the "numbered path" variant is for.
   ------------------------------------------------------------------------ */
const OBJECTS = [
  ["bottle",      ["bottle", "teat", "formula", "milk", "feed", "feeding", "ounce"]],
  ["spoon",       ["solid", "solids", "spoon", "puree", "food", "eating", "meal", "wean"]],
  ["thermometer", ["fever", "temperature", "degrees"]],
  ["nose",        ["nose", "cold", "blocked", "congest", "breathing"]],
  ["mouth",       ["mouth", "gum", "gums", "tongue", "thrush", "ulcer"]],
  ["tooth",       ["teeth", "teething", "tooth", "chewing", "drool"]],
  ["nappy",       ["nappy", "nappies", "urine", "stool", "wet"]],
  ["moon",        ["night", "sleep", "asleep", "bedtime", "3am", "waking", "dark"]],
  ["sun",         ["morning", "5am", "daytime", "nap"]],
  ["clock",       ["hour", "hours", "minute", "minutes", "week", "schedule"]],
  ["drop",        ["dehydrat", "fluid", "water", "drink", "thirst", "dry"]],
  ["weight",      ["weight", "growth", "curve", "centile", "gain", "plateau"]],
  ["eye",         ["watch", "notice", "sign", "signs", "check", "seeing"]],
  ["skin",        ["skin", "rash", "spots", "blotch"]],
  ["sleepy",      ["sleepy", "floppy", "rouse", "listless", "lethargic"]],
  ["sick",        ["vomit", "vomiting", "sick", "reflux", "spit", "posset"]],
  ["toy",         ["distract", "distraction", "toy", "play", "interest", "world", "bored"]],
  ["home",        ["room", "quiet", "dim", "swap", "space", "home", "calm"]],
  ["pause",       ["pause", "stop", "wait", "break", "offer", "insist", "push", "force"]],
  ["smile",       ["mood", "happy", "smile", "content", "alert", "cheerful", "settle"]],
  ["heart",       ["love", "cuddle", "comfort", "hold", "close", "reassur"]],
  ["phone",       ["doctor", "call", "ring", "advice"]],
  ["book",        ["guide", "read", "note", "write", "track", "record"]],
  ["person",      ["partner", "parent", "someone", "help", "visitor"]]
];

function objectFor(text) {
  const t = String(text || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ");
  for (const [name, keys] of OBJECTS) {
    if (keys.some(k => t.includes(k))) return name;
  }
  return "";
}

/* --------------------------------------------------------------------------
   LAYOUT VARIANTS

   Chosen deterministically from the slug and the family, so the dashboard
   preview and the export renderer pick the same one without exchanging a
   message, and so the feed does not become seven identical compositions.
   Amir can override per slide; the override is stored and hashed.
   ------------------------------------------------------------------------ */
const VARIANTS = {
  "cover-hook":     ["character-bottom", "split-character", "detail-crop"],
  "quick-check":    ["orbit-clues", "numbered-path", "character-callouts"],
  "what-helped-us": ["steps-right", "steps-under"],
  "warning":        ["banner-discs", "banner-list"],
  "dont":           ["cross-vignettes", "stop-panel"],
  "save-cta":       ["family-close", "arrow-line"],
  "story-reel":     ["torn-top", "band-top"]
};

function variantFor(family, guide, salt) {
  const list = VARIANTS[family] || ["default"];
  const n = REFS.hashInt(String((guide && guide.slug) || "") + "/" + family + "/" + (salt || ""));
  return list[n % list.length];
}

/* --------------------------------------------------------------------------
   THE VISUAL CONCEPT

   Attached AFTER a slide is built, because it is derived from the slide's own
   finished content — its kind, its source field, its labels and the objects
   those exact words mention. See concept.js for why a slide FAMILY is not
   enough: `quick` and `normal` share the quick-check family and its poster, and
   giving them the same picture is what made a package read as one poster with
   different words pasted on.

   The concept also OVERRIDES the cast. refs.castFor() picks a cast from the
   family, which put Mama, Papa and Ari on seven frames out of nine; the concept
   knows that a "what helped us" slide is one parent doing one thing.
   ------------------------------------------------------------------------ */
function attachConcept(s, guide, index) {
  const concept = conceptFor({ guide, slide: s, index, objectOf: objectFor });
  s.concept = concept;
  s.cast = concept.cast;
  /* Kept for the older field name; it is now the concept's own sentence rather
     than a generic phrase like "the whole family together". */
  s.artNote = concept.scene;
  return s;
}

/* --------------------------------------------------------------------------
   THE SLIDES
   ------------------------------------------------------------------------ */
function slide(base) {
  return Object.assign({
    kind: "", family: "", variant: "", variants: [], cast: [],
    kicker: "", lines: [], items: [], band: "", cta: "",
    logo: false,
    image: "", imageAlt: "",
    art: null,
    artNote: "",
    sourceField: "", sourceText: [],
    optional: true, movable: true,
    truncatedItems: 0
  }, base);
}

function buildSlides(guide, opts) {
  const o = opts || {};
  const ov = o.variantOverrides || {};
  const p = guide.panel || {};
  const slides = [];
  const title = clean(guide.title);

  const kicker = clean(p.eyebrow) ||
    [guide.topic, (guide.ages || [])[0]].filter(Boolean).join(" • ");

  /* ---- 1. COVER / HOOK ------------------------------------------------
     The question as the guide asks it, set large in two or three colours.
     The logo is allowed here and on the close slide, nowhere else. */
  slides.push(slide({
    kind: "cover",
    family: "cover-hook",
    variant: ov.cover || variantFor("cover-hook", guide),
    variants: VARIANTS["cover-hook"],
    cast: REFS.castFor("cover-hook", guide),
    kicker,
    lines: headline(condense(title, BUDGET.headlineWords), "cover-hook"),
    logo: true,
    image: guide.image || "",
    imageAlt: guide.imageAlt || "",
    artNote: "the family together, reacting to the situation in the title",
    sourceField: "title",
    sourceText: [guide.title, p.eyebrow, guide.topic, (guide.ages || []).join(" ")].filter(Boolean),
    optional: false,
    movable: false
  }));

  /* ---- 2. THE QUICK ANSWER -------------------------------------------
     Condensed to a headline rather than set as a paragraph in a box. Whatever
     faithful clause is LEFT in the sentence afterwards becomes the painted
     band underneath — still the guide's own words, by deletion only. */
  const quickText = clean(p.quick) || clean(guide.summary);
  if (quickText) {
    const head = condense(quickText, BUDGET.headlineWords);
    slides.push(slide({
      kind: "quick",
      family: "quick-check",
      variant: ov.quick || variantFor("quick-check", guide, "quick"),
      variants: VARIANTS["quick-check"],
      cast: REFS.castFor("quick-check", guide),
      kicker: CHROME.quickLabel,
      lines: headline(head, "quick-check"),
      band: bandFrom(quickText, head),
      artNote: "one parent holding the object the guide is about, thinking",
      sourceField: p.quick ? "panel.quick" : "summary",
      sourceText: [quickText],
      optional: false,
      movable: true
    }));
  }

  /* ---- 3–6. THE PANELS, each only if the guide has one ---------------- */
  const clueSlide = (key, kind, family, max, optional, artNote) => {
    const labelWords = family === "warning" ? BUDGET.warnLabelWords : BUDGET.labelWords;
    const items = listOf(p[key]);
    if (!items.length) return;
    const shown = items.slice(0, max);
    const heading = clean(p[key].title) || "";
    slides.push(slide({
      kind,
      family,
      variant: ov[kind] || variantFor(family, guide, kind),
      variants: VARIANTS[family],
      cast: REFS.castFor(family, guide),
      /* The question, very small, so somebody who lands here from a share
         knows what they are reading. */
      kicker: shorten(title, 54),
      /* A panel title is already short — "Usually normal", "Call your doctor
         if". Splitting it across two lines turned it into a stacked block,
         which is the shape this redesign is getting away from. */
      lines: headline(heading, family, 1),
      items: shown.map(t => ({ label: condense(t, labelWords), icon: objectFor(t), source: t })),
      truncatedItems: Math.max(0, items.length - shown.length),
      artNote,
      sourceField: "panel." + key + ".items",
      sourceText: items.concat([heading, guide.title]).filter(Boolean),
      optional,
      movable: true
    }));
  };

  clueSlide("normal", "normal", "quick-check", BUDGET.itemsPerSlide, true,
    "everyday objects that explain the ordinary reasons behind the title");
  clueSlide("helped", "helped", "what-helped-us", BUDGET.helpedItems, true,
    "the family doing the practical thing the guide describes");
  clueSlide("warn",   "warn",   "warning",       BUDGET.warnItems,   false,
    "the parents attentive and calm, holding the baby gently");
  clueSlide("dont",   "dont",   "dont",          BUDGET.dontItems,   true,
    "one parent's open palms raised in a gentle stop gesture");

  /* ---- 7. SAVE / CTA --------------------------------------------------
     Interface wording only, chosen from the approved library by topic. The
     band underneath is the guide's own title, so the slide still says what it
     is about. Logo allowed here. */
  const cta = ctaFor(guide);
  slides.push(slide({
    kind: "close",
    family: "save-cta",
    variant: ov.close || variantFor("save-cta", guide),
    variants: VARIANTS["save-cta"],
    cast: REFS.castFor("save-cta", guide),
    lines: withEmphasis(cta.lines.map((t, i) => ({ t, c: COLOUR_RUNS["save-cta"][i % 3] })), "save-cta"),
    band: shorten(title, 58),
    cta: CHROME.bioLine,
    ctaId: cta.id,
    logo: true,
    artNote: "the whole family together, warm and relaxed",
    sourceField: "template",
    sourceText: [guide.title],
    optional: false,
    movable: false
  }));

  const kept = slides.slice(0, MAX_SLIDES);
  kept.forEach((s, i) => attachConcept(s, guide, i));
  return kept;
}

/* The band under a condensed headline: whatever faithful clause is LEFT in the
   source once the headline has taken its span. Deletion only — if nothing
   usable remains there is no band, rather than an invented one. */
function bandFrom(sourceText, usedHead) {
  const src = clean(sourceText);
  const head = clean(usedHead).replace(/[.]$/, "");
  const idx = src.toLowerCase().indexOf(head.toLowerCase());
  let rest = idx >= 0 ? src.slice(idx + head.length) : "";
  rest = rest.replace(/^[\s,;:.—–-]+/, "").replace(/[\s,;:.]+$/, "");
  if (!rest) return "";
  const band = condense(rest, BUDGET.bandWords);
  return wordCount(band) >= 4 && wordCount(band) <= BUDGET.bandWords ? band : "";
}

function ctaFor(guide) {
  const topic = String(guide.topic || "").toLowerCase();
  const matches = CTA_LIBRARY.filter(c => c.topics.indexOf(topic) >= 0);
  const pool = matches.length ? matches : CTA_LIBRARY.filter(c => !c.topics.length);
  const n = REFS.hashInt(String(guide.slug || "") + "/cta");
  return pool[n % pool.length] || CTA_LIBRARY[CTA_LIBRARY.length - 1];
}

/* --------------------------------------------------------------------------
   THE STORY / REEL

   1080×1920. One hook, one focal point, one CTA — never the 4:5 design
   stretched. The warning frame is carried when the guide has one, because the
   warning rule does not care which surface it is on.
   ------------------------------------------------------------------------ */
function buildStory(guide, opts) {
  const o = opts || {};
  const ov = o.variantOverrides || {};
  const p = guide.panel || {};
  const title = clean(guide.title);
  const frames = [];

  frames.push(slide({
    kind: "hook",
    family: "story-reel",
    variant: ov.storyHook || variantFor("story-reel", guide, "hook"),
    variants: VARIANTS["story-reel"],
    cast: REFS.castFor("story-reel", guide),
    lines: headline(condense(title, BUDGET.headlineWords), "story-reel"),
    band: condense(clean(p.quick) || clean(guide.summary), BUDGET.bandWords),
    cta: CHROME.storyTap,
    image: guide.image || "",
    imageAlt: guide.imageAlt || "",
    artNote: "the family together, reacting to the situation in the title",
    sourceField: "title",
    sourceText: [guide.title, clean(p.quick), clean(guide.summary)].filter(Boolean),
    optional: false, movable: false
  }));

  const warn = listOf(p.warn);
  if (warn.length) {
    frames.push(slide({
      kind: "warn",
      family: "story-reel",
      variant: "band-top",
      variants: VARIANTS["story-reel"],
      cast: REFS.castFor("warning", guide),
      lines: headline(clean(p.warn.title), "warning", 1),
      items: warn.slice(0, BUDGET.warnItems)
        .map(t => ({ label: condense(t, BUDGET.warnLabelWords), icon: objectFor(t), source: t })),
      truncatedItems: Math.max(0, warn.length - BUDGET.warnItems),
      cta: CHROME.storyTap,
      artNote: "the parents attentive and calm, holding the baby gently",
      sourceField: "panel.warn.items",
      sourceText: warn.concat([clean(p.warn.title)]),
      optional: false, movable: true
    }));
  }

  const cta = ctaFor(guide);
  frames.push(slide({
    kind: "cta",
    family: "story-reel",
    variant: "torn-top",
    variants: VARIANTS["story-reel"],
    cast: REFS.castFor("save-cta", guide),
    lines: withEmphasis(cta.lines.map((t, i) => ({ t, c: COLOUR_RUNS["story-reel"][i % 3] })), "save-cta"),
    band: shorten(title, 58),
    cta: CHROME.linkLine,
    ctaId: cta.id,
    artNote: "the whole family together, warm and relaxed",
    sourceField: "template",
    sourceText: [guide.title],
    optional: false, movable: false
  }));

  frames.forEach((f, i) => attachConcept(f, guide, 100 + i));
  return { frames };
}

/* --------------------------------------------------------------------------
   THE CAPTION

   One grounded caption; the platform adapters below wrap it. The nuance lives
   here — the carousel creates recognition, the caption carries the detail.
   ------------------------------------------------------------------------ */
function buildCaption(guide) {
  const p = guide.panel || {};
  const parts = [];
  const sources = [guide.title];

  parts.push(clean(guide.title));

  const quick = clean(p.quick) || clean(guide.summary);
  if (quick) { parts.push("", shorten(quick, 320)); sources.push(quick); }

  /* Prefer the experience panel when the guide has one — it is the most human
     thing on the page and it is genuinely ours. Otherwise the reassurance
     panel. */
  const pick = hasHelpedPanel(guide) ? p.helped : p.normal;
  const items = listOf(pick);
  if (items.length) {
    parts.push("", clean(pick.title) + ":");
    items.slice(0, 3).forEach(i => parts.push("• " + shorten(i, 110)));
    sources.push(clean(pick.title));
    items.forEach(i => sources.push(i));
  }

  const warn = listOf(p.warn);
  if (warn.length) {
    parts.push("", clean(p.warn.title) + ":");
    parts.push("• " + shorten(warn[0], 130));
    sources.push(clean(p.warn.title));
    warn.forEach(i => sources.push(i));
  }

  /* Cap by whole lines rather than by characters: a caption is read as a
     shape, and shorten() would collapse the blank lines that give it one. */
  const capped = [];
  let used = 0;
  for (const line of parts) {
    if (used + line.length + 1 > BUDGET.caption) break;
    capped.push(line);
    used += line.length + 1;
  }
  while (capped.length && !clean(capped[capped.length - 1])) capped.pop();

  return { text: capped.join("\n"), sources };
}

/* --------------------------------------------------------------------------
   PLATFORM ADAPTERS

   One grounded package, two destinations. The DIFFERENCE between them is real,
   and it is only these two things:

     Instagram   a caption cannot carry a clickable link, so it says where the
                 link is. Hashtags belong here.
     Facebook    a post CAN carry a clickable link, so the tagged guide URL is
                 in the copy, and hashtags drop to two because more reads as
                 spam there.

   Everything else — the artwork, the slide text, the warning — is shared,
   because a warning worth showing on one platform is worth showing on the
   other.
   ------------------------------------------------------------------------ */
function platformCopy(pkg) {
  const base = String(pkg.caption || "");
  const tags = (pkg.hashtags || []).map(h => "#" + h);

  const instagram = [base, "", CHROME.captionCtaInstagram, "", tags.join(" ")]
    .join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const facebook = [base, "", CHROME.captionCtaFacebook,
    pkg.destinationUrlFacebook || pkg.destinationUrl, "", tags.slice(0, 2).join(" ")]
    .join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return {
    instagram: {
      platform: "instagram",
      caption: instagram,
      link: CHROME.linkLine,
      linkIsClickable: false,
      hashtags: (pkg.hashtags || []).slice(),
      formats: { feed: FORMATS.carousel, story: FORMATS.story },
      limits: { hard: 2200, comfortable: 1400 },
      notes: "Instagram captions cannot carry a clickable link, so the copy points at the bio link."
    },
    facebook: {
      platform: "facebook",
      caption: facebook,
      link: pkg.destinationUrlFacebook || pkg.destinationUrl,
      linkIsClickable: true,
      hashtags: (pkg.hashtags || []).slice(0, 2),
      formats: { feed: FORMATS.carousel, story: FORMATS.story },
      limits: { hard: 63206, comfortable: 1800 },
      notes: "Facebook links are clickable, so the tagged guide URL is in the copy. Fewer hashtags — they read as spam there."
    }
  };
}

/* --------------------------------------------------------------------------
   THE PACKAGE
   ------------------------------------------------------------------------ */
function composePackage(guide, opts) {
  const o = opts || {};
  const topics = o.topics || [];
  const now = o.now || Date.now();
  const slotOffset = o.slotOffset || 0;
  const plan = { variantOverrides: o.variantOverrides || {} };

  const slides = buildSlides(guide, plan);
  const caption = buildCaption(guide);
  const path = guide.url || guideUrl(guide.slug);
  const scheduledFor = suggestSlot(now, slotOffset);

  const pkg = {
    /* identity */
    guideId: guide.id,
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guidePath: path,
    topic: guide.topic || "",
    ages: guide.ages || [],

    /* content */
    format: "carousel",
    slides,
    caption: caption.text,
    captionSourceText: caption.sources,
    hashtags: hashtagsFor(guide, topics),
    story: buildStory(guide, plan),

    /* destination */
    destination: o.destination || "both",
    destinationUrl: taggedUrl({ path, format: "carousel", slug: guide.slug, date: scheduledFor }),
    destinationUrlFacebook: taggedUrl({ path, format: "carousel", slug: guide.slug, date: scheduledFor, source: "facebook" }),
    storyUrl: taggedUrl({ path, format: "story", slug: guide.slug, date: scheduledFor }),
    scheduledFor,

    /* provenance — which guide field produced which slide, so Amir can check
       that nothing was invented without leaving the dashboard */
    sourceRefs: slides.map((s, i) => ({ slide: i + 1, kind: s.kind, family: s.family, field: s.sourceField })),

    /* artwork lifecycle, filled in by artwork.js and social-artwork.js */
    artwork: { status: "QUEUED", updatedAt: null, error: null, engine: null },

    /* lifecycle */
    status: STATES.DRAFT,
    isTest: !!o.isTest,
    approvedHash: null,
    approvedAt: null,
    approvedBy: null,
    rejectedReason: null,

    /* the animation extension, documented and switched off */
    animation: { status: "NOT_CONFIGURED", provider: null, assets: [] },

    composerVersion: 2
  };

  pkg.platforms = platformCopy(pkg);
  return pkg;
}

module.exports = {
  composePackage, buildSlides, buildCaption, buildStory, platformCopy,
  shorten, suggestSlot, hashtagsFor, headline, splitBalanced, objectFor,
  variantFor, ctaFor, bandFrom, attachConcept, withEmphasis,
  BUDGET, CHROME, CTA_LIBRARY, VARIANTS, COLOUR_RUNS, OBJECTS
};
