# Working on The Messy Parents Collection

## Where guide content lives

Three copies, and they are not equals:

- **Firestore** is what readers see. `scripts/build.js` reads it on every
  Netlify deploy. Nothing reaches the live site until it is here.
- **`data/guides-bundle.js`** is the catalogue in this repo: every guide, in
  order, as `JSON.stringify(g, null, 2)` joined by `,\n`. The build falls back
  to it if Firestore cannot be read, and Studio loads it directly as
  `window.GUIDES` to offer batches for import. **New guides are added here.**
- `data/guides.json` and `assets/js/guides.js` are older, smaller and stale.
  They are deeper fallbacks only. Do not add to them.

Editing the bundle does not change the live site. Amir imports the batch in
Studio (Batches → Import this batch), which writes it to Firestore and asks
Netlify to rebuild. Say so when handing over a batch.

## Adding a batch

Amir sends a Word document, "Website Guides — Batch NN", 15 guides in a fixed
shape. Each guide gives: Category, Age range, Title, SEO description, Card
summary, Keywords, Suggested URL slug, a three-column table, a quick answer,
and `Heading3` sections under "Want the fuller answer?".

Take that copy **word for word**. Derive only what the document does not
carry, the way the existing guides derive it:

| field | from |
|---|---|
| `id` | Suggested URL slug |
| `icon` | topic: feeding→bottle, sleeping→moon, development→blocks, health→cross, sanity→heart |
| `panel.eyebrow` | `<Topic label> • <first age's start>–<last age's end> months` |
| `read` | `max(2, round((longform words + panel words) / 180))` |
| `related` | three existing guide ids, chosen by subject — check each one exists |
| `order` | continues the sequence; the last guide's `order` + 1 |
| `batch` | the batch number **as a string**: `"6"`, not `6` |

`featured: false`, `medical: false`, `body: ""`, `originalQuestions: []`,
`sources: []`. `callout` mirrors `panel.warn`. Key order matches the existing
records: id, topic, icon, featured, title, ages, read, summary, keywords, body,
callout, panel, originalQuestions, sources, medical, related, seo, longform,
order, batch.

Extracting the .docx: `<w:br/>` is a line break the author typed — keep it as a
newline or paragraphs run together. Collapse runs of spaces. The sanity
category is spelled several ways ("Parent Sanity", "Parents’ Sanity"), so
normalise the apostrophe before looking it up. Where the document's two copies
of the warning list disagree, the three-column table is the fuller one: use it
for both and say so.

## The warning column

The heading is **"Call your doctor immediately if"** everywhere.

Signs that need emergency help do **not** each carry the instruction — that was
tried, and at three qualifying bullets in a four-bullet column the phrase reads
as boilerplate. Instead each such column carries **one lead line**,
`panel.warn.lead` and `callout.lead`, rendered between the heading and the
bullets. The bullets stay exactly as Amir wrote them.

A sign is emergency-tier when it names:

- blue, grey or dusky colour;
- a pause in breathing;
- breathing that is visibly hard work — struggling, laboured, chest pulling in,
  nostrils flaring, grunting every breath, choking;
- a baby who is floppy, unresponsive, or cannot be woken.

Doctor-tier, deliberately: snoring, gasping or pauses described as a pattern
across nights rather than an event; a sleepy feeder; pale or mottled alone;
stiff or floppy limbs in a development guide; white poo.

The lead is composed from the families the column actually names, in fixed
wording, so the same signs always produce the same line:

- colour → `blue or grey`
- a pause plus any other breathing trouble → `a pause or struggle to breathe`;
  a pause alone → `a pause in breathing`; effort alone → `a struggle to
  breathe`; choking alone → `choking`
- floppy / unresponsive / cannot be woken → `a floppy baby you cannot wake`

Joined with commas and a final "or", sentence case, then
`— call your local emergency number now.` For example:

> Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot
> wake — call your local emergency number now.

`assets/js/guide-render.js` renders it, `assets/css/guide.css` and
`style.css` style it, Studio edits it as "Emergency line", and
`scripts/lib/social/compose.js` carries it onto the warning slide as a band —
without that the slide would show the signs and not the instruction.

## Before pushing

The build reads Firestore first, so to see new guides you must build without
it: move `assets/js/firebase-config.js` aside, run `node scripts/build.js`,
then put it back and `git checkout HEAD -- guide.html` (the offline build
writes a copy with no Firestore fallback and a test catches it).

Then:

- `npm run verify` — all suites, zero failures.
- Serve the repo and check every guide page at 390px and 1440px: no horizontal
  overflow, no console errors. (`scrollHeight` exceeding `clientHeight` on a
  column heading is a font descender, not clipping.)
- Render a social package for a guide you changed if the change touches
  warnings, and look at the warning slide.

The build writes generated pages (`guides/`, `topics/`, `ages/`, `sitemap.xml`,
`llms.txt`, `data/guide-index.json`, …) and re-stamps asset URLs in the
hand-written pages. None of that is committed: restore the tracked pages from
HEAD and delete the generated ones before committing. Commit only the source
you meant to change.

Push to `main`. Amir asked for this directly; do not open a pull request unless
he asks.
