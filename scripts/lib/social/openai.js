/* ============================================================================
   SOCIAL — THE OPENAI TRANSPORT

   The `io` object scripts/lib/social/artwork.js runs on: reference inlining,
   image generation, the stray-lettering check. Extracted out of
   netlify/functions/social-artwork.js so that exactly one implementation
   exists and the offline proof runner cannot quietly diverge from what the
   live dashboard does.

   WHAT IS INJECTED, AND WHY

   `store` is the only thing this file does not implement. In the Netlify
   function it writes to Firebase Storage through the Admin SDK; in
   scripts/social-proof.js it writes to disk. Everything above it — which
   references are attached, in what order, the prompt, the model, the lettering
   gate — is identical, so a proof rendered locally is a proof of the same
   pipeline.

   THE KEY IS READ HERE AND NOWHERE ELSE ABOVE IT. It is passed in, never
   imported from the environment by any module under scripts/lib/social/ that
   a test loads, never logged, never returned in a response and never written
   to Firestore or to a file.

   REFERENCES ARE FETCHED BY US, NOT BY OPENAI. Handing the API a list of
   https:// URLs makes it download five PNGs before it can start, and the
   existing illustration pipeline learned the hard way that this exceeds
   OpenAI's own download timeout once the brand board is in the set. We fetch
   them, cache them in module scope for the life of the process, and send
   base64.
   ========================================================================== */

const REFS = require("./refs");
const PROMPT = require("./artprompt");

const RESPONSES_URL = "https://api.openai.com/v1/responses";
const REF_TIMEOUT_MS = 8000;

/* gpt-image sizes are a fixed set; 1024×1536 is the portrait one, and both
   1080×1350 and 1080×1920 are portrait. The exact platform size is produced by
   the RENDERER, which draws the base into a 1080×1350 or 1080×1920 box with
   object-fit:cover — so the export is exact whatever the model returns. */
const MODEL_SIZE = "1024x1536";

function extractImage(resp) {
  const out = (resp && resp.output) || [];
  for (const item of out) {
    if (item.type === "image_generation_call" && item.result) return item.result;
  }
  return null;
}

function extractText(resp) {
  const out = (resp && resp.output) || [];
  let s = "";
  for (const item of out) {
    if (item.type === "message" && Array.isArray(item.content)) {
      for (const c of item.content) if (c.type === "output_text" && c.text) s += c.text;
    }
  }
  return s.trim();
}

/* Why there is no image. Reported rather than swallowed: "no image returned"
   covers a content filter, a refusal and the orchestrator answering in prose,
   and each needs a different response from the operator. */
function diagnose(resp) {
  const out = (resp && resp.output) || [];
  for (const item of out) {
    if (item.type === "image_generation_call") {
      const status = item.status || "unknown";
      if (status !== "completed") {
        return `the image tool ran but returned status "${status}"` +
          (item.error ? " — " + (item.error.message || JSON.stringify(item.error)) : "") +
          ". This is usually a content filter on the prompt or the reference images.";
      }
      return "the image tool reported success but sent no image data back.";
    }
  }
  for (const item of out) {
    if (item.type === "message" && Array.isArray(item.content)) {
      for (const c of item.content) if (c.type === "refusal" && c.refusal) {
        return "the model refused: " + c.refusal;
      }
    }
  }
  const text = extractText(resp);
  if (text) return `the model replied with text instead of drawing: "${text.slice(0, 240)}"`;
  if (resp && resp.incomplete_details && resp.incomplete_details.reason) {
    return `the response was cut short (${resp.incomplete_details.reason}).`;
  }
  return "the response contained no image and no explanation.";
}

function parseJSONLoose(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```json|```/g, "").trim();
  const a = cleaned.indexOf("{"), b = cleaned.lastIndexOf("}");
  if (a < 0 || b < 0) return null;
  try { return JSON.parse(cleaned.slice(a, b + 1)); } catch (e) { return null; }
}

/* --------------------------------------------------------------------------
   THE IO

   `opts.apiKey`       required. Never stored anywhere by this module.
   `opts.store`        required. { b64, path, contentType } → { path, url, bytes }
   `opts.origin`       where reference images are fetched from.
   `opts.readRef`      optional. A local reader, used by the offline proof
                       runner so it does not need the site to be deployed.
   `opts.imageModel`   defaults to gpt-image-1.
   `opts.model`        the orchestrator, defaults to gpt-4o.
   `opts.onCall`       optional. Called with a label for every HTTP request,
                       so a caller can count exactly how many were made.
   ------------------------------------------------------------------------ */
function buildIo(opts) {
  const o = opts || {};
  if (!o.apiKey) throw new Error("buildIo: an apiKey is required.");
  if (typeof o.store !== "function") throw new Error("buildIo: a store function is required.");

  const imageModel = o.imageModel || PROMPT.DEFAULT_IMAGE_MODEL;
  const model = o.model || "gpt-4o";
  const quality = o.quality || "medium";
  const cache = new Map();
  const note = (label) => { if (typeof o.onCall === "function") o.onCall(label); };

  async function callResponses(payload, label) {
    note(label);
    const r = await fetch(RESPONSES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${o.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j && j.error && j.error.message) || ("Responses API error: HTTP " + r.status));
    return j;
  }

  async function inlineOne(entry) {
    const key = entry.id;
    if (cache.has(key)) return cache.get(key);

    let uri;
    if (typeof o.readRef === "function") {
      uri = await o.readRef(entry);
    } else {
      const url = REFS.absoluteUrl(entry, o.origin || "");
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), REF_TIMEOUT_MS);
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const buf = Buffer.from(await r.arrayBuffer());
        const type = (r.headers.get("content-type") || "image/png").split(";")[0];
        uri = `data:${type};base64,${buf.toString("base64")}`;
      } finally { clearTimeout(timer); }
    }
    cache.set(key, uri);
    return uri;
  }

  return {
    imageModel,

    async referenceUrls(selection) {
      const out = [];
      for (const entry of selection.attach) {
        try { out.push(await inlineOne(entry)); }
        catch (e) { console.error("social artwork: could not read reference", entry.id, String(e)); }
      }
      return out;
    },

    async generate({ prompt, references, model: m }) {
      const resp = await callResponses({
        model,
        tools: [{
          type: "image_generation",
          model: m || imageModel,
          output_format: "png",
          size: MODEL_SIZE,
          quality
        }],
        input: [{
          role: "user",
          content: [{ type: "input_text", text: prompt }]
            .concat(references.map(u => ({ type: "input_image", image_url: u })))
        }]
      }, "generate");

      const b64 = extractImage(resp);
      if (!b64) throw new Error("No image returned — " + diagnose(resp));
      return { b64 };
    },

    async checkText({ b64, prompt }) {
      const resp = await callResponses({
        model,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: "data:image/png;base64," + b64 }
          ]
        }]
      }, "checkText");
      return parseJSONLoose(extractText(resp));
    },

    store: (args) => o.store(args)
  };
}

module.exports = { buildIo, extractImage, extractText, diagnose, parseJSONLoose, MODEL_SIZE };
