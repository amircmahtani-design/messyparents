#!/usr/bin/env node
/* ============================================================================
   THE EXPORT IS THE EXACT PLATFORM SIZE

   Run with: node tests/social-output.js   (part of npm run verify:social)

   Two halves, because half of this can be checked without a browser and half
   of it cannot.

   WITHOUT A BROWSER: the declared sizes. Instagram crops a carousel to the
   aspect ratio of its FIRST image, so a slide that is not 4:5 does not fail —
   it silently mangles every other slide in the set. And a Story that is not
   9:16 gets letterboxed. Those numbers live in exactly two places (config.js
   and templates.js) and this asserts they agree, in both.

   WITH A BROWSER: the actual rendered pixels, and whether the WORDS fall
   inside the frame and inside the Story safe zones. Playwright is a
   devDependency; when it is genuinely not installed this half reports that it
   was skipped rather than passing quietly, because a size check that silently
   does not run is worse than no size check.
   ========================================================================== */

const path = require("path");
const fs = require("fs");
const ROOT = path.resolve(__dirname, "..");

const T = require("../scripts/lib/social/templates");
const C = require("../scripts/lib/social/compose");
const D = require("../scripts/lib/data");
const Sel = require("../scripts/lib/social/select");
const { FORMATS } = require("../scripts/lib/social/config");

let pass = 0, fail = 0, skipped = 0; const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ✓ " + name); return true; }
  fail++; failures.push(detail ? `${name} — ${detail}` : name);
  console.log("  ✗ " + name + (detail ? ` — ${detail}` : ""));
  return false;
}
const skip = (name, why) => { skipped++; console.log("  – " + name + " (skipped: " + why + ")"); };
const section = (t) => console.log("\n" + t + "\n" + "-".repeat(t.length));

/* ---------------------------------------------------------------------- */
section("The declared sizes");

check("The carousel format is 1080×1350",
  FORMATS.carousel.width === 1080 && FORMATS.carousel.height === 1350);
check("…which is 4:5", FORMATS.carousel.ratio === "4:5" &&
  Math.abs(FORMATS.carousel.width / FORMATS.carousel.height - 0.8) < 1e-9);
check("The story format is 1080×1920",
  FORMATS.story.width === 1080 && FORMATS.story.height === 1920);
check("…which is 9:16", FORMATS.story.ratio === "9:16" &&
  Math.abs(FORMATS.story.width / FORMATS.story.height - 0.5625) < 1e-9);
check("The reel format matches the story format",
  FORMATS.reel.width === FORMATS.story.width && FORMATS.reel.height === FORMATS.story.height);

check("The renderer agrees with config about the carousel",
  T.SIZE.carousel.width === FORMATS.carousel.width &&
  T.SIZE.carousel.height === FORMATS.carousel.height);
check("The renderer agrees with config about the story",
  T.SIZE.story.width === FORMATS.story.width &&
  T.SIZE.story.height === FORMATS.story.height);

const css = T.css();
check("The stylesheet sets 1080×1350 on a slide",
  /width:1080px;\s*height:1350px/.test(css));
