#!/usr/bin/env node
/* ============================================================================
   THE ARTWORK PIPELINE, AND WHAT IT MAY AND MAY NOT DO

   Run with: node tests/social-artwork.js   (part of npm run verify:social)

   The transport is FAKE here, and that is the point. scripts/lib/social/
   artwork.js takes every side effect through an injected `io`, so this file
   can watch exactly what would be sent, count the calls, and assert the
   expensive ones do not happen:

     • the references really are attached to the request;
     • a cached frame makes NO image call at all;
     • regenerating one slide regenerates one slide;
     • a base with lettering in it is rejected before it is ever stored;
     • the stored path is package-scoped and deterministic;
     • the exact approved wording ends up on the slide, character for
       character, whatever the picture underneath is;
     • a guide's warning survives into the package and onto a slide;
     • changing the artwork, the references, the prompt version or the model
       invalidates an approval;
     • the export is exactly 1080×1350 and 1080×1920.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const D = require("../scripts/lib/data");
const Sel = require("../scripts/lib/social/select");
const C = require("../scripts/lib/social/compose");
const T = require("../scripts/lib/social/templates");
const REFS = require("../scripts/lib/social/refs");
const ART = require("../scripts/lib/social/artwork");
const PROMPT = require("../scripts/lib/social/artprompt");
const H = require("../scripts/lib/social/hash");
const V = require("../scripts/lib/social/validate");
const Safety = require("../scripts/lib/social/safety");
const CFG = require("../scripts/lib/social/config");

let pass = 0, fail = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));
const clone = (o) => JSON.parse(JSON.stringify(o));

/* A 1×1 PNG, so `store` has real bytes to weigh. */
const TINY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/* The fake transport. Records everything, sends nothing. */
function fakeIo(opts) {
  const o = opts || {};
  const log = { referenceCalls: [], generateCalls: [], checkCalls: [], storeCalls: [] };
  return {
    log,
    async referenceUrls(selection) {
      log.referenceCalls.push(selection.ids.slice());
      return selection.attach.map(e => "data:image/png;base64,REF/" + e.id);
    },
    async generate(req) {
      log.generateCalls.push(req);
      if (o.failGenerate) throw new Error("the image model is unavailable");
      return { b64: TINY_PNG };
    },
    async checkText(req) {
      log.checkCalls.push(req);
      return o.strayText
        ? { hasReadableText: true, hasLogo: false, what: "a mug slogan" }
        : { hasReadableText: false, hasLogo: false, what: "" };
    },
    async store(req) {
      log.storeCalls.push(req);
      return { path: req.path, url: "https://example.invalid/" + req.path, bytes: 68 };
    }
  };
}

