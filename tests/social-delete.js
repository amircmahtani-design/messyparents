#!/usr/bin/env node
/* ============================================================================
   PERMANENT DELETION, AND EVERYTHING IT REFUSES

   Run with: node tests/social-delete.js   (part of npm run verify:social)

   Rejecting a package used to be a one-way trip to a list that only grew. The
   way out is deliberately narrow, and this file is the description of how
   narrow:

     • REJECTED, exactly. Not DRAFT, not NEEDS_REVIEW, and above all not
       APPROVED_HELD — deleting an approved package would discard a decision.
     • The caller has to name the guide it is deleting.
     • Only files under the package's OWN prefix may be removed, and that
       prefix is derived from the package id rather than read from the
       document — so a hand-edited assetPath cannot be used to delete a guide
       illustration.
     • The browser never gets Firestore delete permission; every deletion goes
       through the authenticated function and the Admin SDK.

   The policy is scripts/lib/social/deletion.js, which is pure, so all of this
   is testable without a Firebase project. The last section reads the handler
   and the rules to check the wiring.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const DEL = require("../scripts/lib/social/deletion");
const CFG = require("../scripts/lib/social/config");

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));

const pkg = (status, extra) => Object.assign({
  id: "pkg-abc123",
  guideSlug: "drinking-less-milk",
  guideTitle: "Why is my baby drinking less milk?",
  status,
  slides: [
    { art: { assetPath: "social/pkg-abc123/slide-01-a1b2c3d4e5f60718.png" } },
    { art: { assetPath: "social/pkg-abc123/slide-02-1122334455667788.png" } },
    { art: null }
  ],
  story: { frames: [{ art: { assetPath: "social/pkg-abc123/story-01-99aabbccddeeff00.png" } }] }
}, extra || {});

/* ---------------------------------------------------------------------- */
section("A rejected package, named correctly, may be deleted");

let d = DEL.decideDeletion(pkg(CFG.STATES.REJECTED), "drinking-less-milk");
check("It is allowed", d.ok === true, d.error);
check("…with a 200", d.status === 200);
check("…and the prefix it may delete under", d.prefix === "social/pkg-abc123/", d.prefix);

/* ---------------------------------------------------------------------- */
section("Every other status is refused");

[CFG.STATES.DRAFT, CFG.STATES.NEEDS_REVIEW, CFG.STATES.APPROVED_HELD, CFG.STATES.PUBLISHED]
  .forEach(status => {
    const r = DEL.decideDeletion(pkg(status), "drinking-less-milk");
    check(`${status} is refused`, r.ok === false, JSON.stringify(r));
    check(`…with NOT_REJECTED`, r.code === "NOT_REJECTED");
    check(`…and a 409 the dashboard can explain`, r.status === 409);
    check(`…naming the status it actually has`, r.packageStatus === status);
  });

const approved = DEL.decideDeletion(pkg(CFG.STATES.APPROVED_HELD), "drinking-less-milk");
check("Refusing an approved package explains what to do instead",
  /reject it first/i.test(approved.hint || ""), approved.hint);

check("A missing package is a 404",
  DEL.decideDeletion(null, "x").status === 404);

/* A package that was rejected and then sent back to editing is not rejected
   any more, and the button is not a shortcut round that. */
check("A package sent back to editing after rejection is refused",
  DEL.decideDeletion(pkg(CFG.STATES.NEEDS_REVIEW), "drinking-less-milk").code === "NOT_REJECTED");

/* ---------------------------------------------------------------------- */
section("The caller has to name what it is deleting");

[["", "an empty confirmation"], [null, "no confirmation"],
 ["wont-nap", "another guide's slug"], ["Drinking-Less-Milk", "the wrong case"],
 ["drinking", "a prefix of the slug"]].forEach(([given, label]) => {
  const r = DEL.decideDeletion(pkg(CFG.STATES.REJECTED), given);
  check(`${label} is refused`, r.ok === false && r.code === "CONFIRMATION_MISMATCH", JSON.stringify(r));
});
check("Surrounding whitespace is forgiven",
  DEL.decideDeletion(pkg(CFG.STATES.REJECTED), "  drinking-less-milk  ").ok === true);
check("The refusal tells the dashboard what to show",
  DEL.decideDeletion(pkg(CFG.STATES.REJECTED), "no").expected.guideTitle ===
  "Why is my baby drinking less milk?");