check("…and 1080×1920 on a story", /\.is-story\{\s*width:1080px;\s*height:1920px/.test(css));

check("The Story safe area keeps words clear of Instagram's furniture",
  T.SAFE.story.top >= 250 && T.SAFE.story.bottom >= 250,
  JSON.stringify(T.SAFE.story));

/* ---------------------------------------------------------------------- */
(async () => {
  section("The rendered pixels");

  let chromium = null;
  try { ({ chromium } = require("playwright")); }
  catch (e) { try { ({ chromium } = require("@playwright/test")); } catch (e2) { chromium = null; } }

  if (!chromium) {
    skip("Rendering at full size", "playwright is not installed — run `npm install`");
    return finish();
  }

  const loaded = await D.load();
  const guide = (loaded.guides || []).find(g => g.slug === "drinking-less-milk") ||
                Sel.eligibleGuides(loaded)[0];
  const pkg = C.composePackage(guide, { topics: loaded.topics });

  /* Fonts and images inlined, for the same reason scripts/social-render.js
     does it: setContent() gives the page an opaque origin. */
  const FONT_DIR = path.join(ROOT, "assets/fonts");
  const tokensCss = fs.readFileSync(path.join(ROOT, "assets/css/tokens.css"), "utf8")
    .replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (whole, file) => {
      const full = path.join(FONT_DIR, file);
      return fs.existsSync(full)
        ? `url("data:font/woff2;base64,${fs.readFileSync(full).toString("base64")}")` : whole;
    });
  const MIME = { ".png": "image/png", ".jpg": "image/jpeg" };
  const uri = (p) => {
    const full = path.join(ROOT, String(p).replace(/^\//, ""));
    if (!fs.existsSync(full)) return null;
    return `data:${MIME[path.extname(full).toLowerCase()] || "application/octet-stream"};base64,` +
      fs.readFileSync(full).toString("base64");
  };
  const images = {};
  [T.BRAND.logo, T.BRAND.paper].concat(Object.keys(T.CHARACTERS).map(k => T.CHARACTERS[k].src))
    .forEach(p => { const u = uri(p); if (u) images[p] = u; });
  const assets = { images };
  const paperUri = images[T.BRAND.paper];

  const browser = await chromium.launch();

  async function measure(html, format) {
    const page = await browser.newPage({
      viewport: { width: format.width, height: format.height }, deviceScaleFactor: 1
    });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(120);
    const out = await page.evaluate(() => {
      const el = document.querySelector(".mpc-slide");
      const box = el.getBoundingClientRect();
      let worst = 0;
      const nodes = el.querySelectorAll(
        ".s-hl-l, .s-kicker, .s-lab, .s-band, .s-sub, .s-pill, .s-ctaline, .s-num, .s-more, .s-disc");
      let topMost = Infinity, bottomMost = -Infinity;
      nodes.forEach(n => {
        const r = n.getBoundingClientRect();
        if (!r.width && !r.height) return;
        worst = Math.max(worst, r.bottom - box.bottom, r.right - box.right,
          box.top - r.top, box.left - r.left);
        topMost = Math.min(topMost, r.top - box.top);
        bottomMost = Math.max(bottomMost, r.bottom - box.top);
      });
      return {
        w: Math.round(box.width), h: Math.round(box.height),
        overflow: Math.round(Math.max(0, worst)),
        topMost: Math.round(topMost), bottomMost: Math.round(bottomMost),
        wordCount: nodes.length
      };
    });
    const shot = await page.screenshot({ type: "jpeg", quality: 90 });
    await page.close();
    return { out, shot };
  }

  /* Carousel */
  for (let i = 0; i < pkg.slides.length; i++) {
    const html = T.documentHTML(
      T.slideHTML(pkg.slides[i], { assets, index: i, total: pkg.slides.length }),
      { tokensCss, paperUri, title: "s" + i });
    const { out, shot } = await measure(html, FORMATS.carousel);
    check(`Slide ${i + 1} (${pkg.slides[i].family}) renders at 1080×1350`,
      out.w === 1080 && out.h === 1350, `${out.w}×${out.h}`);
    check(`…with every word inside the frame`, out.overflow === 0, `${out.overflow}px outside`);
    check(`…and words on it at all`, out.wordCount > 0, String(out.wordCount));
    /* JPEG magic bytes: FF D8 FF at the start, FF D9 at the end. */
    check(`…exported as a real JPEG`,
      shot[0] === 0xFF && shot[1] === 0xD8 && shot[2] === 0xFF &&
      shot[shot.length - 2] === 0xFF && shot[shot.length - 1] === 0xD9);
  }

  /* Story */
  const frames = (pkg.story && pkg.story.frames) || [];
  for (let i = 0; i < frames.length; i++) {
    const html = T.documentHTML(T.storyHTML(frames[i], { assets }),
      { tokensCss, paperUri, title: "f" + i });
    const { out, shot } = await measure(html, FORMATS.story);
    check(`Story frame ${i + 1} renders at 1080×1920`,
      out.w === 1080 && out.h === 1920, `${out.w}×${out.h}`);
    check(`…with every word inside the frame`, out.overflow === 0, `${out.overflow}px outside`);
    check(`…clear of the top overlay`, out.topMost >= T.SAFE.story.top - 60,
      `first word at ${out.topMost}px, overlay is ${T.SAFE.story.top}px`);
    check(`…clear of the reply bar`,
      out.bottomMost <= FORMATS.story.height - (T.SAFE.story.bottom - 60),
      `last word at ${out.bottomMost}px of ${FORMATS.story.height}`);
    check(`…exported as a real JPEG`,
      shot[0] === 0xFF && shot[1] === 0xD8 && shot[shot.length - 1] === 0xD9);
  }

  await browser.close();
  finish();
})().catch(e => { console.error(e); process.exit(1); });

function finish() {
  console.log("\n" + "=".repeat(60));
  console.log(`${pass} passed, ${fail} failed${skipped ? `, ${skipped} skipped` : ""}`);
  if (failures.length) { console.log("\nFailures:"); failures.forEach(f => console.log("  ✗ " + f)); }
  console.log("=".repeat(60));
  process.exit(fail ? 1 : 0);
}
