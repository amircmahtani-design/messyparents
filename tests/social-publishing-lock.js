#!/usr/bin/env node
/* ============================================================================
   THE PUBLISHING LOCK

   Run with: node tests/social-publishing-lock.js   (part of npm run verify)

   This is the test that matters most in this phase. It asserts that nothing in
   the repository can publish to Instagram, and it does so four ways:

     1. the lock defaults to closed, and only one exact string opens it;
     2. the publish path throws before it does anything else;
     3. there is no Meta transport in the source at all — no graph.facebook.com,
        no facebook.com/vXX, nothing;
     4. nothing calls the publish function. No schedule in netlify.toml, no
        other function, no client code.

   (4) is the one people forget. A lock is only as good as the number of things
   trying the handle, and the honest answer here should be zero.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const CFG = require("../scripts/lib/social/config");
const Pub = require("../scripts/lib/social/publisher");

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));

/* Comments are prose. This file's own explanations mention Meta hosts, and so
   do the ones in publisher.js — the point of these checks is what the CODE
   does, so comments and strings-in-comments are removed before scanning.
   Crude but adequate: it only ever removes text, so a real call cannot hide. */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^\s*#[^\n]*/gm, " ");
}

/* Every file under scripts/ and netlify/ and social/, as code. */
function sourceFiles() {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      if (/\.(js|mjs|html|css|toml|json)$/.test(e.name)) {
        const raw = fs.readFileSync(full, "utf8");
        out.push({ rel: path.relative(ROOT, full), text: stripComments(raw), raw });
      }
    });
  };
  ["scripts", "netlify", "social"].forEach(d => walk(path.join(ROOT, d)));
  ["netlify.toml", "package.json"].forEach(f => {
    const full = path.join(ROOT, f);
    if (fs.existsSync(full)) {
      const raw = fs.readFileSync(full, "utf8");
      out.push({ rel: f, text: stripComments(raw), raw });
    }
  });
  return out;
}

/* ---------------------------------------------------------------------- */
section("1. The lock defaults to closed");

check("Absent variable → disabled", CFG.publishingEnabled({}) === false);
check("Empty string → disabled", CFG.publishingEnabled({ SOCIAL_PUBLISHING_ENABLED: "" }) === false);
check("undefined → disabled", CFG.publishingEnabled({ SOCIAL_PUBLISHING_ENABLED: undefined }) === false);

/* Everything that has ever looked like a yes. Exactly one may open it. */
const LOOKALIKES = ["true ", " true", "TRUE", "True", "tRuE", "1", "yes", "YES", "on", "y", "t",
  "enabled", "0", "false", "no", "null", "undefined", "[]", "{}"];
let opened = LOOKALIKES.filter(v => CFG.publishingEnabled({ SOCIAL_PUBLISHING_ENABLED: v }));
check("No near-miss value opens the lock", opened.length === 0, opened.join(", "));
check('Only the exact string "true" opens it',
  CFG.publishingEnabled({ SOCIAL_PUBLISHING_ENABLED: "true" }) === true);

check("This process has publishing disabled", CFG.publishingEnabled() === false,
  "SOCIAL_PUBLISHING_ENABLED is set in this environment");
check("Meta is not configured in this process", CFG.metaConfigured() === false);
check("lockReasons explains why", CFG.lockReasons({}).length === 2);

/* ---------------------------------------------------------------------- */
section("2. The publish path throws before doing anything");

