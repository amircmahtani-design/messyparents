/* ============================================================================
   SOCIAL — THE REFERENCE LIBRARY

   assets/img/refs/manifest.json is the SOURCE OF TRUTH for every picture the
   social artwork system is allowed to look at or send anywhere. This module is
   the only thing that reads it.

   That single-source rule is the whole point. The failure mode this replaces
   is a References tab that documents seven approved posters while the
   generator quietly uses a hardcoded array somewhere else — documentation that
   the machine ignores. Here, selection and display are the same call:

       selectFor({ family, guide })  →  { poster, characters, scene, brand, … }

   and the dashboard's References tab renders exactly the list that
   selection walks. If a reference is not in the manifest it does not exist.

   MISSING REFERENCES FAIL LOUDLY. A slide family with no poster reference
   throws MISSING_REFERENCE naming the exact file the manifest asked for. It
   never falls back to "some other poster" or to a generic design, because a
   silent substitution is precisely how the old cream cards came back.

   PATHS. Manifest files are relative to assets/img/refs/ unless the entry is
   marked `external: true`, in which case `file` is already site-absolute
   (paper.jpg and the logo live with the rest of the site's images, not in the
   reference folder, and duplicating them would create two truths).
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const REFS_DIR = path.join(ROOT, "assets", "img", "refs");
const MANIFEST_PATH = path.join(REFS_DIR, "manifest.json");

/* The seven slide families. This list is the contract between the planner,
   the poster references and the prompt builder — all three index by it. */
const FAMILIES = [
  "cover-hook", "quick-check", "what-helped-us",
  "warning", "dont", "save-cta", "story-reel"
];

/* Which families may carry the full logo. Everything else must not. */
const LOGO_FAMILIES = ["cover-hook", "save-cta"];

/* --------------------------------------------------------------------------
   LOADING

   Cached by mtime so a running dashboard picks up a manifest edit without a
   restart, and so a test can write a manifest and load it back.
   ------------------------------------------------------------------------ */
let cache = null;

function loadManifest({ file = MANIFEST_PATH, fresh = false } = {}) {
  let stat;
  try { stat = fs.statSync(file); }
  catch (e) {
    const err = new Error(`MISSING_MANIFEST: ${file} is not there.`);
    err.code = "MISSING_MANIFEST";
    throw err;
  }
  const key = file + ":" + stat.mtimeMs;
  if (!fresh && cache && cache.key === key) return cache.value;

  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) {
    const err = new Error(`BAD_MANIFEST: ${file} is not valid JSON — ${e.message}`);
    err.code = "BAD_MANIFEST";
    throw err;
  }
  if (!Array.isArray(parsed.library)) {
    const err = new Error("BAD_MANIFEST: the manifest has no `library` array.");
    err.code = "BAD_MANIFEST";
    throw err;
  }

  const value = Object.freeze({
    version: String(parsed.version || "unversioned"),
    updated: String(parsed.updated || ""),
    groups: parsed.groups || [],
    library: parsed.library.map(normaliseEntry),
    raw: parsed
  });
  cache = { key, value };
  return value;
}

function normaliseEntry(e) {
  const families = Array.isArray(e.families) ? e.families : ["*"];
  return Object.freeze(Object.assign({}, e, {
    id: String(e.id),
    group: String(e.group || "other"),
    role: String(e.role || "other"),
    families,
    active: e.active !== false,
    external: !!e.external,
    keywords: (e.keywords || []).map(k => String(k).toLowerCase()),
    topics: (e.topics || []).map(t => String(t).toLowerCase())
  }));
}

/* Where a reference lives, as a path the site would serve. */
function publicPath(entry) {
  return entry.external ? entry.file : "/assets/img/refs/" + entry.file;
}

/* Where a reference lives on disk. Used by the local renderer and by the
   existence check; the Netlify functions use publicPath + the site origin. */