/* ---------------------------------------------------------------------- */
section("Only this package's own generated media");

const owned = DEL.ownedPaths(pkg(CFG.STATES.REJECTED));
check("Its own slide and story assets are collected", owned.length === 3, owned.join(", "));
check("Every one is under its own prefix",
  owned.every(p => p.indexOf("social/pkg-abc123/") === 0));

/* The important one: a document that points somewhere else must not be
   followed. This is the difference between deleting a rejected draft and
   deleting the guide's illustration. */
const tampered = pkg(CFG.STATES.REJECTED);
tampered.slides[0].art.assetPath = "guides/drinking-less-milk-hero.png";
tampered.slides[1].art.assetPath = "refs/mama.png";
tampered.story.frames[0].art.assetPath = "social/some-other-package/slide-01.png";
const tamperedOwned = DEL.ownedPaths(tampered);
check("A path pointing at a guide illustration is ignored",
  tamperedOwned.indexOf("guides/drinking-less-milk-hero.png") < 0);
check("A path pointing at a character reference is ignored",
  tamperedOwned.indexOf("refs/mama.png") < 0);
check("A path pointing at ANOTHER package is ignored",
  tamperedOwned.every(p => p.indexOf("social/some-other-package/") !== 0));
check("Nothing outside its own folder survives the filter", tamperedOwned.length === 0);

check("withinPrefix drops everything outside the package folder",
  JSON.stringify(DEL.withinPrefix([
    "social/pkg-abc123/a.png", "guides/hero.png", "refs/papa.png",
    "social/pkg-abc123x/a.png", "book/page.png"
  ], "pkg-abc123")) === JSON.stringify(["social/pkg-abc123/a.png"]));

check("The prefix comes from the id, not from the document",
  DEL.packagePrefix("anything") === CFG.STORAGE_PREFIX + "anything/");

/* ---------------------------------------------------------------------- */
section("The wiring");

const fn = fs.readFileSync(path.join(ROOT, "netlify/functions/social-delete.js"), "utf8");
check("Deletion goes through the authenticated guard", /guard\("POST"/.test(fn));
check("…and uses the shared policy", /require\(.*social\/deletion/.test(fn));
check("…and deletes the Firestore document server-side", /col\(db\)\.doc\(pkg\.id\)\.delete\(\)/.test(fn));
check("…and never touches a bucket path outside the prefix",
  /DEL\.withinPrefix/.test(fn));

const rules = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
check("Firestore rules do not grant the browser any social_packages write",
  !/social_packages[\s\S]{0,200}allow write:\s*if\s*(true|request)/.test(rules));

const storage = fs.readFileSync(path.join(ROOT, "storage.rules"), "utf8");
check("Storage rules exist for the social prefix", /match \/social\//.test(storage));
check("…and the browser cannot write there", /match \/social\/\{file=\*\*\}\s*\{[^}]*allow write:\s*if false/.test(storage));

const app = fs.readFileSync(path.join(ROOT, "social/app.js"), "utf8");
check("The dashboard offers deletion on a rejected package's row",
  /const rejected = status === "REJECTED"/.test(app) && /data-del=/.test(app));
check("…and inside the package view too",
  /status === "REJECTED"[\s\S]{0,200}id="delete"/.test(app));
/* Both entry points are behind a REJECTED condition. Checked by looking at
   what precedes each one rather than by trying to strip the template out. */
check("…and every delete control is behind a REJECTED condition",
  (() => {
    const spots = [];
    const re = /data-del=|id="delete"/g;
    let m;
    while ((m = re.exec(app))) spots.push(m.index);
    return spots.length > 0 && spots.every(i =>
      /rejected \?|status === "REJECTED"/.test(app.slice(Math.max(0, i - 400), i)));
  })(),
  "a delete control was found outside a REJECTED branch");
check("…and confirms with the guide title and slug",
  /guideTitle[\s\S]{0,200}guideSlug/.test(app) && /confirmSlug/.test(app));
check("…and calls the server function rather than Firestore",
  /api\("social-delete"/.test(app) && !/deleteDoc/.test(app));

/* ---------------------------------------------------------------------- */
console.log("\n" + "=".repeat(60));
console.log(`${pass} passed, ${fail} failed`);
if (failures.length) { console.log("\nFailures:"); failures.forEach(f => console.log("  ✗ " + f)); }
console.log("=".repeat(60));
process.exit(fail ? 1 : 0);
