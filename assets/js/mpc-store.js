/* ============================================================================
   MPC data layer — makes the public pages read guides live from Firestore.

   - If firebase-config.js has a real config  -> load guides from Firestore
     (falls back to the bundled guides.js if the fetch fails or is empty).
   - If not (local preview)                    -> just use the bundled guides.js.

   Pages wait for `MPCStore.ready` before rendering. `GUIDES` (a global from
   guides.js) is swapped to the Firestore data so every existing function
   (searchGuides, cardHTML, guideById…) keeps working unchanged.
   ========================================================================== */
window.MPCStore = { guides: [], pages: {}, source: "bundled" };
window.MPC_PAGES = window.MPC_PAGES || {};   // per-page settings (image/title/subtitle)

/* pagesReady resolves as soon as the (tiny) per-page settings are in — WITHOUT
   waiting for the whole guides collection to load. Pages use it to apply their
   hero images fast, so the illustrations appear quickly. */
let _resolvePages;
MPCStore.pagesReady = new Promise(r => { _resolvePages = r; });

MPCStore.ready = (async function () {
  const cfg = window.FIREBASE_CONFIG;
  if (cfg && cfg.projectId) {
    try {
      const V = "10.12.2";
      const [{ initializeApp }, fs] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
      ]);
      const app = initializeApp(cfg);
      const db = fs.getFirestore(app);

      // Fire the reads at once. Resolve page settings the moment they land
      // (don't block them behind the larger guides read).
      const guidesP = fs.getDocs(fs.collection(db, "guides"));
      const pagesP  = fs.getDocs(fs.collection(db, "pages"));
      const topicsP = fs.getDoc(fs.doc(db, "meta", "topics"));   // editable browse topics
      const booksP  = fs.getDoc(fs.doc(db, "meta", "books"));    // editable Our Books list
      const footerP = fs.getDoc(fs.doc(db, "meta", "footer"));   // editable footer lines

      // Footer: every page has one, so apply it the moment it arrives rather
      // than waiting for the guides read. No per-page wiring needed.
      footerP.then(fsnap => {
        if (!fsnap.exists()) return;
        MPCStore.footer = fsnap.data() || {};
        MPCStore.applyFooter(MPCStore.footer);
      }).catch(() => { /* meta/footer is optional — the markup stands */ });

      pagesP.then(psnap => {
        const pages = {};
        psnap.forEach(d => (pages[d.id] = d.data()));
        window.MPC_PAGES = pages;
        MPCStore.pages = pages;
        // Every page has editable wording, so apply it here rather than making
        // each page remember to ask for it.
        MPCStore.applyText(pages);
      }).catch(() => { /* pages collection is optional */ })
        .finally(() => _resolvePages());

      // Topics: rebuild the browse pills from the saved list, if any. This
      // mutates the shared TOPICS/ICONS globals in place, so every page that
      // reads them (home, guides) picks up the changes with no code edits.
      // Must finish BEFORE MPCStore.ready resolves (pages render pills then).
      try {
        const tsnap = await topicsP;
        if (tsnap.exists()) {
          const items = (tsnap.data() || {}).items;
          if (Array.isArray(items) && items.length) applyTopics(items);
        }
      } catch (e) { /* meta/topics is optional — keep the bundled defaults */ }

      // Books: hold the saved Our Books list for the books page to render.
      try {
        const bsnap = await booksP;
        if (bsnap.exists()) {
          const items = (bsnap.data() || {}).items;
          if (Array.isArray(items)) MPCStore.books = items;
        }
      } catch (e) { /* meta/books is optional — the page falls back to defaults */ }

      const snap = await guidesP;
      const arr = [];
      snap.forEach(d => arr.push(d.data()));
      if (arr.length) {
        arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.title).localeCompare(b.title));
        window.GUIDES = arr;               // swap bundled data for live data
        MPCStore.source = "firestore";
      }
    } catch (e) {
      console.warn("[MPC] Firestore load failed — using bundled guides.", e);
      _resolvePages();
    }
  } else {
    _resolvePages();                       // local/preview mode: nothing to wait for
  }
  MPCStore.guides = window.GUIDES;
  return window.GUIDES;
})();

/* Default illustrations for the About page's three slots. Used when a slot has
   no saved image (or was reset to default in Studio). */
MPCStore.ABOUT_DEFAULTS = {
  hero:   "assets/img/papa.webp",
  middle: "assets/img/mama.webp",
  who:    "assets/img/family.webp",
  notare: "assets/img/couple.webp"
};

/* --------------------------------------------------------------------------
   Editable TOPICS (the "Browse by topic" pills) + the Our Books list.
   Both are managed in Studio and stored in Firestore under /meta/{topics,books}.
   ------------------------------------------------------------------------ */
