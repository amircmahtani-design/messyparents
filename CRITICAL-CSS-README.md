# Critical CSS inlined — 26 August 2026

You were right to push back on the fonts. That was a lot of manual work for
round trips, and round trips were never what held FCP at 2.7s. This goes at
FCP directly.

**Self-hosted fonts are reverted.** Nothing in this bundle asks you to
download anything. Round 2 (images, contrast, headings, logo priority) is all
still here.

---

## Upload these 28 files

**New (4):**

    assets/img/family-560.webp   family-800.webp   family-1000.webp
    assets/img/logo-460.webp

**Changed (24):**

    index.html          guides.html        popular.html       about.html
    books.html          editorial.html     404.html           guide.html
    scripts/build.js
    scripts/lib/bake.js
    tests/verify.js
    assets/css/tokens.css
    assets/css/style.css
    assets/js/mpc-runtime.js
    assets/js/home.js
    assets/js/guides-search.js
    assets/js/mpc-preview.js
    assets/js/mpc-store.js
    assets/img/couple.webp
    assets/img/icons/{feeding,sleeping,development,health,sanity}.webp

**Still do not upload** `assets/css/guide.css` or `assets/js/guide-render.js`.

Nothing to do by hand. No new folders, no downloads.

---

## What changed

FCP was 2.7s on mobile against 0.7s on desktop, and almost none of that was
download — the two stylesheets are 11KB gzipped, about 55ms of transfer. The
cost was the **round trip**: receive the document, parse the head, ask for two
more files, wait a full RTT on a 150ms link, and only then draw anything,
while ~110KB of fonts competed for the same pipe.

`inlineCss()` in `scripts/build.js` now pastes the stylesheets into each page
at deploy time. **Zero render-blocking requests remain** — first paint is
gated only by the document itself.

| page | document was | now | requests removed |
|---|---|---|---|
| index.html | 5.3K | 11.0K | 10.6K in 2 requests |
| a guide page | 5.8K | 13.8K | 15.6K in 3 requests |
| a topic page | 5.7K | 11.4K | 10.6K in 2 requests |

Fewer total bytes *and* nothing to wait for. Comments are stripped from the
inlined copy only — worth 4.7KB gzipped per page on this codebase — and the
files on disk keep every word.

### You edit CSS exactly as before

`tokens.css` and `style.css` stay the real files and the only copies anyone
touches. The build reads them and pastes them in. **There is no second source
of truth**, which is precisely why I did not hand-maintain a "critical subset"
instead — `tokens.css` exists because three blues and two creams once drifted
apart across separate files, and that mistake would be worse here.

### If the build ever fails, the site still works

The repo keeps working stylesheet links inside `MPC:CSS:START/END` markers.
If a file cannot be read, `inlineCss()` logs a warning and returns the page
untouched, links intact. **The worst case is exactly today's behaviour**, never
an unstyled page. I tested this by deleting `style.css` and rebuilding — it
warned four times and shipped working links.

Also verified idempotent: built three times in a row, one style block each
time. The file list rides on `data-mpc-css` so a second pass knows what to
re-inline once the links are gone.

---

## The cost, so you can decide

CSS is currently cached immutable for a year and costs a returning visitor
nothing. Inlined, it rides inside HTML that must revalidate. So:

- Visit with **no deploy since last time** → 304, nothing downloaded. No change.
- Visit **after a deploy** → the document re-downloads, now ~6KB gzipped
  bigger than before.

You deploy on Studio saves, so that second case is common. ~6KB is about 30ms
on the emulated connection. I think it is clearly worth it against a
first-visit saving of a full round trip plus contention, but it is a real
trade and it is yours.

---

## Two things that would have broken silently

Both found by testing, not by reading:

1. **`url()` resolves against the document once inlined**, not against
   `assets/css/`. `style.css` asks for `url("../img/paper.jpg")`, which would
   have become `/img/paper.jpg` — a 404, and your paper texture would have
   quietly vanished. Every relative `url()` is rewritten root-absolute.
2. **`style.css` opens with `@import url("tokens.css")`.** Inlined verbatim
   that resolves to `/tokens.css` — another 404, and the entire design token
   set gone. Any `@import` of a file being inlined is now dropped, since its
   contents are already in the block.

Worth knowing that `@import` was also costing you something before this
change: it is a serialised dependency, so `style.css` had to arrive before the
browser even learned it wanted `tokens.css`.

## And one problem I created for your test suite

Inlining means every page's HTML now contains the text of every CSS rule on
the site. A check looking for *markup* can match the *selector* instead:

- **`Landing pages do not repeat the browse-links block` started failing** —
  not because the block came back, but because `.browse-links{...}` in the CSS
  matched.
- **`Landing pages arrive with their filter already lit` silently weakened** —
  `.pill[data-on="true"]` is a selector, so the check would have passed even
  if no pill in the body carried the attribute. That one is worse than a
  failure, because it would have gone unnoticed.

There is now a `readMarkup()` helper in `verify.js` that strips style blocks
and comments, with a comment explaining why, so future markup checks cannot
trip over this.

My own new check had a bug too: `["']?` backtracked past the opening quote and
matched every well-formed URL. It extracts and tests each `url()` value now.

---

## Verified

    node scripts/build.js      ->  0 errors  (also run 2x and 3x: idempotent)
    node tests/verify.js       ->  125 passed, 0 failed
    node tests/runtime-sim.js  ->   60 passed, 0 failed

Five checks added: no page blocks render on a stylesheet, every page carries
the real tokens and layout rules, no inlined `url()` left relative, no
`@import` survives, and guide pages inline the guide panel CSS too.

## What I expect

FCP should drop substantially — the round trip and the contention both go.
LCP should follow, since it cannot happen before first paint. I am not going
to put a number on it: I was wrong about which element was the LCP two rounds
ago, and the honest answer is that this removes the thing the report pointed
at and the measurement decides.

Roughly 700ms of TTFB is connection setup on the emulated link and no change
here touches it, so do not expect desktop numbers.

Re-run PSI after the deploy and send the mobile screenshot.
