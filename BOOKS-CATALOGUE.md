# Books catalogue release

The 15 October 2026 monthly revision presents Before Baby Arrives, Month 1 (We Brought Her Home. Now What?), Month 2 (Nobody Mentioned This Bit.), Month 3 (Just When We Thought We Had It.), then The Messy Parents Handbook. Monthly volumes remain Coming soon. Before Baby Arrives remains In production; Handbook remains In progress.

The first cover uses the approved direct colour adjustment, encoded as lossless WebP with decoded pixels identical to the book cover PNG. The original Firebase asset is retained. The Handbook uses the approved worn-sofa revision. The previous four-book catalogue, including Everyone Says It Gets Easier and its exact copy, is retained in `content/archive/books-catalogue-2026-10-15-four-books.json`; all original cover assets remain available. Guides and other sections keep their existing source and layout.

## One shared source for the build and Studio

`assets/js/books-catalogue.js` is loaded both by the Books baker and Studio. It upgrades only the exact pre-release `meta/books` item snapshot and `updated` value. No Firebase write, credential, permission or security change is involved.

A missing Books document uses the approved five-book defaults. An existing different revision is always respected, including an empty list, removed books, changed order, changed descriptions or cleared covers. The migration is not a permanent overlay.

## Editing later

Refresh Studio after this deploy, then open Site → Our Books. The editor starts with the same five cards shown publicly. Save writes the edited list, its timestamp and a catalogue version. Rebuild/publish through the normal Studio workflow to make those edits public. Future builds respect the saved list exactly.

An already-open old Studio tab can still save the stale list it loaded before this release. Refresh before editing. Its newer timestamp is deliberately authoritative even if that old client omits the version field, so this release never repeatedly fights a later save.

On a Books read failure Studio blocks Books Save and asks for a reload, rather than overwriting an unread catalogue with defaults. This does not change the other editors.

## Checks

`node tests/books-catalogue.js` checks the migration, original copy/cover preservation, repeat builds, future edits, old-client saves, removals, empty lists, Node/browser parity and the actual Studio Books Save handler with a local fake store. It is included in `npm run verify`.

`npx playwright test tests/books-render.spec.js` checks desktop and mobile layouts. All five active covers are local WebP assets. No CSS or guide source changes are needed.
