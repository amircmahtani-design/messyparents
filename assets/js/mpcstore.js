/* ============================================================================
   MPC data layer — makes the public pages read guides live from Firestore.

   - If firebase-config.js has a real config  -> load guides from Firestore
     (falls back to the bundled guides.js if the fetch fails or is empty).
   - If not (local preview)                    -> just use the bundled guides.js.

   Pages wait for `MPCStore.ready` before rendering. `GUIDES` (a global from
   guides.js) is swapped to the Firestore data so every existing function
   (searchGuides, cardHTML, guideById…) keeps working unchanged.
   ========================================================================== */
window.MPCStore = { guides: [], source: "bundled" };

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
      const snap = await fs.getDocs(fs.collection(db, "guides"));
      const arr = [];
      snap.forEach(d => arr.push(d.data()));
      if (arr.length) {
        arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.title).localeCompare(b.title));
        window.GUIDES = arr;               // swap bundled data for live data
        MPCStore.source = "firestore";
      }
    } catch (e) {
      console.warn("[MPC] Firestore load failed — using bundled guides.", e);
    }
  }
  MPCStore.guides = window.GUIDES;
  return window.GUIDES;
})();
