# SEO & AI Search Architecture

**The Messy Parents Collection** — how the site is built for Google, ChatGPT
Search, Bing/Copilot and other answer engines.

This is the machine underneath the content. It was built on the principle in
the brief: *build the infrastructure now, optimise individual articles later.*
Almost nothing here changes what a reader sees. It changes what a crawler gets.

---

## The one-paragraph version

Every guide is now a real page at its own permanent address, with its own
title, description, canonical URL and structured data, all present in the HTML
before any JavaScript runs. Those pages are generated on Netlify at deploy
time from the same Firestore data the browser reads. The sitemap, robots.txt,
redirects and `llms.txt` are generated from that same data in the same pass, so
they cannot disagree with each other. Nothing is invented: a guide with no
publish date does not get one.

---

## What was wrong before

Worth recording, because it explains most of the decisions below.

| | Before | After |
|---|---|---|
| Guide URL | `/guide.html?id=teething` | `/guides/teething/` |
| Guide HTML | `<div id="article"></div>`, filled by JS | Complete page, server-rendered |
| `<title>` | `Guide — The Messy Parents Collection`, identical on all 31 | Unique per guide |
| Canonical | none | One per page |
| Structured data | none | Article, Organization, WebSite, CollectionPage |
| Links to guides in HTML | **zero** | Every guide, from three places |
| Sitemap | none | 48 URLs, generated |
| Landing pages | none | 5 topic + 7 age |

The empty-grid problem was the serious one. `index.html`, `guides.html` and
`popular.html` all shipped with `<div class="card-grid" id="grid"></div>` and
filled it from Firestore on load. There was not a single `<a href>` pointing at
a guide anywhere in the served HTML, so there was nothing for a crawler to
follow even if it had found the pages.

---

## URL architecture

```
/                          home
/guides.html               all guides (search + filter)
/guides/<slug>/            a guide            ← generated
/topics/<topic-id>/        a topic landing page   ← generated
/ages/<age-slug>/          an age landing page    ← generated
/popular.html              popular
/about.html                about
/editorial.html            editorial principles   ← new
```

**Why topics and ages are not under `/guides/`.** The brief suggested
`/guides/sleep/`. That puts category slugs and guide slugs in one namespace, so
a guide could never be called "sleep" without colliding with its own category —
and the collision would surface months later as a mysteriously missing page.
Separate prefixes make it impossible by construction. The audit still checks for
cross-namespace collisions with renamed slugs.

**Trailing slashes.** Guides, topics and ages always end in `/`. The
`.html` pages never do. `pretty_urls` is switched **off** in `netlify.toml`,
because Netlify would otherwise also serve `/about` for `/about.html`, quietly
creating a second URL for every page and splitting its ranking signals.

**Nothing breaks.** Every `guide.html?id=<x>` 301s to the clean URL. Rename a
slug in Studio and the old address redirects permanently — one hop, never a
chain, because every redirect targets the guide's *current* URL rather than the
slug that replaced it. Slug history lives on the guide itself
(`seo.previousSlugs`) and is kept forever.

**HTTP status codes.** A valid page is `200`. A moved or legacy URL is `301`.
Unknown paths outside `/guides/` get Netlify's normal `404`.

`/guides/*` is the deliberate exception, and it is worth understanding why. Two
different things can reach a `/guides/<slug>/` URL that this build did not
generate:

1. **A guide added in Studio since the last deploy.** It exists in Firestore
   but has no page yet. It must render.
2. **A slug that genuinely does not exist.** It must not be indexed.

Netlify cannot tell them apart — it has no idea what is in Firestore. Returning
a hard `404` would satisfy case 2 and break case 1, which is much the worse
outcome: you would add a guide, watch it appear in the guide list, click it and
get a 404 until the next deploy.

So the last rule rewrites to `guide.html`, which *can* tell them apart. It reads
the slug from the path and looks it up. Found, it renders the guide. Not found,
it appends `<meta name="robots" content="noindex, follow">` before showing the
not-found message, so a dead URL still cannot enter the index.

This is the one place the architecture accepts a soft 404 rather than a hard
one, and it is a considered trade, not an oversight.

---

## How the build works

`netlify.toml` runs `node scripts/build.js` on every deploy.

