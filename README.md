# The fuller answer, fixed properly. And live search everywhere.

**20 files to upload. 4 to delete, but not yet.**

---

## Why the section boxes were missing and the button did nothing

One bug, both symptoms.

`let longDraft = []` was declared BELOW `fillForm()`, the function that uses it.
Studio selects a guide while it is starting up, so that load ran while the
variable was still in its temporal dead zone. The ReferenceError:

- aborted the load, so no section cards were ever drawn, and
- stopped the rest of the script running, so the "+ Add another section"
  listener was never attached.

Nothing appeared in the console unless you were looking for it. That is my
mistake — I moved that block during an edit and put it after its first use.

The declaration is above `fillForm()` now. The check added to `npm run verify`
found a **second, older instance of the same thing** (`pvReady`, used by the
preview during start-up) which has been hoisted too.

The `\u26a0` showing as literal text was the same edit: an escape written into
markup rather than into a JavaScript string. Also checked for now.

## What you get when you open a guide

- **Heading** box and **The words** box, already there.
- A guide written before this editor has its prose split into those boxes as it
  opens. `wont-nap` gives four: *Start with the wake window*, *Read the first
  sign, not the third*, *The boring fixes that work*, *When the nap is 35
  minutes and that's it*. Lists keep their bullets inside the text.
- **+ Add another section** works.
- A permanent red **Speak to your doctor if** card underneath — Heading, then
  one bullet per line. Always there. `wont-nap` arrives with its existing three.
  Empty bullets means it does not render on the guide.

Nothing saves until you press Save; Revert puts it back.

## Live search on Popular

Typing "fev" now matches in place, no Enter needed:

```
  results shown : true
  count         : 2 guides
  titles        : Your baby's first fever | Is teething making my baby miserable?
```

The "fever / fev" dropdown you saw was **Chrome's own autofill** covering the
results, not the site. `autocomplete="off"` is on all three search boxes now.

## And the rest, in one coherent set

The Stage 2 build (its absence is what emptied the pills and search), one set of
pills as real links, the fold bar, the round arrows, the editable editorial
page, hashed asset URLs including Studio's, and the redirect-loop fix.

## Delete these in a few days

```
assets/js/guides.js   assets/js/mpc-store.js
assets/js/guide-page.js   assets/js/mpcstore.js
```

## After deploying

1. Hard-refresh (Ctrl+Shift+R), Studio too.
2. `themessyparentscollection.com/data/guide-index.json` should return 31 guides.
3. Type "fev" on Popular without pressing Search.
4. Studio -> any guide -> the fuller answer should already have its writing in
   the boxes, with the red box below it.

---

Build clean, 0 errors, idempotent. 113 static checks, 60 runtime checks.
