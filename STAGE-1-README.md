# Stage 1 — build changes only. The site keeps working exactly as it does now.

**5 files. Nothing a visitor sees changes.**

```
scripts/build.js
scripts/lib/data.js
scripts/lib/bake.js          (new)
scripts/lib/publicdata.js    (new)
data/guides-bundle.js        (new)
```

## What this does

The build starts generating the three small data files the fast version needs,
and bakes the Studio-editable content into the HTML. Your pages still load the
old scripts, which still work, and still override anything the build baked. So
the site behaves precisely as it does today.

It also carries the redirect fix you just deployed, so nothing regresses there.

## Why deploy it on its own

Because it is reversible and it proves the new build works against your real
Firestore data before anything visitors touch changes. **If this deploy is fine,
Stage 2 is very unlikely to surprise us.**

## What to check afterwards

1. The site works normally — home, guides, a guide page, About, Books.
2. `themessyparentscollection.com/data/guide-index.json` returns JSON with 31
   guides. This is the new file, and it proves the build produced it.
3. The Netlify log still says `31 guide pages written`, `0 errors`.

If anything is wrong, re-upload the 5 originals and you are back.

Tested here against your pristine repo: build clean, 0 errors, all 66 of your
existing checks pass, guide pages unchanged (574 words with JavaScript stripped,
one h1, canonical and Article schema all present).