(async () => {
  const loaded = await D.load();
  const guide = (loaded.guides || []).find(g => g.slug === "drinking-less-milk") ||
                Sel.eligibleGuides(loaded)[0];
  const manifest = REFS.loadManifest();

  /* -------------------------------------------------------------------- */
  section("The plan, before anything is generated");

  const pkg = C.composePackage(guide, { topics: loaded.topics });
  pkg.id = "pkg-test-1";

  const plan = ART.planFor(pkg, guide, { manifest });
  check("Every slide and story frame gets a job",
    plan.length === pkg.slides.length + pkg.story.frames.length,
    `${plan.length} jobs for ${pkg.slides.length}+${pkg.story.frames.length} frames`);
  check("Nothing is planned for a family the guide does not have",
    plan.every(j => REFS.FAMILIES.indexOf(j.family) >= 0));
  check("Carousel jobs are 1080×1350",
    plan.filter(j => !j.isStory).every(j => j.format.width === 1080 && j.format.height === 1350));
  check("Story jobs are 1080×1920",
    plan.filter(j => j.isStory).every(j => j.format.width === 1080 && j.format.height === 1920));
  check("Every job carries its own poster reference",
    plan.every(j => j.selection.poster.role === j.family));
  check("Every job records the prompt version and the model",
    plan.every(j => j.provenance.promptVersion === PROMPT.PROMPT_VERSION && j.provenance.imageModel));
  check("Nothing in the plan is cached yet", plan.every(j => !j.cached));

  /* Keys are content-addressed, not random. */
  const planAgain = ART.planFor(pkg, guide, { manifest });
  check("The same package plans the same keys",
    JSON.stringify(plan.map(j => j.key)) === JSON.stringify(planAgain.map(j => j.key)));
  check("Two different families get different keys",
    new Set(plan.map(j => j.key)).size === plan.length);

  /* -------------------------------------------------------------------- */
  section("The references are actually sent");

  let io = fakeIo();
  let run = await ART.generate(pkg, guide, io, { packageId: pkg.id, manifest });

  check("One image request per frame",
    io.log.generateCalls.length === plan.length, String(io.log.generateCalls.length));
  check("References were resolved for every request",
    io.log.referenceCalls.length === plan.length);

  const firstRefs = io.log.referenceCalls[0];
  const coverSel = REFS.selectFor({ family: "cover-hook", guide, manifest });
  check("The cover request attaches the cover poster",
    firstRefs.indexOf("poster-cover-hook") >= 0, firstRefs.join(","));
  check("…the three character sheets",
    ["char-mama", "char-papa", "char-ari"].every(id => firstRefs.indexOf(id) >= 0));
  check("…an approved scene", firstRefs.some(id => /^scene-/.test(id)));
  check("…and the brand board", firstRefs.indexOf("brand-board") >= 0);
  check("The attached set is exactly what refs.js selected",
    JSON.stringify(firstRefs) === JSON.stringify(coverSel.ids));

  const firstCall = io.log.generateCalls[0];
  check("The request carries the images, not just a description",
    Array.isArray(firstCall.references) && firstCall.references.length === firstRefs.length);
  check("Every attached reference is image data",
    firstCall.references.every(r => /^data:image\//.test(r)));
  check("The prompt forbids readable wording", /NO readable text/i.test(firstCall.prompt));
  check("The request asks for the platform size",
    firstCall.width === 1080 && firstCall.height === 1350);

  check("Every frame came back READY",
    run.results.every(r => r.status === "READY"), JSON.stringify(run.counts));
  check("Every frame now carries a stored asset",
    run.patch.slides.every(s => s.art && s.art.assetUrl));
  /* Four at minimum — poster, one character sheet, one approved scene, brand
     board. A slide whose concept calls for one parent attaches four; the
     cover, which calls for all three, attaches six. The old assertion demanded
     five on every frame, which was only ever true because every frame was
     getting the whole family. */
  check("…recorded with its reference ids",
    run.patch.slides.every(s => s.art.referenceIds && s.art.referenceIds.length >= 4));
  check("…and a slide whose concept excludes a parent does not attach them",
    run.patch.slides.some(s => s.art.referenceIds.length < 6),
    run.patch.slides.map(s => s.art.referenceIds.length).join(","));
  check("…the manifest version", run.patch.slides.every(s => s.art.manifestVersion === manifest.version));
  check("…the prompt version", run.patch.slides.every(s => s.art.promptVersion === PROMPT.PROMPT_VERSION));
  check("…the image model", run.patch.slides.every(s => Boolean(s.art.imageModel)));
  check("…the output dimensions",
    run.patch.slides.every(s => s.art.width === 1080 && s.art.height === 1350));
  check("…and a generation timestamp", run.patch.slides.every(s => Boolean(s.art.generatedAt)));

  check("Stored paths are package-scoped",
    io.log.storeCalls.every(c => c.path.indexOf(`social/${pkg.id}/`) === 0),
    io.log.storeCalls[0] && io.log.storeCalls[0].path);
  check("…deterministic, and content-addressed",
    io.log.storeCalls[0].path === ART.storagePath(pkg.id, 0, "slide", plan[0].key));
  check("No two frames write to the same path",
    new Set(io.log.storeCalls.map(c => c.path)).size === io.log.storeCalls.length);
  check("The package artwork state is READY", run.patch.artwork.status === "READY");

  /* -------------------------------------------------------------------- */
  section("A cached render costs nothing");

  const generated = Object.assign({}, pkg, run.patch);
  const io2 = fakeIo();
  const run2 = await ART.generate(generated, guide, io2, { packageId: pkg.id, manifest });

  check("Reopening a generated package makes NO image call",
    io2.log.generateCalls.length === 0, String(io2.log.generateCalls.length));
  check("…and NO storage write", io2.log.storeCalls.length === 0);
  check("…and NO lettering check", io2.log.checkCalls.length === 0);
  check("Every frame reports as cached",
    run2.counts.cached === plan.length && run2.counts.generated === 0,
    JSON.stringify(run2.counts));
  check("The stored assets are still there",
    run2.patch.slides.every(s => s.art && s.art.assetUrl));

  /* An edit to the COPY must not invalidate the artwork cache: the base has
     no words in it, and re-charging for a comma is how people stop fixing
     commas. */
  const reworded = clone(generated);
  reworded.slides[0].lines[0].t = "A completely different headline";
  reworded.caption = "Rewritten caption.";
  const io3 = fakeIo();
  await ART.generate(reworded, guide, io3, { packageId: pkg.id, manifest });
  check("Editing the copy does not re-generate the artwork",
    io3.log.generateCalls.length === 0, String(io3.log.generateCalls.length));

  /* Changing the LAYOUT does, because the composition is different. */
  const revariant = clone(generated);
  revariant.slides[0].variant = revariant.slides[0].variants
    .find(v => v !== revariant.slides[0].variant);
  const io4 = fakeIo();
  const run4 = await ART.generate(revariant, guide, io4, { packageId: pkg.id, manifest });
  check("Changing a layout variant regenerates that frame only",
    io4.log.generateCalls.length === 1, String(io4.log.generateCalls.length));
  check("…and reuses everything else", run4.counts.cached === plan.length - 1);

  /* -------------------------------------------------------------------- */
  section("Regenerating one slide regenerates one slide");

  const io5 = fakeIo();
  const run5 = await ART.generate(generated, guide, io5,
    { packageId: pkg.id, manifest, only: ["slide:2"], force: true });

  check("Exactly one image is requested", io5.log.generateCalls.length === 1);
  check("Exactly one image is stored", io5.log.storeCalls.length === 1);
  check("It is the slide that was asked for",
    io5.log.storeCalls[0].path.indexOf("slide-03") >= 0, io5.log.storeCalls[0].path);
  check("The other slides keep the artwork they had",
    run5.patch.slides.filter((s, i) => i !== 2)
      .every((s, i) => s.art.assetUrl === generated.slides[i < 2 ? i : i + 1].art.assetUrl));
  check("Only one job was planned", run5.counts.planned === 1);

  /* "Regenerate the artwork, keep the exact copy" — the seed changes, so the
     key changes, so one new picture is made and the words are untouched. */
  const bumped = clone(generated);
  bumped.slides[1] = ART.bumpSeed(bumped.slides[1]);
  const io6 = fakeIo();
  const run6 = await ART.generate(bumped, guide, io6, { packageId: pkg.id, manifest });
  check("Bumping the art seed regenerates exactly that frame",
    io6.log.generateCalls.length === 1, String(io6.log.generateCalls.length));
  check("…and the copy on it is untouched",
    JSON.stringify(run6.patch.slides[1].lines) === JSON.stringify(generated.slides[1].lines));
  check("…with a different stored path", run6.patch.slides[1].art.assetPath !== generated.slides[1].art.assetPath);

  /* -------------------------------------------------------------------- */
  section("Two slides that mean different things cannot share a picture");

  /* THE BUG THIS SECTION EXISTS FOR.

     The first cache key hashed the family, the variant, the cast and a
     free-text art note. `quick` and `normal` share the quick-check family and
     its poster, and both were getting the same cast and the same generic art
     note — so they hashed IDENTICALLY, the second was served the first one's
     picture out of the cache, and the whole package read as one poster with
     different words pasted on it. */
  const byKind = {};
  ART.planFor(pkg, guide, { manifest }).forEach(j => {
    const f = j.isStory ? pkg.story.frames[j.index] : pkg.slides[j.index];
    byKind[f.kind + (j.isStory ? "-story" : "")] = j;
  });

  check("The quick answer and the clue slide are in the same family",
    byKind.quick && byKind.normal && byKind.quick.family === byKind.normal.family,
    byKind.quick && byKind.quick.family);
  check("…and they still get different art keys",
    byKind.quick.key !== byKind.normal.key);
  check("…because they have different concepts",
    byKind.quick.concept.action !== byKind.normal.concept.action,
    `${byKind.quick.concept.action} vs ${byKind.normal.concept.action}`);
  check("…and different casts",
    byKind.quick.concept.cast.join() !== byKind.normal.concept.cast.join(),
    `${byKind.quick.concept.cast} vs ${byKind.normal.concept.cast}`);
  check("…and different attached references",
    byKind.quick.selection.ids.join() !== byKind.normal.selection.ids.join());

  const allJobs = ART.planFor(pkg, guide, { manifest });
  check("Every frame in the package has its own art key",
    new Set(allJobs.map(j => j.key)).size === allJobs.length,
    `${new Set(allJobs.map(j => j.key)).size} of ${allJobs.length}`);
  check("Every frame has its own visual concept",
    new Set(allJobs.map(j => j.concept.fingerprint)).size === allJobs.length);
  check("The carousel warning and the Story warning are different pictures",
    byKind.warn && byKind["warn-story"] &&
    byKind.warn.concept.action !== byKind["warn-story"].concept.action,
    byKind.warn && byKind["warn-story"] &&
      `${byKind.warn.concept.action} vs ${byKind["warn-story"].concept.action}`);

  /* A different CONCEPT alone must move the key, with everything else held
     still — family, variant, references, model, seed. */
  const keyWith = (concept, base) => {
    const sl = Object.assign(clone(base), { concept });
    return ART.artKey({
      guide, slide: sl,
      selection: REFS.selectFor({ family: sl.family, guide, manifest, cast: concept.cast }),
      format: { width: 1080, height: 1350 }, imageModel: "gpt-image-1", artSeed: 0
    });
  };
  const warnSlide = pkg.slides.find(s => s.kind === "warn");
  const c1 = warnSlide.concept;
  const c2 = Object.assign(clone(c1), { action: "hand-on-forehead", fingerprint: "different-fp-1" });
  const c3 = Object.assign(clone(c1), { objects: ["thermometer"], fingerprint: "different-fp-2" });
  check("A different warning concept gets a different key",
    keyWith(c1, warnSlide) !== keyWith(c2, warnSlide));
  check("Different objects in the concept get a different key",
    keyWith(c1, warnSlide) !== keyWith(c3, warnSlide));

  const helpedSlide = pkg.slides.find(s => s.kind === "helped");
  const h2 = Object.assign(clone(helpedSlide.concept),
    { action: "checking-the-teat", fingerprint: "different-fp-3" });
  check("A different helped concept gets a different key",
    keyWith(helpedSlide.concept, helpedSlide) !== keyWith(h2, helpedSlide));

  const closeSlide = pkg.slides.find(s => s.kind === "close");
  const t2 = Object.assign(clone(closeSlide.concept),
    { action: "family-close-vertical", fingerprint: "different-fp-4" });
  check("A different CTA concept gets a different key",
    keyWith(closeSlide.concept, closeSlide) !== keyWith(t2, closeSlide));

  /* And the negative: cosmetic edits must NOT move it. */
  const punct = clone(warnSlide);
  punct.lines[0].t = punct.lines[0].t + ",";
  punct.items[0].label = punct.items[0].label + ".";
  punct.band = "anything at all";
  check("A punctuation-only edit does not move the key",
    ART.artKey({ guide, slide: punct,
      selection: REFS.selectFor({ family: punct.family, guide, manifest, cast: punct.concept.cast }),
      format: { width: 1080, height: 1350 }, imageModel: "gpt-image-1", artSeed: 0 }) ===
    keyWith(c1, warnSlide));

  /* -------------------------------------------------------------------- */
  section("One asset, one frame");

  const distinct = ART.pathsAreDistinct(allJobs, pkg.id);
  check("Distinct jobs produce distinct stored asset paths",
    distinct.ok, JSON.stringify(distinct.clashes));
  check("…one path per frame", distinct.paths.length === allJobs.length);
  check("Every path is inside this package's own folder",
    distinct.paths.every(p => p.indexOf(`social/${pkg.id}/`) === 0));
  check("A carousel path and a Story path never collide",
    new Set(distinct.paths.map(p => p.replace(/-[0-9a-f]{16}\.png$/, ""))).size === allJobs.length);

  /* Even if two frames were somehow handed the same key, the path carries the
     frame's own kind and index, so the objects still cannot be the same one. */
  const forced = allJobs.map(j => Object.assign({}, j, { key: "0".repeat(64) }));
  check("Two frames with the same key still write to different paths",
    ART.pathsAreDistinct(forced, pkg.id).ok);

  const generatedPkg = Object.assign({}, pkg, run.patch);
  const urls = generatedPkg.slides.concat(generatedPkg.story.frames)
    .map(f => f.art && f.art.assetUrl).filter(Boolean);
  check("No generated asset is assigned to two frames",
    new Set(urls).size === urls.length, `${new Set(urls).size} of ${urls.length}`);
  check("No stored asset path is assigned to two frames",
    (() => {
      const ps = generatedPkg.slides.concat(generatedPkg.story.frames)
        .map(f => f.art && f.art.assetPath).filter(Boolean);
      return new Set(ps).size === ps.length;
    })());

  /* -------------------------------------------------------------------- */
  section("Regenerating one frame touches one seed");

  const seeded = clone(generatedPkg);
  const before = seeded.slides.concat(seeded.story.frames).map(f => (f.art && f.art.artSeed) || 0);
  seeded.slides[3] = ART.bumpSeed(seeded.slides[3]);
  const after = seeded.slides.concat(seeded.story.frames).map(f => (f.art && f.art.artSeed) || 0);

  check("The targeted frame's seed goes up by one", after[3] === before[3] + 1);
  check("…and no other frame's seed moves",
    after.every((v, i) => i === 3 || v === before[i]),
    before.join(",") + " → " + after.join(","));

  const ioSeed = fakeIo();
  const runSeed = await ART.generate(seeded, guide, ioSeed, { packageId: pkg.id, manifest });
  check("Only the bumped frame is regenerated", ioSeed.log.generateCalls.length === 1);
  check("…and every other frame is served from cache",
    runSeed.counts.cached === allJobs.length - 1, JSON.stringify(runSeed.counts));
  check("…and the copy on the bumped frame is untouched",
    JSON.stringify(runSeed.patch.slides[3].lines) === JSON.stringify(generatedPkg.slides[3].lines));

  /* -------------------------------------------------------------------- */
  section("A base with lettering in it is rejected, not displayed");

  const ioStray = fakeIo({ strayText: true });
  const runStray = await ART.generate(pkg, guide, ioStray, { packageId: pkg.id, manifest });

  check("The lettering check ran on every generated image",
    ioStray.log.checkCalls.length === plan.length);
  check("NOTHING was stored", ioStray.log.storeCalls.length === 0);
  check("Every frame reports as rejected",
    runStray.results.every(r => r.status === "REJECTED"));
  check("The rejected frames are flagged strayText",
    runStray.patch.slides.every(s => s.art.strayText === true));
  check("…with no asset url", runStray.patch.slides.every(s => !s.art.assetUrl));
  check("…and a reason a person can read",
    /readable lettering/i.test(runStray.patch.slides[0].art.error || ""),
    runStray.patch.slides[0].art.error);
  check("The package artwork state is FAILED", runStray.patch.artwork.status === "FAILED");

  /* The renderer must not display a rejected base. */
  const strayFrame = runStray.patch.slides[0];
  const strayHtml = T.slideHTML(strayFrame, { index: 0, total: 1 });
  check("The renderer falls back to the composed scene for a rejected base",
    !/class="b-base"/.test(strayHtml) && /b-char/.test(strayHtml));

  /* An unreadable answer counts as "possibly has text". */
  check("An unparseable lettering check is treated as suspect",
    ART.interpretTextCheck(null).hasText === true);
  check("A logo counts as lettering",
    ART.interpretTextCheck({ hasReadableText: false, hasLogo: true }).hasText === true);
  check("A clean answer passes",
    ART.interpretTextCheck({ hasReadableText: false, hasLogo: false }).hasText === false);

  /* A transport failure is a failure, not a silent success. */
  const ioFail = fakeIo({ failGenerate: true });
  const runFail = await ART.generate(pkg, guide, ioFail, { packageId: pkg.id, manifest });
  check("A transport failure marks the frames FAILED",
    runFail.patch.slides.every(s => s.art.status === "FAILED"));
  check("…records the reason",
    /unavailable/.test(runFail.patch.slides[0].art.error || ""));
  check("…and stores nothing", ioFail.log.storeCalls.length === 0);
  check("…and does not retry by itself",
    ioFail.log.generateCalls.length === plan.length, String(ioFail.log.generateCalls.length));

  /* -------------------------------------------------------------------- */
  section("The exact approved wording is drawn by the renderer");

  const slide = generated.slides.find(s => s.family === "warning") || generated.slides[0];
  const html = T.slideHTML(slide, { index: 0, total: generated.slides.length });

  check("The generated base is used as the picture", /class="b-base"/.test(html));
  (slide.lines || []).forEach((l, i) => {
    check(`Headline piece ${i + 1} appears verbatim`, html.indexOf(T.esc(l.t)) >= 0, l.t);
  });
  (slide.items || []).forEach((it, i) => {
    check(`Label ${i + 1} appears verbatim`, html.indexOf(T.esc(it.label)) >= 0, it.label);
  });

  /* THE SPELLING RULE. A displacement filter on a node containing text mangles
     the letters — an early build turned "Try a dim, quiet room" into "TAY A
     DIM, QUIET ROOM". Backgrounds are filtered; text nodes never are. */
  const css = T.css();
  const filteredTextRule = /\.s-(hl-l|ctaline|sub)\s*\{[^}]*filter:/.test(css);
  check("No filter is applied to a headline, subtitle or CTA text node", !filteredTextRule);
  check("Chip text is a separate node from the filtered background",
    /\.c-bg\{[^}]*position:absolute/.test(css.replace(/\s+/g, "")) ||
    /\.c-bg\s*\{[^}]*position:absolute/.test(css));
  const chipHtml = T.chip("s-lab", "orange", "Try a dim, quiet room", { bgFilter: "mpcTornFine" });
  check("A painted chip renders its words outside the filtered element",
    /class="c-bg"[^>]*filter:url\(#mpcTornFine\)/.test(chipHtml) &&
    /<span class="c-t">Try a dim, quiet room<\/span>/.test(chipHtml));

  /* Text is HTML-escaped, so an apostrophe in a guide cannot break the page. */
  const risky = T.slideHTML({
    family: "quick-check", variant: "orbit-clues", cast: ["papa", "ari"],
    lines: [{ t: 'Don\'t "push" & <hope>', c: "ink" }], items: []
  }, {});
  check("Wording is escaped rather than injected",
    risky.indexOf("&lt;hope&gt;") >= 0 && risky.indexOf("<hope>") < 0);

  /* -------------------------------------------------------------------- */
  section("The warning survives everything");

  const warnItems = ((guide.panel || {}).warn || {}).items || [];
  if (warnItems.length) {
    const warnSlide = generated.slides.find(s => s.kind === "warn");
    check("A guide with a warning panel gets a warning slide", Boolean(warnSlide));
    check("…in the warning family", warnSlide && warnSlide.family === "warning");
    check("…which cannot be removed", warnSlide && warnSlide.optional === false);
    check("…and carries the guide's own conditions",
      warnSlide && warnSlide.items.every(it =>
        warnItems.some(w => w.toLowerCase().indexOf(it.label.toLowerCase().replace(/…$/, "")) >= 0 ||
                            it.label.toLowerCase().indexOf(w.toLowerCase()) >= 0)),
      warnSlide && warnSlide.items.map(i => i.label).join(" | "));
    check("…and says when there are more than fit",
      warnSlide && (warnItems.length <= 3 || warnSlide.truncatedItems > 0));

    const stripped = clone(generated);
    stripped.slides = stripped.slides.filter(s => s.kind !== "warn");
    stripped.story.frames = stripped.story.frames.filter(f => f.kind !== "warn");
    const findings = Safety.lintPackage(stripped, guide);
    check("Dropping it is an error",
      findings.some(f => f.code === "dropped-warning" && f.level === "error"));
  } else {
    check("This guide has no warning panel to preserve", true);
  }

  /* -------------------------------------------------------------------- */
  section("Approval covers the artwork, not just the words");

  const approvable = Object.assign({}, generated, { status: CFG.STATES.NEEDS_REVIEW });
  const baseHash = H.contentHash(approvable);

  const mutations = {
    "the rendered asset":      p => { p.slides[0].art.assetPath = "social/pkg-test-1/slide-01-other.png"; },
    "a reference id":          p => { p.slides[0].art.referenceIds[0] = "poster-dont"; },
    "the manifest version":    p => { p.slides[0].art.manifestVersion = "messy-parents-refs-v99"; },
    "the prompt version":      p => { p.slides[0].art.promptVersion = "mpc-social-art-v99"; },
    "the image model":         p => { p.slides[0].art.imageModel = "some-other-model"; },
    "a layout variant":        p => { p.slides[0].variant = "detail-crop"; },
    "the destination":         p => { p.destination = "instagram"; },
    "the Facebook URL":        p => { p.destinationUrlFacebook += "&x=1"; },
    "the Instagram caption":   p => { p.platforms.instagram.caption += " Extra."; },
    "the Facebook caption":    p => { p.platforms.facebook.caption += " Extra."; },
    "a slide label":           p => { p.slides[2] && p.slides[2].items[0] && (p.slides[2].items[0].label = "Changed"); },
    "a headline colour":       p => { p.slides[0].lines[0].c = "red"; },
    "the slide order":         p => { p.slides.reverse(); },
    "a story frame":           p => { p.story.frames[0].lines[0].t = "Different"; },
    "the logo on a slide":     p => { p.slides[0].logo = !p.slides[0].logo; }
  };
  Object.keys(mutations).forEach(name => {
    const m = clone(approvable);
    mutations[name](m);
    check(`Changing ${name} invalidates the approval`, H.contentHash(m) !== baseHash);
  });

  const metadataOnly = clone(approvable);
  metadataOnly.updatedAt = "2026-09-01T00:00:00Z";
  metadataOnly.updatedBy = "someone@example.com";
  metadataOnly.validation = [{ level: "warn", code: "x", message: "y" }];
  metadataOnly.artwork = Object.assign({}, metadataOnly.artwork, { updatedAt: "later" });
  check("Bookkeeping does not invalidate it", H.contentHash(metadataOnly) === baseHash);

  /* And the real path: regenerating artwork on an approved package. */
  const held = clone(approvable);
  held.status = CFG.STATES.APPROVED_HELD;
  held.approvedHash = H.contentHash(approvable);
  check("An untouched approved package still matches", H.hashMatches(held) === true);
  const reArt = clone(held);
  reArt.slides[0].art.assetPath = "social/pkg-test-1/slide-01-regenerated.png";
  check("Regenerating its artwork breaks the match", H.hashMatches(reArt) === false);

  /* -------------------------------------------------------------------- */
  section("Validation understands posters");

  const clean = V.validatePackage(generated).filter(f => f.level === "error");
  check("A generated package has no blocking errors", clean.length === 0,
    clean.map(f => f.code + ": " + f.message).join(" · "));

  const tooMany = clone(generated);
  const clueSlide = tooMany.slides.findIndex(s => (s.items || []).length);
  if (clueSlide >= 0) {
    tooMany.slides[clueSlide].items = tooMany.slides[clueSlide].items.concat([
      { label: "Five", icon: "" }, { label: "Six", icon: "" }, { label: "Seven", icon: "" }
    ]).slice(0, 7);
    check("More than four labels on a slide is an error",
      V.validatePackage(tooMany).some(f => f.code === "too-many-labels" && f.level === "error"));
  }

  const badLogo = clone(generated);
  const internal = badLogo.slides.findIndex(s => REFS.LOGO_FAMILIES.indexOf(s.family) < 0);
  if (internal >= 0) {
    badLogo.slides[internal].logo = true;
    check("The logo on an internal slide is an error",
      V.validatePackage(badLogo).some(f => f.code === "logo-restraint" && f.level === "error"));
  }

  const wrongSize = clone(generated);
  wrongSize.slides[0].art.width = 1200;
  check("Artwork that is not the platform size is an error",
    V.validatePackage(wrongSize).some(f => f.code === "artwork-size" && f.level === "error"));

  const strayPkg = clone(generated);
  strayPkg.slides[0].art.strayText = true;
  strayPkg.slides[0].art.assetPath = "social/pkg-test-1/x.png";
  check("Artwork rejected for lettering is an error",
    V.validatePackage(strayPkg).some(f => f.code === "artwork-stray-text" && f.level === "error"));

  const noFbLink = clone(generated);
  noFbLink.platforms.facebook.link = "Link in bio";
  check("Facebook without a clickable URL is an error",
    V.validatePackage(noFbLink).some(f => f.code === "facebook-link" && f.level === "error"));

  /* -------------------------------------------------------------------- */
  section("Only supported slides are generated");

  const bare = {
    id: "bare", slug: "bare", title: "Is this a question?", url: "/guides/bare/",
    topic: "sleeping", ages: [], summary: "", panel: { quick: "A quick answer." }
  };
  const barePkg = C.composePackage(bare, { topics: [] });
  check("A guide with only a quick answer gets three slides",
    barePkg.slides.length === 3, barePkg.slides.map(s => s.family).join(","));
  check("…and no what-helped-us slide",
    !barePkg.slides.some(s => s.family === "what-helped-us"));
  check("…and no warning slide", !barePkg.slides.some(s => s.family === "warning"));
  check("…and no don't slide", !barePkg.slides.some(s => s.family === "dont"));
  check("Nothing is padded to fill the families",
    barePkg.slides.length < REFS.FAMILIES.length);
  check("No carousel exceeds Instagram's limit",
    Sel.eligibleGuides(loaded).every(g =>
      C.composePackage(g, { topics: loaded.topics }).slides.length <= CFG.MAX_SLIDES));

  const helpedOnlyFromPanel = Sel.eligibleGuides(loaded).every(g => {
    const p = C.composePackage(g, { topics: loaded.topics });
    const s = p.slides.find(x => x.family === "what-helped-us");
    if (!s) return true;
    const src = ((g.panel || {}).helped || {}).items || [];
    return s.items.every(it => src.some(x =>
      String(x).toLowerCase().indexOf(String(it.label).toLowerCase()) >= 0 ||
      String(it.label).toLowerCase().indexOf(String(x).toLowerCase()) >= 0));
  });
  check("“What helped us” only ever uses panel.helped.items", helpedOnlyFromPanel);

  /* -------------------------------------------------------------------- */
  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed`);
  if (failures.length) { console.log("\nFailures:"); failures.forEach(f => console.log("  ✗ " + f)); }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
