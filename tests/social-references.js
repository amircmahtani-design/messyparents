#!/usr/bin/env node
/* ============================================================================
   THE REFERENCE LIBRARY

   Run with: node tests/social-references.js   (part of npm run verify:social)

   The whole visual system rests on one claim: the seven approved posters and
   the three character sheets are not documentation, they are the input to
   every image request. This file is what makes that claim checkable.

     • the manifest loads, and every entry in it has a file behind it;
     • each slide family selects ITS poster, by role, not by position;
     • the character sheets are attached, as images, in the request;
     • a missing poster fails loudly and by name — no generic substitute;
     • the logo is only ever allowed on the two families that may carry it;
     • the OpenAI key is not reachable from anywhere except the one function
       that is allowed to read it.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "..");
const REFS = require("../scripts/lib/social/refs");
const PROMPT = require("../scripts/lib/social/artprompt");

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));

/* ---------------------------------------------------------------------- */
section("The manifest loads and is complete");

let manifest = null;
try { manifest = REFS.loadManifest({ fresh: true }); }
catch (e) { /* reported by the next check */ }

check("assets/img/refs/manifest.json parses", Boolean(manifest),
  "loadManifest threw");
check("It declares a version", Boolean(manifest && /\S/.test(manifest.version)),
  manifest && manifest.version);
check("It has a library of reference objects",
  Boolean(manifest && manifest.library.length >= 15),
  manifest ? `${manifest.library.length} entries` : "none");

const missing = manifest ? REFS.missingFiles(manifest) : [{ id: "manifest" }];
check("Every reference in the manifest has a file behind it",
  missing.length === 0,
  missing.map(m => `${m.id} → ${m.expected}`).join(", "));

/* The flat keys the guide illustration generator reads are untouched. Social
   is a second consumer of this file, not a replacement for the first. */
const raw = manifest && manifest.raw;
check("The guide illustration generator's keys still exist",
  Boolean(raw && raw.characters && raw.characters.mama && raw.brand && Array.isArray(raw.approvedScenes)));

/* ---------------------------------------------------------------------- */
section("Every slide family selects its own poster");

const FAMILIES = REFS.FAMILIES;
check("There are seven slide families", FAMILIES.length === 7, FAMILIES.join(","));

const guide = {
  slug: "drinking-less-milk", topic: "feeding",
  title: "Why is my baby drinking less milk?",
  summary: "A dip in bottles is usually distraction, teething or a cold.",
  keywords: ["milk", "bottle"]
};

const selections = {};
FAMILIES.forEach(family => {
  let sel = null;
  try { sel = REFS.selectFor({ family, guide, manifest }); } catch (e) { /* below */ }
  selections[family] = sel;
  check(`${family} selects a poster`, Boolean(sel && sel.poster));
  check(`…and it is the ${family} poster`,
    Boolean(sel && sel.poster.role === family), sel && sel.poster.id);
});

/* Two families must not share a poster: that is the failure mode where every
   slide comes out looking like the cover. */
const posterIds = FAMILIES.map(f => selections[f] && selections[f].poster.id);
check("No two families share a poster reference",
  new Set(posterIds).size === posterIds.length, posterIds.join(","));

/* ---------------------------------------------------------------------- */
section("Character sheets are attached, not described");

FAMILIES.forEach(family => {
  const sel = selections[family];
  if (!sel) return;
  check(`${family} attaches at least two character sheets`,
    sel.characters.length >= 2, `${sel.characters.length}`);
  check(`…every one of them is a real cutout file`,
    sel.characters.every(c => fs.existsSync(REFS.diskPath(c))));
  check(`…and Ari is one of them`, sel.cast.indexOf("ari") >= 0, sel.cast.join(","));
});

const cover = selections["cover-hook"];
check("The brand board is attached to every request", Boolean(cover && cover.brand));
check("A semantically relevant approved scene is chosen",
  Boolean(cover && cover.scene), cover && cover.scene && cover.scene.id);
check("…and for a feeding guide it is the feeding scene",
  Boolean(cover && cover.scene && cover.scene.id === "scene-milk-refusal"),
  cover && cover.scene && cover.scene.id);

