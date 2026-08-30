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

const problem = (level, code, message) => ({ level, code, message });

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
    const hasWords = String(s.heading || "").trim() ||
      (Array.isArray(s.lines) && s.lines.some(l => String(l || "").trim()));
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

  return out;
}

/* Merge the browser's or the renderer's overflow findings in, so one list on
   the package answers "is anything wrong with this". */
function withRenderFindings(structural, renderFindings) {
  return (structural || []).concat(renderFindings || []);
}

const blocking = (findings) => (findings || []).filter(f => f.level === "error");
const canApprove = (findings) => blocking(findings).length === 0;

module.exports = { validatePackage, withRenderFindings, blocking, canApprove };
