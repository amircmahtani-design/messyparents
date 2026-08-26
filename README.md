# The actual bug. Three undefined names in code I wrote.

**20 files. 4 to delete, but not yet.**

---

## What was wrong

Not the hoisting I fixed last time — that was real but it was not this.

`renderLongform()` called **`esc()`**. Studio's escaper is **`escS()`**. A
ReferenceError, thrown inside `fillForm()`, which meant:

- the section cards were never drawn, and
- every line after `renderLongform()` in `fillForm()` never ran — including the
  two that load the red box.

So the red card sat there empty and the boxes never appeared. One undefined
name, both symptoms, and nothing visible unless you had the console open.

While fixing it I added a check that every helper Studio calls is one it
defines. It immediately found **a second one**: `markDirty()`, which I had also
invented — Studio has no such function; edits drive the live preview instead.
Both are corrected, and typing in a section now debounces through
`schedulePreview()` like every other text field.

That check is now part of `npm run verify`, so a made-up function name cannot
ship again.

## What you will see

Opening `first-fever`:

```
  4 section cards, already filled in:
    The age rule, first
    How to take a temperature
    Watch the baby, not the number
    Managing at home
  red box: 6 bullets, already there
```

- **Heading** box then **The words** box on each.
- **+ Add another section** works.
- The red **Speak to your doctor if** card is permanent and arrives with that
  guide's existing bullets.

Nothing saves until you press Save; Revert puts it back.

## Also in here

Live search on Popular (type "fev", no Enter), `autocomplete="off"` so Chrome's
autofill stops covering the results, the Stage 2 build, one set of pills as real
links, the fold bar, round arrows, the editable editorial page, hashed asset
URLs including Studio's, and the redirect-loop fix.

## Delete these in a few days

```
assets/js/guides.js   assets/js/mpc-store.js
assets/js/guide-page.js   assets/js/mpcstore.js
```

## After deploying

Hard-refresh Studio (Ctrl+Shift+R), open a guide, and the fuller-answer boxes
should have that guide's writing in them with the red box below.

---

Build clean, 0 errors, idempotent. 114 static checks, 60 runtime checks.
