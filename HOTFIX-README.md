# Hotfix — this is the actual fix

**Two files. Upload both, overwrite. Nothing else changes.**

```
_redirects
scripts/build.js
```

Your original files, with three lines removed.

## What the evidence showed

The Netlify build log was decisive:

```
[seo] 31 guides from firestore
[seo] 31 guide pages written
[seo] 5 topic pages, 7 age pages
[seo] done in 1038ms — 0 errors
```

The pages were being written all along. So the problem was never generation.

Then the pattern of what works against what does not:

```
/                  WORKS    no redirect rule covers it
/guides.html       WORKS    no redirect rule covers it
/sitemap.xml       WORKS    no redirect rule covers it

/topics/feeding/   LOOPS    covered by  /topics/:slug -> /topics/:slug/  301!
/guides/<slug>/    LOOPS    covered by  /guides/:slug -> /guides/:slug/  301!
```

Every URL covered by one of those three rules loops. Every URL not covered
works. That is the whole fault.

## Why they loop

Two things combined.

**Netlify matches `/topics/feeding/` against the source `/topics/:slug`.** The
trailing slash does not stop it matching. So the rule redirects the URL to the
address the browser already asked for.

**The `!` makes the redirect forced**, which means it beats a real file at that
path. The generated page existing changed nothing — the redirect fired first,
every time.

## What I got wrong along the way

My first fix wrote the sources out one at a time
(`/guides/teething -> /guides/teething/`) on the theory that an explicit source
could not match itself. **That was wrong**, and this evidence is what showed it:
since Netlify matches the slashed form against a slashless source, an explicit
rule loops for exactly the same reason. Any rule shaped `/x -> /x/` is a loop
here. Good thing you sent the screenshots before deploying it.

So they are simply gone, with nothing in their place. Netlify already resolves
`/topics/feeding/` to `topics/feeding/index.html` by itself and serves the same
file for the slashless form — ordinary directory-index behaviour that needs no
help from this file.

## Why both files

`scripts/build.js` regenerates `_redirects` on every deploy. Patching only the
generated file would be overwritten on the next build; patching only the script
would leave the bad file in place until a build ran.

## After deploying

`themessyparentscollection.com/guides/day-night-confusion/` should load, and it
should be **instant** — the article is in the HTML. If it loads but takes a
moment and flashes, tell me: that would mean it is falling through to the
Firestore path and there is a second thing to look at.

Tested here: build clean, 0 errors, all 66 checks pass, `/guides/* -> /guide.html 200`
still the last rule so a guide added in Studio still renders before its page exists.
