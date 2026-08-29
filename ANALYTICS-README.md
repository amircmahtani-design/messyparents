# Analytics, consent and Search Console

Added August 2026. GA4 with Consent Mode v2, a minimal consent banner, and a
privacy page. Nothing else — no advertising pixels, no heatmaps, no session
recording, no second analytics vendor.

## Turning it on

One environment variable, in Netlify → Site configuration → Environment
variables:

```
GA_MEASUREMENT_ID = G-XXXXXXXXXX
```

Then trigger a deploy. That is the whole switch.

**With it unset, nothing happens at all.** No tag, no cookie, no banner, no
network request — the site behaves exactly as it did before any of this
existed. That is also true of every local build, so `npm run build` on a laptop
never produces a page that phones Google.

To turn analytics off again, delete the variable and redeploy. Nothing else
needs undoing.

### Why an environment variable and not Studio

The id is only ever read at build time, so a Studio field would still need a
deploy to take effect — it would look editable without being editable. The
variable also keeps the id out of git, and out of `studio/index.html`, which
must not be edited from the repo (see `claude/studio-index-html-warning.md`).

The Search Console verification token is different and *does* live in Studio
(Site → Search & AI), because `scripts/lib/head.js` already emits it per page.

## How it is wired

```
scripts/build.js  injectAnalytics()  →  <script>window.MPC_GA="G-…"</script>
        ↓                                (inside bakeCommon, so every public
        ↓                                 page and no admin page)
assets/js/mpc-runtime.js              →  on `load`, fetches mpc-analytics.js
        ↓
assets/js/mpc-analytics.js            →  consent, banner, gtag, events
```

`bakeCommon()` is the choke point. Studio and the Editor never pass through it
— they are only stamped for asset URLs — so they cannot receive analytics even
by accident. Neither loads `mpc-runtime.js` either, which is the second reason.

### Why the tag is injected rather than linked

`tests/verify.js` asserts that a generated guide page loads **at most two
scripts**. A `<script src>` in the page template would put a third on all 61
guide pages and break that. Injecting from the runtime keeps it true and keeps
`gtag.js` off the critical path entirely — it is requested after `load`, once
the guide is already on screen.

### The two budgets

| File | Ceiling | Why |
|---|---|---|
| `mpc-runtime.js` + `guide.js` | 14KB gzipped | what a reader waits for before first paint |
| `mpc-analytics.js` | 3.5KB gzipped | everything after `load` |

They are separate on purpose. The core figure means "what the reader waits
for", and folding post-load bytes into it would make it mean something else.
Both are enforced in `tests/verify.js` with the reasoning written beside them.

The analytics ceiling **moved from 3KB to 3.5KB in August 2026**, immediately
after the feature landed. 3KB was a number guessed before the file was written,
and it left seven bytes of headroom — the same position the guide-page budget
was in at 12KB with eleven bytes, which then failed on the first line of the
next change.

Squeezing under it also did real damage. Comments were shaved out of a file
whose entire risk is that its consent ordering is not self-evident, and the
banner's class name was shortened to save bytes, which silently broke its
styling (see the bug below). The rise is not because the file grew; it is
because the first number was set badly and was buying nothing but pressure to
write worse code.

3.5KB leaves roughly 450 bytes — a change or two of room, and still nowhere
near a consent-management platform. If it needs raising again, write down why,
in a sentence, or change the code instead. **Do not shave comments to fit.**

## Consent

Order of operations, which is the part that matters legally:

1. `gtag("consent", "default", …)` with everything **denied**, queued first on
   a `dataLayer` nothing else has touched.
2. Only then is `gtag.js` requested.
3. `gtag("consent", "update", {analytics_storage:"granted"})` on Accept, and
   never before.

Consent Mode v2 reads that default before it initialises storage, so **no `_ga`
cookie exists while the answer is denied**. Until a choice is made, Google
receives a cookieless ping with no identifier stored on the device.

Three states:

| Stored choice | gtag.js | Cookie | Banner |
|---|---|---|---|
| none (first visit) | loaded, storage denied | none | shown |
| `granted` | loaded, storage granted | `_ga`, `_ga_<id>` | no |
| `denied` | **never requested** | none | no |

The choice lives in `localStorage` under `mpc.consent`. Not a cookie — it never
leaves the device, so it needs no consent of its own.