/* A health guide picks a different one. If the choice were random or fixed,
   this is the check that would fail. */
const healthSel = REFS.selectFor({
  family: "warning", manifest,
  guide: { slug: "first-fever", topic: "health", title: "Your baby's first fever", summary: "A fever in a newborn." }
});
check("A health guide's warning slide picks the medical scene instead",
  healthSel.scene && healthSel.scene.id === "scene-not-doctors",
  healthSel.scene && healthSel.scene.id);

check("Selection is deterministic",
  JSON.stringify(REFS.selectFor({ family: "cover-hook", guide, manifest }).ids) ===
  JSON.stringify(cover.ids));

/* ---------------------------------------------------------------------- */
section("The attached set is what the prompt describes");

const format = { width: 1080, height: 1350, ratio: "4:5" };
const prompt = PROMPT.buildPrompt({
  family: "quick-check", guide, selection: selections["quick-check"], format,
  slide: { artNote: "a parent holding a bottle" }
});

check("The prompt names the poster reference it was given",
  prompt.includes(selections["quick-check"].poster.name));
check("The prompt names each attached character sheet",
  selections["quick-check"].characters.every(c => prompt.includes(c.name)));
check("The prompt forbids readable text", /NO readable text/i.test(prompt));
check("The prompt forbids a logo", /NO logo/i.test(prompt));
check("The prompt forbids photorealism and stock", /photorealism/i.test(prompt) && /stock/i.test(prompt));
check("The prompt forbids replacement characters", /replacement characters/i.test(prompt));
check("The prompt states the exact output size",
  prompt.includes("1080×1350") || prompt.includes("1080x1350"));
check("The prompt reserves a text-safe area", /TEXT-SAFE AREA/.test(prompt));
check("The prompt carries the required system wording",
  prompt.indexOf(PROMPT.SYSTEM_PROMPT) === 0);
check("The prompt says the wording is added programmatically",
  /added programmatically/i.test(prompt));

const prov = PROMPT.provenance({
  family: "quick-check", selection: selections["quick-check"],
  imageModel: "gpt-image-1", format
});
check("Provenance records the prompt version", prov.promptVersion === PROMPT.PROMPT_VERSION);
check("Provenance records the manifest version", prov.manifestVersion === manifest.version);
check("Provenance records every selected reference id",
  prov.referenceIds.length === selections["quick-check"].ids.length);
check("Provenance records the image model", prov.imageModel === "gpt-image-1");

/* ---------------------------------------------------------------------- */
section("A missing reference fails loudly");

/* A manifest with the warning poster removed. The generator must refuse that
   family by name rather than reaching for another poster. */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mpc-refs-"));
const brokenPath = path.join(tmp, "manifest.json");
const broken = JSON.parse(JSON.stringify(manifest.raw));
broken.library = broken.library.filter(e => e.id !== "poster-warning");
broken.version = "test-broken-v1";
fs.writeFileSync(brokenPath, JSON.stringify(broken));

const brokenManifest = REFS.loadManifest({ file: brokenPath, fresh: true });
let threw = null;
try { REFS.selectFor({ family: "warning", guide, manifest: brokenManifest }); }
catch (e) { threw = e; }
check("A family with no poster throws", Boolean(threw), threw && threw.message);
check("…with a MISSING_REFERENCE code", threw && threw.code === "MISSING_REFERENCE");
check("…naming the family", threw && /warning/.test(threw.message));
check("…and does NOT fall back to another poster",
  threw && !/cover-hook|save-cta/.test(String(threw.selectedInstead || "")));

/* An inactive reference is not a usable one either. */
const inactivePath = path.join(tmp, "inactive.json");
const inactive = JSON.parse(JSON.stringify(manifest.raw));
inactive.library.forEach(e => { if (e.id === "poster-dont") e.active = false; });
inactive.version = "test-inactive-v1";
fs.writeFileSync(inactivePath, JSON.stringify(inactive));
let threw2 = null;
try {
  REFS.selectFor({ family: "dont", guide, manifest: REFS.loadManifest({ file: inactivePath, fresh: true }) });
} catch (e) { threw2 = e; }
check("An inactive poster counts as missing", threw2 && threw2.code === "MISSING_REFERENCE");

