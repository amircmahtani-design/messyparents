/* ============================================================================
   SOCIAL — THE ARTWORK PIPELINE

   The hybrid: OpenAI helps make the PICTURE, and is never trusted with a WORD.

     1. read the approved guide fields                     (compose.js)
     2. select only the slides the guide supports          (compose.js)
     3. pick the poster reference for the slide family     (refs.js)
     4. pick the character sheets and one approved scene   (refs.js)
     5. send those references to the image model           (this file, via io)
     6. ask for an illustrated base with NO lettering      (artprompt.js)
     7. check the base for stray lettering, reject if any  (this file)
     8. store it at a deterministic package-scoped path    (this file, via io)
     9. draw the approved wording over it deterministically (templates.js)

   ---------------------------------------------------------------------------
   THE CACHE KEY EXCLUDES THE COPY, ON PURPOSE

   A generated base contains no words, so a headline edit cannot change what
   the right picture is — and re-charging for an image because somebody fixed
   a comma would make people stop fixing commas. So artKey() hashes the things
   that genuinely decide the picture:

       guide, slide family, layout variant, cast, art note,
       reference ids, manifest version, prompt version, image model,
       output size, and artSeed

   `artSeed` is the deliberate escape hatch: "regenerate the artwork, keep the
   exact copy" increments it, the key changes, and one new image is made. That
   is the only way to spend money on a slide whose text has not changed.

   Reopening a package with a matching key makes no API call at all. That is a
   test, not a hope: tests/social-artwork.js asserts the transport is never
   touched on a cache hit.

   ---------------------------------------------------------------------------
   NO KEY EVER LEAVES THE SERVER

   Nothing in this file reads process.env, opens a socket or knows what an
   Authorization header is. Every side effect arrives as an `io` object built
   by netlify/functions/social-artwork.js, which is the only place the key is
   read and the only place that can reach api.openai.com. That is also what
   makes the whole pipeline testable with a fake transport.
   ========================================================================== */

const crypto = require("crypto");
const REFS = require("./refs");
const PROMPT = require("./artprompt");
const { FORMATS, STORAGE_PREFIX } = require("./config");

/* Generation states shown in the dashboard. One-way except through Retry. */
const ART_STATES = { QUEUED: "QUEUED", GENERATING: "GENERATING", READY: "READY", FAILED: "FAILED" };

/* Which format a frame is drawn at. Story frames are 9:16, everything else is
   the 4:5 carousel — read from config so there is one definition of "1080". */
const formatFor = (isStory) => (isStory ? FORMATS.story : FORMATS.carousel);

const sha = (s) => crypto.createHash("sha256").update(String(s), "utf8").digest("hex");

/* --------------------------------------------------------------------------
   THE KEY
   ------------------------------------------------------------------------ */
/* WHY `kind`, `sourceField` AND THE CONCEPT ARE IN HERE.

   The first version of this key hashed the family, the variant, the cast and a
   free-text art note. Two slides in the same family — `quick` and `normal`,
   which share the quick-check poster — produced the SAME key, so the second one
   was served the first one's picture out of the cache and the package read as
   one poster with different words on it.

   The key now carries a stable semantic fingerprint of what the slide is a
   picture OF: its kind, the approved field it came from, the concept chosen for
   it, the action, and the objects that concept puts in the scene. Two slides
   that mean different things cannot collide. A punctuation edit still changes
   nothing, because none of these inputs is the copy. */
function artKey({ guide, slide, selection, format, imageModel, artSeed }) {
  const c = slide.concept || {};
  const parts = [
    "k2",
    "guide:" + String((guide && guide.slug) || ""),
    "kind:" + String(slide.kind || ""),
    "family:" + String(slide.family || ""),
    "source:" + String(slide.sourceField || ""),
    "concept:" + String(c.id || ""),
    "action:" + String(c.action || ""),
    "objects:" + ((c.objects || []).join(",")),
    "fingerprint:" + String(c.fingerprint || ""),
    "variant:" + String(slide.variant || ""),
    "cast:" + (slide.cast || []).join(","),
    "refs:" + selection.ids.join(","),
    "manifest:" + selection.manifestVersion,
    "prompt:" + PROMPT.PROMPT_VERSION,
    "model:" + (imageModel || PROMPT.DEFAULT_IMAGE_MODEL),
    "size:" + format.width + "x" + format.height,
    "seed:" + (artSeed || 0)
  ];
  return sha(parts.join("\n"));
}

