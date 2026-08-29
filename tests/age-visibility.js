#!/usr/bin/env node
/* ============================================================================
   AGE-RANGE VISIBILITY — the switch itself.

   Run with: node tests/age-visibility.js

   tests/verify.js checks the site the build actually wrote, which is one state
   of the switch at a time. This checks the switch: that the saved map in
   Studio wins over the repo default in both directions, that a range coming
   back on restores everything it took away, and that the rules about which
   guides disappear are the ones written down in scripts/lib/ages.js.

   It runs entirely in memory against a stubbed Firestore, so it needs no
   network, no build and no deploy — and it can therefore test the ON state,
   which a checkout of this repo never otherwise sees.
   ========================================================================== */

"use strict";

const path = require("path");
const A = require("../scripts/lib/ages");
const bundle = require("../data/guides-bundle.js");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok   " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  FAIL " + name + (detail ? " — " + detail : ""));
  return false;
}
function section(t) { console.log("\n" + t + "\n" + "-".repeat(t.length)); }

const AGES = bundle.AGES;
const OFF = ["12–18 months", "18–24 months"];

/* ==========================================================================
   1. The default state, with nothing ever saved in Studio.
   ======================================================================== */
section("Default state (no map saved)");
{
  const v = A.resolve(AGES, null);
  check("12–18 months is off", v.isHidden("12–18 months"));
  check("18–24 months is off", v.isHidden("18–24 months"));
  check("every other range is on",
    AGES.filter(a => !OFF.includes(a)).every(a => v.isVisible(a)));
  check("the full list is still intact", v.all.length === AGES.length);
  check("visible + hidden accounts for all of them",
    v.visible.length + v.hidden.length === AGES.length);
}

/* ==========================================================================
   2. Studio's saved map wins — in both directions.

   This is the requirement that makes it a switch rather than a deletion: a
   range that is off by default must come back on when Amir ticks it, and a
   range that is on by default must go off when he unticks it.
   ======================================================================== */
section("The saved map overrides the default");
{
  const on = A.resolve(AGES, { "12–18 months": true, "18–24 months": true });
  check("ticking both restores them", on.allPublic, on.hidden.join(", "));
  check("...and the visible list is the complete list",
    on.visible.length === AGES.length);

  const off = A.resolve(AGES, { "0–1 month": false });
  check("unticking a range that is on by default hides it",
    off.isHidden("0–1 month"));
  check("...and does not disturb the defaults",
    off.isHidden("12–18 months") && off.isHidden("18–24 months"));

  const one = A.resolve(AGES, { "12–18 months": true });
  check("the two default-off ranges are independent",
    one.isVisible("12–18 months") && one.isHidden("18–24 months"));

  /* Studio writes the label as the key. A label that has been round-tripped
     through a keyboard, a spreadsheet or a copy/paste can come back with a
     plain hyphen instead of an en-dash, and a switch that silently stops
     working is worse than one that is obviously broken. */
  const dash = A.resolve(AGES, { "12-18 months": true, "18-24 MONTHS": true });
  check("a hyphen or a different case still matches the band", dash.allPublic,
    dash.hidden.join(", "));
}

/* ==========================================================================
   3. Which guides disappear.
   ======================================================================== */
section("Which guides are held back");
{
  const v = A.resolve(AGES, null);

  check("a guide tagged only to hidden ranges is held back",
    v.isGuideHidden(["12–18 months", "18–24 months"]));
  check("a guide tagged to one hidden range is held back",
    v.isGuideHidden(["18–24 months"]));
  check("a guide tagged to a visible AND a hidden range stays",
    !v.isGuideHidden(["4–6 months", "18–24 months"]));
  check("...and shows only its visible ranges",
    JSON.stringify(v.visibleAgesOf(["4–6 months", "18–24 months"])) ===
      JSON.stringify(["4–6 months"]));
  check("a guide with no ages at all is untouched", !v.isGuideHidden([]));
  check("an unrecognised age label never hides a guide",
    !v.isGuideHidden(["37 years"]));

  const on = A.resolve(AGES, { "12–18 months": true, "18–24 months": true });
  check("with everything on, nothing is held back",
    !on.isGuideHidden(["12–18 months", "18–24 months"]));
  check("...and no guide loses an age tag",
    on.visibleAgesOf(["4–6 months", "18–24 months"]).length === 2);
}

/* ==========================================================================
   4. Against the real catalogue, through the real loader.

   Firestore is stubbed rather than mocked out: load() makes the same REST
   calls it makes on Netlify and gets the same shaped answers back, so the map
   is read from meta/seo exactly as Studio writes it.
   ======================================================================== */
section("The build's data layer, end to end");

function encode(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
  return { mapValue: { fields: fields(v) } };
}
function fields(o) {
  const out = {};
  for (const k of Object.keys(o || {})) out[k] = encode(o[k]);
  return out;
}

/* Two extra guides so the "held back" path has something to hold back: the
   bundled catalogue happens to contain no guide tagged ONLY to the two ranges
   that are off, and a test that never exercises the case is not a test. */