let threw3 = null;
try { REFS.loadManifest({ file: path.join(tmp, "nope.json"), fresh: true }); }
catch (e) { threw3 = e; }
check("An absent manifest throws MISSING_MANIFEST", threw3 && threw3.code === "MISSING_MANIFEST");

let threw4 = null;
try { REFS.selectFor({ family: "not-a-family", guide, manifest }); }
catch (e) { threw4 = e; }
check("An unknown family is refused", threw4 && threw4.code === "UNKNOWN_FAMILY");

fs.rmSync(tmp, { recursive: true, force: true });

/* ---------------------------------------------------------------------- */
section("Logo restraint is a property of the manifest, not a habit");

check("Only two families may carry the logo",
  REFS.LOGO_FAMILIES.length === 2, REFS.LOGO_FAMILIES.join(","));
check("…the cover and the closing slide",
  REFS.LOGO_FAMILIES.indexOf("cover-hook") >= 0 && REFS.LOGO_FAMILIES.indexOf("save-cta") >= 0);
FAMILIES.forEach(f => {
  const sel = selections[f];
  if (!sel) return;
  const allowed = REFS.LOGO_FAMILIES.indexOf(f) >= 0;
  check(`${f} ${allowed ? "may" : "may not"} use the logo`, Boolean(sel.logo) === allowed);
});

/* ---------------------------------------------------------------------- */
section("The OpenAI key stays server-side");

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}
function walk(dir, out) {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, out);
    if (/\.(js|mjs|html|css|json)$/.test(e.name)) {
      out.push({ rel: path.relative(ROOT, full), text: stripComments(fs.readFileSync(full, "utf8")) });
    }
  });
  return out;
}

/* THE SCRIPTS A BROWSER ACTUALLY LOADS.

   Walking assets/js wholesale is the wrong test: the repository contains a
   copy of the illustration BACKGROUND FUNCTION at assets/js/, left there by an
   earlier move, and it mentions the variable name in a `process.env` read that
   no browser can satisfy. It is dead weight in a public folder, not a leak,
   and flagging it would train somebody to ignore this check.

   What matters is whether a script any PAGE loads can see the key. So the
   <script src> attributes are gathered from every HTML file and only those
   files are read. */
const htmlFiles = fs.readdirSync(ROOT).filter(f => /\.html$/.test(f))
  .map(f => path.join(ROOT, f))
  .concat(["social/index.html", "studio/index.html", "editor/index.html"]
    .map(f => path.join(ROOT, f)).filter(fs.existsSync));

const loaded = new Set();
htmlFiles.forEach(h => {
  const src = fs.readFileSync(h, "utf8");
  const re = /<script[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(src))) {
    const u = m[1].split("?")[0];
    if (/^https?:/.test(u)) continue;
    const rel = u.replace(/^\//, "");
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) loaded.add(path.relative(ROOT, full));
  }
});
loaded.add("social/app.js");   /* loaded as a module, and the surface this task built */

/* What matters is whether a browser script can READ the key or carries its
   VALUE — not whether it mentions the variable by name. The dashboard's
   connection test prints "OPENAI_API_KEY is set" as a label, which is exactly
   the sort of thing an operator needs to see and is not a leak. So the check
   is for an actual environment read or something shaped like a key. */
