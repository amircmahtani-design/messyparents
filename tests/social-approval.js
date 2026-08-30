#!/usr/bin/env node
/* ============================================================================
   APPROVAL INTEGRITY

   Run with: node tests/social-approval.js   (part of npm run verify)

   Approval in this system is a signature over content, not a status field. The
   properties that has to have, and that this file asserts:

     • the same content always hashes the same, whatever order the keys arrive
       in from Firestore, and whatever whitespace an editor introduced;
     • changing ANY field a follower would see changes the hash;
     • changing a field nobody sees does not — otherwise approvals would break
       every time the document was touched, and Amir would learn to ignore it;
     • editing an approved package clears its approval automatically;
     • an approval cannot be granted over content the approver was not looking
       at, or over a package with unresolved errors;
     • APPROVED_HELD is where it stops.
   ========================================================================== */

const H = require("../scripts/lib/social/hash");
const W = require("../scripts/lib/social/workflow");
const CFG = require("../scripts/lib/social/config");
const D = require("../scripts/lib/data");
const Sel = require("../scripts/lib/social/select");
const C = require("../scripts/lib/social/compose");
const V = require("../scripts/lib/social/validate");

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));
const clone = (o) => JSON.parse(JSON.stringify(o));

const PKG = {
  id: "p1", guideSlug: "sleep-regression", format: "carousel",
  status: CFG.STATES.NEEDS_REVIEW,
  caption: "Is this sleep regression?\n\nProbably.",
  hashtags: ["themessyparentscollection", "sleeping"],
  destinationUrl: "https://themessyparentscollection.com/guides/sleep-regression/?utm_source=instagram&utm_medium=social&utm_campaign=ig_2026_09&utm_content=carousel_sleep-regression",
  scheduledFor: "2026-09-02T19:00:00.000Z",
  slides: [
    { kind: "cover", eyebrow: "Sleeping", heading: "Is this sleep regression?", lines: [], image: "" },
    { kind: "warn", heading: "Call your doctor if", lines: ["A fever over 38"], image: "" }
  ],
  story: { frames: [{ kind: "hook", heading: "Is this sleep regression?", body: "Probably.", image: "" }] },
  approvedHash: null
};

/* ---------------------------------------------------------------------- */
section("The hash is stable, and it is about content");

check("Hashing twice gives the same answer", H.contentHash(PKG) === H.contentHash(clone(PKG)));

const reordered = {};
Object.keys(PKG).sort().reverse().forEach(k => { reordered[k] = PKG[k]; });
check("Key order does not matter", H.contentHash(PKG) === H.contentHash(reordered));

const respaced = clone(PKG);
respaced.caption = "Is this sleep regression?\n\n  Probably.  ";
check("Cosmetic whitespace does not matter", H.contentHash(PKG) === H.contentHash(respaced));

const metadata = clone(PKG);
metadata.updatedAt = "2026-09-01T00:00:00Z";
metadata.updatedBy = "someone@example.com";
metadata.validation = [{ level: "warn", code: "x", message: "y" }];
metadata.note = "a note to self";
check("Metadata nobody sees does not change the hash", H.contentHash(PKG) === H.contentHash(metadata));

/* ---------------------------------------------------------------------- */
section("Every visible field is covered");

const mutations = {
  caption:        p => { p.caption += " Extra."; },
  hashtags:       p => { p.hashtags.push("newtag"); },
  destinationUrl: p => { p.destinationUrl += "&utm_term=x"; },
  scheduledFor:   p => { p.scheduledFor = "2026-09-04T19:00:00.000Z"; },
  "slide text":   p => { p.slides[1].lines[0] = "A fever over 39"; },
  "slide heading":p => { p.slides[0].heading = "Something else"; },
  "slide image":  p => { p.slides[0].image = "https://example.com/a.jpg"; },
  "slide order":  p => { p.slides.reverse(); },
  "slide removal":p => { p.slides.pop(); },
  "story text":   p => { p.story.frames[0].body = "Different."; },
  "guide":        p => { p.guideSlug = "wont-nap"; }
};
Object.keys(mutations).forEach(name => {
  const m = clone(PKG); mutations[name](m);
  check(`Changing ${name} changes the hash`, H.contentHash(PKG) !== H.contentHash(m));
});

check("A package with no stored hash never counts as approved", H.hashMatches(PKG) === false);
const approved = clone(PKG); approved.approvedHash = H.contentHash(PKG);
check("A stored hash over unchanged content matches", H.hashMatches(approved) === true);
const tampered = clone(approved); tampered.caption = "Rewritten after approval";
check("A stored hash over changed content does not match", H.hashMatches(tampered) === false);

/* ---------------------------------------------------------------------- */
section("Editing clears an approval");

const held = clone(PKG);
held.status = CFG.STATES.APPROVED_HELD;
held.approvedHash = H.contentHash(PKG);
held.approvedAt = "2026-09-01T10:00:00Z";
held.approvedBy = "amir@example.com";

