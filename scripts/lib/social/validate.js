/* ============================================================================
   SOCIAL — PACKAGE VALIDATION

   Structural checks that do not need a browser. Two more live elsewhere
   because they genuinely cannot be answered here:

     • text overflow — only a rendered slide knows whether the words fit, so
       the dashboard measures it live and scripts/social-render.js measures it
       at export size. Both write their findings back onto the package.
     • content grounding — safety.js owns that.

   A package with any `error` cannot be approved. `warn` is informational and
   shown next to the package.
   ========================================================================== */

const { MAX_SLIDES, PUBLISH_IMAGE_FORMAT, FORMATS } = require("./config");
const { readTags } = require("./utm");
const { LOGO_FAMILIES, FAMILIES } = require("./refs");

const problem = (level, code, message) => ({ level, code, message });

/* --------------------------------------------------------------------------
   POSTER RULES

   These did not exist while a slide was a heading over a card, because a card
   cannot be over-filled — it just grew a scrollbar nobody saw. A poster can:
   five labels on a quick-check slide, or a fourteen-word label, is a slide
   that has stopped being readable at thumbnail size, which is the whole
   reason for the redesign.

   Word counts, not character counts. A label is read as words.
   ------------------------------------------------------------------------ */
const MAX_ITEMS = 4;

/* Two budgets, because a warning is not a label.

   "Fewer wet nappies than expected, or weight loss beyond the first week" is
   twelve words and every one of them is load-bearing — condense.js refuses to
   truncate a warning's condition, and it is right to. So the warning family
   gets room and the renderer sets it smaller across two or three short lines;
   the ordinary clue slides, where the words are describing rather than
   instructing, stay tight. */
const LABEL_WARN = { warning: 12, "default": 8 };
const LABEL_ERROR = { warning: 18, "default": 14 };
const HEADLINE_WARN_WORDS = 16;

const words = (v) => String(v == null ? "" : v).trim().split(/\s+/).filter(Boolean).length;
const lineText = (l) => (typeof l === "string" ? l : (l && l.t) || "");
const itemText = (i) => (typeof i === "string" ? i : (i && i.label) || "");

/* Every visible string on a slide, both shapes. */
function slideWords(s) {
  const out = [];
  if (!s) return out;
  if (s.heading) out.push(s.heading);
  (s.lines || []).forEach(l => out.push(lineText(l)));
  (s.items || []).forEach(i => out.push(itemText(i)));
  if (s.band) out.push(s.band);
  if (s.cta) out.push(s.cta);
  if (s.body) out.push(s.body);
  return out.filter(Boolean);
}

function posterChecks(pkg) {
  const out = [];
  const slides = (pkg && pkg.slides) || [];
  const frames = (pkg && pkg.story && pkg.story.frames) || [];
  const seenHeadline = new Map();

  const one = (s, n, where) => {
    const family = s.family || "";

    /* The logo. It carries the brand hard, and on every slide it stops
       carrying anything at all. The cover and the closing slide, and nowhere
       else — including Story frames, which get none by default. */
    if (s.logo && !LOGO_FAMILIES.includes(family)) {
      out.push(problem("error", "logo-restraint",
        `${where} ${n} (${family || "no family"}) carries the full logo. Only ${LOGO_FAMILIES.join(" and ")} may.`));
    }

    /* Labels. */
    const items = s.items || [];
    if (items.length > MAX_ITEMS) {
      out.push(problem("error", "too-many-labels",
        `${where} ${n} has ${items.length} labels. A poster slide reads at most ${MAX_ITEMS}.`));
    }
    const budget = LABEL_WARN[family] || LABEL_WARN["default"];
    const ceiling = LABEL_ERROR[family] || LABEL_ERROR["default"];
    items.forEach((it, k) => {
      const w = words(itemText(it));
      if (w > ceiling) {
        out.push(problem("error", "label-too-long",
          `${where} ${n}, label ${k + 1} is ${w} words. That is a sentence, not a label.`));
      } else if (w > budget) {
        out.push(problem("warn", "label-long",
          `${where} ${n}, label ${k + 1} is ${w} words — comfortable is ${budget}.`));
      }
    });

    /* Headline length. A poster headline that needs sixteen words is a
       paragraph wearing a large typeface. */
    const hw = (s.lines || []).reduce((t, l) => t + words(lineText(l)), 0);
    if (hw > HEADLINE_WARN_WORDS) {
      out.push(problem("warn", "headline-long",
        `${where} ${n} has a ${hw}-word headline. Shorten it or move it to the caption.`));
    }

    /* A family the renderer does not know how to draw. */
    if (family && !FAMILIES.includes(family)) {
      out.push(problem("error", "unknown-family",
        `${where} ${n} has family "${family}", which is not one of ${FAMILIES.join(", ")}.`));
    }

    /* The same headline twice in one carousel is a swipe with nothing in it. */
    const key = (s.lines || []).map(l => lineText(l)).join(" ").toLowerCase().trim();
    if (key && where === "Slide") {
      if (seenHeadline.has(key)) {
        out.push(problem("warn", "duplicate-headline",
          `${where} ${n} repeats the headline on slide ${seenHeadline.get(key)}.`));
      } else seenHeadline.set(key, n);
    }

    /* Rendered artwork, when there is any, must be the exact platform size. */
    const art = s.art || null;
    if (art && art.assetPath) {
      const f = where === "Slide" ? FORMATS.carousel : FORMATS.story;
      if (art.width && art.height && (art.width !== f.width || art.height !== f.height)) {
        out.push(problem("error", "artwork-size",
          `${where} ${n} artwork is ${art.width}×${art.height}; ${f.label} must be ${f.width}×${f.height}.`));
      }
      if (art.strayText) {
        out.push(problem("error", "artwork-stray-text",
          `${where} ${n} artwork was rejected because the generated base contained readable text.`));
      }
    }
  };

  slides.forEach((s, i) => one(s, i + 1, "Slide"));
  frames.forEach((f, i) => one(f, i + 1, "Story frame"));

  /* The artwork job itself. */
  const a = (pkg && pkg.artwork) || {};
  if (a.status === "FAILED") {
    out.push(problem("warn", "artwork-failed",
      "Artwork generation failed for this package. " + (a.error || "") +
      " Press Retry, or approve the text and regenerate the artwork afterwards."));
  }

  return out;
}

