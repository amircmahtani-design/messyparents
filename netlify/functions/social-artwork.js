/* ============================================================================
   SOCIAL — GENERATE THE ARTWORK BASES

   POST { id, only?: ["slide:2"], force?: bool, regenerateArtwork?: bool }

   This is the ONLY place in the social system that can reach api.openai.com,
   and the only place that reads OPENAI_API_KEY. Everything above it —
   scripts/lib/social/artwork.js, artprompt.js, refs.js — is pure and
   testable, and receives its side effects through the `io` object built
   below. That is not tidiness for its own sake: it is what makes
   "the key stays server-side" and "a cache hit makes no API call" properties
   a test can assert rather than claims in a README.

   WHAT IT DOES

     1. reads the package and its guide
     2. plans the jobs (refs.js chooses the poster, characters and scene)
     3. INLINES every selected reference as a data: URL and attaches it to the
        request — the References tab is not documentation, these bytes are the
        request
     4. asks for an illustrated base with no lettering (artprompt.js)
     5. asks the model whether the base contains lettering, and REJECTS it if
        it does, before anything is stored
     6. stores the accepted base in Firebase Storage under social/<package>/
     7. writes one Firestore patch with the artwork provenance on every frame

   WHAT IT NEVER DOES

     • return the key, log the key, or put the key in a document
     • write a word onto an image
     • touch a package's copy, status or approval — except to CLEAR an
       approval, because new artwork is content the approver has not seen

   REFERENCES ARE FETCHED BY US, NOT BY OPENAI. Handing the API a list of
   https:// URLs makes it download five PNGs before it can start, and the
   existing illustration pipeline learned the hard way that this exceeds
   OpenAI's own download timeout once the brand board is in the set. We fetch
   them, cache them in module scope for the life of the warm instance, and
   send base64.
   ========================================================================== */

const { guard, json, col, readPackage, stamp, app } = require("../../scripts/lib/social/server");
const { loadGuides } = require("../../scripts/lib/social/guides");
const REFS = require("../../scripts/lib/social/refs");
const ART = require("../../scripts/lib/social/artwork");
const PROMPT = require("../../scripts/lib/social/artprompt");
const CFG = require("../../scripts/lib/social/config");
const V = require("../../scripts/lib/social/validate");
const OPENAI = require("../../scripts/lib/social/openai");
const Safety = require("../../scripts/lib/social/safety");

const KEY = () => process.env.OPENAI_API_KEY;
const IMAGE_MODEL = () => process.env.OPENAI_IMAGE_MODEL || PROMPT.DEFAULT_IMAGE_MODEL;
const ORCH_MODEL = () => process.env.OPENAI_MODEL || "gpt-4o";
const SITE_ORIGIN = () => (process.env.URL || process.env.DEPLOY_PRIME_URL ||
  "https://themessyparentscollection.com").replace(/\/$/, "");

/* ---- the transport -------------------------------------------------------
   scripts/lib/social/openai.js builds the io: reference inlining, generation
   and the stray-lettering check. It lives there rather than here so that the
   offline proof runner (scripts/social-proof.js) uses literally the same code
   and cannot quietly diverge from what this function does. The only thing this
   file supplies is `store`, because only this file can reach Firebase.        */
function buildIo() {
  return OPENAI.buildIo({
    apiKey: KEY(),
    imageModel: IMAGE_MODEL(),
    model: ORCH_MODEL(),
    quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
    origin: SITE_ORIGIN(),
    async store({ b64, path, contentType }) {
      const bucket = app().storage().bucket();
      const buffer = Buffer.from(b64, "base64");
      const token = require("crypto").randomUUID();
      await bucket.file(path).save(buffer, {
        contentType: contentType || "image/png",
        metadata: {
          cacheControl: "public,max-age=31536000,immutable",
          metadata: { firebaseStorageDownloadTokens: token }
        }
      });
      const url = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name +
        "/o/" + encodeURIComponent(path) + "?alt=media&token=" + token;
      return { path, url, bytes: buffer.length };
    }
  });
}

exports.handler = guard("POST", async ({ db, body, user }) => {
  if (!body.id) return json(400, { error: "id is required" });
  if (!KEY()) {
    return json(503, {
      error: "OPENAI_API_KEY is not configured for this site, so no artwork can be generated.",
      code: "NO_IMAGE_ENGINE",
      hint: "Set OPENAI_API_KEY in Netlify → Site settings → Environment variables. " +
        "Slides fall back to the composed approved-artwork layout until then."
    });
  }

  const pkg = await readPackage(db, body.id);
  const loaded = await loadGuides(db);
  const guide = (loaded.guides || []).find(g => g.slug === pkg.guideSlug) || null;
  if (!guide) return json(409, { error: "The guide this package came from is no longer available." });

  /* "Regenerate the artwork, keep the copy": bump the seed on the targeted
     frames so their cache key changes and a genuinely new picture is made. */
  let working = pkg;
  if (body.regenerateArtwork) {
    const only = body.only ? [].concat(body.only) : null;
    const touch = (list, kind) => (list || []).map((f, i) =>
      (!only || only.indexOf(kind + ":" + i) >= 0) ? ART.bumpSeed(f) : f);
    working = Object.assign({}, pkg, {
      slides: touch(pkg.slides, "slide"),
      story: Object.assign({}, pkg.story || {}, { frames: touch((pkg.story || {}).frames, "story") })
    });
  }

  /* Mark it generating, so the dashboard has something honest to show while
     this runs. */
  await col(db).doc(pkg.id).set(stamp({
    artwork: Object.assign({}, pkg.artwork || {}, {
      status: ART.ART_STATES.GENERATING, error: null, engine: "openai",
      updatedAt: new Date().toISOString()
    })
  }, user), { merge: true });

  let outcome;
  try {
    outcome = await ART.generate(working, guide, buildIo(), {
      packageId: pkg.id,
      imageModel: IMAGE_MODEL(),
      only: body.only || null,
      force: !!body.force
    });
  } catch (e) {
    await col(db).doc(pkg.id).set(stamp({
      artwork: { status: ART.ART_STATES.FAILED, engine: "openai", error: String(e.message || e),
        updatedAt: new Date().toISOString() }
    }, user), { merge: true });
    return json(502, { error: String(e.message || e), code: e.code || "GENERATION_FAILED", retryable: true });
  }

  /* New artwork is content nobody has approved. The approval hash covers the
     rendered asset ids, so it would fail on the next check anyway — clearing
     it here is what keeps the dashboard and the truth in step. */
  const patch = Object.assign({}, outcome.patch);
  const wasApproved = pkg.status === CFG.STATES.APPROVED_HELD;
  const changedSomething = outcome.counts.generated > 0 || outcome.counts.failed > 0;
  if (wasApproved && changedSomething) {
    patch.status = CFG.STATES.NEEDS_REVIEW;
    patch.approvedHash = null; patch.approvedAt = null; patch.approvedBy = null;
  }

  const after = Object.assign({}, pkg, patch);
  patch.validation = V.validatePackage(after).concat(Safety.lintPackage(after, guide));

  await col(db).doc(pkg.id).set(stamp(patch, user), { merge: true });

  return json(200, {
    id: pkg.id,
    artwork: patch.artwork,
    results: outcome.results,
    counts: outcome.counts,
    approvalCleared: Boolean(wasApproved && changedSomething),
    validation: patch.validation,
    note: outcome.counts.cached
      ? `${outcome.counts.cached} frame(s) already had matching artwork and were not regenerated.`
      : undefined
  });
});