function diskPath(entry) {
  return entry.external
    ? path.join(ROOT, entry.file.replace(/^\//, ""))
    : path.join(REFS_DIR, entry.file);
}

function absoluteUrl(entry, origin) {
  const p = publicPath(entry);
  return /^https?:/i.test(p) ? p : String(origin || "").replace(/\/$/, "") + p;
}

/* --------------------------------------------------------------------------
   LOOKUP
   ------------------------------------------------------------------------ */
const all = (m) => (m || loadManifest()).library;

const byId = (id, m) => all(m).find(e => e.id === id) || null;

const serves = (entry, family) =>
  entry.families.includes("*") || entry.families.includes(family);

function byGroup(group, m) {
  return all(m).filter(e => e.group === group);
}

/* The poster reference for one slide family. Required — a family with no
   active poster is a broken manifest, not a reason to improvise. */
function posterFor(family, m) {
  const man = m || loadManifest();
  const hit = man.library.find(e =>
    e.group === "poster" && e.active && e.role === family);
  if (!hit) {
    const err = new Error(
      `MISSING_REFERENCE: no active poster reference with role "${family}" in ` +
      `manifest ${man.version}. Add one to assets/img/refs/manifest.json — ` +
      `the generator will not substitute a generic design.`);
    err.code = "MISSING_REFERENCE";
    err.family = family;
    throw err;
  }
  return hit;
}

/* The brand board. Also required: it is what carries the palette. */
function brandBoard(m) {
  const man = m || loadManifest();
  const hit = man.library.find(e => e.role === "brand-board" && e.active);
  if (!hit) {
    const err = new Error("MISSING_REFERENCE: no active brand reference board in the manifest.");
    err.code = "MISSING_REFERENCE";
    throw err;
  }
  return hit;
}

function characterSheet(name, m) {
  const man = m || loadManifest();
  const hit = man.library.find(e =>
    e.role === "character-sheet" && e.active && e.character === name);
  if (!hit) {
    const err = new Error(`MISSING_REFERENCE: no active character sheet for "${name}".`);
    err.code = "MISSING_REFERENCE";
    err.character = name;
    throw err;
  }
  return hit;
}

/* --------------------------------------------------------------------------
   WHICH CHARACTERS BELONG ON THIS SLIDE

   Mama, Papa and Ari are the cast. Which of them appear is decided by the
   FAMILY, not by the wording — deriving it from the copy would let a guide
   that mentions a doctor conjure a fourth character, and letting the model
   decide would let it invent one.

   Ari is in every family: the whole publication is about one baby. Both
   parents appear wherever the composition wants a pair; the quick-check
   poster is a single-adult composition, so it gets one, chosen deterministically
   from the slug so the feed alternates rather than always showing Papa.
   ------------------------------------------------------------------------ */
function castFor(family, guide) {
  const slug = String((guide && guide.slug) || "");
  const flip = hashInt(slug) % 2 === 0;
  switch (family) {
    case "quick-check":     return [flip ? "mama" : "papa", "ari"];
    case "what-helped-us":  return ["mama", "papa", "ari"];
    case "warning":         return ["mama", "papa", "ari"];
    case "dont":            return ["mama", "papa", "ari"];
    case "save-cta":        return ["mama", "papa", "ari"];
    case "story-reel":      return ["mama", "papa", "ari"];
    case "cover-hook":
    default:                return ["mama", "papa", "ari"];
  }
}

/* A tiny stable string hash. Deterministic across runs and processes, which is
   what makes preview and export choose the same variant. */
function hashInt(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

/* --------------------------------------------------------------------------
   ONE SEMANTICALLY RELEVANT APPROVED SCENE

   Scored, not random: the guide's topic is worth more than a keyword, and a
   scene restricted to a family (the crossed-out white-coat scene is warning
   only) is only eligible for that family. Ties break on the manifest order so
   the answer is stable.
   ------------------------------------------------------------------------ */
function sceneFor(family, guide, m) {
  const man = m || loadManifest();
  const topic = String((guide && guide.topic) || "").toLowerCase();
  const haystack = [
    (guide && guide.title) || "",
    (guide && guide.summary) || "",
    (guide && guide.quick) || "",
    ((guide && guide.keywords) || []).join(" ")
  ].join(" ").toLowerCase();

  const candidates = man.library
    .filter(e => e.role === "approved-scene" && e.active && serves(e, family))
    .map((e, i) => {
      let score = 0;
      if (topic && e.topics.includes(topic)) score += 10;
      e.keywords.forEach(k => { if (k && haystack.includes(k)) score += 2; });
      /* A scene pinned to exactly this family was chosen for it on purpose. */
      if (e.families.includes(family)) score += 6;
      return { e, score, i };
    })
    .sort((a, b) => b.score - a.score || a.i - b.i);

  return candidates.length ? candidates[0].e : null;
}

/* --------------------------------------------------------------------------
   THE SELECTION

   Everything one image request needs, resolved from the manifest and recorded
   on the slide so the choice is auditable afterwards. `ids` is what goes into
   the approval hash: change a reference and the approval falls over, which is
   the behaviour the brief asks for.
   ------------------------------------------------------------------------ */
function selectFor({ family, guide, manifest, cast: castOverride } = {}) {
  const man = manifest || loadManifest();
  if (!FAMILIES.includes(family)) {
    const err = new Error(`UNKNOWN_FAMILY: "${family}" is not one of ${FAMILIES.join(", ")}.`);
    err.code = "UNKNOWN_FAMILY";
    throw err;
  }

  const poster = posterFor(family, man);
  const brand = brandBoard(man);
  /* The SLIDE'S cast wins when it has one. castFor() derives a cast from the
     family, which is how seven frames out of nine ended up with Mama, Papa and
     Ari; concept.js knows that a "what helped us" slide is one parent doing one
     thing, and attaching a character sheet for somebody who must not appear is
     an invitation to draw them. */
  const cast = (Array.isArray(castOverride) && castOverride.length)
    ? castOverride.filter(c => ["mama", "papa", "ari"].indexOf(c) >= 0)
    : castFor(family, guide);
  const characters = cast.map(c => characterSheet(c, man));
  const scene = sceneFor(family, guide, man);
  const logo = LOGO_FAMILIES.includes(family)
    ? man.library.find(e => e.role === "logo" && e.active) || null
    : null;

  const chosen = [poster].concat(characters, scene ? [scene] : [], [brand]);

  return {
    family,
    manifestVersion: man.version,
    poster,
    brand,
    characters,
    cast,
    scene,
    logo,
    /* The order references are attached in, and the order they are recorded
       in. Poster first (composition), then identity, then finish, then
       palette — the same priority the manifest's own comment states. */
    attach: chosen,
    ids: chosen.map(e => e.id),
    files: chosen.map(e => publicPath(e))
  };
}

/* Every reference in the manifest, shaped for the References tab. Includes
   which slide families use it, so the tab answers "is this actually wired in"
   rather than just listing pictures. */
function libraryView(m) {
  const man = m || loadManifest();
  return {
    version: man.version,
    updated: man.updated,
    groups: man.groups,
    references: man.library.map(e => ({
      id: e.id,
      group: e.group,
      role: e.role,
      name: e.name || e.id,
      note: e.note || "",
      file: publicPath(e),
      thumb: e.thumb ? (e.external ? e.thumb : "/assets/img/refs/" + e.thumb) : publicPath(e),
      active: e.active,
      external: e.external,
      character: e.character || null,
      manifestVersion: man.version,
      usedBy: e.families.includes("*") ? FAMILIES.slice() : e.families.slice()
    }))
  };
}

/* Which manifest entries have no file behind them. Reported by the References
   tab and by tests/social-references.js; never silently patched. */
function missingFiles(m) {
  const man = m || loadManifest();
  return man.library
    .filter(e => !fs.existsSync(diskPath(e)))
    .map(e => ({ id: e.id, expected: e.external ? e.file : "assets/img/refs/" + e.file }));
}

module.exports = {
  FAMILIES, LOGO_FAMILIES, MANIFEST_PATH, REFS_DIR,
  loadManifest, libraryView, missingFiles,
  posterFor, brandBoard, characterSheet, sceneFor, castFor,
  selectFor, publicPath, diskPath, absoluteUrl, byId, byGroup, hashInt
};