/* Deterministic, package-scoped, and unguessable.

   Package-scoped so that deleting a rejected package can delete exactly its
   own media and nothing else — see netlify/functions/social-delete.js, which
   refuses to touch anything outside this prefix.

   The key in the filename is what makes the path unguessable, which is what
   lets these be readable by URL without a sign-in exchange. The dashboard is
   an <img> tag on a page that cannot mint Storage tokens; the same trade-off
   is already made for the book images in storage.rules, and it is written
   down there too. */
function storagePath(packageId, index, kind, key) {
  const n = String(index + 1).padStart(2, "0");
  return `${STORAGE_PREFIX}${packageId}/${kind}-${n}-${key.slice(0, 16)}.png`;
}

/* Two frames must never end up pointing at one object. The path already
   contains the frame's own kind and index, so it is unique by construction —
   this asserts it over a whole plan, and the tests use it. */
function pathsAreDistinct(jobs, packageId) {
  const seen = new Map();
  const clashes = [];
  (jobs || []).forEach(j => {
    const p = storagePath(packageId || "pkg", j.index, j.kind, j.key);
    if (seen.has(p)) clashes.push({ path: p, ids: [seen.get(p), j.id] });
    else seen.set(p, j.id);
  });
  return { ok: clashes.length === 0, clashes, paths: Array.from(seen.keys()) };
}

/* --------------------------------------------------------------------------
   THE PLAN

   What would be generated, without generating anything. The dashboard uses it
   to show which references a slide is going to use before spending a penny,
   and social-artwork.js walks it.
   ------------------------------------------------------------------------ */
function planFor(pkg, guide, opts) {
  const o = opts || {};
  const manifest = o.manifest || REFS.loadManifest();
  const imageModel = o.imageModel || PROMPT.DEFAULT_IMAGE_MODEL;
  const only = o.only == null ? null : [].concat(o.only);   /* e.g. ["slide:2"] */

  const jobs = [];
  const add = (slide, index, isStory) => {
    const id = (isStory ? "story:" : "slide:") + index;
    if (only && only.indexOf(id) < 0) return;

    const format = formatFor(isStory);
    const selection = REFS.selectFor({
      family: slide.family, guide, manifest,
      cast: (slide.concept && slide.concept.cast) || slide.cast || null
    });
    const key = artKey({
      guide, slide, selection, format, imageModel,
      artSeed: (slide.art && slide.art.artSeed) || 0
    });

    jobs.push({
      id, index, isStory, kind: isStory ? "story" : "slide",
      family: slide.family,
      selection,
      format,
      imageModel,
      key,
      concept: slide.concept || null,
      artSeed: (slide.art && slide.art.artSeed) || 0,
      cached: isCached(slide, key),
      prompt: PROMPT.buildPrompt({ family: slide.family, guide, selection, format, slide }),
      provenance: PROMPT.provenance({ family: slide.family, selection, imageModel, format, slide })
    });
  };

  (pkg.slides || []).forEach((s, i) => add(s, i, false));
  (((pkg.story || {}).frames) || []).forEach((f, i) => add(f, i, true));
  return jobs;
}

/* A slide already carrying artwork made from exactly this key and still
   pointing at a stored asset. Absence is never a match. */
function isCached(slide, key) {
  const a = slide && slide.art;
  return Boolean(a && a.key === key && a.assetPath && a.assetUrl && !a.strayText);
}

