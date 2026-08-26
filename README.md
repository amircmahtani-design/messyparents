# Completes Stage 2 — the missing build, one set of pills, and the section editor

**19 files to upload. 4 to delete, but not yet.**

---

## 1. The pills, search, and "fev" on Popular — all one bug

Your repo had **Stage 2's pages** running against the **older build**:

```
guides.html        Stage 2   -> loads mpc-catalogue.js
scripts/build.js   Guide-UI  -> never writes /data/guide-index.json
```

The page fetches that file, gets a 404, and falls back to an empty list —
deliberately, so a failed fetch costs filtering rather than the whole page.
Which is exactly why nothing looked broken. An empty list means every query and
every pill returns nothing.

My fault: overlapping bundles with no way to tell which halves went together.
`scripts/build.js` here is the Stage 2 one, so the data files get written.

**No search code was damaged.** Tested against the real generated files:

```
"m" 31 hits   "mi" 15   "mil" 6   "milk" 5

Popular -> "fev" -> Search -> guides.html?q=fev
  2 guides: Your baby's first fever | Is teething making my baby miserable?
```

(The Popular box has always submitted to `guides.html?q=` rather than filtering
in place — that is how it originally shipped, not something that changed.)

## 2. One set of pills

Filter pills are `<a href="/topics/health/">` now, with the click intercepted so
they filter in place exactly as before. A crawler follows them, so the duplicate
row of links at the bottom is deleted. If the JavaScript ever fails, a click
lands on a working topic page instead of doing nothing.

## 3. The fuller answer looks like the rest of the editor

Each section is now the same card as the guide's three columns: a tagged panel,
a **Heading** box, then a labelled text box. Prose, not bullets — the box is
taller and there is no "one per line" hint to mislead.

A guide with nothing written yet opens with one empty card ready to type into,
rather than an empty state and an extra click. Blank sections are dropped on
save, so that costs nothing if it goes unused.

## 4. Tests, so a broken page cannot look fine again

That is what cost you today. Three new checks:

- fails if a page loads the catalogue but the build has not written the index,
  saying exactly that;
- types `m`, `mi`, `mil`, `milk` and asserts each returns results;
- walks Popular -> `?q=fev` and asserts the fever guide comes back.

## Delete these in a few days, not now

```
assets/js/guides.js   assets/js/mpc-store.js
assets/js/guide-page.js   assets/js/mpcstore.js
```

While they are there, re-uploading the old HTML rolls you back.

## After deploying

1. Hard-refresh (Ctrl+Shift+R), Studio too.
2. **`themessyparentscollection.com/data/guide-index.json` should return 31
   guides.** If it 404s the build did not run and search will be empty again.
3. "fev" on Popular, "mil" on Guides, click a topic pill.
4. Studio -> any guide -> The fuller answer: Heading box, text box.

---

Build clean, 0 errors, idempotent. 111 static checks, 58 runtime checks.