let step = W.applyEdit(held, { caption: "A different caption" });
check("Editing an approved package sends it back to review", step.status === CFG.STATES.NEEDS_REVIEW);
check("…and clears the hash", step.after.approvedHash === null);
check("…and clears who approved it", step.after.approvedBy === null && step.after.approvedAt === null);
check("…and says so", /cleared/i.test(step.approvalNote || ""));

step = W.applyEdit(held, { caption: held.caption });
check("Re-saving identical text is not an edit", step.contentChanged === false);
check("…so the approval survives", step.status === CFG.STATES.APPROVED_HELD && step.after.approvedHash);

step = W.applyEdit(held, { note: "just a note" });
check("A note does not disturb an approval", step.status === CFG.STATES.APPROVED_HELD);

step = W.applyEdit(held, { status: "PUBLISHED", caption: "x" });
check("A patch cannot smuggle a status in as content", step.after.status !== "PUBLISHED");

const sneaky = W.sanitisePatch({ caption: "ok", status: "PUBLISHED", approvedHash: "forged", approvedBy: "me" });
check("sanitisePatch drops approvedHash", sneaky.approvedHash === undefined);
check("sanitisePatch drops status", sneaky.status === undefined);
check("sanitisePatch keeps real edits", sneaky.caption === "ok");

/* ---------------------------------------------------------------------- */
section("The browser cannot request the states that matter");

check("APPROVED_HELD is refused", W.isClientRequestable(CFG.STATES.APPROVED_HELD) === false);
check("PUBLISHED is refused", W.isClientRequestable(CFG.STATES.PUBLISHED) === false);
check("DRAFT is allowed", W.isClientRequestable(CFG.STATES.DRAFT) === true);
check("REJECTED is allowed", W.isClientRequestable(CFG.STATES.REJECTED) === true);

/* ---------------------------------------------------------------------- */
section("Granting an approval");

const clean = [];
let d = W.decideApproval(PKG, clean);
check("A clean package can be approved", d.ok === true);
check("…and lands in APPROVED_HELD, not PUBLISHED", d.newStatus === CFG.STATES.APPROVED_HELD);
check("…with a hash of the stored content", d.hash === H.contentHash(PKG));

d = W.decideApproval(PKG, clean, "a-hash-from-a-stale-screen");
check("Approving content that moved under you is refused", d.ok === false && d.code === "CHANGED");
check("…with 409 so the dashboard can say why", d.status === 409);

d = W.decideApproval(PKG, clean, H.contentHash(PKG));
check("Approving what you were actually looking at is allowed", d.ok === true);

d = W.decideApproval(PKG, [{ level: "error", code: "prescriptive", message: "no" }]);
check("A package with an error cannot be approved", d.ok === false && d.code === "INVALID");
check("…with 422", d.status === 422);

d = W.decideApproval(PKG, [{ level: "warn", code: "x", message: "hmm" }]);
check("A warning does not block approval", d.ok === true);

d = W.decideApproval(Object.assign(clone(PKG), { status: CFG.STATES.APPROVED_HELD, approvedHash: "h" }), clean);
check("Approving twice is a no-op, not an error", d.ok === true && d.already === true);

/* ---------------------------------------------------------------------- */
section("Nothing reaches a publishable state");

check("APPROVED_HELD is the furthest an approval goes",
  W.decideApproval(PKG, clean).newStatus === CFG.STATES.APPROVED_HELD);
check("Approval does not consult the publishing lock at all",
  !/publishingEnabled|assertPublishing/.test(
    require("fs").readFileSync(require("path").join(__dirname, "..", "scripts/lib/social/workflow.js"), "utf8")));

/* ---------------------------------------------------------------------- */
(async () => {
  section("A real package, end to end");

  const loaded = await D.load();
  const guide = Sel.eligibleGuides(loaded)[0];
  const pkg = C.composePackage(guide, { topics: loaded.topics });
  pkg.validation = V.validatePackage(pkg);

  const decision = W.decideApproval(pkg, pkg.validation);
  check("A freshly composed package is approvable", decision.ok === true,
    decision.error || (decision.findings || []).map(f => f.code).join(","));

  const nowHeld = Object.assign({}, pkg, {
    status: CFG.STATES.APPROVED_HELD, approvedHash: decision.hash
  });
  check("Its stored hash matches its own content", H.hashMatches(nowHeld) === true);

  const edited = W.applyEdit(nowHeld, { slides: nowHeld.slides.map((s, i) =>
    i === 1 ? Object.assign({}, s, { lines: ["Edited after approval"] }) : s) });
  check("Editing one slide of it clears the approval",
    edited.status === CFG.STATES.NEEDS_REVIEW && edited.after.approvedHash === null);
  check("And the old hash no longer matches the new content",
    H.contentHash(edited.after) !== decision.hash);

  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed`);
  if (failures.length) { console.log("\nFailures:"); failures.forEach(x => console.log("  ✗ " + x)); }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
})();