/* --------------------------------------------------------------------------
   STRAY LETTERING

   The model is told, at length, not to draw words. It mostly obeys. "Mostly"
   is not good enough for a slide whose whole design assumes the picture is
   wordless: a base with a half-legible mug slogan under the headline looks
   like a mistake, and a base with invented advice on it IS one.

   So every base is asked about before it is stored, by the same model, with a
   yes/no schema. A base that reports lettering is REJECTED — not shown, not
   stored as "finished", not silently used. The slide keeps its composed
   fallback and the dashboard says why.

   The check is deliberately conservative: an unparseable answer counts as
   "possibly has text", because the cost of a false positive is one retry and
   the cost of a false negative is a published typo.
   ------------------------------------------------------------------------ */
const TEXT_CHECK_PROMPT =
  "Look at this illustration. Answer ONLY with JSON of the form " +
  '{"hasReadableText": true|false, "hasLogo": true|false, "what": "<short description or empty>"}. ' +
  "Set hasReadableText to true if ANY letters, words, numbers, captions, labels, signage, " +
  "handwriting, book titles, mug slogans or packaging copy are legible or partially legible " +
  "anywhere in the image, including small or blurred lettering. Set hasLogo to true if any " +
  "brand mark, wordmark, badge, watermark or signature appears. Do not describe the picture.";

function interpretTextCheck(answer) {
  if (!answer || typeof answer !== "object") {
    return { hasText: true, reason: "the lettering check returned nothing readable, so the base is treated as suspect" };
  }
  if (answer.hasReadableText === true) {
    return { hasText: true, reason: "the generated base contains readable lettering" + (answer.what ? ` (${answer.what})` : "") };
  }
  if (answer.hasLogo === true) {
    return { hasText: true, reason: "the generated base contains a logo or watermark" + (answer.what ? ` (${answer.what})` : "") };
  }
  if (answer.hasReadableText === false) return { hasText: false, reason: "" };
  return { hasText: true, reason: "the lettering check did not answer, so the base is treated as suspect" };
}

/* --------------------------------------------------------------------------
   RUNNING ONE JOB

   `io` is everything that touches the outside world, injected:

     io.referenceUrls(selection)   → absolute URLs for the attached references
     io.generate({ prompt, size, references, model })  → { b64 }
     io.checkText({ b64, prompt })                     → parsed JSON answer
     io.store({ b64, path })                           → { path, url }

   The order matters and is asserted by the tests: references are resolved and
   attached BEFORE generation, and the lettering check happens BEFORE storage,
   so a rejected base is never written to the bucket at all.
   ------------------------------------------------------------------------ */
async function runJob(job, io, ctx) {
  const c = ctx || {};
  const references = await io.referenceUrls(job.selection);
  if (!references.length) {
    const e = new Error("MISSING_REFERENCE: none of the selected references could be read.");
    e.code = "MISSING_REFERENCE";
    throw e;
  }

  const out = await io.generate({
    prompt: job.prompt,
    size: `${job.format.width}x${job.format.height}`,
    width: job.format.width,
    height: job.format.height,
    references,
    model: job.imageModel
  });
  if (!out || !out.b64) {
    const e = new Error("NO_IMAGE: the image model returned no image.");
    e.code = "NO_IMAGE";
    throw e;
  }

  /* The lettering gate, before anything is stored. */
  let verdict = { hasText: false, reason: "" };
  if (io.checkText) {
    let answer = null;
    try { answer = await io.checkText({ b64: out.b64, prompt: TEXT_CHECK_PROMPT }); }
    catch (e) { answer = null; }
    verdict = interpretTextCheck(answer);
  }
  if (verdict.hasText) {
    return {
      ok: false,
      strayText: true,
      reason: verdict.reason,
      art: strayArt(job, verdict.reason)
    };
  }

  const stored = await io.store({
    b64: out.b64,
    path: storagePath(c.packageId || "unsaved", job.index, job.kind, job.key),
    contentType: "image/png"
  });

  return { ok: true, art: readyArt(job, stored, out) };
}

function baseArt(job) {
  return Object.assign({}, job.provenance, {
    key: job.key,
    artSeed: job.artSeed,
    family: job.family,
    variant: null,
    width: job.format.width,
    height: job.format.height,
    engine: "openai"
  });
}

