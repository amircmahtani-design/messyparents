# Fix: the dashboard showed no guides

9 files. Drop them over the repo the same way as before, keeping the folder
structure, and redeploy. Nothing else changes — no Firebase rules, no
environment variables, no settings.

    scripts/lib/social/guides.js          NEW
    netlify/functions/social-status.js    replaces
    netlify/functions/social-guides.js    replaces
    netlify/functions/social-generate.js  replaces
    netlify/functions/social-get.js       replaces
    netlify/functions/social-update.js    replaces
    netlify/functions/social-approve.js   replaces
    social/index.html                     replaces
    SOCIAL-README.md                      replaces

## What was wrong

My mistake, and it was in the audit before it was in the code.

The endpoints read the guide library through `scripts/lib/data.js` `load()`.
That function is written for the BUILD, and the build runs in a checkout with
the whole repository on disk. It reads four files from the filesystem:

    assets/js/firebase-config.js     to find the Firestore project
    data/guides-bundle.js            the bundled fallback
    assets/js/guides.js              the older bundled fallback
    data/guides.json                 the seed file

A Netlify function is not a checkout. It is bundled by esbuild into a single
file in a Lambda, so none of those files are shipped next to it, `__dirname` is
not the repository root, and `require.resolve` on a relative path throws.

Every read failed. Every fallback after it failed. And `load()` is written not
to throw — it returns an empty guide list with a warning, which is exactly what
an empty dashboard looks like. It failed politely, which is the worst way to
fail.

## What it does now

`scripts/lib/social/guides.js` reads Firestore directly through the Admin SDK
the functions already use, with the service account already in your Netlify
environment. No filesystem, no API key, no bundled copy.

It reuses `normaliseGuide()` from `scripts/lib/data.js` and `resolve()` from
`scripts/lib/ages.js` rather than copying them, so a guide has exactly the same
shape here as it does on the public site, and an age band switched off in
Studio is invisible to Instagram for free.

This is also just better than what the audit proposed: it reads the
authoritative copy rather than the public REST view, and it cannot be broken by
a data file that did or did not get deployed.

## Also in here

`social/index.html` now uses `assets/img/navicon.webp` with the `favicon-32.png`
fallback — the same icons as the site, Studio and the Editor. It had a different
one, which made `/social/` look like a different site in a row of pinned tabs.

## Verified

I ran the real handlers against a stand-in Firestore holding the guide library:

    social-status    → 61 eligible of 61, source "firestore (admin)", 0 warnings
    social-guides    → 61 rows, 5 topics, 5 age bands
    search           → the full question "Why is my baby drinking less milk?"
                       matches one guide
    social-generate  → 6 slides, 0 errors
    social-approve   → APPROVED_HELD, hash stored
    edit after that  → approval cleared, back to NEEDS_REVIEW
    social-publish   → 423 PUBLISHING_DISABLED

All 98 tests still pass.

## After you redeploy

Open the **Status** tab first. It should say `firestore (admin)` and a real
number of guides. If it still says 0, that tab now tells you why.
