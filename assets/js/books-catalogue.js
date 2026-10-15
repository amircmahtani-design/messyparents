/* One-time Books release, shared by the Netlify build and Studio.
 * Only the exact pre-release saved revision is upgraded. Any later Studio
 * save (including one from an older client) remains authoritative.
 * No Firestore writes are made here. See BOOKS-CATALOGUE.md. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MPCBooks = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const VERSION = "2026-10-15-four-book-collection";
  const BASELINE_UPDATED = 1785678550117;
  const BASELINE = [
  {
    "title": "Before Baby Arrives",
    "status": "Out now",
    "summary": "Before the baby arrives, everyone tells you to be prepared.\nWe learned that being ready enough is far more realistic.\nHere's everything we wish someone had told us before the adventure began.",
    "cover": "https://firebasestorage.googleapis.com/v0/b/messy-parents.firebasestorage.app/o/books%2Fcover-0-1785678443050.png?alt=media&token=81f07eb0-b563-4674-ae0e-5810734072cc"
  },
  {
    "cover": "",
    "summary": "Four to twelve months. Solids, the sleep changes nobody warned you about, rolling and crawling and the arrival of opinions. Includes the complete list of things we blamed on teething.",
    "status": "Coming soon",
    "title": "Ari & Papa: Everyone Says It Gets Easier"
  },
  {
    "title": "The Messy Parents Handbook",
    "summary": "Every guide on this site, in order, with the red-flag lists on their own pages so you can find them fast. Designed to live next to the changing table and get covered in something.",
    "cover": "",
    "status": "In progress"
  }
];
  const NEWBORN = {
  "title": "We Brought Her Home. Now What?",
  "summary": "Birth to four months. The feeds, the broken nights, the tiny noises and the questions that arrive the minute you get home. Honest, practical help for finding your feet when your baby is brand new and everything feels new to you, too.",
  "status": "Coming soon",
  "cover": "/assets/img/books/we-brought-her-home-now-what.webp"
};
  const clone = items => items.map(book => ({ ...book }));
  const DEFAULTS = [
    { ...BASELINE[0], status: "In production" },
    { ...NEWBORN },
    { ...BASELINE[1], cover: "/assets/img/books/everyone-says-it-gets-easier.webp" },
    { ...BASELINE[2], cover: "/assets/img/books/messy-parents-handbook.webp" }
  ];
  // Property order differs between REST and the browser SDK. Values must match.
  function stable(value) {
    if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
    if (value && typeof value === "object") return "{" + Object.keys(value).sort()
      .map(key => JSON.stringify(key) + ":" + stable(value[key])).join(",") + "}";
    return JSON.stringify(value);
  }
  function resolve(document) {
    if (!document || !Array.isArray(document.items)) return clone(DEFAULTS);
    // A deliberately empty list is a saved choice, never a request for defaults.
    if (document.catalogueVersion || document.updated !== BASELINE_UPDATED ||
        stable(document.items) !== stable(BASELINE)) return clone(document.items);
    return clone(DEFAULTS);
  }
  DEFAULTS.forEach(Object.freeze);
  Object.freeze(DEFAULTS);
  return Object.freeze({ VERSION, DEFAULTS, resolve });
});