function validatePackage(pkg) {
  const out = [];
  const slides = (pkg && pkg.slides) || [];

  if (slides.length < 2) {
    out.push(problem("error", "too-few-slides", "A carousel needs at least two slides."));
  }
  if (slides.length > MAX_SLIDES) {
    out.push(problem("error", "too-many-slides",
      `Instagram allows ${MAX_SLIDES} carousel items; this package has ${slides.length}.`));
  }

  slides.forEach((s, i) => {
    const n = i + 1;
    if (!s.kind) out.push(problem("error", "slide-kind", `Slide ${n} has no kind.`));
    const hasWords = slideWords(s).some(t => String(t).trim());
    if (!hasWords && !s.image) {
      out.push(problem("error", "empty-slide", `Slide ${n} has neither words nor a picture.`));
    }
    if (!s.sourceField) {
      out.push(problem("warn", "no-provenance", `Slide ${n} does not record which guide field it came from.`));
    }
  });

  if (slides[0] && slides[0].kind !== "cover") {
    out.push(problem("warn", "no-cover", "The first slide is not the cover."));
  }

  /* Meta crops every carousel image to the aspect ratio of the FIRST one, so a
     mixed set silently mangles the rest. Ours are all 4:5 by construction;
     this asserts that nothing has changed it. */
  const f = FORMATS.carousel;
  if (!f || f.ratio !== "4:5") {
    out.push(problem("error", "aspect", "Carousel format is no longer 4:5."));
  }
  if (PUBLISH_IMAGE_FORMAT !== "jpeg") {
    out.push(problem("error", "format", "The publish format must be JPEG — Meta accepts nothing else."));
  }

  if (!String(pkg.caption || "").trim()) {
    out.push(problem("error", "no-caption", "The caption is empty."));
  } else if (pkg.caption.length > 2200) {
    out.push(problem("error", "caption-length", "Instagram truncates captions over 2,200 characters."));
  }

  if ((pkg.hashtags || []).length > 30) {
    out.push(problem("error", "hashtags", "Instagram allows at most 30 hashtags."));
  }

  const tags = readTags(pkg.destinationUrl || "");
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(k => {
    if (!tags[k]) out.push(problem("error", "utm", `The destination URL is missing ${k}.`));
  });
  if (pkg.destinationUrl && !/^https:\/\/themessyparentscollection\.com\//.test(pkg.destinationUrl)) {
    out.push(problem("error", "destination", "The destination URL does not point at the site."));
  }

  if (!pkg.scheduledFor || isNaN(Date.parse(pkg.scheduledFor))) {
    out.push(problem("error", "schedule", "The suggested date/time is missing or unreadable."));
  }

  const story = (pkg.story && pkg.story.frames) || [];
  if (!story.length) out.push(problem("warn", "no-story", "This package has no Story version."));

  /* The destination is a real choice now, and it decides which previews and
     which copy Amir is approving. */
  const dest = pkg.destination || "both";
  if (!["instagram", "facebook", "both"].includes(dest)) {
    out.push(problem("error", "destination-unknown",
      `"${dest}" is not a destination. Instagram, Facebook, or both.`));
  }
  if (pkg.platforms) {
    ["instagram", "facebook"].forEach(k => {
      const v = pkg.platforms[k];
      if (!v) return;
      if (!String(v.caption || "").trim()) {
        out.push(problem("error", "platform-caption", `The ${k} caption is empty.`));
      } else if (v.limits && v.caption.length > v.limits.hard) {
        out.push(problem("error", "platform-caption-length",
          `The ${k} caption is ${v.caption.length} characters; ${k} allows ${v.limits.hard}.`));
      }
    });
    const fb = pkg.platforms.facebook;
    if ((dest === "facebook" || dest === "both") && fb && !/^https:\/\//.test(String(fb.link || ""))) {
      out.push(problem("error", "facebook-link",
        "Facebook is a destination but the Facebook copy has no clickable guide URL."));
    }
  }

  return out.concat(posterChecks(pkg));
}

/* Merge the browser's or the renderer's overflow findings in, so one list on
   the package answers "is anything wrong with this". */
function withRenderFindings(structural, renderFindings) {
  return (structural || []).concat(renderFindings || []);
}

const blocking = (findings) => (findings || []).filter(f => f.level === "error");
const canApprove = (findings) => blocking(findings).length === 0;

module.exports = { validatePackage, withRenderFindings, blocking, canApprove, posterChecks, slideWords, MAX_ITEMS };
