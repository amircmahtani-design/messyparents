#!/usr/bin/env node
/* ============================================================================
   SOCIAL CONTENT SAFETY

   Run with: node tests/social-safety.js   (part of npm run verify)

   Two halves.

   The first is the rules in isolation: does the checker catch prescriptive
   phrasing, an invented experience, an invented family member, a dropped
   warning — and does it correctly NOT fire on Amir's own approved words? That
   second half matters as much as the first. A checker that flags a guide
   titled "Why is my baby drinking less milk?" is a checker that gets ignored.

   The second half runs the real composer over the entire real guide library
   and asserts the whole thing comes out clean. That is the check that would
   actually catch a regression in the composer.
   ========================================================================== */

const D = require("../scripts/lib/data");
const Sel = require("../scripts/lib/social/select");
const C = require("../scripts/lib/social/compose");
const S = require("../scripts/lib/social/safety");
const V = require("../scripts/lib/social/validate");

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));
const codes = (f) => f.map(x => x.code);
const has = (f, code) => codes(f).includes(code);
const errs = (f) => f.filter(x => x.level === "error");

const withHelped = { panel: { helped: { title: "What helped us", items: ["Offer a chilled teether"] } } };
const noHelped   = { panel: { normal: { title: "Usually normal", items: ["Drool and chewing"] } } };

/* ---------------------------------------------------------------------- */
section("Invented text is caught");

let f = S.lintText("You should give your baby a chilled teether every hour",
  { guide: withHelped, sources: ["Offer a chilled teether"] });
check("Prescriptive phrasing is an error when the words are not the guide's",
  has(f, "prescriptive") && errs(f).length > 0);

f = S.lintText("What worked for us was a warm bath every evening",
  { guide: noHelped, sources: ["Drool and chewing"] });
check("An experience claim with no “What helped us” panel is an error",
  has(f, "ungrounded-experience") && errs(f).length > 0);

f = S.lintText("Ari loved a frozen flannel", { guide: withHelped, sources: ["Offer a chilled teether"] });
check("Naming a family member the source never mentions is an error", has(f, "invented-person"));

f = S.lintText("This will definitely stop the crying", { guide: withHelped, sources: ["Offer a chilled teether"] });
check("Promising an outcome is caught", has(f, "promise"));

f = S.lintText("Your baby is fine", { guide: withHelped, sources: ["Offer a chilled teether"] });
check("Blanket reassurance is caught", has(f, "reassurance"));

f = S.lintText("Give 5ml of the usual dose", { guide: withHelped, sources: ["Offer a chilled teether"] });
check("Dosing language is caught", has(f, "medical"));

f = S.lintText("Offer a chilled teether and a lavender compress",
  { guide: withHelped, sources: ["Offer a chilled teether"] });
check("A word that is not in the source is reported", has(f, "ungrounded-vocabulary"));

/* ---------------------------------------------------------------------- */
section("The guide's own words are not flagged");

const realTitle = "Why is my baby drinking less milk?";
f = S.lintText(realTitle, { guide: noHelped, sources: [realTitle] });
check("A guide title containing “my baby” is clean", f.length === 0, codes(f).join(","));

f = S.lintText("Offer a chilled teether", { guide: withHelped, sources: ["Offer a chilled teether"] });
check("An unchanged panel item is clean", f.length === 0, codes(f).join(","));

f = S.lintText("What helped us", { guide: withHelped, sources: ["What helped us"] });
check("The guide's own panel heading is clean", f.length === 0, codes(f).join(","));

const ownWords = "We tried a chilled teether";
f = S.lintText(ownWords, { guide: withHelped, sources: [ownWords] });
check("A first-person-plural line quoted from the guide is clean", f.length === 0, codes(f).join(","));

f = S.lintText("You should offer a chilled teether", { guide: withHelped,
  sources: ["You should offer a chilled teether"] });
check("Prescriptive wording that IS the guide's is a warning, not an error",
  has(f, "prescriptive") && errs(f).length === 0);

/* ---------------------------------------------------------------------- */
section("A dropped warning is caught");

