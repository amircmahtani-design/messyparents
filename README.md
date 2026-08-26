# The fuller answer, editable in Studio + why the last upload did nothing

**8 files.** Includes the redirect hotfix. Independent of the speed-up work.

```
guide.html                  guide.css?v=1 -> ?v=2   (this is the fix, see below)
scripts/build.js            your current one + the hotfix + 4 lines
scripts/lib/data.js
assets/js/guide-render.js
assets/css/guide.css
assets/js/site-text.js
studio/index.html
editorial.html
```

---

## First: why nothing happened last time. My mistake.

`guide.html` asks for `assets/css/guide.css?v=1`, and `_headers` caches CSS for
a week. I changed the stylesheet but left the version at `1`, so the URL never
changed — your browser and Netlify's CDN both kept serving the old file. The new
markup shipped; the CSS to style it did not.

(Asset URLs get hashed automatically in Stage 2, which is exactly why that
change exists. On your current build it has to be bumped by hand.)

It is `?v=2` now. If a change to `guide.css` ever seems not to arrive again,
that number is the first thing to check.

Worth confirming the deploy itself ran: Netlify -> Deploys -> newest -> the log
should say `31 guide pages written`.

## The fuller answer is now written in Studio

Open any guide. Above the quick-answer box there is now **The fuller answer**:
a list of sections, each with a heading and its words. Add, remove and reorder
them. A blank line starts a new paragraph.

This is the prose that sits behind the "Want the fuller answer?" bar.

**Why this needed building.** That prose lived in a `body` field of raw HTML
that nothing in Studio could edit — every guide had 150-350 words in it and
there was no way to change a single one without opening Firestore directly. It
is stored as data now:

```
longform: [ { h: "Building the body clock", t: "Daylight in the morning..." } ]
```

Plain text in, escaped on the way out, so nothing typed in Studio can break a
page.

**Your existing guides are untouched.** They still have their old HTML and still
render from it exactly as now. When you open one, a line appears offering to
**bring it in here** — that converts the HTML into editable sections, splitting
on its headings. It is a button rather than automatic, because it is one-way and
should be your decision. Nothing changes on the site until you Save.

The build sees the new format everywhere it matters: word counts, meta
descriptions, the SEO audit, the sitemap. A section written in Studio is
indistinguishable downstream from prose written the old way.

## Font

The fuller answer's prose is hand-lettered now, like the rest of the guide, at
slightly larger size and line-height because Patrick Hand is lighter and needs
the room. Headings match too.

I had kept it in the body face for readability over 250 words. You asked for the
same font as everything else, so it is. **Have a proper look at a long guide
before you decide you like it** — if it reads heavy, changing
`.g-detail-fold .article-body` back is one line and I will do it.

## Also in here

- **"Want the fuller answer?"** bar: centred label, chevron that flips. "More
  detail" and "3 min read" gone.
- **Edge arrows**: bare chevrons at the viewport edges on desktop, a labelled
  pair under the guide on a phone. Real links, so every guide gains two inbound
  links from its neighbours.
- **Studio -> Site -> Text -> The guide template** now has the bar label,
  "Read next", and the arrow labels.
- **Studio -> Site -> How we write these**: fourteen boxes, pre-filled.

---

Tested: build clean, 0 errors, all 66 checks pass, 631 words on a guide without
JavaScript, and a guide authored the new way renders and counts identically to
one written the old way.
