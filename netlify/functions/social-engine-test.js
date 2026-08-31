/* ============================================================================
   SOCIAL — IS THE IMAGE ENGINE ACTUALLY WORKING?

   GET (authenticated)

   "Is the OpenAI key in here, and is it working?" is a question the dashboard
   should be able to answer by pressing a button. Before this existed the only
   ways to find out were to read the environment variables in Netlify, or to
   generate a whole package and see what came back — one of which does not
   prove the key WORKS and the other of which costs money to fail.

   Three questions, cheapest first, stopping at the first NO:

     1. is a key configured at all?           no request
     2. does it authenticate, and can this   one tiny text request
        account reach the orchestrator?      (about 16 output tokens)
     3. is the image model available to      one models listing
        this account?

   It never generates an image. The whole check is a fraction of a cent.

   IT NEVER RETURNS THE KEY. The response carries booleans, model names, a
   latency and, when something is wrong, an error message from OpenAI — which
   is the one thing that actually tells you what to fix. The commonest real
   failure is an account that authenticates perfectly but has not been verified
   for image generation, and that shows up here as `imageToolAvailable: false`
   with the available image models listed, instead of as a confusing refusal
   halfway through a package.
   ========================================================================== */

const { guard, json } = require("../../scripts/lib/social/server");
const OPENAI = require("../../scripts/lib/social/openai");
const PROMPT = require("../../scripts/lib/social/artprompt");
const REFS = require("../../scripts/lib/social/refs");

exports.handler = guard("GET", async () => {
  const key = process.env.OPENAI_API_KEY;

  const result = await OPENAI.testConnection({
    apiKey: key,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    imageModel: process.env.OPENAI_IMAGE_MODEL || PROMPT.DEFAULT_IMAGE_MODEL
  });

  /* The other half of "is it working": the references it would send. A key
     that authenticates is useless if the poster files are not deployed, and
     that failure otherwise only appears when somebody presses Generate. */
  let references = { ok: false, error: null, manifestVersion: null, missing: [] };
  try {
    const manifest = REFS.loadManifest({ fresh: true });
    const missing = REFS.missingFiles(manifest);
    references = {
      ok: missing.length === 0,
      manifestVersion: manifest.version,
      count: manifest.library.length,
      missing,
      error: missing.length ? `${missing.length} reference file(s) are not deployed.` : null
    };
  } catch (e) {
    references = { ok: false, error: e.message, manifestVersion: null, missing: [] };
  }

  const ready = Boolean(result.authOk && result.imageToolAvailable !== false && references.ok);

  return json(200, {
    ready,
    engine: result,
    references,
    promptVersion: PROMPT.PROMPT_VERSION,
    summary: ready
      ? `Connected. ${result.orchestratorModel} responded in ${result.latencyMs}ms and ` +
        `${result.imageModel} is available to this account. ` +
        `${references.count} references deployed (manifest ${references.manifestVersion}).`
      : (result.error || references.error || "Not ready."),
    /* What to do about it, in the order a person would try. */
    next: ready ? null : (
      !result.keyPresent
        ? "Set OPENAI_API_KEY in Netlify → Site settings → Environment variables, then redeploy."
        : !result.reachable
          ? "The function could not reach api.openai.com. Check Netlify's outbound network access."
          : !result.authOk
            ? "The key was rejected. Check it has not been revoked or rotated."
            : result.imageToolAvailable === false
              ? "The key works but this account cannot use the image model. Verify the organisation " +
                "in the OpenAI dashboard, or set OPENAI_IMAGE_MODEL to one of engine.availableImageModels."
              : "Deploy the missing reference files listed under references.missing.")
  });
});
