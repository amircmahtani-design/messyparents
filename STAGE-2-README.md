# Stage 2 — the actual speed-up. Deploy only after Stage 1 is confirmed fine.

**24 files.** This is where the pages switch to the light runtime.

## What changes for a reader

A guide page goes from five scripts and ~158KB of JavaScript — including the
complete text of every guide and the Firebase SDK — to two scripts and 9.2KB
gzipped. No Firebase. No whole-collection read. The article was already in the
HTML; now nothing heavy arrives on top of it.

## The four files to delete — LAST, and only once this is confirmed working

```
assets/js/guides.js
assets/js/mpc-store.js
assets/js/guide-page.js
assets/js/mpcstore.js
```

**Do not delete them in the same commit as the upload.** Leaving them costs
nothing — nothing references them — and it means that if anything goes wrong you
can re-upload the old HTML and be instantly back. That safety net is what was
missing last time, and it is why the rollback did not work.

Delete them a day later, once you are happy.

## What to check afterwards

1. A guide page loads and is **instant**. If it flashes or fills in after a
   beat, tell me — that means it is falling through to the Firestore path.
2. Home, Popular, All Guides: search and the topic/age pills all filter.
3. Studio: open it, edit a guide's wording, check the live preview updates,
   save. A status pill should appear bottom-left about the rebuild.
4. `/topics/feeding/` and `/ages/0-1-month/` load.
5. Then run PageSpeed on mobile.

## Also in this stage

`_headers` switches CSS and JS to a one-year immutable cache, which is safe
because the build now stamps every reference with a hash of the file's contents.

## Not included

The typography, the CSS and every image are byte-identical to what you have.
The pills stay as they are, as you asked.
