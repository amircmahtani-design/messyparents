# Guide page: collapsible longer version + previous/next arrows

**4 files. Deploy on the site you have live now — this is independent of the
speed-up work and does not touch it.**

```
scripts/build.js            (your current one, plus 4 lines)
assets/js/guide-render.js
assets/css/guide.css
```

`scripts/build.js` here is built on top of the redirect hotfix you already
deployed, so it keeps that fix.

## 1. The longer version now folds away

It is a `<details>` element, closed by default. Tap the heading to open it.

**The prose stays in the HTML either way.** Google indexes content inside a
closed accordion normally — that has been its position since mobile-first
indexing, because so much mobile content lives behind expanders — and the AI
crawlers read markup rather than clicking. So you keep the search and citation
value and lose the wall of text. Measured on `wont-nap`: 632 words still in the
page with every script stripped out.

No JavaScript involved, so it works on a page whose whole point is that it does
not need any, and it is keyboard and screen-reader accessible for free.

## 2. Spacing and font

- The gap under the rule went from 28px to 34px, and there are now 22px between
  the heading and the prose when it opens.
- `.g-extra` headings are hand-lettered now, like the guide above them. They
  were Baloo 2, which read as a different document starting rather than the same
  guide continuing.
- **The prose itself is still in the body face.** Patrick Hand is right for a
  headline and for four bullet points; it is tiring for 250 words of paragraphs.
  If you want it handwritten too, say so and it is one line.

## 3. Previous / next arrows

- **Wide screens:** two quiet circular arrows pinned to the left and right edges
  of the viewport, vertically centred, outside the reading column.
- **Phones:** a plain pair of links under the guide with the neighbouring titles,
  since nothing should float over text on a small screen.

They follow the library's own order, and the first and last guides correctly get
only one arrow.

These are real `<a href>` links written by the build, not a scripted control.
That matters at 300+ guides: every guide now gains two more inbound links from
its neighbours, and the guides nothing links to are the ones that never get
found. "Read next" at the bottom is topical; this is sequential. Different jobs.

## Check after deploying

1. A guide page: the longer version is folded, opens on tap, closes again.
2. Arrows appear either side on desktop, as links underneath on a phone.
3. First guide has only a next arrow; last has only a previous.
4. `/guides/drinking-less-milk/` still loads (the redirect fix is still in).

Tested here against your live repo: build clean, 0 errors, all 66 checks pass.