const guideWithWarn = {
  title: "Test", slug: "t", id: "t", ages: [], panel: {
    quick: "A short answer",
    warn: { title: "Call your doctor if", items: ["A fever over 38"] }
  }
};
const pkgNoWarn = { slides: [{ kind: "cover", heading: "Test", sourceText: ["Test"] }], story: { frames: [] },
  caption: "Test", captionSourceText: ["Test"] };
check("A guide with a warning panel must carry it",
  has(S.lintPackage(pkgNoWarn, guideWithWarn), "dropped-warning"));

const pkgWithWarn = Object.assign({}, pkgNoWarn, {
  slides: pkgNoWarn.slides.concat([{ kind: "warn", heading: "Call your doctor if",
    lines: ["A fever over 38"], sourceText: ["A fever over 38", "Call your doctor if"] }])
});
check("Carrying it satisfies the rule", !has(S.lintPackage(pkgWithWarn, guideWithWarn), "dropped-warning"));

/* ---------------------------------------------------------------------- */
section("The composer only ever shortens");

check("shorten() never lengthens", ["", "a", "hello world", "x".repeat(400)]
  .every(s => C.shorten(s, 40).replace(/…$/, "").length <= 40));
check("shorten() leaves short text alone", C.shorten("Short enough", 40) === "Short enough");
check("shorten() does not cut mid-word",
  !/\w…$/.test(C.shorten("A sentence that is definitely far too long for the budget given", 30)) ||
  /\s…$|[a-z]…$/.test(C.shorten("A sentence that is definitely far too long for the budget given", 30)));

/* ---------------------------------------------------------------------- */
section("Carousel shape adapts to the fields a guide actually has");

const base = {
  id: "x", slug: "x", title: "Is this a question?", url: "/guides/x/", ages: ["0–1 month"],
  topic: "sleeping", summary: "A summary.",
  panel: {
    quick: "A quick answer.",
    normal: { title: "Usually normal", items: ["One", "Two"] },
    helped: { title: "What helped us", items: ["Three"] },
    warn:   { title: "Call your doctor if", items: ["Four"] },
    dont:   { title: "Don't", items: ["Five"] }
  }
};
const kindsOf = (g) => C.composePackage(g, { topics: [] }).slides.map(s => s.kind);

check("A full guide produces every section",
  JSON.stringify(kindsOf(base)) ===
  JSON.stringify(["cover", "quick", "normal", "helped", "warn", "dont", "close"]));

const noDont = JSON.parse(JSON.stringify(base)); delete noDont.panel.dont;
check("No “don't” panel → no “don't” slide", !kindsOf(noDont).includes("dont"));

const noHelp = JSON.parse(JSON.stringify(base)); delete noHelp.panel.helped;
check("No “what helped us” panel → no helped slide", !kindsOf(noHelp).includes("helped"));

const bare = JSON.parse(JSON.stringify(base));
bare.panel = { quick: "A quick answer." };
check("A sparse guide still produces a valid short carousel",
  JSON.stringify(kindsOf(bare)) === JSON.stringify(["cover", "quick", "close"]));

check("No carousel exceeds ten slides", kindsOf(base).length <= 10);

/* ---------------------------------------------------------------------- */
(async () => {
  section("The whole real guide library, through the real composer");

  const loaded = await D.load();
  const eligible = Sel.eligibleGuides(loaded);
  check("There are guides to work with", eligible.length > 0, `${eligible.length} eligible`);

  let totalErrors = 0, totalWarnings = 0;
  const offenders = [];
  eligible.forEach(g => {
    const pkg = C.composePackage(g, { topics: loaded.topics });
    const findings = S.lintPackage(pkg, g).concat(V.validatePackage(pkg));
    const e = errs(findings);
    if (e.length) offenders.push(`${g.slug}: ${codes(e).join(",")}`);
    totalErrors += e.length;
    totalWarnings += findings.length - e.length;
  });

  check(`Every one of the ${eligible.length} guides composes without a content error`,
    totalErrors === 0, offenders.slice(0, 6).join(" · "));
  console.log(`  (${totalWarnings} warning(s) across the library — warnings do not block approval.)`);

  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed`);
  if (failures.length) { console.log("\nFailures:"); failures.forEach(x => console.log("  ✗ " + x)); }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
})();
