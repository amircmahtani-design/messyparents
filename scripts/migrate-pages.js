#!/usr/bin/env node
/* One-off migration: rewrites the <head> resource hints and the script block
   on each hand-written public page. Kept in the repo so the change is
   reviewable, but it is not part of the build. */

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

/* ---- fonts ---------------------------------------------------------------
   Baloo 2 was requested at 600, 700 and 800. Auditing every rule that sets
   font-family:var(--display) against every rule that sets a weight on the same
   selectors: it renders at 700 and nothing else. h1-h4 are explicitly 700;
   .band p, .book-cover-empty span are 700; .article-body h3/h4, .callout h3,
   .book-card h3 and .g-extra h2 are headings and inherit that same 700 rule.
   The only selector that would have picked up another weight is .book-num,
   which no page uses.

   Nunito genuinely needs all four: 400 body, 600 pills and band subtitle,
   700 card meta, 800 buttons, strong and the guide eyebrow.
   Patrick Hand ships in one weight.

   Dropping 600 and 800 turns the Baloo request from a variable font carrying a
   600-800 axis into a single static instance. */
const FONT_OLD = /https:\/\/fonts\.googleapis\.com\/css2\?family=Baloo\+2:wght@600;700;800&family=Patrick\+Hand&family=Nunito:wght@400;600;700;800&display=swap/g;
const FONT_NEW = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Patrick+Hand&family=Nunito:wght@400;600;700;800&display=swap";

/* ---- resource hints ------------------------------------------------------
   Every page opened a connection to firebasestorage.googleapis.com. Nothing
   fetches from it. Studio-uploaded illustrations are rewritten to
   /.netlify/images?url=... — Netlify's image CDN, on this origin — by both
   MPCStore.img() and guide-render.js. The original Firebase URL is only ever
   used by the <img> onerror fallback, i.e. when the CDN has already failed.

   So this was a DNS lookup, a TCP connection and a TLS handshake, on every
   page, for a host the page never talks to. Removed. */
const PRECONNECT_FB = /\n?<!--[^>]*?Firebase Storage[\s\S]*?-->\n?<link rel="preconnect" href="https:\/\/firebasestorage\.googleapis\.com" crossorigin>|<link rel="preconnect" href="https:\/\/firebasestorage\.googleapis\.com" crossorigin>\n?/g;

const RUNTIME = (p) => `<script src="${p}assets/js/mpc-runtime.js" defer></script>`;
const CATALOGUE = (p) => `<script src="${p}assets/js/mpc-catalogue.js" defer></script>`;

/* The old block, in each of the shapes it appears in. */
const OLD_BLOCK = /<script src="([^"]*)assets\/js\/firebase-config\.js"><\/script>\s*(?:<!--[\s\S]*?-->\s*)?<script src="[^"]*assets\/js\/guides\.js\?v=\d+"><\/script>\s*(?:<!--[\s\S]*?-->\s*)?(?:<script src="[^"]*assets\/js\/guide-render\.js\?v=\d+"><\/script>\s*)?<script src="[^"]*assets\/js\/mpc-store\.js\?v=\d+"><\/script>/;

const YEAR_SCRIPT = /<script>\/\* The Studio-edited copyright line writes its own year[\s\S]*?<\/script>\n?/;

const files = {
  "index.html":     { scripts: ["runtime", "catalogue"] },
  "guides.html":    { scripts: ["runtime", "catalogue"] },
  "popular.html":   { scripts: ["runtime", "catalogue"] },
  "about.html":     { scripts: ["runtime"] },
  "books.html":     { scripts: ["runtime"] },
  "editorial.html": { scripts: ["runtime"] },
  "404.html":       { scripts: ["runtime"] },
  "guide.html":     { scripts: ["runtime", "guide"] }
};

for (const [file, cfg] of Object.entries(files)) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { console.log("skip (missing):", file); continue; }
  let html = fs.readFileSync(full, "utf8");
  const before = html;

  html = html.replace(FONT_OLD, FONT_NEW);
  html = html.replace(PRECONNECT_FB, "");

  const m = OLD_BLOCK.exec(html);
  const prefix = m ? m[1] : (file === "editorial.html" || file === "guide.html" ? "/" : "");

  const tags = cfg.scripts.map((s) => {
    if (s === "runtime") return RUNTIME(prefix);
    if (s === "catalogue") return CATALOGUE(prefix);
    if (s === "guide") return `<script src="${prefix}assets/js/guide.js" defer></script>`;
    return "";
  }).join("\n");

  if (m) {
    html = html.replace(OLD_BLOCK, tags);
  } else {
    console.log("  ! script block not matched in", file);
  }

  /* The year is now handled inside mpc-runtime.js. */
  html = html.replace(YEAR_SCRIPT, "");
  html = html.replace(
    /<script>\nvar _y=document\.getElementById\("year"\); if\(_y\) _y\.textContent=new Date\(\)\.getFullYear\(\);\n/,
    "<script>\n");

  if (html !== before) {
    fs.writeFileSync(full, html);
    console.log("updated:", file);
  } else {
    console.log("unchanged:", file);
  }
}
