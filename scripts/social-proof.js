#!/usr/bin/env node
/* ============================================================================
   SOCIAL — GENERATE ONE PACKAGE'S ARTWORK FOR REAL, AND REPORT WHAT HAPPENED

   Usage:
     OPENAI_API_KEY=… node scripts/social-proof.js drinking-less-milk
     OPENAI_API_KEY=… node scripts/social-proof.js drinking-less-milk --only slide:2
     node scripts/social-proof.js drinking-less-milk --report      (no calls)

   WHY THIS EXISTS

   `npm run social:proof` renders a package with the deterministic composed
   fallback. That is genuinely useful — it proves the layout, the wording and
   the export sizes without a network — but it is NOT a proof of the artwork
   system, and presenting it as one is how a fallback render got mistaken for
   generated output.

   This script runs the REAL pipeline: the same scripts/lib/social/artwork.js
   generate(), driven by the same scripts/lib/social/openai.js transport the
   Netlify function uses, with the same prompt, the same attached references,
   the same stray-lettering gate and the same provenance.

   TWO THINGS DIFFER FROM THE LIVE FUNCTION, AND BOTH ARE STATED IN THE REPORT:

     • storage — assets are written to social-preview/<slug>/art/ instead of
       Firebase Storage, because there is no service account here;
     • auth — there is no Firebase ID token to verify, because there is no
       browser and no Firestore document.

   Everything that decides what the picture looks like is identical.

   THE KEY is read from the environment at the top of this file and passed
   down. It is never written to a file, never printed, and never included in
   the report.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const D = require("./lib/data");
const Sel = require("./lib/social/select");
const C = require("./lib/social/compose");
const T = require("./lib/social/templates");
const V = require("./lib/social/validate");
const Safety = require("./lib/social/safety");
const REFS = require("./lib/social/refs");
const ART = require("./lib/social/artwork");
const PROMPT = require("./lib/social/artprompt");
const OPENAI = require("./lib/social/openai");
const { FORMATS } = require("./lib/social/config");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const slug = argv.find(a => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--only"
  && argv[argv.indexOf(a) - 1] !== "--out") || "drinking-less-milk";

const OUT = path.resolve(ROOT, opt("--out", "social-preview"));
const REPORT_ONLY = flag("--report");

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

function dataUri(sitePath) {
  const full = path.join(ROOT, String(sitePath).replace(/^\//, ""));
  if (!fs.existsSync(full)) return null;
  const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
  return `data:${mime};base64,${fs.readFileSync(full).toString("base64")}`;
}

async function main() {
  const key = process.env.OPENAI_API_KEY;
  if (!key && !REPORT_ONLY) {
    console.error("OPENAI_API_KEY is not set. Run with --report to print the artwork state " +
      "without generating anything.");
    process.exit(2);
  }

  const loaded = await D.load();
  const guide = Sel.eligibleGuides(loaded).find(g => g.slug === slug);
  if (!guide) { console.error(`No eligible guide "${slug}".`); process.exit(1); }

  const manifest = REFS.loadManifest();
  const pkg = C.composePackage(guide, { topics: loaded.topics });
  pkg.id = "proof-" + slug;

  const dir = path.join(OUT, slug);
  const artDir = path.join(dir, "art");
  fs.mkdirSync(artDir, { recursive: true });

  /* ---- the transport, identical to the live function's except for store ---- */
  let calls = { generate: 0, checkText: 0 };
  const io = REPORT_ONLY ? null : OPENAI.buildIo({
    apiKey: key,
    imageModel: process.env.OPENAI_IMAGE_MODEL || PROMPT.DEFAULT_IMAGE_MODEL,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
    onCall: (label) => { calls[label] = (calls[label] || 0) + 1; },
    /* Read the references straight off disk. The live function fetches them
       from the deployed site; the bytes are the same bytes. */
    async readRef(entry) {
      const uri = dataUri(REFS.publicPath(entry));
      if (!uri) throw new Error("missing reference file for " + entry.id);
      return uri;
    },
    async store({ b64, path: p, contentType }) {
      const buffer = Buffer.from(b64, "base64");
      const local = path.join(artDir, path.basename(p));
      fs.writeFileSync(local, buffer);
      return { path: p, url: "art/" + path.basename(p), bytes: buffer.length, local };
    }
  });

  let outcome = null;
  if (!REPORT_ONLY) {
    console.log(`Generating artwork for ${slug} — ${pkg.slides.length} slides, ` +
      `${pkg.story.frames.length} story frames.\n`);
    outcome = await ART.generate(pkg, guide, io, {
      packageId: pkg.id,
      manifest,
      imageModel: io.imageModel,
      only: argv.includes("--only") ? [opt("--only")] : null,
      force: flag("--force")
    });
    Object.assign(pkg, outcome.patch);
    outcome.results.forEach(r => console.log(`  ${r.status.padEnd(9)} ${r.id}` +
      (r.error ? "  — " + r.error : "")));
    console.log("");
  }

  /* ---- render every frame at full size ---------------------------------- */
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch (e) { ({ chromium } = require("@playwright/test")); }

  const FONT_DIR = path.join(ROOT, "assets/fonts");
  const tokensCss = fs.readFileSync(path.join(ROOT, "assets/css/tokens.css"), "utf8")
    .replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (whole, file) => {
      const full = path.join(FONT_DIR, file);
      return fs.existsSync(full)
        ? `url("data:font/woff2;base64,${fs.readFileSync(full).toString("base64")}")` : whole;
    });

  const images = {};
  [T.BRAND.logo, T.BRAND.paper].concat(Object.keys(T.CHARACTERS).map(k => T.CHARACTERS[k].src))
    .forEach(p => { const u = dataUri(p); if (u) images[p] = u; });
  /* The generated bases, inlined the same way — setContent() has no origin to
     resolve a relative path against. */
  const inlineArt = (frame) => {
    const a = frame.art;
    if (!a || !a.assetUrl || a.strayText) return;
    const local = path.join(artDir, path.basename(a.assetPath || a.assetUrl));
    if (!fs.existsSync(local)) return;
    images[a.assetUrl] = "data:image/png;base64," + fs.readFileSync(local).toString("base64");
  };
  pkg.slides.forEach(inlineArt);
  (pkg.story.frames || []).forEach(inlineArt);

  const assets = { images };
  const paperUri = images[T.BRAND.paper];
  const browser = await chromium.launch();

  async function shoot(html, format, outBase) {
    const page = await browser.newPage({
      viewport: { width: format.width, height: format.height }, deviceScaleFactor: 1
    });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(180);
    await page.screenshot({ path: outBase + ".jpg", type: "jpeg", quality: 93 });
    const dim = await page.evaluate(() => {
      const el = document.querySelector(".mpc-slide");
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), base: !!el.querySelector(".b-base") };
    });
    await page.close();
    return dim;
  }

  const rows = [];
  for (let i = 0; i < pkg.slides.length; i++) {
    const s = pkg.slides[i];
    const html = T.documentHTML(T.slideHTML(s, { assets, index: i, total: pkg.slides.length }),
      { tokensCss, paperUri, title: `${slug} ${i + 1}` });
    const dim = await shoot(html, FORMATS.carousel,
      path.join(dir, `slide-${String(i + 1).padStart(2, "0")}-${s.family}`));
    rows.push(row("slide:" + i, s, dim, guide, manifest));
  }
  for (let i = 0; i < pkg.story.frames.length; i++) {
    const f = pkg.story.frames[i];
    const html = T.documentHTML(T.storyHTML(f, { assets }),
      { tokensCss, paperUri, title: `${slug} story ${i + 1}` });
    const dim = await shoot(html, FORMATS.story,
      path.join(dir, `story-${String(i + 1).padStart(2, "0")}-${f.kind}`));
    rows.push(row("story:" + i, f, dim, guide, manifest));
  }
  await browser.close();

  /* ---- the report -------------------------------------------------------- */
  const findings = V.validatePackage(pkg).concat(Safety.lintPackage(pkg, guide));
  const report = {
    guide: slug,
    packageId: pkg.id,
    generatedAt: new Date().toISOString(),
    engine: REPORT_ONLY ? "none (report only)" : "openai",
    imageModel: (pkg.artwork && pkg.artwork.imageModel) || null,
    promptVersion: PROMPT.PROMPT_VERSION,
    manifestVersion: manifest.version,
    openaiRequests: REPORT_ONLY ? { generate: 0, checkText: 0 } : calls,
    counts: outcome ? outcome.counts : null,
    artworkState: pkg.artwork,
    frames: rows,
    distinctArtKeys: new Set(rows.map(r => r.artKey).filter(Boolean)).size,
    distinctAssetPaths: new Set(rows.map(r => r.assetPath).filter(Boolean)).size,
    distinctConcepts: new Set(rows.map(r => r.conceptAction)).size,
    allFramesUsedAssetUrl: rows.every(r => r.renderedUsing === "art.assetUrl"),
    errors: findings.filter(f => f.level === "error"),
    warnings: findings.filter(f => f.level === "warn").length,
    storage: REPORT_ONLY ? null :
      "local disk (social-preview/<slug>/art/) — the live function writes the same bytes " +
      "to Firebase Storage under social/<packageId>/",
    auth: "no Firebase ID token in this runner; the live endpoint verifies one before it " +
      "reaches this pipeline"
  };

  fs.writeFileSync(path.join(dir, "artwork-report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(dir, "package.json"),
    JSON.stringify(Object.assign({}, pkg, { validation: findings }), null, 2));
  fs.writeFileSync(path.join(dir, "caption-instagram.txt"), pkg.platforms.instagram.caption);
  fs.writeFileSync(path.join(dir, "caption-facebook.txt"), pkg.platforms.facebook.caption);

  printReport(report);
  process.exit(report.errors.length ? 1 : 0);
}

