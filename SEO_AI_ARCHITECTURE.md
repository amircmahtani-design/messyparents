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
  build.js          the build
  lib/site.js       domain, entity name, URL shapes — one source of truth
  lib/data.js       loads guides and normalises them into one model
  lib/head.js       <head> tags and JSON-LD
  lib/audit.js      validation + the audit page
assets/js/
  guide-render.js   THE RENDERER — runs in Node and in the browser
  guide-page.js     guide page behaviour in the browser
```

Data is read in this order, and it falls through on any failure:

1. **Firestore** over the REST API, using the same public API key the browser
   uses (`guides` is `allow read: if true`).
2. **`assets/js/guides.js`**, the bundled copy the browser already falls back to.
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

Two things update on different clocks, and it matters to know which is which.

**Immediately, no deploy needed** — because these read Firestore in the browser:

- the guide appears in the grids on Home, Popular and All Guides
- edits to an existing guide show on its page
- topic pills, ages, search and filtering all include it

**On the next deploy** — because these are generated files:

- the guide's own page at `/guides/<slug>/` with its title, description,
  canonical, Open Graph tags and Article schema
- its entry in `sitemap.xml` and `llms.txt`
- its place on the topic and age landing pages
- its "Read next" links on other guides

In between, a brand-new guide still works: the fallback rule renders it from
Firestore. What it lacks is its own metadata and its sitemap entry — so it is
readable and shareable, just not yet properly indexable.

**To close the gap:** Studio → Site → Search & AI → **Rebuild the search pages**.
Takes a minute or two. Not urgent for one guide; worth doing after a batch, and
before you would want Google to find them.

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

- **~5KB of inline CSS removed from every guide page.** The panel styles moved
  to `assets/css/guide.css`, hard-cached. At 300 guides that is 1.5MB of
  duplication avoided, and a change reaches every guide at once.
- **No Firestore round trip before first paint.** The content is in the HTML.
- **No layout shift from hydration** — the hash check means the DOM is not
  rebuilt when it is already correct.
- **Illustrations carry `width`/`height`**, so they reserve their space.
- **Landing pages load one category**, not the whole archive.
- `_headers` caches assets hard, HTML not at all, crawler files for an hour.

The all-guides page renders all 31 cards server-side. At 300 that is around
2,400 DOM nodes — acceptable, but if it ever feels slow the fix is to paginate
the *visible* list while keeping every link crawlable.

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

**`npm run verify`** — 63 checks against what the build actually wrote to disk:
card parity between build and browser, unique titles, correct canonicals, one
`<h1>`, the answer present in the HTML, valid schema, no relative paths, no
orphans, no fabricated dates, no leaked internal IDs, no ghost breadcrumbs,
sitemap and robots correctness, no redirect chains, private surfaces private.

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
   Build hooks, paste into Studio once per device.
4. **Turn on "The longer version"** — see above. One click, triples the
   indexable content.
5. **Social profiles** — when they exist, add them to `sameAs` in
   `scripts/lib/site.js` so the Organization entity is linkable.
6. **`INDEXNOW_KEY`** — optional, for Bing/Copilot freshness.
7. **Analytics** — nothing was installed. When you add it, referrer data is
   preserved, so `chat.openai.com`, `perplexity.ai`, `copilot.microsoft.com` and
   `claude.ai` will be distinguishable as referral sources.
8. **Run `npm test` once after the first deploy** — the browser-level audit
   could not be run here.

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
