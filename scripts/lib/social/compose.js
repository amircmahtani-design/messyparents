/* ============================================================================
   SOCIAL — COMPOSING A PACKAGE FROM A GUIDE

   This is a re-renderer, not a writer. Every sentence it puts on a slide comes
   out of a field Amir already approved in Studio; the only transformation
   applied is SHORTENING. Nothing is rephrased, nothing is summarised in new
   words, nothing is added.

   That single constraint is what makes safety.js able to check the output
   mechanically: a composer that can only remove words cannot introduce one, so
   any word on a slide that is not in the source is a bug with a name.

   No AI service is involved and none is required. If a future phase wants a
   model to polish wording, it belongs behind this module as an optional pass
   whose output goes through exactly the same checks — never in front of it.

   ---------------------------------------------------------------------------
   FIELD MAPPING (from scripts/lib/data.js normaliseGuide)

     title ................. cover slide, caption opening
     panel.eyebrow ......... cover eyebrow (falls back to topic • ages)
     panel.quick ........... the quick-answer slide and the caption's answer
     panel.normal.items[] .. the "usually normal" slide
     panel.helped.items[] .. the "what helped us" slide — and the ONLY source
                             for first-person-plural wording anywhere
     panel.warn.items[] .... the warning slide, which is never optional
     panel.dont.items[] .... the "don't" slide, which is
     panel.hero/heroAlt .... the approved illustration
     summary, ages, topic .. supporting metadata

   A guide missing a field simply has no slide for it. Empty sections are never
   padded, and the carousel length follows the guide.
   ========================================================================== */

const { guideUrl } = require("../site");
const { taggedUrl } = require("./utm");
const { MAX_SLIDES, STATES } = require("./config");
const { hasHelpedPanel } = require("./safety");

/* --------------------------------------------------------------------------
   SHORTENING — the only transformation allowed

   Cut at a sentence end if there is one in range; otherwise at a word
   boundary, with an ellipsis. Never mid-word, never a new word.
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

/* --------------------------------------------------------------------------
   SLIDE BUDGETS

   Character limits chosen from the rendered template at 1080×1350: the point
   where the type has to shrink below comfortable reading size. validate.js
   re-checks the rendered result, so these are the first line of defence, not
   the only one.
   ------------------------------------------------------------------------ */
const BUDGET = {
  coverHeading: 78,
  quickBody: 190,
  bullet: 88,
  bulletsPerSlide: 3,
  storyHeading: 70,
  storyBody: 150,
  caption: 1400
};

/* The fixed template wording. Short, and listed in safety.js CHROME_WORDS so
   the grounding check knows these words are ours rather than invented. */
const CHROME = {
  closeHeading: "Read the full guide",
  closeLine: "Link in bio",
  brand: "The Messy Parents Collection",
  captionCta: "Read the full guide — link in bio."
};

/* --------------------------------------------------------------------------
   SCHEDULING

   Three a week, Monday / Wednesday / Friday at 19:00 UTC. This is a SUGGESTION
   written onto the package for Amir to change; nothing acts on it in this
   phase, and nothing acts on it in a later phase either until the package has
   been approved.
   ------------------------------------------------------------------------ */
const SLOT_DAYS = [1, 3, 5];   // Mon, Wed, Fri
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
   HASHTAGS

   Built from the guide's own classification, not from a trending list. Capped
   at eight: past that they read as spam and Instagram does not reward them.
   ------------------------------------------------------------------------ */
