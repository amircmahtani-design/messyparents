# What to upload

Generated output (`/guides/`, `/topics/`, `/ages/`, `sitemap.xml`, `llms.txt`,
`seo-audit.html`, `/test-results/`) is **not** in the zip. Netlify regenerates
all of it on every deploy. Committing it would leave a renamed guide's old page
behind as a stale file competing with the redirect that replaced it.

## New files
```
scripts/build.js
scripts/lib/site.js
scripts/lib/data.js
scripts/lib/head.js
scripts/lib/audit.js
assets/js/guide-render.js     shared by the build AND the browser
assets/js/guide-page.js
assets/css/guide.css          extracted from guide.html, unchanged
editorial.html                new page: how the guides get written
tests/verify.js
_redirects                    the FALLBACK copy — see note below
.gitignore
SEO_AI_ARCHITECTURE.md
CHANGED-FILES.md
```

## Modified files
```
guide.html                    now also the page template
guides.html                   prefilter + baked grid + browse-links marker
index.html                    baked grid
popular.html                  baked grids
about.html  books.html  404.html    footer link + head block
assets/js/guides.js           clean URLs, absolute icon paths, grid helper
assets/js/mpc-store.js        absolute topic-icon paths
assets/css/style.css          footer link styles (7 lines appended)
studio/index.html             Search & sharing panel + Search & AI section
netlify.toml                  build command, pretty_urls off
_headers                      cache + X-Robots-Tag for the new paths
package.json                  build / verify / check scripts
tests/audit-core.js           new pages added to the crawl
```

## Unchanged
No guide copy was edited. No illustration was touched. No design was changed.
`data/guides.json`, `seed.js`, `firestore.rules`, `storage.rules`, the Editor
and the Netlify functions are all as they were.

## About `_redirects`
The copy in the zip is the **fallback**: it keeps every clean URL working if the
build step ever fails to run. The build overwrites it at deploy time with the
full map. Upload it as-is and let Netlify replace it.

## First deploy
1. Upload, deploy, and read the deploy log. It reports how many guides it found
   and whether they came from Firestore or the bundled copy.
2. If it says "bundled", the build could not reach Firestore. Pages will be
   correct but frozen — worth investigating, not urgent.
3. Check `https://themessyparentscollection.com/seo-audit.html` (private).
4. Run `npm test` once — the browser-level audit is the one check that could
   not be run here.