function _escHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* Build the little icon shown inside a topic pill. An icon can be an uploaded
   image (path / URL) OR a short emoji/text glyph — we detect which. */
function topicIconMarkup(icon){
  const v = (icon == null ? "" : String(icon)).trim();
  if (!v) return '<span class="pill-ico" aria-hidden="true">📌</span>';   // 📌 fallback
  if (/^(https?:|data:|\.?\/|assets\/)/i.test(v) || /\.(webp|png|jpe?g|svg|gif)$/i.test(v))
    return '<img src="' + _escHtml(v) + '" alt="" aria-hidden="true">';
  return '<span class="pill-ico" aria-hidden="true">' + _escHtml(v) + '</span>';
}

/* Replace the shared TOPICS + ICONS globals *in place* (they are the same
   array/object the pages read, so mutating them updates the pills everywhere
   without touching guides.js). `items` = [{ id, label, icon }]. */
function applyTopics(items){
  const T = window.TOPICS, I = window.ICONS;
  if (!Array.isArray(T)) return;
  T.length = 0;
  if (I) Object.keys(I).forEach(k => delete I[k]);
  items.forEach(it => {
    if (!it || !it.id) return;
    const id = String(it.id), mk = topicIconMarkup(it.icon);
    T.push({ id: id, label: it.label || id, icon: mk });
    if (I) I[id] = mk;
  });
  MPCStore.topics = items.slice();
}
MPCStore.applyTopics = applyTopics;

/* Default Our Books list — shown until (or unless) a list is saved in Studio.
   Mirrors the three books the page originally shipped with (no covers yet). */
MPCStore.BOOK_DEFAULTS = [
  { title:"Ari & Papa: The First Hundred Nights",
    summary:"The newborn stretch, told honestly. Feeding at 4am, the day-night confusion, the shift system that saves marriages, and the visitors who mean well. Short chapters, because you will be reading it one-handed.",
    status:"Out now" },
  { title:"Ari & Papa: Everyone Says It Gets Easier",
    summary:"Four to twelve months. Solids, the sleep changes nobody warned you about, rolling and crawling and the arrival of opinions. Includes the complete list of things we blamed on teething.",
    status:"Coming soon" },
  { title:"The Messy Parents Handbook",
    summary:"Every guide on this site, in order, with the red-flag lists on their own pages so you can find them fast. Designed to live next to the changing table and get covered in something.",
    status:"In progress" }
];
MPCStore.books = null;   // filled from Firestore when a saved list exists

function bookStatusClass(status){
  return /out/i.test(status || "") ? "status--out" : "";
}
function bookCardHTML(b){
  b = b || {};
  const title   = _escHtml(b.title || "Untitled");
  const summary = _escHtml(b.summary || "");
  const status  = b.status
    ? '<span class="status ' + bookStatusClass(b.status) + '">' + _escHtml(b.status) + '</span>'
    : "";
  const cover = b.cover
    ? '<img src="' + _escHtml(b.cover) + '" alt="' + title + ' cover" loading="lazy">'
    : '<div class="book-cover-empty" aria-hidden="true"><span>' + title + '</span></div>';
  return '<article class="book-card">' +
    '<div class="book-cover">' + cover + '</div>' +
    '<div class="book-body">' + status +
      '<h3>' + title + '</h3>' +
      (summary ? '<p class="book-summary">' + summary + '</p>' : "") +
    '</div></article>';
}

/* Render the Our Books grid into #bookGrid (or a given element id). Falls back
   to BOOK_DEFAULTS when nothing has been saved yet. */
MPCStore.applyBooks = function(targetId){
  const el = document.getElementById(targetId || "bookGrid");
  if (!el) return;
  const items = (Array.isArray(MPCStore.books) && MPCStore.books.length)
    ? MPCStore.books
    : MPCStore.BOOK_DEFAULTS;
  el.innerHTML = items.map(bookCardHTML).join("");
};

/* Swap an image's source with NO flash of the old/default picture: the image
   stays hidden (CSS opacity 0 while .ready is absent) until the *new* file has
   actually finished loading, then we reveal it. If the source is unchanged (or
   already cached) we reveal straight away. */
function setImageSource(img, src) {
  if (!img || !src) return;
  const current = img.getAttribute("src") || "";
  if (current === src) {
    if (img.complete && img.naturalWidth > 0) img.classList.add("ready");
    else img.addEventListener("load", function(){ img.classList.add("ready"); }, { once: true });
    return;
  }
  img.classList.remove("ready");                 // hide until the new one is in
  img.addEventListener("load",  function(){ img.classList.add("ready"); }, { once: true });
  img.addEventListener("error", function(){ img.classList.add("ready"); }, { once: true });
  img.setAttribute("src", src);
  if (img.complete && img.naturalWidth > 0) img.classList.add("ready");   // was cached
}