const KEY_READ = /process\s*\.\s*env\s*(\.\s*OPENAI_API_KEY|\[\s*["']OPENAI_API_KEY["']\s*\])/;
const KEY_VALUE = /\bsk-[A-Za-z0-9_-]{20}/;

const clientLeaks = Array.from(loaded).filter(rel => {
  const text = stripComments(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  return KEY_READ.test(text) || KEY_VALUE.test(text);
});
check(`No script the browser loads can read the OpenAI key (${loaded.size} checked)`,
  clientLeaks.length === 0, clientLeaks.join(", "));

/* And no key value is committed anywhere in the repository. */
const everywhere = walk(path.join(ROOT, "social"), [])
  .concat(walk(path.join(ROOT, "scripts"), []))
  .concat(walk(path.join(ROOT, "netlify"), []))
  .concat(walk(path.join(ROOT, "tests"), []));
const hardcoded = everywhere.filter(f => KEY_VALUE.test(f.text));
check("No key value is committed anywhere in the source",
  hardcoded.length === 0, hardcoded.map(f => f.rel).join(", "));

/* The shared social library is bundled into functions, but it is also the
   thing tests import — it must not read the environment for a secret. */
const libFiles = walk(path.join(ROOT, "scripts", "lib", "social"), []);
const libLeaks = libFiles.filter(f => KEY_READ.test(f.text));
check("No module under scripts/lib/social reads the key from the environment",
  libLeaks.length === 0, libLeaks.map(f => f.rel).join(", "));

/* Exactly the functions that are supposed to. */
const fnFiles = walk(path.join(ROOT, "netlify", "functions"), []);
const readers = fnFiles.filter(f => KEY_READ.test(f.text)).map(f => path.basename(f.rel));
const ALLOWED = ["social-artwork.js", "social-references.js", "social-status.js",
  "social-engine-test.js",
  "generate-illustration.js", "generate-illustration-background.js"];
const unexpected = readers.filter(r => ALLOWED.indexOf(r) < 0);
check("Only the server functions that need it read the key",
  unexpected.length === 0, unexpected.join(", "));
check("social-artwork.js is one of them", readers.indexOf("social-artwork.js") >= 0);

/* Reporting presence is fine; returning the value is not. */
const artFn = stripComments(fs.readFileSync(path.join(ROOT, "netlify/functions/social-artwork.js"), "utf8"));
const artReads = (artFn.match(/process\.env\.OPENAI_API_KEY/g) || []).length;
check("social-artwork reads the key in exactly one place", artReads === 1, String(artReads));
const artUses = artFn.match(/KEY\(\)/g) || [];
check("…and uses it only to test for presence and to hand to the transport",
  artUses.length === 2 && /!KEY\(\)/.test(artFn) && /apiKey:\s*KEY\(\)/.test(artFn),
  artUses.join(" "));

/* The transport is shared with the offline proof runner, so it is worth
   asserting separately that it takes the key as an argument rather than
   reaching for the environment itself — otherwise "the key is read in one
   place" would be true of the function and false of the system. */
const oaFn = stripComments(fs.readFileSync(path.join(ROOT, "scripts/lib/social/openai.js"), "utf8"));
check("The shared transport never reads the environment",
  !/process\.env/.test(oaFn));

/* The connection test is the one endpoint whose whole job is to talk about the
   key, so it is worth asserting it talks ABOUT it rather than returning it. */
const testFn = stripComments(fs.readFileSync(path.join(ROOT, "netlify/functions/social-engine-test.js"), "utf8"));
check("The connection test reads the key once and passes it to the transport",
  (testFn.match(/process\.env\.OPENAI_API_KEY/g) || []).length === 1 &&
  /apiKey:\s*key/.test(testFn));
check("…and never returns it",
  !/json\([\s\S]*\bkey\b\s*[,}]/.test(testFn.replace(/apiKey:\s*key/g, "")));
check("…and generates no image",
  !/image_generation/.test(testFn));
check("…it receives the key as an argument and signs one header with it",
  /apiKey/.test(oaFn) && /Bearer \$\{o\.apiKey\}/.test(oaFn));
check("…and never logs it",
  !/console\.[a-z]+\([^)]*apiKey/.test(oaFn));

const refFn = stripComments(fs.readFileSync(path.join(ROOT, "netlify/functions/social-references.js"), "utf8"));
const refReads = (refFn.match(/process\.env\.OPENAI_API_KEY/g) || []).length;
const refBooleans = (refFn.match(/Boolean\(process\.env\.OPENAI_API_KEY\)/g) || []).length;
check("social-references only ever reports the key as a boolean",
  refReads > 0 && refReads === refBooleans, `${refBooleans} of ${refReads}`);

/* ---------------------------------------------------------------------- */
console.log("\n" + "=".repeat(60));
console.log(`${pass} passed, ${fail} failed`);
if (failures.length) { console.log("\nFailures:"); failures.forEach(f => console.log("  ✗ " + f)); }
console.log("=".repeat(60));
process.exit(fail ? 1 : 0);
