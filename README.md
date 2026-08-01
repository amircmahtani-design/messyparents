# Messy Parents Collection — website

Static site. No build step, no dependencies, no framework. Open it, edit it, upload it.

## Run it locally

```bash
cd messy-parents-site
python3 -m http.server 8080
# then open http://localhost:8080
```

(Opening `index.html` directly by double-clicking also works.)

## Adding your content

**You only ever edit one file: `data/content.js`.**

Everything on the site — the month rails, the sections, the search index, the
"x of 16 sections ready" counters on the home page — is generated from it.

Each of the four tabs has an entry for all 16 age periods:

- `m01` … `m12` — months 1 to 12
- `m13_15`, `m16_18`, `m19_21`, `m22_24` — year two, in quarters

Find the one you want, e.g. `content.sleeping.m04`, and fill it in:

```js
"m04": {
  "headline": "The four month sleep regression",
  "summary": "One or two sentences that open the section.",
  "atAGlance": [
    { "label": "Total sleep", "value": "12–16 hrs" },
    { "label": "Naps", "value": "3–4" }
  ],
  "blocks": [
    { "type": "text", "heading": "What is happening", "body": "Paragraph one.\n\nParagraph two." },
    { "type": "list", "heading": "What helps", "items": ["First thing", "Second thing"] }
  ],
  "redFlags": ["Sign that needs a professional"],
  "status": "draft"
}
```

`Feeding → Month 1` is filled in as a worked example — copy its shape.

### Block types

| type | fields |
|---|---|
| `text` | `heading`, `body` (blank lines make new paragraphs) |
| `list` | `heading`, `items[]` — bullets |
| `steps` | `heading`, `items[]` — numbered |
| `checklist` | `heading`, `items[]` — tick boxes |
| `callout` | `variant` (`tip` / `note` / `warn`), `heading`, `body` |
| `quote` | `body`, `attribution` |
| `image` | `src`, `caption`, `alt` |

Sections left empty show a dashed placeholder telling you exactly which key to fill.
They are also excluded from search and from the home page counters, so the site
always tells you honestly how much is done.

## Adding your visuals

Drop image files into `assets/img/`, then reference them from a block:

```js
{ "type": "image", "src": "assets/img/newborn-latch.png", "caption": "A deep latch." }
```

## Re-skinning

All colours, fonts, radii and shadows are CSS variables in the `:root` block at the
top of `assets/css/style.css`. Change them there and the whole site follows.

## Publishing

It is plain static files, so anything works: Netlify (drag the folder onto their
dashboard), Vercel, Cloudflare Pages, GitHub Pages, or any web host's `public_html`.

## Structure

```
index.html          home
feeding.html        \
sleeping.html        |  four tab pages — all identical,
development.html     |  they just set data-tab on <body>
health.html         /
data/content.js     ← your writing goes here
assets/css/style.css
assets/js/app.js    renderer + search
assets/img/         your visuals
```
