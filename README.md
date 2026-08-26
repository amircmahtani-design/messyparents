# Guide page: the fuller-answer bar, edge arrows, and an editable editorial page

**7 files. Deploy on the site you have live now.** Includes the redirect hotfix.
Independent of the speed-up work.

```
scripts/build.js            your current one + the hotfix + 4 lines
assets/js/guide-render.js
assets/css/guide.css
assets/js/site-text.js
studio/index.html
editorial.html
```

---

## 1. "Want the fuller answer?"

One quiet bar across the width of the guide, tapped to open. Centred label,
chevron that flips when it opens. **"More detail" and "3 min read" are gone** —
the bar says one thing.

Folded by default, and the prose is still in the HTML either way: Google indexes
a closed `<details>` normally, and the AI crawlers read markup rather than
clicking. Measured on `wont-nap`: 631 words still in the page with every script
stripped out. No JavaScript, keyboard and screen-reader accessible for free.

The label is still a real `<h2>`, so the prose sits under a heading in the
document outline. It just does not look like one.

## 2. The arrows

Bare chevrons pinned to the left and right edges of the viewport, vertically
centred, well outside the reading column — no pill, no shadow, no circle. They
nudge on hover. Drawn in CSS rather than set as a character, so their weight and
size stay exact whatever the reader's font settings do.

On a phone they become a plain labelled pair under the guide, because nothing
should float over text on a small screen.

Real `<a href>` links written by the build, so every guide gains two inbound
links from its neighbours — which is what stops guides becoming orphans as the
library grows past 300.

## 3. All of it editable — Studio → Site → Text → The guide template

```
Fuller answer — the bar you tap to open it     Want the fuller answer?
Heading above the suggested guides             Read next
Previous-guide arrow — screen reader text      Previous
Next-guide arrow — screen reader text          Next
The two arrows — screen reader name            Previous and next guide
```

These sit alongside the ones already there (the blue box label, the notepad
badge). Change the bar to "The long version", "Tell me more", anything — it
applies to every guide at once, old and new.

## 4. "How we write these" is editable too

Studio → Site → **How we write these**. Fourteen boxes: the page heading, the
line under it, and the six sections with their headings and their words, every
one pre-filled with exactly what is on the page now.

It needed three things, all of which the codebase already documented:
a `editorial` entry in `assets/js/site-text.js`, one line adding the page to
Studio's list, and tags on the heading and intro in `editorial.html` — the only
two strings on that page that were never marked editable.

### Where the link should live — my recommendation

**Keep it in the footer; do not add a sixth nav tab.** The nav carries the five
things a tired parent needs at 3am, and a sixth item makes the mobile menu worse
for everyone to serve a page most visitors will never open. It is already linked
from the footer of every page, which is what search and answer engines actually
look for.

**One change worth making:** link it from the About page as well — that is where
somebody goes when deciding whether to trust you. One line; say the word.

---

Tested against your live repo with the hotfix applied: build clean, 0 errors,
all 66 checks pass, one h1, five h2s, five internal guide links, 631 words
without JavaScript.
