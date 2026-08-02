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

      // Fire BOTH reads at once. Resolve page settings the moment they land
      // (don't block them behind the larger guides read).
      const guidesP = fs.getDocs(fs.collection(db, "guides"));
      const pagesP  = fs.getDocs(fs.collection(db, "pages"));

      pagesP.then(psnap => {
        const pages = {};
        psnap.forEach(d => (pages[d.id] = d.data()));
        window.MPC_PAGES = pages;
        MPCStore.pages = pages;
      }).catch(() => { /* pages collection is optional */ })
        .finally(() => _resolvePages());

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
  bottom: "assets/img/family.webp"
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

/* Apply the whole About page (three illustration slots + positioning). */
function applyAboutPage(pg) {
  pg = pg || {};
  const D = MPCStore.ABOUT_DEFAULTS;

  // Hero (backward compatible with the old single "image" field).
  const heroCfg = Object.assign({}, pg.hero);
  if (!heroCfg.image && pg.image) heroCfg.image = pg.image;
  applyAboutArt(document.querySelector('.about-section[data-illus="hero"]'), heroCfg, D.hero);

  // Middle.
  applyAboutArt(document.querySelector('.about-section[data-illus="middle"]'), pg.middle, D.middle);

  // Bottom — attaches to whichever section the editor chose.
  const target = (pg.bottom && pg.bottom.target) || "who";
  const chosen = document.querySelector('.about-section[data-section="' + target + '"]');
  document.querySelectorAll('.about-section[data-illus="bottom"]').forEach(function (sec) {
    if (sec === chosen) applyAboutArt(sec, pg.bottom, D.bottom);
    else sec.classList.remove("has-art");   // the other section stays text-only
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
    // Popular / Guides: a single hero image. Reveal the default straight away
    // when there's no override; swap-then-reveal (no flash) when there is one.
    const img = document.getElementById("pageHeroImg");
    if (img) {
      if (pg && pg.image) setImageSource(img, pg.image);
      else img.classList.add("ready");
    }
  }

  if (pg) {
    if (pg.title) { const h = document.querySelector("[data-page-title]"); if (h) h.textContent = pg.title; }
    if (pg.subtitle) { const s = document.querySelector("[data-page-subtitle]"); if (s) s.textContent = pg.subtitle; }
  }
};