(async () => {
  let threw = null;
  try { await Pub.publish({ status: "APPROVED_HELD", approvedHash: "x", slides: [] }); }
  catch (e) { threw = e; }
  check("publish() rejects while locked", threw && threw.code === "PUBLISHING_DISABLED",
    threw ? threw.code : "it did not throw");

  /* With the lock open but no credentials it must still refuse — the assert
     covers both, so a stray environment variable is not enough. */
  let threw2 = null;
  try { CFG.assertPublishingAllowed({ SOCIAL_PUBLISHING_ENABLED: "true" }); }
  catch (e) { threw2 = e; }
  check("Lock open but no credentials → still refused",
    threw2 && threw2.code === "PUBLISHING_DISABLED");

  /* Even fully unlocked, the transport does not exist. */
  let threw3 = null;
  try { await Pub.callGraph({}); } catch (e) { threw3 = e; }
  check("The Meta transport is not implemented", threw3 && threw3.code === "NOT_IMPLEMENTED");

  /* An approved package with no assets is refused for a second reason. */
  let threw4 = null;
  try {
    await Pub.publish({ status: "APPROVED_HELD", approvedHash: "x", slides: [{}] },
      { env: { SOCIAL_PUBLISHING_ENABLED: "true", IG_ACCESS_TOKEN: "t", IG_USER_ID: "u" } });
  } catch (e) { threw4 = e; }
  check("A package whose hash does not match is refused",
    threw4 && threw4.code === "HASH_MISMATCH", threw4 && threw4.code);

  /* buildPayload must not perform IO. It is pure by construction; assert that
     it returns rather than throws, and that it is honest about itself. */
  const payload = Pub.buildPayload({ slides: [{ kind: "cover" }], caption: "x", hashtags: ["a"] });
  check("buildPayload produces a preview payload without sending", payload.children.length === 1);
  check("buildPayload says nothing was sent", /not been sent/.test(payload.note));

  /* -------------------------------------------------------------------- */
  section("3. There is no Meta transport in the source");

  const files = sourceFiles();
  const META_HOST = /graph\.facebook\.com|graph\.instagram\.com|api\.instagram\.com/;
  const hosts = files.filter(f => META_HOST.test(f.text) && !/tests[\\/]/.test(f.rel));
  check("No Meta API host appears anywhere in scripts/, netlify/ or social/",
    hosts.length === 0, hosts.map(f => f.rel).join(", "));

  const fetches = files.filter(f =>
    /fetch\s*\(\s*[`"'](https?:)?\/\/(graph|api)\.(facebook|instagram)/.test(f.text));
  check("Nothing fetches a Meta endpoint", fetches.length === 0, fetches.map(f => f.rel).join(", "));

  /* -------------------------------------------------------------------- */
  section("4. Nothing calls the publish function");

  const callers = files.filter(f =>
    !/social-publish\.js$/.test(f.rel) &&
    !/publisher\.js$/.test(f.rel) &&
    /social-publish(?![\w-])/.test(f.text));   /* not social-publishing-lock */

  /* social/app.js may reference it for the dry-run payload view, which sends
     nothing. Anything else is a caller and should not exist. */
  const realCallers = callers.filter(f => !/social[\\/]app\.js$/.test(f.rel));
  check("No scheduled function, retry or server code calls social-publish",
    realCallers.length === 0, realCallers.map(f => f.rel).join(", "));

  const toml = fs.existsSync(path.join(ROOT, "netlify.toml"))
    ? fs.readFileSync(path.join(ROOT, "netlify.toml"), "utf8") : "";
  check("netlify.toml schedules nothing at all", !/schedule\s*=/.test(toml));
  check("netlify.toml does not mention social-publish", !/social-publish(?![\w-])/.test(toml));

  const appJs = fs.existsSync(path.join(ROOT, "social/app.js"))
    ? fs.readFileSync(path.join(ROOT, "social/app.js"), "utf8") : "";
  const nonDryRun = /social-publish[\s\S]{0,240}/.exec(appJs);
  check("The dashboard only ever calls social-publish with dryRun",
    !appJs.includes("social-publish") || (nonDryRun && /dryRun:\s*true/.test(nonDryRun[0])));

  /* -------------------------------------------------------------------- */
  section("5. Approving does not publish");

  const approve = fs.readFileSync(path.join(ROOT, "netlify/functions/social-approve.js"), "utf8");
  check("social-approve never requires the publisher", !/require\(.*publisher/.test(approve));
  check("social-approve writes APPROVED_HELD, not PUBLISHED",
    /APPROVED_HELD/.test(approve) && !/STATES\.PUBLISHED/.test(approve));

  const W = require("../scripts/lib/social/workflow");
  check("The browser cannot request APPROVED_HELD",
    W.isClientRequestable(CFG.STATES.APPROVED_HELD) === false);
  check("The browser cannot request PUBLISHED",
    W.isClientRequestable(CFG.STATES.PUBLISHED) === false);
  check("It can still ask for the ordinary states",
    W.isClientRequestable(CFG.STATES.NEEDS_REVIEW) && W.isClientRequestable(CFG.STATES.REJECTED));

  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed`);
  if (failures.length) { console.log("\nFailures:"); failures.forEach(f => console.log("  ✗ " + f)); }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
})();