/* --------------------------------------------------------------------------
   Editable About copy.

   Each About section can have its heading and body text overridden from
   Studio. The stored text is plain text, so nothing typed in Studio can break
   the page: a blank line starts a new paragraph and [label](url) becomes a
   link. Anything else is escaped.

   Clearing a field in Studio saves an empty string, which puts the wording
   that ships in about.html back — so "reset" is just "empty the box".
   ------------------------------------------------------------------------ */
function _inlineHTML(text) {
  // Escape everything, then put back the few bits of formatting Studio allows.
  return _escHtml(text)
    // [label](url) -> link. Only same-site paths and http(s)/mailto links are
    // allowed, so a stray "javascript:" can never end up in an href.
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, function (whole, label, href) {
      return /^(https?:\/\/|mailto:|\/|[\w.-]+\.html|#)/i.test(href)
        ? '<a href="' + href + '">' + label + "</a>"
        : whole;
    })
    // *stars* -> the cream highlight used behind headline words.
    .replace(/\*([^*\n]+)\*/g, '<span class="hl">$1</span>');
}

function proseHTML(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)                          // blank line = new paragraph
    .map(function (para) { return para.trim(); })
    .filter(Boolean)
    .map(function (para) {
      return "<p>" + _inlineHTML(para).replace(/\n/g, "<br>") + "</p>";
    })
    .join("");
}

/* --------------------------------------------------------------------------
   Editable site text.

   Every editable string has a key. Strings that sit in the HTML are tagged
   <p data-mpc-text="the.key">, and get replaced here. Strings that a script
   builds are read with MPCStore.t("the.key", "fallback").

   Values come from two Firestore docs: pages/site (shown on every page) and
   pages/<this page> (from <body data-mpc-page="...">). The page's own value
   wins if both set the same key. An empty or missing value means "use the
   wording that ships in the HTML", so clearing a box in Studio is the reset.
   ------------------------------------------------------------------------ */
MPCStore.text = {};

function currentPageId() {
  var b = document.body;
  return (b && b.getAttribute("data-mpc-page")) || "";
}

/* Merge the site-wide and this-page text maps into one lookup. */
function buildTextMap(pages) {
  var out = {}, id = currentPageId();
  [(pages || {}).site, (pages || {})[id]].forEach(function (pg) {
    var t = pg && pg.text;
    if (!t) return;
    Object.keys(t).forEach(function (k) {
      var v = t[k];
      if (v != null && String(v).trim() !== "") out[k] = String(v);
    });
  });
  return out;
}

/* Look up one string. Falls back to whatever the caller passes, which is
   always the wording that ships in the code — so this is safe before (or
   without) any Firestore data. */
MPCStore.t = function (key, fallback) {
  var v = MPCStore.text[key];
  return (v == null || v === "") ? (fallback == null ? "" : fallback) : v;
};

/* Replace every tagged element on the page. Elements remember what shipped in
   the markup, so removing an override puts the original words straight back
   (which is what makes Studio's live preview able to go backwards). */
/* Page scripts that build their own strings use these to stay safe. */
MPCStore.esc = _escHtml;
MPCStore.inline = _inlineHTML;

MPCStore.applyText = function (pages) {
  MPCStore.text = buildTextMap(pages || window.MPC_PAGES);
  var nodes = document.querySelectorAll("[data-mpc-text]");
  Array.prototype.forEach.call(nodes, function (el) {
    var key = el.getAttribute("data-mpc-text");
    if (el.__mpcOriginal == null) el.__mpcOriginal = el.innerHTML;
    var v = MPCStore.text[key];
    if (v == null || String(v).trim() === "") { el.innerHTML = el.__mpcOriginal; return; }
    // A multi-paragraph value becomes real paragraphs; a single line is
    // dropped straight in, so a heading stays a heading.
    el.innerHTML = /\n\s*\n/.test(v)
      ? proseHTML(v)
      : _inlineHTML(String(v).trim());
  });

  // Editable attributes, e.g. data-mpc-attr="placeholder:search.placeholder".
  // Plain text only — an attribute can't take markup.
  Array.prototype.forEach.call(document.querySelectorAll("[data-mpc-attr]"), function (el) {
    var spec = (el.getAttribute("data-mpc-attr") || "").split(":");
    var attr = spec[0], key = spec[1];
    if (!attr || !key) return;
    if (el.__mpcOriginalAttr == null) el.__mpcOriginalAttr = el.getAttribute(attr) || "";
    var v = MPCStore.text[key];
    el.setAttribute(attr, (v == null || String(v).trim() === "") ? el.__mpcOriginalAttr : String(v).trim());
  });
  // Let any page script that builds its own strings redraw with the new words.
  try {
    window.dispatchEvent(new CustomEvent("mpc:textchange"));
  } catch (e) { /* very old browser — the static text still updated */ }
};