function readyArt(job, stored, out) {
  return Object.assign(baseArt(job), {
    status: ART_STATES.READY,
    assetPath: stored.path,
    assetUrl: stored.url,
    assetId: stored.path,
    bytes: stored.bytes || null,
    strayText: false,
    error: null,
    generatedAt: new Date().toISOString(),
    revisedPrompt: (out && out.revisedPrompt) || null
  });
}

function strayArt(job, reason) {
  return Object.assign(baseArt(job), {
    status: ART_STATES.FAILED,
    assetPath: null,
    assetUrl: null,
    assetId: null,
    strayText: true,
    error: reason,
    generatedAt: new Date().toISOString()
  });
}

function failedArt(job, message) {
  return Object.assign(baseArt(job), {
    status: ART_STATES.FAILED,
    assetPath: null, assetUrl: null, assetId: null,
    strayText: false,
    error: String(message || "generation failed"),
    generatedAt: new Date().toISOString()
  });
}

/* --------------------------------------------------------------------------
   RUNNING A PACKAGE (OR ONE SLIDE OF IT)

   Returns a patch for the package rather than writing one, so the Netlify
   function owns the single Firestore write and this stays testable.

   ONE SLIDE AT A TIME IS THE POINT. `only: ["slide:2"]` regenerates slide 3
   and touches nothing else — no other job is planned, so no other image is
   requested and no other image is paid for.
   ------------------------------------------------------------------------ */
async function generate(pkg, guide, io, opts) {
  const o = opts || {};
  const jobs = planFor(pkg, guide, o);
  const slides = (pkg.slides || []).map(s => Object.assign({}, s));
  const frames = (((pkg.story || {}).frames) || []).map(f => Object.assign({}, f));

  const results = [];
  let generated = 0, cached = 0, failed = 0;

  for (const job of jobs) {
    const target = job.isStory ? frames[job.index] : slides[job.index];
    if (!target) continue;

    if (job.cached && !o.force) {
      cached++;
      results.push({ id: job.id, status: "CACHED", key: job.key });
      continue;
    }

    try {
      const r = await runJob(job, io, { packageId: o.packageId || pkg.id });
      target.art = r.art;
      if (r.ok) { generated++; results.push({ id: job.id, status: "READY", key: job.key }); }
      else { failed++; results.push({ id: job.id, status: "REJECTED", key: job.key, error: r.reason }); }
    } catch (e) {
      failed++;
      target.art = failedArt(job, e.message);
      results.push({ id: job.id, status: "FAILED", key: job.key, error: e.message });
    }
  }

  const status = failed
    ? (generated ? ART_STATES.READY : ART_STATES.FAILED)
    : ART_STATES.READY;

  return {
    patch: {
      slides,
      story: Object.assign({}, pkg.story || {}, { frames }),
      artwork: {
        status,
        engine: "openai",
        imageModel: (jobs[0] && jobs[0].imageModel) || PROMPT.DEFAULT_IMAGE_MODEL,
        promptVersion: PROMPT.PROMPT_VERSION,
        manifestVersion: (jobs[0] && jobs[0].selection.manifestVersion) || null,
        updatedAt: new Date().toISOString(),
        error: failed ? `${failed} frame(s) could not be generated.` : null
      }
    },
    results,
    counts: { generated, cached, failed, planned: jobs.length }
  };
}

/* Bump the artwork seed on one frame, so "regenerate the artwork, keep the
   copy" produces a different key and therefore a genuinely new picture. */
function bumpSeed(frame) {
  const art = frame.art || {};
  return Object.assign({}, frame, {
    art: Object.assign({}, art, { artSeed: (art.artSeed || 0) + 1 })
  });
}

module.exports = {
  ART_STATES, TEXT_CHECK_PROMPT,
  artKey, storagePath, pathsAreDistinct, planFor, isCached, interpretTextCheck,
  runJob, generate, bumpSeed, formatFor,
  readyArt, strayArt, failedArt
};
