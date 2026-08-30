#!/usr/bin/env node
/* ============================================================================
   SOCIAL — RENDER A PACKAGE TO IMAGE FILES

   Usage:
     node scripts/social-render.js                     every eligible guide
     node scripts/social-render.js drinking-less-milk   one guide
     node scripts/social-render.js --limit 5 --png      five, plus PNG copies

   Output goes to social-preview/<slug>/ , which is git-ignored working space,
   not part of the site.

   FORMAT. JPEG is written always, because JPEG is the only image format
   Instagram's publishing API accepts. PNG is written only with --png, only as
   a lossless copy for looking at on a laptop, and nothing in the publishing
   path ever reads one. See scripts/lib/social/config.js PUBLISH_IMAGE_FORMAT.

   ---------------------------------------------------------------------------
   THE OPAQUE ORIGIN PROBLEM, AND WHY EVERYTHING IS INLINED

   Playwright's setContent() gives the page an about:blank URL. Nothing
   root-absolute resolves from there: not /assets/css/tokens.css, not the three
   .woff2 faces, not the character cutouts, not the paper grain. A page that
   silently loses its fonts still renders — in Trebuchet, at the wrong size,
   with the layout subtly wrong — and that is the kind of failure that is only
   noticed once the JPEGs exist.

   So every byte the renderer needs is read from disk here and handed to
   templates.js as a data: URI through ctx.assets.images. The dashboard, which
   is a real page on a real origin, passes the real paths instead. Same code,
   same layout, same pixels.

   ---------------------------------------------------------------------------
   THIS SCRIPT MAKES NO NETWORK CALL AND WRITES NO FIRESTORE DOCUMENT.

   It does the one check that cannot be done without a browser: measuring
   whether the words fall outside the slide, and reporting every one that does.
   Artwork generation is a separate, server-side, authenticated concern — see
   netlify/functions/social-artwork.js.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const D = require("./lib/data");
const Sel = require("./lib/social/select");
const C = require("./lib/social/compose");
const T = require("./lib/social/templates");
const V = require("./lib/social/validate");
const Safety = require("./lib/social/safety");
const REFS = require("./lib/social/refs");
const { FORMATS } = require("./lib/social/config");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "social-preview");

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const slugs = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--limit" && argv[i - 1] !== "--out");

/* --------------------------------------------------------------------------
   ASSETS AS DATA URIs
   ------------------------------------------------------------------------ */
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