const EXTRA = [
  { id: "toddler-tantrums", title: "Tantrums", summary: "s", topic: "sanity",
    ages: ["18–24 months"], panel: { quick: "q" }, related: [], order: 900 },
  { id: "walking-late", title: "Not walking yet", summary: "s", topic: "development",
    ages: ["12–18 months", "18–24 months"], panel: { quick: "q" }, related: [], order: 901 }
];

function stubFirestore(savedMap) {
  const guides = bundle.GUIDES.concat(EXTRA);
  const docs = {
    guides: guides.map(g => ({
      name: "projects/x/databases/(default)/documents/guides/" + g.id,
      fields: fields(g), updateTime: "2026-08-01T00:00:00Z"
    })),
    pages: [],
    meta: savedMap ? [{
      name: "projects/x/databases/(default)/documents/meta/seo",
      fields: fields({ ageVisibility: savedMap })
    }] : []
  };
  global.fetch = (url) => {
    const which = String(url).includes("/documents/guides") ? "guides"
      : String(url).includes("/documents/pages") ? "pages" : "meta";
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ documents: docs[which] })
    });
  };
}

async function loadWith(savedMap) {
  stubFirestore(savedMap);
  /* A fresh module each time: load() caches nothing, but requiring it once per
     state makes the two runs provably independent. */
  delete require.cache[require.resolve("../scripts/lib/data.js")];
  const { load } = require("../scripts/lib/data.js");
  return load();
}

(async function () {
  const off = await loadWith(null);
  const on = await loadWith({ "12–18 months": true, "18–24 months": true });

  check("the stub was actually read", off.source === "firestore", off.source);

  /* ---- OFF ------------------------------------------------------------- */
  check("OFF: the two ranges are gone from the public age list",
    OFF.every(a => !off.ages.includes(a)), off.ages.join(", "));
  check("OFF: the other five remain, in order",
    JSON.stringify(off.ages) === JSON.stringify(AGES.filter(a => !OFF.includes(a))));
  check("OFF: both hidden-only guides are held back",
    off.hiddenGuides.length === 2 &&
    off.hiddenGuides.every(g => ["toddler-tantrums", "walking-late"].includes(g.id)),
    off.hiddenGuides.map(g => g.id).join(", "));
  check("OFF: neither appears in the published list",
    !off.guides.some(g => ["toddler-tantrums", "walking-late"].includes(g.id)));
  check("OFF: no published guide carries a hidden age tag",
    off.guides.every(g => g.ages.every(a => !OFF.includes(a))),
    off.guides.filter(g => g.ages.some(a => OFF.includes(a))).map(g => g.id).join(", "));
  check("OFF: no published guide carries a hidden age SLUG",
    off.guides.every(g => (g.ageSlugs || []).every(sl => !["12-18-months", "18-24-months"].includes(sl))));

  const mixed = off.guides.filter(g =>
    (g.allAges || g.ages).some(a => OFF.includes(a)));
  check("OFF: guides in both a hidden and a visible range still publish",
    mixed.length > 0, "none in the catalogue to check");
  check("OFF: ...and keep their real tagging on record for the audit",
    mixed.every(g => g.allAges && g.allAges.length > g.ages.length));

  check("OFF: nothing was deleted — every guide is still loaded",
    off.allGuides.length === bundle.GUIDES.length + EXTRA.length,
    `${off.allGuides.length}`);
  check("OFF: the held-back guides keep their ages, slugs and titles",
    off.hiddenGuides.every(g => g.ages.length && g.slug && g.title));
  check("OFF: the full age list is still available",
    off.allAges.length === AGES.length);

  /* ---- ON -------------------------------------------------------------- */
  check("ON: every range is public again",
    JSON.stringify(on.ages) === JSON.stringify(AGES), on.ages.join(", "));
  check("ON: nothing is held back", on.hiddenGuides.length === 0);
  check("ON: the held-back guides are published again",
    ["toddler-tantrums", "walking-late"].every(id => on.guides.some(g => g.id === id)));
  check("ON: the guide count is back to the full catalogue",
    on.guides.length === off.allGuides.length);
  check("ON: age tags are restored on the mixed guides",
    mixed.every(g => {
      const back = on.guides.find(x => x.id === g.id);
      return back && back.ages.length === (g.allAges || g.ages).length;
    }));
  check("ON: their age landing links come back",
    on.guides.some(g => (g.ageSlugs || []).includes("18-24-months")));

  /* ---- the round trip -------------------------------------------------- */
  const back = await loadWith({ "12–18 months": false, "18–24 months": false });
  check("OFF -> ON -> OFF returns exactly the first state",
    JSON.stringify(back.ages) === JSON.stringify(off.ages) &&
    back.guides.length === off.guides.length &&
    back.hiddenGuides.length === off.hiddenGuides.length);

  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) {
    console.log("\nFailures:");
    failures.forEach(f => console.log("  ✗ " + f));
  }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
})();
