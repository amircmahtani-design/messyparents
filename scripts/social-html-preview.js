#!/usr/bin/env node
/* Export self-contained HTML previews without Playwright or a Meta connection.
   This is intentionally separate from social-render.js: it gives an integrator
   a zero-setup way to inspect the exact deterministic layouts in any browser. */
const fs = require("fs");
const path = require("path");
const D = require("./lib/data");
const { attachLongform } = require("./lib/social/guides");
const Sel = require("./lib/social/select");
const C = require("./lib/social/compose");
const T = require("./lib/social/templates");
const Icons = require("./lib/social/icons");
const { BRAND } = require("./lib/social/art");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "social-preview-html");
const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const requested = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--limit");
const mime = (file) => ({ ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" }[path.extname(file).toLowerCase()] || "application/octet-stream");
const dataUri = (rel) => {
  const full = path.join(ROOT, rel.replace(/^\//, ""));
  return fs.existsSync(full) ? `data:${mime(full)};base64,${fs.readFileSync(full).toString("base64")}` : "";
};

async function main() {
  const loaded = await D.load();
  try {
    const raw = require("../data/guides-bundle.js").GUIDES || [];
    const byId = new Map(raw.map(g => [g.id, g]));
    loaded.guides = loaded.guides.map(g => attachLongform(g, byId.get(g.id)));
  } catch (_) {}

  let guides = Sel.eligibleGuides(loaded);
  if (requested.length) guides = guides.filter(g => requested.includes(g.slug));
  const limit = Number(opt("--limit", 5));
  guides = Sel.spreadTopics(guides).slice(0, limit || guides.length);
  if (!guides.length) throw new Error("No matching eligible guides.");

  const tokensCss = fs.readFileSync(path.join(ROOT, "assets/css/tokens.css"), "utf8")
    .replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (_, file) => dataUri(`assets/fonts/${file}`));
  const images = {};
  Object.values(BRAND).forEach(rel => { const uri = dataUri(rel); if (uri) images[rel] = uri; });
  const assets = {
    logo: dataUri("assets/img/logo.webp"), images,
    icons: Icons.FILES.reduce((o, f) => (o[f] = dataUri(`assets/img/social-icons/${f}.png`), o), {})
  };
  const paper = dataUri("assets/img/paper.jpg");
  fs.mkdirSync(OUT, { recursive: true });

  for (const guide of guides) {
    const pkg = C.composePackage(guide, { topics: loaded.topics });
    const cards = pkg.slides.map((slide, i) => T.slideHTML(slide, {
      index: i, total: pkg.slides.length, assets
    })).join("\n");
    const stories = (pkg.story.frames || []).map(frame => T.storyHTML(frame, { assets })).join("\n");
    const shell = `<style>body{margin:0;padding:42px;background:#d9d2c4;display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start}.mpc-slide{transform-origin:top left}</style><main>${cards}${stories}</main>`;
    const html = T.documentHTML(shell, { title: `${guide.title} — social preview`, tokensCss, paper });
    fs.writeFileSync(path.join(OUT, `${guide.slug}.html`), html);
    fs.writeFileSync(path.join(OUT, `${guide.slug}.json`), JSON.stringify(pkg, null, 2));
    console.log(`✓ ${guide.slug}: ${pkg.slides.length} carousel slides, ${(pkg.story.frames || []).length} story frames`);
  }
  console.log(`Open social-preview-html/*.html in a browser. No API or publishing connection is used.`);
}

main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
