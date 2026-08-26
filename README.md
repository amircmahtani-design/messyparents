# The fuller answer, editable in Studio + why the last upload did nothing

**8 files.** Includes the redirect hotfix. Independent of the speed-up work.

```
guide.html
scripts/build.js            hotfix + prev/next + automatic asset hashing
scripts/lib/data.js
assets/js/guide-render.js
assets/css/guide.css
assets/js/site-text.js
studio/index.html
editorial.html
```

---

## Why "How we write these" was blank — and why it now cannot be

`site-text.js` is cached for a week and Studio asked for it by a fixed name, so
a freshly deployed copy sat on the server while your browser kept running last
week's. The `editorial` entry existed in the file the whole time; the file never
arrived. Studio fell back to "Edit the wording on this page." and drew nothing.

Two fixes, because one was clearly not enough:

1. **The build now stamps Studio's own script URLs** with a hash of each file's
   contents — `studio/index.html` and `editor/index.html` had no cache-busting
   of any kind and the build had never touched them. Same for `guide.css`.
2. **A safety net inside `studio/index.html`**: if `SITE_TEXT` arrives without
   an editorial entry, Studio defines it itself. `studio/index.html` demonstrably
   reaches you — the fuller-answer editor appeared — so the fields cannot fail
   to show up again. Once the stamped copy lands, that block never runs.

Open Studio → **How we write these** and you get what the Home page gives you:
a heading box, then a big text box, then a heading, then a text box, six times
over, each pre-filled with what is on the page now.

## The arrows

Round and soft, made from the same parts as the topic pills: cream fill, the
site's hairline border, a lift and a blue edge on hover. 66px, out in the margin
rather than clipped against the window.

The breakpoint moved from 1100px to **1380px**. Below that the guide's own
1180px column leaves too little margin and a floating arrow crowds the text, so
those widths keep the labelled pair underneath — which is more useful there
anyway.

**I also found why they looked wrong.** `guide.css` had a whole duplicated
half from one of my earlier edits, so an older arrow rule was overriding the new
one. 406 lines down to 291, zero duplicated rules, braces balanced.

## The rest of what you asked for

- **The line above "Want the fuller answer?" is gone.** The bar is its own
  divider.
- **More of the width is used**: the reading column went from 700px to 960px,
  on the fuller answer and on the editorial page.
- **Larger text**: the fuller answer's prose is now `clamp(1.2rem, 1.45vw,
  1.34rem)` with 1.75 line-height, and its headings scale up to match.
- **The editorial page reads like the rest of the site.** It was using the plain
  article template, so it was set in the body face while everything around it is
  hand-lettered — the page a reader checks to decide whether to trust you,
  looking like a different website.

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