Declining after having accepted also **expires the `_ga` cookies already set**.
A consent update stops them being read but does not delete them, so that is
done explicitly, on both the bare and dot-prefixed host forms.

### Reopening the choice

`mpc-analytics.js` appends a **Cookie settings** link to `.foot-links` at
runtime, next to the Privacy link the build bakes in. It reopens the same
banner, and a visitor can move in either direction as often as they like.

It is added by script rather than baked into the HTML so it can never be a dead
link: with no Measurement ID configured, the file never runs and the link does
not exist.

## What is measured

GA4's own defaults cover users, new vs returning, sessions, page views,
engagement time, engaged sessions, source, medium, referrer, landing page,
country, device and browser. None of that needed code.

Added on top, on generated guide pages only:

| Parameter | Source |
|---|---|
| `page_type` | `guide`, or `not_found` on a soft 404 |
| `guide_slug` | the guide's slug |
| `guide_topic` | `g.topic` |
| `guide_age` | first age band |

Register the last four as **custom dimensions** in the GA4 UI (Admin → Custom
definitions → Create custom dimension, scope: Event) or they will not appear in
reports.

### The soft 404

`_redirects` rewrites any unknown `/guides/*` to `guide.html` with a **200**, so
Netlify cannot distinguish a guide saved in Studio five minutes ago from a dead
URL. `guide.js` `notFound()` sets `window.MPC_NOT_FOUND`, and this file reports
`page_type: "not_found"` and drops the guide fields — otherwise every dead link
would count as a guide someone read.

### Guide-to-guide navigation

GA4 reconstructs guide A → B → C from ordinary page views by itself (Explore →
Path exploration). No custom event is needed for the sequence.

One event is sent, `guide_link_click`, carrying `link_type` of `prev`, `next`,
`related`, `card` or `other` — which control was used, which a page view cannot
show. One delegated listener; no markup was touched and no link changed how it
looks or behaves.

## Google Search Console

Domain verification, so no site code changes for verification at all:

1. search.google.com/search-console → Add property → **Domain**.
2. Enter `themessyparentscollection.com`.
3. Copy the TXT record it offers.
4. Netlify → Domains → the domain → DNS records → Add: type `TXT`, name blank
   or `@`, value = the copied string.
5. Back in Search Console, press Verify. DNS can take up to an hour.
6. Sitemaps → submit `sitemap.xml`.

Domain verification covers every subdomain and every protocol. The meta-tag
route still exists as a fallback (Studio → Site → Search & AI writes
`meta/seo.googleVerification`, and `scripts/lib/head.js` emits it), but it
verifies one hostname and needs a deploy.

Note that Site → Search & AI only renders if the live Studio has the current
`studio/illustration-generator.js` — `showPanel()` in `index.html` omits
`seoEditor` and the add-on works around it.

## robots.txt, sitemap, UTM

None of these were changed, and none needed to be.

- **Sitemap** is generated and already excluded Studio, the Editor and the
  audit. `/privacy.html` was added to it.
- **robots.txt** already disallows `/studio/`, `/editor/`, `/seo-audit.html`
  and `/.netlify/functions/` for every named crawler and for `*`.
- **UTM** attribution is GA4's own and needs no code. Netlify preserves query
  strings across the legacy `?id=` redirects, and the `/guides/*` rule is a
  rewrite rather than a redirect, so the URL and its parameters survive intact.

## A bug worth remembering

The banner styles itself from a CSS string inside this file. When the class was
shortened from `mpc-consent` to `mpc-cc` to fit the budget, the rename caught
the selectors and the `querySelector` calls but **not** `el.className` or the
button wrapper in the `innerHTML`. The result was a fully working, completely
unstyled bar across the bottom of every page — and nothing failed, because the
JavaScript was correct.

`tests/verify.js` now checks that every class the banner CSS targets exists in
its markup and the other way round. If a class is renamed again, that check is
what will say so.

## Testing

`npm run verify` runs the static suite. The analytics section covers the two
budgets, the absence of a static script tag, that Studio and the Editor stay
clean, the consent ordering, the privacy page and its footer link, and the
class-drift guard above.

Behaviour — the three consent states, withdrawal, reopening, cookie clearing,
the soft-404 path and the off switch — was exercised in a stubbed DOM
(`consent_test.js`, session workspace, 48 checks). Worth rebuilding as a repo
test if this file grows.
