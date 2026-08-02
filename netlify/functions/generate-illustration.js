/* Netlify Function: generate-illustration
   ---------------------------------------------------------------------------
   Calls OpenAI (gpt-image-1) to draw a guide's hero illustration, using your
   reference images so the style/characters stay locked.

   Secrets: set OPENAI_API_KEY in Netlify → Site settings → Environment variables.
   Never put the key in the repo.

   Request  (POST JSON): { prompt: string, refs: string[] (absolute image URLs), size?: string }
   Response (JSON):      { b64: string }  or  { error: string }
   ------------------------------------------------------------------------- */

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const key = process.env.OPENAI_API_KEY;
  if (!key) return json({ error: "OPENAI_API_KEY is not set in Netlify environment variables." }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  const { prompt, refs = [], size = "1536x1024", quality = "medium" } = body || {};
  if (!prompt) return json({ error: "Missing prompt." }, 400);

  try {
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", quality);
    form.append("n", "1");

    // Pull each reference image and attach it. gpt-image-1 edits accepts multiple.
    let attached = 0;
    for (const url of refs) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const buf = await r.arrayBuffer();
        const type = r.headers.get("content-type") || "image/png";
        const name = (url.split("/").pop() || "ref.png").split("?")[0];
        form.append("image[]", new Blob([buf], { type }), name);
        attached++;
      } catch { /* skip a bad ref, keep going */ }
    }
    if (!attached) return json({ error: "Could not load any reference images. Check the URLs in your refs manifest." }, 400);

    const resp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form
    });
    const data = await resp.json();
    if (!resp.ok) return json({ error: data?.error?.message || "OpenAI request failed.", detail: data }, resp.status);

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No image returned by OpenAI." }, 502);
    return json({ b64 });
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
