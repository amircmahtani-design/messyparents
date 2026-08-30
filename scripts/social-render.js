#!/usr/bin/env node
/* ============================================================================
   SOCIAL — RENDER SLIDES TO IMAGE FILES

   Usage:
     node scripts/social-render.js                       every eligible guide
     node scripts/social-render.js sleep-regression      one guide
     node scripts/social-render.js --limit 5 --png       five, plus PNG copies

   Output goes to social-preview/<slug>/ , which is git-ignored working space,
   not part of the site.

   FORMAT. JPEG is written always, because JPEG is the only image format
   Instagram's publishing API accepts. PNG is written only with --png, only as
   a lossless copy for looking at on a laptop, and nothing in the publishing
   path ever reads one. See scripts/lib/social/config.js PUBLISH_IMAGE_FORMAT.

   This script also does the one check that cannot be done without a browser:
   it measures whether the words fit inside the slide, and reports every slide
   that overflows. It writes no Firestore document and makes no network call.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const D = require("./lib/data");
const Sel = require("./lib/social/select");
const C = require("./lib/social/compose");
const T = require("./lib/social/templates");
const V = require("./lib/social/validate");
const Safety = require("./lib/social/safety");
const { FORMATS } = require("./lib/social/config");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "social-preview");

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const slugs = argv.filter(a => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--limit");

async function main() {
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch (e) {
    try { ({ chromium } = require("@playwright/test")); }
    catch (e2) {
      console.error("Playwright is not installed. `npm install` first — it is already a devDependency.");
      process.exit(2);
    }
  }

  const loaded = await D.load();
  console.log(`Guides: ${loaded.guides.length} (source: ${loaded.source})`);
  loaded.warnings.forEach(w => console.log("  ! " + w));

  let guides = Sel.eligibleGuides(loaded);
  if (slugs.length) guides = guides.filter(g => slugs.includes(g.slug));
  const limit = Number(opt("--limit", 0));
  if (limit) guides = Sel.spreadTopics(guides).slice(0, limit);

  if (!guides.length) { console.error("No matching eligible guides."); process.exit(1); }

  fs.mkdirSync(OUT, { recursive: true });

  /* tokens.css with the three faces EMBEDDED as data URIs.

     setContent() gives the page an opaque origin, from which a file:// font
     will not load — and a font that silently falls back is the kind of bug
     that only shows up once the JPEGs are already on Instagram. Embedding the
     .woff2 files removes the question. They total about 150KB and are read
     once for the whole run. */
  const FONT_DIR = path.join(ROOT, "assets/fonts");
  const tokensCss = fs.readFileSync(path.join(ROOT, "assets/css/tokens.css"), "utf8")
    .replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (whole, file) => {
      const full = path.join(FONT_DIR, file);
      if (!fs.existsSync(full)) return whole;
      return `url("data:font/woff2;base64,${fs.readFileSync(full).toString("base64")}")`;
    });

  const browser = await chromium.launch();
  const report = [];

  for (const guide of guides) {
    const pkg = C.composePackage(guide, { topics: loaded.topics });
    const dir = path.join(OUT, guide.slug);
    fs.mkdirSync(dir, { recursive: true });

    const findings = V.validatePackage(pkg).concat(Safety.lintPackage(pkg, guide));
    const overflow = [];

    /* Carousel */
    for (let i = 0; i < pkg.slides.length; i++) {
      const html = T.documentHTML(
        T.slideHTML(pkg.slides[i], { index: i, total: pkg.slides.length }),
        { title: `${guide.slug} ${i + 1}`, tokensCss }
      );
      const of = await shoot(browser, html, FORMATS.carousel, path.join(dir, `slide-${String(i + 1).padStart(2, "0")}`));
      if (of) overflow.push({ level: "error", code: "overflow", message: `Slide ${i + 1} overflows by ${of}px.` });
    }

    /* Story */
    const frames = (pkg.story && pkg.story.frames) || [];
    for (let i = 0; i < frames.length; i++) {
      const html = T.documentHTML(T.storyHTML(frames[i]), { title: `${guide.slug} story ${i + 1}`, tokensCss });
      const of = await shoot(browser, html, FORMATS.story, path.join(dir, `story-${String(i + 1).padStart(2, "0")}`));
      if (of) overflow.push({ level: "error", code: "overflow", message: `Story frame ${i + 1} overflows by ${of}px.` });
    }

    const all = findings.concat(overflow);
    fs.writeFileSync(path.join(dir, "package.json"),
      JSON.stringify(Object.assign({}, pkg, { validation: all }), null, 2));

    const errs = all.filter(f => f.level === "error").length;
    console.log(`${errs ? "✗" : "✓"} ${guide.slug} — ${pkg.slides.length} slides, ${frames.length} story frames` +
      (errs ? `, ${errs} error(s)` : ""));
    all.filter(f => f.level === "error").forEach(f => console.log("    ✗ " + f.message + (f.detail ? ` [${f.detail}]` : "")));
    report.push({ slug: guide.slug, slides: pkg.slides.length, errors: errs });
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

  const bad = report.filter(r => r.errors).length;
  console.log(`\n${report.length} package(s) rendered into social-preview/. ${bad ? bad + " with errors." : "No errors."}`);
  process.exit(bad ? 1 : 0);
}

/* Screenshot one slide and report overflow in pixels (0 = fits). */
async function shoot(browser, html, format, outBase) {
  const page = await browser.newPage({
    viewport: { width: format.width, height: format.height },
    deviceScaleFactor: 1
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(120);

  const overflow = await page.evaluate(() => {
    const el = document.querySelector(".mpc-slide");
    if (!el) return 0;
    let worst = Math.max(0, el.scrollHeight - el.clientHeight, el.scrollWidth - el.clientWidth);
    el.querySelectorAll("*").forEach(n => {
      const r = n.getBoundingClientRect();
      if (r.bottom > el.clientHeight + 1) worst = Math.max(worst, Math.round(r.bottom - el.clientHeight));
      if (r.right > el.clientWidth + 1) worst = Math.max(worst, Math.round(r.right - el.clientWidth));
    });
    return worst;
  });

  await page.screenshot({ path: outBase + ".jpg", type: "jpeg", quality: 92 });
  if (flag("--png")) await page.screenshot({ path: outBase + ".png", type: "png" });
  await page.close();
  return overflow;
}

main().catch(e => { console.error(e); process.exit(1); });