/* --------------------------------------------------------------------------
   Editable footer — the copyright line and the disclaimer under it. Both are
   on every page, so this runs itself as soon as the data arrives; no page
   needs to call it. {year} in the copyright line becomes the current year, so
   it never goes stale.
   ------------------------------------------------------------------------ */
MPCStore.applyFooter = function (cfg) {
  cfg = cfg || {};
  var year = new Date().getFullYear();
  [["copyright", "[data-foot-copy]"], ["note", "[data-foot-note]"]].forEach(function (pair) {
    var el = document.querySelector(pair[1]);
    if (!el) return;
    // Remember what shipped in the markup, so emptying the box in Studio puts
    // the original line back instead of leaving a gap.
    if (el.__mpcOriginal == null) el.__mpcOriginal = el.innerHTML;
    var txt = (cfg[pair[0]] == null ? "" : String(cfg[pair[0]])).trim();
    el.innerHTML = txt
      ? _inlineHTML(txt.replace(/\{year\}/gi, year))
      : el.__mpcOriginal;
  });
};

/* Apply an editable slot's image + positioning to one .about-section.
   config = { image, width:"small|medium|large", align:"left|right", maxw:Number } */
function applyAboutArt(sec, config, fallback) {
  if (!sec) return;
  const c = config || {};
  const img = sec.querySelector("[data-illus-img]");
  const src = c.image || fallback;
  if (src && img) {
    setImageSource(img, src);   // reveals only once the chosen image has loaded
    sec.classList.add("has-art");
  } else {
    sec.classList.remove("has-art");
  }
  // size (Small / Medium / Large)
  sec.classList.remove("art-small", "art-medium", "art-large");
  sec.classList.add("art-" + (c.width || "medium"));
  // side (Left / Right)
  if (c.align === "left" || c.align === "right") sec.setAttribute("data-pos", c.align);
  // optional exact max width
  if (img) {
    const mw = parseInt(c.maxw, 10);
    if (mw > 0) img.style.setProperty("--art-max", mw + "px");
    else img.style.removeProperty("--art-max");
  }
}

/* Apply the whole About page (four illustration slots + positioning). */
function applyAboutPage(pg) {
  pg = pg || {};
  const D = MPCStore.ABOUT_DEFAULTS;

  // Hero (backward compatible with the old single "image" field).
  const heroCfg = Object.assign({}, pg.hero);
  if (!heroCfg.image && pg.image) heroCfg.image = pg.image;

  // "Who we are" and "What we are not" now each have their own slot. Fall back
  // to the old single "bottom" slot (with its target) for previously-saved data.
  const legacy = pg.bottom, legacyTarget = (legacy && legacy.target) || "who";
  const whoCfg    = pg.who    || (legacyTarget === "who"    ? legacy : null);
  const notareCfg = pg.notare || (legacyTarget === "notare" ? legacy : null);

  const sections = [
    ["hero",   heroCfg,    D.hero],
    ["middle", pg.middle,  D.middle],
    ["who",    whoCfg,     D.who],
    ["notare", notareCfg,  D.notare]
  ];

  // Words are handled by the general text system (see MPCStore.applyText);
  // this only places the artwork.
  sections.forEach(function (s) {
    applyAboutArt(document.querySelector('.about-section[data-illus="' + s[0] + '"]'), s[1], s[2]);
  });
}

/* Apply an editable page image (and optional title/subtitle) once data is
   ready. Falls back to whatever is already in the markup. Safe on any page. */
MPCStore.applyPage = function (pageId) {
  const pg = (window.MPC_PAGES || {})[pageId] || null;

  if (pageId === "about" && document.querySelector(".about")) {
    // The About page has its own three-slot apply (runs even with no saved data
    // so the defaults settle in without flashing).
    applyAboutPage(pg || {});
  } else {
    // Popular / Guides: a single hero image. The <img> ships with NO src (only
    // a data-default), so the browser never paints an old/default picture before
    // we pick the right one here — custom if saved, otherwise the default.
    const img = document.getElementById("pageHeroImg");
    if (img) {
      const src = (pg && pg.image) || img.getAttribute("data-default");
      if (src) setImageSource(img, src);
      else img.classList.add("ready");
    }
  }

  if (pg) {
    if (pg.title) { const h = document.querySelector("[data-page-title]"); if (h) h.textContent = pg.title; }
    if (pg.subtitle) { const s = document.querySelector("[data-page-subtitle]"); if (s) s.textContent = pg.subtitle; }
  }
};
