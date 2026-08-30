# Upload these — visual-concept fix (round 2)

Drop the contents of this folder over your checkout, keeping the folder
structure. Verified: applying it to a clean copy of the original repository
gives `npm run check` → **691 passed, 0 failed**.

48 files, 14 of which are the poster reference images (unchanged since round 1;
included so the folder applies cleanly on its own).

---

## What changed in this round

### The repeated illustration

Every frame was getting the same picture because everything that decided the
SCENE was constant: the cast was Mama+Papa+Ari on seven frames out of nine, the
approved scene was the same one on all nine, and the art note was a generic
phrase. A slide FAMILY is not a visual concept.

**New: `scripts/lib/social/concept.js`.** Derives a grounded `visualConcept` per
slide from that slide's own approved content — its kind, its source field, and
the objects its exact words name. It decides the scene, the cast, which
characters must NOT appear, the objects, the crop and the mood, and folds all of
it into a `fingerprint`.

For `drinking-less-milk` the nine frames now differ:

| frame | concept | cast |
|---|---|---|
| cover | bottle-offered-refused | Mama + Papa + Ari |
| quick answer | distracted-mid-feed | Papa + Ari |
| usually normal | object-clues-no-figures | Ari only |
| what helped us | dim-quiet-room | Papa + Ari |
| warning | checking-nappy-and-feed | Mama + Ari |
| save / CTA | family-together-resting | Mama + Papa + Ari |
| story hook | vertical-bottle-standoff | Papa + Ari |
| story warning | vertical-attentive-check | Mama + Ari |
| story CTA | family-close-vertical | Mama + Papa + Ari |

The concept is in the OpenAI prompt, the artwork cache key, the stored
provenance and the approval hash. Only the character sheets for a slide's own
cast are attached to its request — attaching a sheet for somebody who must not
appear is an invitation to draw them.

### The cache key

`artKey()` hashed the family, the variant, the cast and a free-text note, so
`quick` and `normal` — same family, same poster — hashed identically and the
second was served the first one's picture. The key now carries kind, source
field, concept id, action, objects and concept fingerprint. Punctuation edits
still do not move it.

### The recruitment-poster look

Gone. The palette is now `assets/css/tokens.css` **by value** — the old
`#215d9c` navy, `#dc5019` vermilion and `#cb4a22` red were invented by eye and,
blocked across a frame under all-caps, produce a wartime notice.

* No full-bleed dark field on any slide. Blue survives as a soft brushed patch.
* No full-width red banner. The warning is a torn coral patch well inside the
  frame, and no slide carries a large blue and a large red block at once.
* Headlines are sentence case in Baloo 2 700. At most ONE line per headline may
  be uppercase — only where emphasis is the point, only at one or two words,
  and never on a warning.
* Patrick Hand carries the support lines; Nunito the small factual wording.
* No rectangles left in the scene layer: uneven corner radii, rotations, torn
  scraps, loose circles, scribbled underlines.

### The fallback scenes

`sceneCover`, `sceneQuickCheck`, `sceneHelped`, `sceneWarning`, `sceneDont`,
`sceneSave` and `sceneStory` now differ materially in cast, crop, scale and
object treatment. The clue slide has **no people in it at all** — it is a
flat-lay of the objects the guide's own words name, with Ari small in a corner.
`castHTML()` also places a solo parent explicitly instead of pinning Papa to the
right edge, which is what made a one-parent scene overlap into a single shape.

---

## Files

**New (4)**

    scripts/lib/social/concept.js     the grounded visual concept
    scripts/lib/social/openai.js      the shared OpenAI transport
    scripts/social-proof.js           the real generation runner + state report
    (plus the round-1 new files, included so this folder applies on its own)

**Changed in this round (10)**

    scripts/lib/social/compose.js     attaches the concept, softer colour runs,
                                      one-word emphasis, single-line panel titles
    scripts/lib/social/templates.js   the tokens palette, mixed-case type,
                                      soft patches, seven distinct scenes
    scripts/lib/social/artwork.js     the semantic cache key, pathsAreDistinct()
    scripts/lib/social/artprompt.js   the tone instruction, palette by value,
                                      per-slide concept block, new briefs
    scripts/lib/social/refs.js        selectFor() takes the slide's own cast
    scripts/lib/social/hash.js        the concept is part of the approval hash
    netlify/functions/social-artwork.js   uses the shared transport
    tests/social-artwork.js           cache-key and asset-identity tests
    tests/social-references.js        key-safety for the shared transport
    package.json                      social:proof:live, social:proof:report

---

## Running the real proof

    OPENAI_API_KEY=…  node scripts/social-proof.js drinking-less-milk

Same `artwork.generate()` and same transport as the live dashboard. It writes
the six 1080×1350 files, the three 1080×1920 files, both captions and an
`artwork-report.json` into `social-preview/drinking-less-milk/`, and prints the
artwork-state table with the OpenAI request count. A frame that fails prints
`FAILED` or `REJECTED` with the reason — it never silently shows the fallback.

    node scripts/social-proof.js drinking-less-milk --report

prints the same table with no calls and no spend.

    node scripts/social-proof.js drinking-less-milk --only slide:4

regenerates one frame.

`SOCIAL_PUBLISHING_ENABLED` stays unset. Publishing remains impossible.
