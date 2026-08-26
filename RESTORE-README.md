# Put the site back to exactly how it was

These 21 files are the **pristine originals**, taken from the zip you sent me.
I verified that zip is byte-identical to the version I started from, so
uploading these returns your repo to the state it was in before any of my work.

## Upload all 21, overwriting

```
index.html          guides.html         popular.html
about.html          books.html          editorial.html
404.html            guide.html

_headers            robots.txt          package.json
scripts/build.js    scripts/lib/data.js
studio/index.html   editor/index.html
tests/verify.js     SEO_AI_ARCHITECTURE.md

assets/js/guides.js         <- these four were DELETED. They must come back.
assets/js/mpc-store.js
assets/js/guide-page.js
assets/js/mpcstore.js
```

The last four matter most. If they are missing while the old HTML is in place,
every page loads `assets/js/guides.js` and gets a 404 — no guides, no grids, no
guide pages. That is a completely dead site, and it is the most likely reason
"nothing is working".

## Then delete these, if you uploaded them

They are unreferenced by the original HTML, so they are harmless if left. Delete
them only to keep the repo tidy:

```
.gitignore                      <- delete this one. It tells Git to ignore
                                   _redirects, which your original build needs
                                   to stay tracked.
UPLOAD-TO-GITHUB.md
assets/js/mpc-runtime.js        assets/js/mpc-catalogue.js
assets/js/guide.js              assets/js/home.js
assets/js/guides-search.js      assets/js/popular.js
assets/js/mpc-preview.js        data/guides-bundle.js
scripts/lib/bake.js             scripts/lib/publicdata.js
scripts/migrate-pages.js
tests/dom-stub.js               tests/runtime-sim.js
tests/scale-test.js
```

## Then check it in a private window

**Not a normal tab.** Chrome caches `301` redirects, and the broken deploy sent
a permanent redirect from `/guides/<slug>/` to itself. Your browser will keep
following its cached copy of that redirect and never ask the server again — so
the site can be fully fixed and still look broken to you.

Open an Incognito window (Ctrl+Shift+N) and try
`themessyparentscollection.com/guides/drinking-less-milk/`.

- **Works in Incognito, broken in your normal tab** -> the site is fine; it is
  your cached redirect. Clear it: `chrome://settings/clearBrowserData` ->
  Cached images and files.
- **Broken in both** -> the deploy itself is still wrong. Send me the Netlify
  build log.
