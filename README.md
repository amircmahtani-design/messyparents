# The last one. Search everywhere, and the fuller answer finished.

**20 files to upload. 4 to delete, but not yet.**

---

## 1. Search matches as you type — on all three pages

The Popular box used to submit to `guides.html?q=` and do nothing until you
pressed Search. Now it matches in place, like Home and Guides.

Tested, typing "fev" with no Enter pressed:

```
  results shown : true
  count         : 2 guides
  titles        : Your baby's first fever | Is teething making my baby miserable?
```

The dropdown you saw under the box with "fever / fev" in it was **Chrome's own
autofill**, not the site. `autocomplete="off"` is on all three search inputs now,
so it will not cover the results.

The form keeps its `action`, so pressing Enter still works if JavaScript fails.

## 2. The fuller answer — boxes waiting for you

Open any guide and the boxes are simply there:

- **Heading** box, then **The words** box. Already visible, nothing to press
  first.
- A guide written before this editor existed has its prose **split into those
  boxes automatically as the guide opens** — headings become headings, lists
  keep their bullets. No "Bring it in here" button any more. Nothing saves until
  you press Save, and Revert puts it back.
- **+ Add another section** for more.
- A permanent red **"Speak to your doctor if"** card underneath, with a Heading
  and one bullet per line. Always there — you never add it. Leave the bullets
  empty and it does not render on the guide.

That red box was already in your data model and already rendered on the page;
Studio simply had no editor for it. It does now.

`wont-nap` converts to four sections: *Start with the wake window*, *Read the
first sign, not the third*, *The boring fixes that work*, *When the nap is 35
minutes and that's it* — plus its existing three red-box bullets.

## 3. Everything from the earlier bundles, in one coherent set

- The **Stage 2 build**, which writes `/data/guide-index.json`. Its absence is
  what made the pills and search return nothing.
- **One set of pills**, as real links, with the duplicate bottom row deleted.
- The fold bar, the round arrows, the editable editorial page, content-hashed
  asset URLs including Studio's, and the redirect-loop fix.

## Delete these in a few days, not now

```
assets/js/guides.js   assets/js/mpc-store.js
assets/js/guide-page.js   assets/js/mpcstore.js
```

## After deploying

1. Hard-refresh (Ctrl+Shift+R), Studio too.
2. **`themessyparentscollection.com/data/guide-index.json` should return 31
   guides.** If it 404s the build did not run and search will be empty.
3. Type "fev" on Popular without pressing Search.
4. Studio -> any guide -> the fuller answer boxes should already have that
   guide's writing in them.

---

Build clean, 0 errors, idempotent. 111 static checks, 60 runtime checks.
