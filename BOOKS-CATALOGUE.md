# Books catalogue release

The 15 October 2026 release adds the approved newborn book and three covers. Before Baby Arrives keeps its original cover, title and summary; its status is corrected to In production. Guides and all other site sections use their existing paths unchanged.

## One shared source for the build and Studio

`assets/js/books-catalogue.js` is loaded both by the Books baker and Studio. It upgrades only the exact pre-release `meta/books` item snapshot and `updated` value. No Firebase write, credential, permission or security change is involved.

A missing Books document uses the approved four-book defaults. An existing different revision is always respected, including an empty list, removed books, changed order, changed descriptions or cleared covers. The migration is not a permanent overlay.

## Editing later

Refresh Studio after this deploy, then open Site → Our Books. The editor starts with the same four cards shown publicly. Save writes the edited list, its timestamp and a catalogue version. Rebuild/publish through the normal Studio workflow to make those edits public. Future builds respect the saved list exactly.

An already-open old Studio tab can still save the stale list it loaded before this release. Refresh before editing. Its newer timestamp is deliberately authoritative even if that old client omits the version field, so this release never repeatedly fights a later save.

On a Books read failure Studio blocks Books Save and asks for a reload, rather than overwriting an unread catalogue with defaults. This does not change the other editors.

## Checks

`node tests/books-catalogue.js` checks the migration, original copy/cover preservation, repeat builds, future edits, old-client saves, removals, empty lists, Node/browser parity and the actual Studio Books Save handler with a local fake store. It is included in `npm run verify`.

`npx playwright test tests/books-render.spec.js` checks desktop and mobile layouts. The live first cover remains on the existing Netlify image CDN; new covers are local WebP assets. No CSS or guide source changes are needed.