function row(id, frame, dim, guide, manifest) {
  const a = frame.art || {};
  const c = frame.concept || {};
  let sel = null;
  try {
    sel = REFS.selectFor({ family: frame.family, guide, manifest, cast: c.cast || frame.cast });
  } catch (e) { /* reported as a missing poster elsewhere */ }
  return {
    id,
    family: frame.family,
    kind: frame.kind,
    conceptId: c.id || null,
    conceptAction: c.action || null,
    conceptCast: (c.cast || []).join("+"),
    conceptObjects: (c.objects || []).join(","),
    status: a.status || "(none)",
    engine: a.engine || null,
    assetUrl: a.assetUrl || null,
    assetPath: a.assetPath || null,
    artKey: a.key || null,
    artSeed: a.artSeed || 0,
    posterRef: sel && sel.poster.id,
    sceneRef: sel && sel.scene && sel.scene.id,
    characterRefs: sel && sel.characters.map(x => x.id).join("+"),
    openaiCalled: Boolean(a.assetUrl || a.strayText || a.error),
    renderedUsing: dim.base ? "art.assetUrl" : "fallback scene function",
    width: dim.w, height: dim.h
  };
}

function printReport(r) {
  const line = "-".repeat(118);
  console.log("\nARTWORK STATE\n" + line);
  console.log(
    "frame".padEnd(9) + "family".padEnd(16) + "concept".padEnd(26) +
    "cast".padEnd(14) + "status".padEnd(9) + "engine".padEnd(8) + "key".padEnd(14) + "rendered via");
  console.log(line);
  r.frames.forEach(f => console.log(
    f.id.padEnd(9) + String(f.family).padEnd(16) + String(f.conceptAction).padEnd(26) +
    String(f.conceptCast).padEnd(14) + String(f.status).padEnd(9) +
    String(f.engine || "—").padEnd(8) + String(f.artKey || "—").slice(0, 12).padEnd(14) +
    f.renderedUsing));
  console.log(line);
  console.log(`OpenAI requests: ${r.openaiRequests.generate} image, ${r.openaiRequests.checkText} lettering check`);
  console.log(`Distinct art keys: ${r.distinctArtKeys}/${r.frames.length}   ` +
    `distinct asset paths: ${r.distinctAssetPaths}/${r.frames.length}   ` +
    `distinct concepts: ${r.distinctConcepts}/${r.frames.length}`);
  console.log(`Every frame used art.assetUrl: ${r.allFramesUsedAssetUrl ? "YES" : "NO"}`);
  console.log(`Sizes: ${r.frames.map(f => f.width + "x" + f.height).join(", ")}`);
  console.log(`Content errors: ${r.errors.length}, warnings: ${r.warnings}`);
  if (r.errors.length) r.errors.forEach(e => console.log("  ✗ " + e.code + ": " + e.message));
}

main().catch(e => { console.error(e); process.exit(1); });
