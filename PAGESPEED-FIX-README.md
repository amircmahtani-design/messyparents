# PageSpeed fix — 26 August 2026

Rebased onto the latest repo (the zip sent 26/08). Your callout spacing work
and the "Speak with your doctor if" wording are preserved — see "Rebase notes"
at the bottom.

Baseline (PSI mobile, 26/08/2026 18:19 GST):
Performance **79**, Accessibility **89**, Best Practices 100, SEO 100,
Agentic browsing **2/3**. FCP 2.7s · LCP 4.1s · Speed Index 4.9s · TBT 0ms ·
CLS 0. Desktop was already 99.

TBT 0 and CLS 0 mean nothing is wrong with the JavaScript or the layout. Every
mobile point went to **bytes and round trips on a slow connection**. So nothing
here changes how the site behaves — only what it asks for and when.

---

## Upload these 18 files

**New (4)** — just add:

    assets/img/family-560.webp
    assets/img/family-800.webp
    assets/img/family-1000.webp
    assets/img/logo-460.webp

**Changed (14)** — replace:

    index.html          guides.html        popular.html       about.html
    books.html          editorial.html     404.html           guide.html
    assets/css/style.css
    assets/js/mpc-runtime.js
    assets/js/home.js
    assets/js/guides-search.js
    scripts/lib/bake.js
    tests/verify.js

**Do NOT upload** `assets/css/guide.css` or `assets/js/guide-render.js`. They
are your latest work, I did not touch them, and the copies in this zip would
be identical anyway — they are simply not included so there is no chance of
going backwards.

`family.webp` and `logo.webp` are untouched and stay as they are.

---

## 1. The font stylesheet stopped blocking the first paint

Every public page linked `fonts.googleapis.com` as a plain blocking
stylesheet. Nothing could be drawn until a DNS lookup, a TLS handshake and a
round trip to a third-party origin finished. That is most of the 2.7s FCP, and
LCP cannot happen before the page renders, so it paid for it twice.

Now: preload + `media="print"` + `onload`, with a noscript fallback.

**Same URL. Same three faces. Same weights.** The note in `tests/verify.js`
about `.book-num` resolving to Baloo 600 is right, and Nunito 800 is live too
(`.search button`, `.article-body strong`), so nothing is trimmed. Only *how*
it is requested changed.

## 2. The hero is the LCP element and was sent at full size

`family.webp` is 185KB at 1000x747, drawn at about 364 CSS px on a phone.

Added a `srcset` with `sizes` taken from your real breakpoints (430px above
960, `min(460px, 100vw - 48px)` below). At Lighthouse's mobile emulation the
phone now pulls the 800w file: **185KB -> 107KB on the LCP resource.** The
1000w variant is a q80 re-encode at 36.5 dB PSNR — visually identical on flat
illustration art.

`family.webp` itself is unchanged, so the og:image and the About defaults are
unaffected.

### A trap this created, and the guard for it

`srcset` beats `src`. The moment you set a different home hero in Studio, the
shipped list would have kept serving the old family illustration and your
upload would have looked like it did nothing.

`applyHero` in `scripts/lib/bake.js` now rebuilds that list through the
Netlify image CDN for a Studio upload, and drops it entirely for anything
else. Unit-tested across all three paths plus idempotency. `verify.js` also
now fails if any `srcset` candidate is not a real file — a 404 there means the
largest image on the page never appears at all.

## 3. The logo stopped competing with the hero

It was 49KB at 620x270 **and** `fetchpriority="high"` — a second "most
important image" signal at the top of the same document. On index, guides,
popular and about it now has a 460w variant (28KB on a phone) and yields
priority to the hero. `guide.html` keeps its high priority: no hero there, so
the logo genuinely is the biggest thing above the fold.

## 4. Accessibility 89, and probably the Agentic browsing 2/3 as well

The filter pills are `<a href>` carrying `aria-pressed`. That was right while
they were buttons, but `aria-pressed` is only valid on a button — so since
they became links it has been invalid ARIA on every pill on every browse and
landing page. Lighthouse fails the page for it (`aria-allowed-attr`), and a
screen reader may ignore it, so the state it existed to announce was not
dependably announced either.

Now `data-on` carries the styling and `aria-current="true"` carries the
announcement, written only when the filter is on. One helper
(`MPC.pillState`) in `mpc-runtime.js`, matched by `state()` in `bake.js`.

A single `aria-allowed-attr` failure costs almost exactly the 11 points you
are missing, so this should be 89 -> 100. The default Agentic browsing checks
are accessibility-tree, CLS and llms.txt — CLS is 0 and llms.txt is generated
by the build, so the tree is the likely third, and this is the same fix.

## 5. Small

Removed a duplicated `autocomplete="off"` on the home search input.

---

## Verified on the latest code before shipping

    node scripts/build.js      ->  0 errors
    node tests/verify.js       ->  117 passed, 0 failed
    node tests/runtime-sim.js  ->  60 passed, 0 failed

The build ran without Firestore access, so it also exercised the bundled
fallback path — worth knowing that still works.

Two checks were added to `verify.js`: the font link must never block, and
every responsive image candidate must exist on disk.

## Rebase notes

Between the first zip and this one you changed three files:

- `assets/css/style.css` — `.callout h3` margin `0 0 9px`
- `assets/css/guide.css` — `.g-detail-fold` callout spacing, `.gpage-related` width
- `assets/js/guide-render.js` — "Call your doctor if" -> "Speak with your doctor if"

`style.css` is the only one that overlaps with my changes, and only because I
edit two pill selectors in it. I re-applied my two lines onto **your** version
rather than shipping mine, so the callout margin is intact — confirmed in the
built output. The other two files are untouched and excluded from this zip.

## One thing I got wrong, in case it bites you later

My first draft of the font comment contained a literal `<noscript>` tag. The
test's noscript-stripping regex matched from that mention *inside the comment*
through to the real closing tag and silently ate both font links. `build.js`
regexes over this HTML too. **Don't write tag names in the comments in these
files.** The test now strips comments first.

## Not done

Topic icons ship at 150px and are drawn at 23px in the pills. Resizing saves
11.5KB — about 57ms on Slow 4G — but means rewiring every icon reference
through `build.js`, the facets payload and the baked card markup. Bad trade;
left alone.