**This runs on Netlify, not on your machine.** There is no terminal to open and
nothing to install. It is the same as it always was: commit through the GitHub
web UI, Netlify does the rest.

```
scripts/
  build.js            the build
  lib/site.js         domain, entity name, URL shapes — one source of truth
  lib/data.js         loads guides and normalises them into one model
  lib/head.js         <head> tags and JSON-LD
  lib/audit.js        validation + the audit page
  lib/bake.js         Studio's editable content, applied at deploy time
  lib/publicdata.js   the small generated JSON the browse pages read
data/
  guides-bundle.js    the build's fallback catalogue — never served to a reader
assets/js/
  guide-render.js     THE RENDERER — runs in Node and in the browser
  mpc-runtime.js      the tiny shared public runtime (no data, no Firebase)
  mpc-catalogue.js    search and filtering against the generated index
  guide.js            guide page behaviour in the browser
  home.js             home page
  guides-search.js    all-guides, and the topic/age landing pages
  popular.js          popular page
  mpc-preview.js      Studio's live-preview shim — never served to a reader
```

Data is read in this order, and it falls through on any failure:

1. **Firestore** over the REST API, using the same public API key the browser
   uses (`guides` is `allow read: if true`).
2. **`data/guides-bundle.js`**, the bundled copy. This used to live at
   `assets/js/guides.js` and was loaded by every public page; it is a
   build-time input now. Build-time fallback data is good. Shipping it to every
   reader was not.
3. **`data/guides.json`**, the seed file.

### The build cannot fail a deploy

Priority 1 in the brief is *do not break the live website*, and a build that
throws takes the whole site with it. So every risky step is wrapped, every
failure degrades to something sensible, and the process **always exits 0**.
Problems are printed in the Netlify deploy log and written into the audit
instead of stopping the publish.

This was confirmed accidentally during development: with no network at all,
Firestore returned 403 and the build produced a complete, correct 31-page site
from the bundled copy, logging exactly what it had done.

### And if the build does not run at all

`_redirects` is committed to the repository with a fallback:

```
/guides/*  /guide.html  200
```

It is a **rewrite, not a redirect**, and it is not forced, so Netlify serves the
real generated page whenever one exists and only falls through to this when one
does not. `guide.html` reads the slug out of `location.pathname` and renders
from Firestore exactly as the site did before. Every clean URL keeps working
even on a completely broken deploy.

### One renderer, two runtimes

`assets/js/guide-render.js` is used by the build **and** by the browser.

If the server and the client each had their own copy of the guide markup they
would drift, and a drifted copy is indistinguishable from cloaking — bots would
get one page and readers another. Sharing the function makes them identical by
construction. `tests/verify.js` asserts that all 31 cards render byte-for-byte
identically from both paths.

The build stamps a hash of what it rendered onto each panel and grid. The
browser recomputes it and **only touches the DOM when they differ**, so on a
normal visit nothing is replaced: no flash, no layout shift, and the page the
reader sees is the HTML that arrived over the wire.

---

### A trap worth knowing about

Pre-rendered cards must sit in the *exact* order the browser would render them.
The all-guides page renders in data order when unfiltered, but a filtered view
goes through `searchGuides()`, which sorts alphabetically by title — so the
topic and age landing pages bake alphabetically too.

Get this wrong and the hash never matches, so the grid silently rebuilds and
visibly reorders itself on every single visit. It was wrong once during this
work and was caught by comparing the baked order against the client's own sort.
That comparison is now part of `npm run verify`.

---

## The guide data model

Search metadata lives under a single `seo` key on the guide document, so the
whole search side of a guide can be read, diffed and audited in one place, and
nothing can collide with an existing content field.

```
id, title, summary, body, panel, callout,      ← existing content, untouched
topic, subcategory, stage, ages, related,
keywords, originalQuestions, sources, medical

seo: {
  slug, previousSlugs[],
  title, description, canonical, imageAlt,
  publishedDate, updatedDate,
  noindex,
  references[],
  showDetail, showQuestions, showBreadcrumbs, showRelated
}
```

**Empty fields stay empty.** A blank `seo.title` falls back to the question
itself; a blank `seo.description` falls back to the guide's visible quick
answer. That is not invention — it is the same words the reader sees. A blank
date produces **no date property at all**, rather than a guess.

