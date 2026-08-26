# Hotfix — stops the redirect loop

**Two files. Upload both, overwrite.**

```
_redirects
scripts/build.js
```

These are your ORIGINAL files with one thing changed. Nothing else is touched —
not the HTML, not the CSS, not the fonts, not the JavaScript. This is the
original site plus a fix.

## What was wrong

Your repo has always contained this rule:

```
/guides/:slug  /guides/:slug/  301!
```

While a generated page exists at `/guides/<slug>/index.html`, Netlify serves it
and the rule never fires. When the page is **missing**, Netlify matches the
request against `/guides/:slug` and permanently redirects it to
`/guides/<slug>/` — the address it already asked for. The browser follows it,
gets the same answer, follows it again, and gives up:
`ERR_TOO_MANY_REDIRECTS`.

So a missing page — the moment the site most needed to fall through to the
`/guides/*  /guide.html  200` rule at the bottom and render from Firestore
instead — is precisely the moment it broke hardest.

## What changed

Each address is now named explicitly:

```
/guides/day-night-confusion  /guides/day-night-confusion/  301!
```

The source never ends in a slash and the target always does, so a rule can
never point at itself. An unknown or not-yet-built slug now falls through to the
rewrite at the bottom, which is what it was always meant to do.

`_redirects` is included as well as `scripts/build.js` because the build
regenerates that file on every deploy — patching only one of them would either
be overwritten on the next build, or not take effect until one ran.

## This fixes the symptom, not the cause

The loop is what you can see. The reason the guide pages were missing is still
unknown, and it needs the Netlify build log. After this deploy the site should
work; if a guide page renders slowly (the old Firestore-in-the-browser way)
rather than instantly, that confirms the pages are still not being generated and
there is a second thing to fix.
