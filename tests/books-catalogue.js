/* Books release, Studio compatibility and repeat-build regression tests. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const Books = require("../assets/js/books-catalogue");
const Bake = require("../scripts/lib/bake");
const Render = require("../assets/js/guide-render");
const copy = value => JSON.parse(JSON.stringify(value));
const originalCover = "https://firebasestorage.googleapis.com/v0/b/messy-parents.firebasestorage.app/o/books%2Fcover-0-1785678443050.png?alt=media&token=81f07eb0-b563-4674-ae0e-5810734072cc";
const original = {
  "updated": 1785678550117,
  "items": [
    {
      "status": "Out now",
      "cover": "https://firebasestorage.googleapis.com/v0/b/messy-parents.firebasestorage.app/o/books%2Fcover-0-1785678443050.png?alt=media&token=81f07eb0-b563-4674-ae0e-5810734072cc",
      "summary": "Before the baby arrives, everyone tells you to be prepared.\nWe learned that being ready enough is far more realistic.\nHere's everything we wish someone had told us before the adventure began.",
      "title": "Before Baby Arrives"
    },
    {
      "summary": "Four to twelve months. Solids, the sleep changes nobody warned you about, rolling and crawling and the arrival of opinions. Includes the complete list of things we blamed on teething.",
      "title": "Ari & Papa: Everyone Says It Gets Easier",
      "status": "Coming soon",
      "cover": ""
    },
    {
      "summary": "Every guide on this site, in order, with the red-flag lists on their own pages so you can find them fast. Designed to live next to the changing table and get covered in something.",
      "cover": "",
      "title": "The Messy Parents Handbook",
      "status": "In progress"
    }
  ],
  "__updateTime": "2026-08-02T13:49:11.284454Z"
};
const snapshot = copy(original);
const resolved = Books.resolve(original);
assert.deepEqual(resolved.map(b => b.title), [
  "Before Baby Arrives", "We Brought Her Home. Now What?",
  "Nobody Mentioned This Bit.", "Just When We Thought We Had It.", "The Messy Parents Handbook"
]);
assert.deepEqual(resolved.map(b => b.status), ["In production", "Coming soon", "Coming soon", "Coming soon", "In progress"]);
assert.equal(resolved[0].cover, "/assets/img/books/before-baby-arrives-colour-matched.webp");
assert.equal(resolved[0].summary, original.items[0].summary);
assert.equal(resolved[4].summary, original.items[2].summary);
for (const month of [1,2,3]) assert.match(resolved[month].summary, new RegExp("^Month " + month + ":"));
const archived = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/archive/books-catalogue-2026-10-15-four-books.json")));
assert.equal(archived[2].title, original.items[1].title);
assert.equal(archived[2].summary, original.items[1].summary);
assert.ok(fs.existsSync(path.join(__dirname, "..", archived[2].cover)));
assert.deepEqual(original, snapshot, "Do not mutate the fetched document");
assert.deepEqual(Books.resolve(null), resolved);
assert.deepEqual(Books.resolve({}), resolved);
assert.deepEqual(Books.resolve({ items: [] }), []);
assert.deepEqual(Books.resolve({ ...original, items: [] }), []);
assert.deepEqual(Books.resolve({ ...original, catalogueVersion: Books.VERSION }), original.items);
const reorderedKeys = copy(original);
reorderedKeys.items = reorderedKeys.items.map(b => ({ cover: b.cover, status: b.status, title: b.title, summary: b.summary }));
assert.deepEqual(Books.resolve(reorderedKeys), resolved, "SDK property order must not affect migration");
for (const mutation of [
  doc => { doc.updated++; },
  doc => { doc.items[0].title = "A later title"; },
  doc => { doc.items[0].cover = ""; },
  doc => { doc.items[1].extra = "Preserved future field"; },
  doc => { doc.items.reverse(); },
  doc => { doc.items.pop(); }
]) {
  const changed = copy(original); mutation(changed);
  assert.deepEqual(Books.resolve(changed), changed.items, "Unrecognized saved revisions stay authoritative");
}
const saved = { items: copy(resolved), updated: original.updated + 1, catalogueVersion: Books.VERSION };
saved.items.reverse(); saved.items.pop(); saved.items[0].title = "Edited in Studio";
saved.items[0].summary = "Edited summary"; saved.items[0].status = "Coming later"; saved.items[0].cover = "";
assert.deepEqual(Books.resolve(saved), saved.items);
const olderClientSave = copy(saved); delete olderClientSave.catalogueVersion;
assert.deepEqual(Books.resolve(olderClientSave), olderClientSave.items);
assert.deepEqual(Books.resolve({ ...saved, items: [] }), []);
assert.deepEqual(Books.resolve({ items: resolved, updated: original.updated }), resolved, "No duplicate insertion on repeated resolution");
const browser = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../assets/js/books-catalogue.js"), "utf8"), browser);
for (const doc of [null, original, saved, olderClientSave, { items: [] }]) {
  assert.deepEqual(copy(browser.MPCBooks.resolve(doc)), Books.resolve(doc));
}
const template = '<div class="book-grid" id="bookGrid"></div>';
const baked = Bake.applyBooks(template, original, Render.img);
assert.equal((baked.match(/class="book-card"/g) || []).length, 5);
assert.equal(Bake.applyBooks(baked, original, Render.img), baked, "Rebuild must be idempotent");
assert.equal((Bake.applyBooks(baked, {items:[]}, Render.img).match(/class="book-card"/g) || []).length, 0);
for (const book of resolved.slice(1)) {
  assert.ok(book.cover.startsWith("/assets/img/books/"));
  assert.ok(fs.existsSync(path.join(__dirname, "..", book.cover)));
}
const studio = fs.readFileSync(path.join(__dirname, "../studio/index.html"), "utf8");
assert.match(studio, /MPCBooks\.resolve\(b\.exists\(\) \? b\.data\(\) : null\)/);
assert.match(studio, /catalogueVersion:MPCBooks\.VERSION/);
assert.match(studio, /if\(state\.booksReadFailed \|\| !BOOKS_CATALOGUE\)/);
assert.match(studio, /Saved\. These take effect on the next rebuild\./);
// Exercise the actual Save handler with fake UI/Firestore, without signing in or writing externally.
const saveBlock = studio.slice(studio.indexOf('$("#saveBooks").addEventListener'), studio.indexOf('/* ---- Text rows'));
async function testStudioSave() {
  let handler, written;
  const ui = { "#saveBooks": { addEventListener: (_, fn) => { handler=fn; } }, "#booksMsg": {} };
  const state = { booksList: copy(resolved), booksReadFailed: false, fb: {
    db: {}, fs: { doc: (_,collection,id) => ({ collection,id }), setDoc: async (ref,data) => { written={ref,data}; } }
  } };
  vm.runInNewContext(saveBlock, { $: id=>ui[id], state, MODE:"firebase", MPCBooks:Books, BOOKS_CATALOGUE:Books, renderBookRows:()=>{}, Date });
  await handler();
  assert.deepEqual(copy(written.ref), {collection:"meta",id:"books"});
  assert.deepEqual(copy(written.data.items), resolved);
  assert.equal(written.data.catalogueVersion, Books.VERSION);
  assert.deepEqual(Books.resolve(written.data), resolved);
  state.booksList=[]; await handler();
  assert.deepEqual(Books.resolve(written.data), []);
  written=null; state.booksReadFailed=true; await handler();
  assert.equal(written,null,"Failed read must block a destructive fallback save");
  console.log("Books catalogue: migration, rendering, Node/browser parity and Studio save tests passed.");
}
testStudioSave().catch(error=>{ console.error(error); process.exitCode=1; });