const tagify = (s) => String(s || "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u2010-\u2015]/g, " to ")
  .replace(/[^a-z0-9 ]+/g, "")
  .split(/\s+/).filter(Boolean).join("");

function hashtagsFor(guide, topics) {
  const out = ["themessyparentscollection"];
  const topicLabel = (topics || []).find(t => t.id === guide.topic);
  if (topicLabel) out.push(tagify(topicLabel.label));
  else if (guide.topic) out.push(tagify(guide.topic));

  /* Age bands become "2to3months", not "23months" — the dash carries meaning
     and dropping it produces a hashtag that reads as twenty-three months. */
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
   SLIDES
   ------------------------------------------------------------------------ */
function buildSlides(guide) {
  const p = guide.panel || {};
  const slides = [];

  const eyebrow = clean(p.eyebrow) ||
    [guide.topic, (guide.ages || [])[0]].filter(Boolean).join(" • ");

  /* 1. Cover — the question, as the guide asks it. */
  slides.push({
    kind: "cover",
    eyebrow,
    heading: shorten(guide.title, BUDGET.coverHeading),
    lines: [],
    image: guide.image || "",
    imageAlt: guide.imageAlt || "",
    sourceField: "title",
    sourceText: [guide.title, p.eyebrow, guide.topic, (guide.ages || []).join(" ")].filter(Boolean),
    optional: false,
    movable: false
  });

  /* 2. The quick answer. */
  const quick = clean(p.quick) || clean(guide.summary);
  if (quick) {
    slides.push({
      kind: "quick",
      eyebrow: "Quick answer",
      heading: "",
      lines: [shorten(quick, BUDGET.quickBody)],
      image: "",
      sourceField: p.quick ? "panel.quick" : "summary",
      sourceText: [quick],
      optional: false,
      movable: true
    });
  }

  /* 3–5. The panels, each only if the guide has one. */
  const panelSlide = (key, kind, optional) => {
    const items = listOf(p[key]);
    if (!items.length) return;
    const shown = items.slice(0, BUDGET.bulletsPerSlide);
    slides.push({
      kind,
      /* The question, small, at the top of every panel slide. Someone who
         lands on slide 4 from a share needs to know what they are reading. */
      eyebrow: shorten(guide.title, 62),
      heading: clean(p[key].title) || "",
      lines: shown.map(i => shorten(i, BUDGET.bullet)),
      image: "",
      sourceField: `panel.${key}.items`,
      sourceText: items.concat([clean(p[key].title), guide.title]).filter(Boolean),
      optional,
      movable: true,
      truncatedItems: Math.max(0, items.length - shown.length)
    });
  };

  panelSlide("normal", "normal", true);
  panelSlide("helped", "helped", true);
  panelSlide("warn",   "warn",   false);   /* never removable */
  panelSlide("dont",   "dont",   true);

  /* 6. Close. Template wording only. */
  slides.push({
    kind: "close",
    eyebrow: "",
    heading: CHROME.closeHeading,
    lines: [shorten(guide.title, BUDGET.coverHeading), CHROME.closeLine],
    image: "",
    sourceField: "template",
    sourceText: [guide.title],
    optional: false,
    movable: false
  });

  return slides.slice(0, MAX_SLIDES);
}

/* --------------------------------------------------------------------------
   CAPTION

   Readable, not a reproduction of the guide. The answer, one panel's worth of
   bullets, and a pointer to the site. Every word comes from the guide or from
   CHROME.
   ------------------------------------------------------------------------ */
function buildCaption(guide) {
  const p = guide.panel || {};
  const parts = [];
  const sources = [guide.title];

  parts.push(clean(guide.title));

  const quick = clean(p.quick) || clean(guide.summary);
  if (quick) { parts.push("", shorten(quick, 320)); sources.push(quick); }

  /* Prefer the experience panel in the caption when the guide has one — it is
     the most human thing on the page and it is genuinely ours. Otherwise the
     reassurance panel. */
  const pick = hasHelpedPanel(guide) ? p.helped : p.normal;
  const items = listOf(pick);
  if (items.length) {
    parts.push("", clean(pick.title) + ":");
    items.slice(0, 3).forEach(i => parts.push("• " + shorten(i, 110)));
    sources.push(clean(pick.title), ...items);
  }

  const warn = listOf(p.warn);
  if (warn.length) {
    parts.push("", clean(p.warn.title) + ":");
    parts.push("• " + shorten(warn[0], 130));
    sources.push(clean(p.warn.title), ...warn);
  }

  parts.push("", CHROME.captionCta);

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
  if (capped.length < parts.length) capped.push("", CHROME.captionCta);

  return { text: capped.join("\n"), sources };
}

/* --------------------------------------------------------------------------
   STORY

   Two frames. A hook and a pointer. Anything longer is a carousel.
   ------------------------------------------------------------------------ */
function buildStory(guide) {
  const p = guide.panel || {};
  const frames = [{
    kind: "hook",
    heading: shorten(guide.title, BUDGET.storyHeading),
    body: shorten(clean(p.quick) || clean(guide.summary), BUDGET.storyBody),
    image: guide.image || "",
    imageAlt: guide.imageAlt || "",
    sourceText: [guide.title, clean(p.quick), clean(guide.summary)].filter(Boolean)
  }];

  const warn = listOf(p.warn);
  if (warn.length) {
    frames.push({
      kind: "warn",
      heading: shorten(clean(p.warn.title), BUDGET.storyHeading),
      body: shorten(warn[0], BUDGET.storyBody),
      image: "",
      sourceText: warn.concat([clean(p.warn.title)])
    });
  }

  frames.push({
    kind: "cta",
    heading: CHROME.closeHeading,
    body: CHROME.closeLine,
    image: "",
    sourceText: [guide.title]
  });

  return { frames };
}

/* --------------------------------------------------------------------------
   THE PACKAGE
   ------------------------------------------------------------------------ */
function composePackage(guide, { topics = [], now = Date.now(), slotOffset = 0, isTest = false } = {}) {
  const slides = buildSlides(guide);
  const caption = buildCaption(guide);
  const path = guide.url || guideUrl(guide.slug);
  const scheduledFor = suggestSlot(now, slotOffset);

  return {
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
    story: buildStory(guide),

    /* destination */
    destinationUrl: taggedUrl({ path, format: "carousel", slug: guide.slug, date: scheduledFor }),
    storyUrl: taggedUrl({ path, format: "story", slug: guide.slug, date: scheduledFor }),
    scheduledFor,

    /* provenance — which guide field produced which slide, so Amir can check
       that nothing was invented without leaving the dashboard */
    sourceRefs: slides.map((s, i) => ({ slide: i + 1, kind: s.kind, field: s.sourceField })),

    /* lifecycle */
    status: STATES.DRAFT,
    isTest: !!isTest,
    approvedHash: null,
    approvedAt: null,
    approvedBy: null,
    rejectedReason: null,

    /* the animation extension, documented and switched off */
    animation: { status: "NOT_CONFIGURED", provider: null, assets: [] },

    composerVersion: 1
  };
}

module.exports = {
  composePackage, buildSlides, buildCaption, buildStory,
  shorten, suggestSlot, hashtagsFor, BUDGET, CHROME
};