`sources` holds internal raw-question IDs (`RAW-20250820-…`). These are
provenance for you, not citations, and they never reach the page. There is a
test for it.

---

## What happens when you add or edit a guide

This used to be a story about two clocks. It is now a story about one, because
the public site no longer reads Firestore.

**On save:**

1. The guide is written to Firestore, which is the source of truth.
2. Studio queues a Netlify build hook, debounced by 90 seconds — so editing a
   batch of guides fires **one** build after the last save, not one per save.
3. The build regenerates everything: the guide's own page, its entry in the
   sitemap and `llms.txt`, its place on the topic and age landing pages, the
   "Read next" links on other guides, the redirects if the slug changed, the
   search index, and the SEO audit.
4. A minute or two later the CDN is serving it.

A small status pill in the corner of Studio says which stage it is at, so a
rebuild is never a mystery. Paste the build hook once per device (Site → Search
& AI); until you do, nothing is triggered and the manual **Rebuild the search
pages** button works exactly as before.

**Why this changed.** Previously the grids on Home, Popular and All Guides
updated the instant you saved, because every one of those pages downloaded the
entire guides collection from Firestore on load. That is a real convenience,
and it was being paid for by every reader on every page — 113KB of bundled
article bodies at 31 guides, and about 1.7MB at 500. See
[Performance](#performance) for what that looked like in practice.

**The gap is still covered.** A guide saved but not yet rebuilt has no
generated page, so `_redirects` rewrites it to `guide.html`, which fetches
**that one document** over the Firestore REST API and renders it. It is
readable and shareable immediately; what it lacks until the build lands is its
own metadata and its sitemap entry, so it is not yet properly indexable.

And a generated page whose guide has been edited since the deploy catches
itself up: once the browser is idle, once per session, `guide.js` re-checks the
hash the build stamped on the panel against live data with the same
single-document read. If they match — the normal case — nothing happens.

---

### Adding guides continuously

Guides are added all the time, so the state of the newest one is not an edge
case — it is the normal condition of the site for a minute or two after every
save. What each surface does in that window:

| Surface | A guide saved 30 seconds ago |
|---|---|
| `/guides/<slug>/` | **Works.** No generated page yet, so `_redirects` rewrites to `guide.html`, which fetches that one document over REST and renders it. Shareable immediately. |
| Guide list, search, topic and age pages | Appear after the rebuild. They read the generated index. |
| Sitemap, `llms.txt`, "Read next" on other guides | After the rebuild. |
| Studio's own list and preview | **Immediate.** Studio reads Firestore directly and always has. |
| Editor's guide picker | Fills from the generated index, so after the rebuild; the guide's content is then fetched live, one document at a time. |

`guide.html` therefore carries the Firestore project id and key, written in by
the build. Without them a newly saved guide would show "We can't find that one"
— which is the exact failure the fallback rewrite exists to prevent, so
`npm run verify` asserts it is there.

A slug that genuinely does not exist still marks itself `noindex, follow` and
says so, and it does that **without** downloading the renderer first: the guide
is looked up before any of the machinery for drawing it is fetched.

### If a build cannot reach Firestore

This used to be a soft landing. It is not any more, and the change is worth
understanding.

Previously a build that fell back to the bundled copy still produced a working
site, because every page read the guides collection in the browser — anything
newer than the bundle appeared anyway. Now the public site is static, so **what
the build writes is the site.** A fallback build published after new guides
were added is missing them from the guide list, the search index, the landing
pages and the sitemap. Their own URLs still resolve through the rewrite, but
nothing links to them.

So the build now says so extremely loudly in the deploy log, including how old
the bundled copy is. And there is a switch: set **`MPC_REQUIRE_FIRESTORE=1`**
in Netlify's environment variables and a failed read exits non-zero, so Netlify
keeps the previous deploy live rather than replacing it with an incomplete one.

It is off by default, because "never fail a deploy" was a deliberate decision
and reversing it is Amir's call, not the build's.

---

## The four switches

Studio → **Site → Search & AI**. Each can be overridden per guide.

| Switch | Default | What it does |
|---|---|---|
| **The longer version** | **off** | Renders `guide.body` beneath the panel |
| **Read next** | **on** | Related guides at the bottom |
| **Where this one came from** | off | `originalQuestions`, with dates |
| **Breadcrumbs** | off | Home › age › topic, **above** the panel |

Everything except breadcrumbs renders *below* the guide panel — and
`guide-page.js` sizes that panel to the viewport, so all of it starts below the
fold and **first paint is unchanged**. Breadcrumbs are the exception because
they push the panel down, which is why they are off.

`BreadcrumbList` structured data is emitted **only when breadcrumbs are actually
visible**, because marking up something a reader cannot see is exactly what the
brief forbids.

### Please turn on "The longer version"

Every guide already carries a `body` field of 147–347 words of original prose.
The panel template does `if(g.panel) renderPanel(); else renderArticle();` — the
panel always wins, so **the body has never been displayed to anyone**.

From the audit:

```
visible words across all 31 guides:   4,332   (~140 per page)
prose that exists but is not shown:   7,539
```

Turning this on roughly triples the indexable content on every guide, using
words you have already written, without changing what anyone sees first. It is
the single highest-value thing available and it is one click. It is off only
because the brief says content decisions come later and the design is yours.

---

## Structured data

Emitted as one `@graph` per page.

- **Organization** and **WebSite** — on every page, by `@id` reference, so
  search engines can see all 300 eventual guides belong to one publisher.
  `WebSite` carries a `SearchAction` pointing at the real site search.
- **Article** — on guide pages. `headline`, `description`, `abstract` (the
  visible quick answer — the passage a retrieval system is most likely to lift),
  `image`, `author`, `publisher`, `inLanguage`, `isAccessibleForFree`, `about`.
  `datePublished`/`dateModified` **only when real**.
- **BreadcrumbList** — only when breadcrumbs are visible.
- **CollectionPage** + **ItemList** — topic and age pages.

**Deliberately not used:**

- **`FAQPage`** — Google restricted FAQ rich results to government and health
  authority sites in 2023, which this deliberately is not. The guides are also
  not a visible list of questions and answers.
- **`MedicalWebPage`**, `reviewedBy`, `MedicalEntity` — these imply clinical
  review by a qualified person. There isn't one, and the site's honesty about
  that is its whole character.
- **`sameAs`** — added the moment there are real social profiles to point at.
- **`aggregateRating`** — no ratings exist.

`author` is `Ari & Papa`, linked to `/about.html`. That is the byline the About
page already uses in its own words, so it is a real, visible attribution.

---

## Crawler configuration

`robots.txt` is generated and commented. Every public route is open; only the
two editing surfaces and the audit are closed.

| Crawler | Why it matters |
|---|---|
| `Googlebot` | Search **and** AI Overviews / AI Mode, which are served from the ordinary index |
| `Bingbot` | Bing **and** Microsoft Copilot, which grounds answers in the Bing index |
| `OAI-SearchBot` | **ChatGPT Search** results and citations |
| `ChatGPT-User` | Fetches a page when a user asks ChatGPT to open it |
| `GPTBot` | OpenAI **model training** — no effect on ChatGPT Search |
| `Google-Extended` | Gemini **model training** — separate from search and AI Overviews |
| `PerplexityBot`, `ClaudeBot`, `Claude-SearchBot`, `Applebot`, `Applebot-Extended`, `DuckDuckBot`, `Amazonbot` | Other answer engines |

**The distinction that matters:** `OAI-SearchBot` and `GPTBot` are different
crawlers doing different jobs. Blocking `GPTBot` opts out of model training;
blocking `OAI-SearchBot` makes the site invisible in ChatGPT Search. If you ever
want to opt out of training only, change the `GPTBot` block to `Disallow: /` and
**leave `OAI-SearchBot` exactly as it is**. Both are currently allowed.

**`/.netlify/images` is deliberately not blocked.** Every Studio-uploaded
illustration is served through Netlify's image CDN on that path. Blocking the
whole `/.netlify/` prefix — which is the obvious thing to do — would make every
guide illustration uncrawlable and hand Googlebot a page it could not fully
render. Only `/.netlify/functions/` is closed.

Three layers protect the private surfaces: `robots.txt`, a `noindex` meta tag,
and an `X-Robots-Tag` HTTP header in `_headers`.

---

## Sitemap

`/sitemap.xml`, generated from the guide data on every build. Contains the home
page, the real content pages, every topic and age landing page, and every
canonical indexable guide.

Excluded: query-string URLs, filter permutations, noindexed guides, guides with
a canonical override, `/studio/`, `/editor/`, `/seo-audit.html`, redirects.

`<lastmod>` is only emitted when a true date exists — the guide's own updated
date, or failing that Firestore's own document update time, which is a real
timestamp the CMS produced. Never the build date.

Referenced from `robots.txt`. Scales fine past 300 guides; beyond about 10,000
it would need a sitemap index, which is a small change to one function.

---

## IndexNow

Implemented, dormant until you set a key.

Set `INDEXNOW_KEY` in Netlify's environment variables to any 8–128 character
hex-ish string. The build then writes `/<key>.txt` and submits changed URLs to
`api.indexnow.org`, which feeds Bing and therefore Copilot.

It only submits guides whose date changed in the last 7 days, so a deploy that
touches no content pings nothing — which is what the protocol asks for. Failure
is caught and logged; the sitemap covers the same ground anyway.

---

## Internal linking

Previously there were no crawlable links to any guide. Now:

- **`/guides.html`** — all 31 cards as real `<a href>`, plus a quiet
  `.browse-links` nav linking every topic and age page. The filter pills are
  `<button>`s and crawlers do not click buttons; these links are how the landing
  pages are reachable.
- **`/topics/<id>/` and `/ages/<slug>/`** — every guide in that group.
- **Guide pages** — "Read next", from the existing `related` field.
- **`index.html` / `popular.html`** — featured and one-per-topic cards.

Empty landing pages are never published. Cards are baked in the same order the
client would render them, so the grid does not reorder itself on load.

The audit flags guides nothing else links to. Currently two:
`newborn-hiccups` and `newborn-trembles-and-jerks`.

---

## Performance

The SEO half of this site was solved before the performance half. A guide page
arrived with its whole article in the HTML — and then loaded a content
management system on top of it.

### What was wrong

Every public page, including a generated guide page that needed nothing:

```
firebase-config.js     0.9KB
guides.js            113.6KB   the complete catalogue, every article body
guide-render.js       16.4KB
mpc-store.js          21.5KB
guide-page.js          7.6KB
                     -------
                    ~158KB of JavaScript
```

plus the Firebase SDK from gstatic, plus a Firestore connection, plus
`getDocs(collection(db, "guides"))` — a download of every guide document,
bodies included — after which it compared hashes, discovered the HTML it had
already been served was correct, and did nothing.

`guides.js` was about 3.6KB per guide. Extrapolated: **334KB at 100 guides,
1.0MB at 300, 1.7MB at 500** — on every page.

### The principle

**Public site = static. Studio = dynamic.**

Firestore is the content-management source. It is not something an ordinary
reader has to load before the site works.

```
STUDIO → Firestore → Netlify build → static output → CDN → reader
```

### What a reader downloads now

A generated guide page, measured with `tests/scale-test.js`:

| | 31 guides | 100 | 300 | 500 |
|---|---|---|---|---|
| HTML (gzipped) | 4.9KB | 4.9KB | 4.9KB | 4.9KB |
| JavaScript (gzipped) | 9.2KB | 9.2KB | 9.2KB | 9.2KB |
| Requests | 7 | 7 | 7 | 7 |
| *Bundled catalogue, before* | *104.7KB* | *334.4KB* | *1008.0KB* | *1686.5KB* |

**Flat.** That is the whole point: a guide page's cost stopped being a function
of how many guides exist.

### The data files

Browse pages need metadata — for search, filtering, recommendations — but not
article bodies. So the build generates two files instead of one bundle:

- **`/data/guide-index.json`** — id, slug, title, topic, read time, ages,
  featured. Everything needed to draw a card and filter. ~178 bytes a guide.
- **`/data/guide-search.json`** — summary, target keywords and a capped body
  excerpt: the text a query is matched against. ~410 bytes a guide. Fetched
  **only when somebody actually types**.

Neither carries an article body, and `npm run verify` fails the build if one
starts to.

Loading is in three stages, so nothing is ever waited on:

1. The page arrives. Cards are baked into the HTML; the filter pills and their
   counts are inline in `MPC_FACETS`. Nothing is fetched. The page is finished.
2. At idle, or on the first touch of a pill or the search box, the index loads.
3. On the first keystroke, the search text loads. Until it lands, queries match
   on titles alone — instant, already in memory — and re-score when it arrives.

### Firestore on the public site

Two paths, both single-document, both over the REST API with no SDK:

- a guide saved in Studio since the last deploy, which has no generated page yet;
- the once-per-session idle freshness check on a generated page, which skips
  entirely on a metered or 2G connection.

There are **no whole-collection reads anywhere on the public site**, and no
public page loads the Firebase SDK. `verify.js` asserts both.

### Baking

Editable wording, the footer, hero illustrations, the About slots, the books
list and the filter pills all used to be applied in the browser from Firestore.
They are applied by `scripts/lib/bake.js` at deploy time now, from the same
data. Nothing arrives late, so nothing flashes or shifts.

The hero image mattered most: it used to ship with **no `src` at all**, only a
`data-default`, resolved after Firebase had booted. It was the LCP element on
three pages and could not be discovered by the browser's preload scanner. It is
now written into the HTML.

### Smaller things

- **A preconnect to `firebasestorage.googleapis.com` on every page**, to a host
  no page ever contacts — illustrations are rewritten to `/.netlify/images`,
  which is this origin. Removed.
- **The typography was left completely alone**, deliberately. Baloo 2 is
  requested at 600, 700 and 800 and renders only at 700, so trimming it looks
  like a free saving. It is not: a browser downloads a font file only when an
  element actually needs that weight, so the two unused weights were never
  fetched — they were only *declared*. The entire saving is about 260 bytes of
  text in a third-party stylesheet that is hard-cached anyway. Against that, if
  anything ever renders the display face at another weight the browser would
  substitute 700 and the heading would visibly thicken. A non-zero risk to the
  site's look for a rounding error in transfer size is a bad trade. The font
  request is now pinned by a test, so altering it has to be a deliberate design
  decision rather than a performance one.
- **`fitGuide()` measured the panel six or seven times per load** on a chain of
  timers, each clearing the transform and reading `scrollHeight` — a forced
  synchronous layout, mostly to produce the same answer. It now measures when
  something has actually changed, batched into one animation frame, reads
  before writes, with a `ResizeObserver` covering the font swap and image
  decode the timers were guessing at.
- **Asset caching** was a week, with hand-maintained `?v=` strings already out
  of step between pages. Every reference is now stamped with a content hash by
  the build, so `immutable` for a year is safe.
- **CSS is shared and hard-cached**, not inlined — 300 guide pages must not each
  carry their own copy.

### Studio is exempt, deliberately

Studio loads the complete catalogue, because it is an editing environment and
that is the correct trade there. It is `noindex` and nobody reaches it by
accident. `data/guides-bundle.js` — the old `guides.js` — lives on as the
build's Firestore fallback and Studio's seed source. No public page references
it, and there is a test for that.

---

## Studio

All SEO editing lives in the existing Studio. No second admin.

**Per guide** — a "Search & sharing" section in the guide editor: web address
(with a warning when a rename will move an indexed page), title and description
with live character counts, illustration alt text, target queries, published and
updated dates, hide-from-search, and a per-guide override for the longer
version.

`updatedDate` is set automatically on save, so it is always true.

**Site-wide** — Site → **Search & AI**: the four switches, the Google and Bing
verification codes, and the Netlify build hook.

**The build hook is stored in `localStorage`, not Firestore.** A build hook is a
URL that triggers a deploy, and `meta/*` is publicly readable — putting it in
Firestore would publish it. Paste it once per device.

**Saving a guide updates the live site immediately** (the browser reads
Firestore directly). The *generated* pages rebuild on deploy, or when you press
**Rebuild the search pages**. If they ever fall behind, the browser notices via
the hash and redraws from live data, so a reader never sees stale content.

---

## Audit tools

**`/seo-audit.html`** — generated every build. A row per guide: URL, indexable,
title and length, description and length, category, ages, short answer present,
visible vs hidden word count, related link count, image alt, dates, sitemap
inclusion, and every problem or to-do. `noindex`, robots-disallowed, and
`X-Robots-Tag`-blocked. `test-results/seo-audit.json` is the machine-readable
copy.

**`npm run verify`** — 136 checks in two passes.

`tests/verify.js` (98) reads what the build actually wrote to disk:
card parity between build and browser, unique titles, correct canonicals, one
`<h1>`, the answer present in the HTML, valid schema, no relative paths, no
orphans, no fabricated dates, no leaked internal IDs, no ghost breadcrumbs,
sitemap and robots correctness, no redirect chains, private surfaces private —
plus a performance-architecture section that fails if any of this work is
undone by accident: no public page shipping the catalogue, no Firebase SDK on a
public page, no whole-collection read, no article bodies in the index, a budget
on guide-page JavaScript, the hero image having a real `src`, and — the one
that matters most — every generated guide page still containing its full
article once every `<script>` is stripped out.

`tests/runtime-sim.js` (38) executes the rewritten client scripts in Node
against the JSON the build actually wrote, with a small DOM stub. It checks
that filtering returns exactly the guides the bundle says it should, that real
queries find and rank the right guide, that a card built in the browser is
byte-identical to the baked one, and that a pre-rendered guide page touches
neither the DOM nor the network on load. The Playwright audit is the right tool
for rendering problems, but it needs a browser binary to be downloadable, and
"the tests could not run" is a poor answer for scripts that were rewritten from
scratch.

**`node tests/scale-test.js`** — clones the real guides to 100, 300 and 500,
runs the real build at each size, measures what a reader would download, and
restores everything afterwards. See [Performance](#performance).

**`npm test`** — your existing Playwright audit, now including `editorial.html`
and two generated pages.

Current state: **0 errors, 5 warnings, 202 editorial to-dos** — which is the
expected shape. The to-dos are the content pass, not faults.

---

## What still needs you

1. **Google Search Console** — verify the domain, paste the code into Studio →
   Site → Search & AI, submit `https://themessyparentscollection.com/sitemap.xml`.
   Nothing is hardcoded; blank means no tag rather than a fake one.
2. **Bing Webmaster Tools** — same, then submit the sitemap.
3. **Netlify build hook** — create one in Site settings → Build & deploy →
   Build hooks, paste into Studio once per device. This matters more than it
   used to: the public site is static now, so the rebuild is what publishes. Once
   the hook is set, Studio fires it automatically 90 seconds after your last
   save, and a status pill tells you where it is up to. Without it, saves reach
   Firestore but the generated pages wait for the next deploy.
4. **Turn on "The longer version"** — see above. One click, triples the
   indexable content.
5. **Social profiles** — when they exist, add them to `sameAs` in
   `scripts/lib/site.js` so the Organization entity is linkable.
6. **`INDEXNOW_KEY`** — optional, for Bing/Copilot freshness.
7. **Analytics** — nothing was installed. When you add it, referrer data is
   preserved, so `chat.openai.com`, `perplexity.ai`, `copilot.microsoft.com` and
   `claude.ai` will be distinguishable as referral sources.
8. **Run `npm test` once after the first deploy** — the browser-level audit
   needs a Playwright browser binary, which could not be downloaded in the
   environment this work was done in. `npm run verify` covers the same ground
   at the file and script level, but a real browser is a real browser.
9. **Re-run PageSpeed on mobile** for `/`, `/guides.html` and
   `/guides/blocked-nose-newborn/`. The local measurements are of payload and
   request architecture; LCP, CLS, INP and TBT can only be measured live.
10. **Consider moving `assets/img/refs/` to Firebase Storage.** It is 20MB of
    illustration reference sheets, deployed on every build. Studio already has
    the tool for it (Site → the refs migration panel). They are fetched by
    Studio and by the Netlify functions from the deployed origin, so they
    cannot simply be deleted — but no reader ever requests them, so this is
    deploy weight, not reader weight, and it is not urgent.

---

## The content phase

The technical work is done. What remains is writing, per guide:

- search-intent analysis and target queries
- a written title and meta description
- a published date
- the longer version reviewed and switched on
- outbound references where research was used (`seo.references`)
- related links for the two orphans

`/seo-audit.html` lists exactly which fields are missing on which guide, which
is what makes that pass mechanical rather than archaeological.

None of it requires touching the templates again. Edit a guide once in Studio
and the site works out its URL, its metadata, its structured data, its place in
the sitemap, its landing pages and its internal links on its own.