function dataUri(sitePath) {
  const full = path.join(ROOT, String(sitePath).replace(/^\//, ""));
  if (!fs.existsSync(full)) return null;
  const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
  return `data:${mime};base64,${fs.readFileSync(full).toString("base64")}`;
}

/* Everything templates.js might ask for, resolved once for the whole run. */
function buildAssetMap() {
  const images = {};
  const want = [T.BRAND.logo, T.BRAND.paper];
  Object.keys(T.CHARACTERS).forEach(k => want.push(T.CHARACTERS[k].src));
  want.forEach(p => {
    const uri = dataUri(p);
    if (uri) images[p] = uri;
    else console.warn("  ! missing render asset: " + p);
  });
  return images;
}

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

  /* The reference manifest has to be readable and complete before anything is
     drawn: a missing poster reference is reported by name rather than quietly
     replaced with a generic design. */
  const manifest = REFS.loadManifest();
  const missing = REFS.missingFiles(manifest);
  console.log(`References: manifest ${manifest.version}, ${manifest.library.length} entries` +
    (missing.length ? `, ${missing.length} MISSING` : ""));
  missing.forEach(m => console.log(`  ! missing reference file for ${m.id}: ${m.expected}`));

  const loaded = await D.load();
  console.log(`Guides: ${loaded.guides.length} (source: ${loaded.source})`);
  loaded.warnings.forEach(w => console.log("  ! " + w));

  let guides = Sel.eligibleGuides(loaded);
  if (slugs.length) guides = guides.filter(g => slugs.includes(g.slug));
  const limit = Number(opt("--limit", 0));
  if (limit) guides = Sel.spreadTopics(guides).slice(0, limit);

  if (!guides.length) { console.error("No matching eligible guides."); process.exit(1); }

  const outDir = path.resolve(ROOT, opt("--out", OUT));
  fs.mkdirSync(outDir, { recursive: true });

  /* tokens.css with the faces EMBEDDED. See the header. */
  const FONT_DIR = path.join(ROOT, "assets/fonts");
  const tokensCss = fs.readFileSync(path.join(ROOT, "assets/css/tokens.css"), "utf8")
    .replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (whole, file) => {
      const full = path.join(FONT_DIR, file);
      if (!fs.existsSync(full)) return whole;
      return `url("data:font/woff2;base64,${fs.readFileSync(full).toString("base64")}")`;
    });

  const images = buildAssetMap();
  const paperUri = images[T.BRAND.paper] || T.BRAND.paper;
  const ctxAssets = { images, logo: T.BRAND.logo, icons: {} };

  const browser = await chromium.launch();
  const report = [];

  for (const guide of guides) {
    const pkg = C.composePackage(guide, { topics: loaded.topics });
    const dir = path.join(outDir, guide.slug);
    fs.mkdirSync(dir, { recursive: true });

    const findings = V.validatePackage(pkg).concat(Safety.lintPackage(pkg, guide));
    const overflow = [];

    /* Carousel */
    for (let i = 0; i < pkg.slides.length; i++) {
      const html = T.documentHTML(
        T.slideHTML(pkg.slides[i], { assets: ctxAssets, index: i, total: pkg.slides.length }),
        { title: `${guide.slug} ${i + 1}`, tokensCss, paperUri }
      );
      const of = await shoot(browser, html, FORMATS.carousel,
        path.join(dir, `slide-${String(i + 1).padStart(2, "0")}-${pkg.slides[i].family}`));
      if (of) overflow.push({ level: "error", code: "overflow",
        message: `Slide ${i + 1} (${pkg.slides[i].family}) has text outside the slide by ${of}px.` });
    }

    /* Story */
    const frames = (pkg.story && pkg.story.frames) || [];
    for (let i = 0; i < frames.length; i++) {
      const html = T.documentHTML(
        T.storyHTML(frames[i], { assets: ctxAssets }),
        { title: `${guide.slug} story ${i + 1}`, tokensCss, paperUri }
      );
      const of = await shoot(browser, html, FORMATS.story,
        path.join(dir, `story-${String(i + 1).padStart(2, "0")}-${frames[i].kind}`));
      if (of) overflow.push({ level: "error", code: "overflow",
        message: `Story frame ${i + 1} has text outside the frame by ${of}px.` });
    }

    const all = findings.concat(overflow);
    fs.writeFileSync(path.join(dir, "package.json"),
      JSON.stringify(Object.assign({}, pkg, { validation: all }), null, 2));
    fs.writeFileSync(path.join(dir, "caption-instagram.txt"), pkg.platforms.instagram.caption);
    fs.writeFileSync(path.join(dir, "caption-facebook.txt"), pkg.platforms.facebook.caption);

    const errs = all.filter(f => f.level === "error").length;
    console.log(`${errs ? "✗" : "✓"} ${guide.slug} — ${pkg.slides.length} slides, ${frames.length} story frames` +
      (errs ? `, ${errs} error(s)` : ""));
    all.filter(f => f.level === "error").forEach(f => console.log("    ✗ " + f.message + (f.detail ? ` [${f.detail}]` : "")));
    report.push({ slug: guide.slug, slides: pkg.slides.length, errors: errs });
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

  const bad = report.filter(r => r.errors).length;
  console.log(`\n${report.length} package(s) rendered into ${path.relative(ROOT, outDir)}/. ${bad ? bad + " with errors." : "No errors."}`);
  process.exit(bad ? 1 : 0);
}

/* Screenshot one frame and report, in pixels, how far the WORDS fall outside
   it (0 = everything fits). The torn sheets, painted bands and character
   cutouts bleed past the edge on purpose, so only the type is measured. */
async function shoot(browser, html, format, outBase) {
  const page = await browser.newPage({
    viewport: { width: format.width, height: format.height },
    deviceScaleFactor: 1
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(160);

  const overflow = await page.evaluate(() => {
    const el = document.querySelector(".mpc-slide");
    if (!el) return 0;
    const box = el.getBoundingClientRect();
    let worst = 0;
    el.querySelectorAll(".s-hl-l, .s-kicker, .s-lab, .s-band, .s-sub, .s-pill, .s-ctaline, .s-num, .s-more, .s-disc")
      .forEach(n => {
        const r = n.getBoundingClientRect();
        if (!r.width && !r.height) return;
        worst = Math.max(worst,
          r.bottom - box.bottom, r.right - box.right,
          box.top - r.top, box.left - r.left);
      });
    return Math.round(Math.max(0, worst));
  });

  await page.screenshot({ path: outBase + ".jpg", type: "jpeg", quality: 92 });
  if (flag("--png")) await page.screenshot({ path: outBase + ".png", type: "png" });
  await page.close();
  return overflow;
}

main().catch(e => { console.error(e); process.exit(1); });
