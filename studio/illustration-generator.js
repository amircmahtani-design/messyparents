/* ============================================================================
   MPC Studio — illustration generator UI (self-installing)
   ----------------------------------------------------------------------------
   Load this via Netlify snippet injection or a <script src> in studio/.
   Injects everything it needs into the guide editor:
     • A preview of the current hero image (so you can see what's there)
     • A ✨ Generate illustration button
     • Live progress while the pipeline runs
     • The generated image + QA verdict, with Approve/Regenerate/Reject
     • An editable scene brief so you can steer the illustration
   Works on mobile.
   ========================================================================== */
(function(){
  const CSS = `
#genPanel{margin-top:14px;padding:14px;border:2px dashed #cbd5e1;border-radius:12px;background:#fafaf5}
#genPanel .gp-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
#genPanel .gp-head strong{font-family:inherit;font-size:15px}
#genPanel .gp-head .hint{font-size:12px;color:#6b7684}
#genPanel .gp-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
#genPanel .gp-btn{border:1px solid #e3e6ea;background:#fff;color:#1f2733;padding:10px 14px;border-radius:9px;font-weight:700;font-size:14px;min-height:44px;cursor:pointer;font-family:inherit}
#genPanel .gp-btn:hover{border-color:#c9ced6}
#genPanel .gp-btn.primary{background:#3f6fa3;border-color:#3f6fa3;color:#fff}
#genPanel .gp-btn.primary:hover{background:#335c88}
#genPanel .gp-btn.ghost{background:transparent}
#genPanel .gp-btn[disabled]{opacity:.5;cursor:default}
#genPanel .gp-msg{font-size:13px;color:#41505f;margin-bottom:10px;min-height:18px;font-weight:600}
#genPanel .gp-qa{margin:0;padding:10px;background:#111;color:#c6f6c6;font-size:11px;line-height:1.4;border-radius:8px;max-height:220px;overflow:auto;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace}
#genPanel .gp-images{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px}
#genPanel .gp-img-col{min-width:0}
#genPanel .gp-img-label{font-size:12px;color:#6b7684;margin-bottom:6px;font-weight:700}
#genPanel .gp-img-frame{width:100%;background:repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50%/16px 16px;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;min-height:120px;position:relative}
#genPanel .gp-img{width:100%;display:block}
#genPanel .gp-img-none{padding:24px 12px;text-align:center;color:#6b7684;font-size:13px}
#genPanel .gp-chars{margin-bottom:12px}
#genPanel .gp-chars-label{font-size:12px;color:#6b7684;font-weight:700;margin-bottom:6px}
#genPanel .gp-chars-chips{display:flex;gap:6px;flex-wrap:wrap}
#genPanel .gp-chip{background:#fff;border:2px solid #e3e6ea;color:#1f2733;padding:8px 14px;border-radius:999px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;min-height:36px}
#genPanel .gp-chip:hover{border-color:#c9ced6}
#genPanel .gp-chip.active{background:#3f6fa3;border-color:#3f6fa3;color:#fff}
#genPanel .gp-chip[data-char="auto"].active{background:#7c56b8;border-color:#7c56b8}
#genPanel .gp-brief{margin-top:10px}
#genPanel .gp-brief-label{font-size:12px;color:#6b7684;margin-bottom:6px;font-weight:700}
#genPanel .gp-brief-summary{cursor:pointer;font-size:13px;font-weight:700;color:#6b7684;padding:8px 0;user-select:none}
#genPanel .gp-brief-summary:hover{color:#1f2733}
#genPanel .gp-brief-ta{width:100%;font-family:ui-monospace,Menlo,monospace;font-size:12px;padding:10px;border:1px solid #cbd5e1;border-radius:8px;min-height:180px;margin-top:6px}
#genPanel .gp-change{margin-top:14px;padding:12px;background:#fff;border:2px solid #7c56b8;border-radius:10px}
#genPanel .gp-change-label{font-size:14px;font-weight:700;color:#1f2733;margin-bottom:8px}
#genPanel .gp-change-row{display:flex;gap:8px;flex-wrap:wrap}
#genPanel .gp-change-input{flex:1;min-width:200px;padding:12px 14px;font-family:inherit;font-size:16px;border:1px solid #cbd5e1;border-radius:8px}
#genPanel .gp-change-hint{font-size:12px;color:#6b7684;margin-top:8px;font-style:italic}
@media (min-width: 560px){#genPanel .gp-images{grid-template-columns:1fr 1fr}}
.gp-hidden{display:none !important}
`;

  const HTML_BLOCK = `
<div id="genPanel">
  <div class="gp-head">
    <strong>✨ AI illustration</strong>
    <span class="hint">brand-locked characters, human approval before it attaches</span>
  </div>

  <div class="gp-images" id="gpImagesRow">
    <div class="gp-img-col">
      <div class="gp-img-label">Current hero image</div>
      <div class="gp-img-frame">
        <img id="gpCurrentImg" class="gp-img gp-hidden" alt="current hero">
        <div id="gpCurrentNone" class="gp-img-none">No hero image set yet.</div>
      </div>
    </div>
    <div class="gp-img-col gp-hidden" id="gpPendingCol">
      <div class="gp-img-label">Proposed (not saved yet)</div>
      <div class="gp-img-frame">
        <img id="gpPreviewImg" class="gp-img" alt="proposed illustration">
      </div>
    </div>
  </div>

  <div class="gp-chars">
    <div class="gp-chars-label">Who's in the picture?</div>
    <div class="gp-chars-chips">
      <button type="button" class="gp-chip active" data-char="auto">✨ Let AI choose</button>
      <button type="button" class="gp-chip" data-char="Mama">Mama</button>
      <button type="button" class="gp-chip" data-char="Papa">Papa</button>
      <button type="button" class="gp-chip" data-char="Ari">Ari</button>
    </div>
  </div>

  <div class="gp-buttons">
    <button type="button" id="gpGenerateBtn" class="gp-btn primary">✨ Generate illustration</button>
    <button type="button" id="gpEditBriefBtn" class="gp-btn ghost gp-hidden">Edit JSON &amp; regenerate</button>
    <button type="button" id="gpRegenBtn" class="gp-btn ghost gp-hidden">Regenerate</button>
    <button type="button" id="gpApproveBtn" class="gp-btn primary gp-hidden">Approve &amp; use</button>
    <button type="button" id="gpRejectBtn" class="gp-btn ghost gp-hidden">Reject</button>
  </div>

  <div class="gp-msg" id="gpMsg">Ready.</div>

  <div id="gpQAWrap" class="gp-hidden" style="margin-top:12px">
    <div class="gp-img-label">QA verdict</div>
    <pre id="gpQAPre" class="gp-qa"></pre>
  </div>

  <div id="gpChangeWrap" class="gp-change gp-hidden">
    <div class="gp-change-label">💬 Tell me what to change (plain English)</div>
    <div class="gp-change-row">
      <input id="gpChangeInput" class="gp-change-input" type="text"
             placeholder="e.g. Papa standing up, or Mama sitting on a chair not floating">
      <button type="button" id="gpChangeBtn" class="gp-btn primary">Apply change</button>
    </div>
    <div class="gp-change-hint">This is usually all you need — it keeps everything else the same and just applies your fix.</div>
  </div>

  <div id="gpBriefWrap" class="gp-brief gp-hidden">
    <details>
      <summary class="gp-brief-summary">⚙️ Advanced: edit full brief as JSON</summary>
      <div class="gp-brief-label">Edit the raw brief and regenerate</div>
      <textarea id="gpBriefTA" class="gp-brief-ta"></textarea>
    </details>
  </div>
</div>
`;

  const gpState = { url: null, brief: null, qa: null, unsub: null, fb: null };

  function isStudioEditorPage() {
    return !!(document.querySelector(".top .logo") && document.querySelector("#f_hero"));
  }

  /* ---------- Firebase: grab the studio's already-initialized app ---------- */
  async function getFirebase() {
    if (gpState.fb) return gpState.fb;
    if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.projectId) {
      throw new Error("Firebase config not loaded — sign in first.");
    }
    const V = "10.12.2";
    const [appMod, fsMod] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
    ]);
    const apps = appMod.getApps();
    const app = apps.length ? apps[0] : appMod.initializeApp(window.FIREBASE_CONFIG);
    gpState.fb = { fs: fsMod, db: fsMod.getFirestore(app) };
    return gpState.fb;
  }

  function q(sel){ return document.querySelector(sel); }
  function on(id, evt, fn){ const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); }
  function show(id){ document.getElementById(id).classList.remove("gp-hidden"); }
  function hide(id){ document.getElementById(id).classList.add("gp-hidden"); }

  /** Read the character-selector chips. Returns null if "Let AI choose" is
      active (planner picks), or an array of selected character names. */
  function getSelectedCharacters() {
    const autoChip = document.querySelector('#genPanel .gp-chip[data-char="auto"]');
    if (!autoChip || autoChip.classList.contains("active")) return null;
    const chars = [];
    document.querySelectorAll('#genPanel .gp-chip.active').forEach(c => {
      if (c.dataset.char !== "auto") chars.push(c.dataset.char);
    });
    return chars.length ? chars : null;
  }

  function refreshCurrentPreview() {
    const heroInput = document.getElementById("f_hero");
    const img       = document.getElementById("gpCurrentImg");
    const none      = document.getElementById("gpCurrentNone");
    if (!heroInput || !img || !none) return;
    const url = (heroInput.value || "").trim();
    if (url) {
      const src = /^https?:\/\//.test(url) ? url : ("/" + url.replace(/^\//, ""));
      img.onerror = () => {
        // URL is set but the image failed to load — show a helpful message
        img.classList.add("gp-hidden");
        none.classList.remove("gp-hidden");
        none.textContent = "URL is set but the image couldn't load.";
      };
      img.onload = () => {
        img.classList.remove("gp-hidden");
        none.classList.add("gp-hidden");
      };
      img.src = src;
    } else {
      img.classList.add("gp-hidden");
      none.classList.remove("gp-hidden");
      none.textContent = "No hero image set yet.";
    }
  }

  function showReview(d) {
    gpState.url   = d.url;
    gpState.brief = d.brief;
    gpState.qa    = d.qa;
    document.getElementById("gpPreviewImg").src = d.url;
    document.getElementById("gpPendingCol").classList.remove("gp-hidden");
    document.getElementById("gpQAPre").textContent = JSON.stringify(d.qa || {}, null, 2);
    document.getElementById("gpBriefTA").value = JSON.stringify(d.brief || {}, null, 2);
    document.getElementById("gpChangeInput").value = "";
    show("gpQAWrap"); show("gpBriefWrap"); show("gpChangeWrap");
    show("gpEditBriefBtn"); show("gpRegenBtn"); show("gpApproveBtn"); show("gpRejectBtn");
    document.getElementById("gpGenerateBtn").disabled = false;

    const flag = d.status === "awaiting-approval-with-issues"
      ? "⚠ QA flagged issues — review carefully before approving."
      : "✓ Ready for your approval.";
    document.getElementById("gpMsg").textContent = flag + " Attempts: " + (d.attempts || 1);
  }

  function hideReview() {
    document.getElementById("gpPendingCol").classList.add("gp-hidden");
    hide("gpQAWrap"); hide("gpBriefWrap"); hide("gpChangeWrap");
    hide("gpEditBriefBtn"); hide("gpRegenBtn"); hide("gpApproveBtn"); hide("gpRejectBtn");
    document.getElementById("gpGenerateBtn").disabled = false;
  }

  /** Grab the current guide's ID from the studio's internal state.
      Studio exposes it via the hidden #f_id input in most builds. */
  function currentGuideId() {
    const el = document.getElementById("f_id");
    if (el && el.value) return el.value.trim();
    // Fallback: try to read from the highlighted item in the guide list
    const active = document.querySelector(".gitem.active");
    if (active && active.dataset && active.dataset.id) return active.dataset.id;
    return null;
  }

  /** Fetch the guide from Firestore so the planner has real content. */
  async function fetchGuide(id) {
    if (!window.state || !window.state.fb) return { id, title: id };
    const { fs, db } = window.state.fb;
    try {
      const snap = await fs.getDoc(fs.doc(db, "guides", id));
      if (snap.exists()) return snap.data();
    } catch (_) {}
    return { id, title: id };
  }

  /** Subscribe to the job doc in Firestore and show progress. */
  async function subscribeToJob(guideId) {
    let fb;
    try { fb = await getFirebase(); }
    catch (e) {
      document.getElementById("gpMsg").textContent = "Firebase not ready: " + (e.message || e);
      return;
    }
    const { fs, db } = fb;
    const jobRef = fs.doc(db, "illustration_jobs", guideId);
    if (gpState.unsub) { try { gpState.unsub(); } catch(_) {} }
    let first = true;
    gpState.unsub = fs.onSnapshot(jobRef, snap => {
      const d = snap.data(); if (!d) return;
      if (first) { first = false; if (!["planning","generating","reviewing"].includes(d.status)) return; }
      const msg = document.getElementById("gpMsg");
      if (d.status === "planning")   msg.textContent = "🧠 Planning the scene…";
      if (d.status === "generating") msg.textContent = "🎨 Drawing (attempt " + (d.attempt || 1) + ")…";
      if (d.status === "reviewing")  msg.textContent = "🔍 Reviewing for brand fidelity…";
      if (d.status === "awaiting-approval" || d.status === "awaiting-approval-with-issues") {
        try { gpState.unsub(); } catch(_) {}
        showReview(d);
      }
      if (d.status === "error") {
        try { gpState.unsub(); } catch(_) {}
        msg.textContent = "✗ Failed: " + (d.error || "generation error");
        document.getElementById("gpGenerateBtn").disabled = false;
      }
    });
  }

  async function startGeneration(briefOverride, userInstructions) {
    const id = currentGuideId();
    if (!id) {
      document.getElementById("gpMsg").textContent = "Pick a guide first (open one from the ☰ menu).";
      return;
    }
    document.getElementById("gpGenerateBtn").disabled = true;
    hideReview();
    document.getElementById("gpMsg").textContent = "Starting…";

    // Persist current draft so the planner sees the latest content.
    try {
      if (typeof window.draftGuide === "function") {
        const g = window.draftGuide();
        const { fs, db } = await getFirebase();
        await fs.setDoc(fs.doc(db, "guides", g.id), g, { merge: true });
      }
    } catch(_) {}

    await subscribeToJob(id);

    try {
      await fetch("/.netlify/functions/generate-illustration-background", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          guideId: id,
          refsBase: location.origin + "/assets/img/refs",
          briefOverride: briefOverride || null,
          characterSelection: getSelectedCharacters(),
          userInstructions: userInstructions || ""
        })
      });
    } catch (e) {
      document.getElementById("gpMsg").textContent = "Could not start: " + (e.message || e);
      document.getElementById("gpGenerateBtn").disabled = false;
    }

    setTimeout(() => {
      if (!gpState.url && document.getElementById("gpGenerateBtn").disabled) {
        try { gpState.unsub && gpState.unsub(); } catch(_) {}
        document.getElementById("gpMsg").textContent = "Still working after 6 min. Reopen the guide shortly — the job may finish in the background.";
        document.getElementById("gpGenerateBtn").disabled = false;
      }
    }, 360000);
  }

  async function approve() {
    if (!gpState.url) return;
    const heroInput = document.getElementById("f_hero");
    if (heroInput) {
      heroInput.value = gpState.url;
      heroInput.dispatchEvent(new Event("input", { bubbles: true }));
      heroInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    refreshCurrentPreview();

    // Auto-save: write the hero URL directly to Firestore so the guide is
    // persisted immediately. Merge write — won't overwrite other fields.
    // Studio's schema is `guide.panel.hero`, not top-level.
    let savedOk = false;
    try {
      const id = currentGuideId();
      if (id) {
        const { fs, db } = await getFirebase();
        await fs.setDoc(fs.doc(db, "guides", id), {
          panel: { hero: gpState.url },
          heroUpdated: Date.now()
        }, { merge: true });
        savedOk = true;
      }
    } catch (e) {
      document.getElementById("gpMsg").textContent =
        "✓ Approved — but auto-save failed (tap Save to keep): " + (e.message || e);
    }
    if (savedOk) {
      document.getElementById("gpMsg").textContent = "✓ Approved and saved.";
      // Refresh the sidebar dots so the new state (green) shows immediately.
      setTimeout(() => refreshSidebarDots(), 500);
    }
    hideReview();
  }

  function reject() {
    gpState.url = null; gpState.brief = null; gpState.qa = null;
    document.getElementById("gpMsg").textContent = "Rejected. Nothing attached.";
    hideReview();
  }

  function tryEditBrief() {
    try {
      const edited = JSON.parse(document.getElementById("gpBriefTA").value);
      startGeneration(edited, "");
    } catch (e) {
      document.getElementById("gpMsg").textContent = "Brief is not valid JSON: " + (e.message || e);
    }
  }

  function inject() {
    if (!isStudioEditorPage()) return;
    if (document.getElementById("genPanel")) return;

    // 1) Inject CSS
    if (!document.getElementById("mpc-gen-css")) {
      const st = document.createElement("style");
      st.id = "mpc-gen-css"; st.textContent = CSS;
      document.head.appendChild(st);
    }

    // 2) Inject the panel right after the #f_hero field (or its wrapper)
    const heroInput = document.getElementById("f_hero");
    if (!heroInput) return;
    const container = heroInput.closest(".field") || heroInput.parentElement;
    const wrap = document.createElement("div");
    wrap.innerHTML = HTML_BLOCK.trim();
    container.parentElement.insertBefore(wrap.firstElementChild, container.nextSibling);

    // 3) Wire up buttons
    on("gpGenerateBtn",  "click", () => startGeneration(null, ""));
    on("gpRegenBtn",     "click", () => startGeneration(gpState.brief, ""));
    on("gpEditBriefBtn", "click", tryEditBrief);
    on("gpApproveBtn",   "click", approve);
    on("gpRejectBtn",    "click", reject);
    on("gpChangeBtn",    "click", () => {
      const txt = (document.getElementById("gpChangeInput").value || "").trim();
      if (!txt) {
        document.getElementById("gpMsg").textContent = "Type what to change first (e.g. 'Papa standing up').";
        return;
      }
      startGeneration(gpState.brief, txt);
    });

    // 3b) Wire up character-selector chips
    document.querySelectorAll("#genPanel .gp-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const isAuto = chip.dataset.char === "auto";
        const autoChip = document.querySelector('#genPanel .gp-chip[data-char="auto"]');
        const charChips = document.querySelectorAll('#genPanel .gp-chip:not([data-char="auto"])');
        if (isAuto) {
          // Tapping "Let AI choose" clears everything else and activates auto
          autoChip.classList.add("active");
          charChips.forEach(c => c.classList.remove("active"));
        } else {
          // Tapping a character toggles it and turns off auto
          autoChip.classList.remove("active");
          chip.classList.toggle("active");
          // If no character is selected, fall back to auto
          const anyActive = Array.from(charChips).some(c => c.classList.contains("active"));
          if (!anyActive) autoChip.classList.add("active");
        }
      });
    });

    // 4) Wire up the hero-input to refresh the current preview
    heroInput.addEventListener("input",  refreshCurrentPreview);
    heroInput.addEventListener("change", refreshCurrentPreview);
    refreshCurrentPreview();

    // 4b) Studio sets #f_hero.value programmatically when you pick a guide,
    //     which does NOT fire input/change events. Poll for value changes
    //     every 500ms — bullet-proof way to catch programmatic assignments.
    let lastHeroValue = heroInput.value;
    setInterval(() => {
      const el = document.getElementById("f_hero");
      if (!el) return;
      if (el.value !== lastHeroValue) {
        lastHeroValue = el.value;
        refreshCurrentPreview();
      }
    }, 500);

    // 5) When the user picks a different guide from the sidebar, refresh
    //    the current preview a moment later (belt-and-braces on top of the poll)
    document.addEventListener("click", e => {
      if (e.target.closest(".gitem")) {
        setTimeout(refreshCurrentPreview, 200);
        setTimeout(refreshCurrentPreview, 700);
      }
    });
  }

  /* ==========================================================================
     FEATURE: sidebar dots — colour-code each guide item by hero status
     ------------------------------------------------------------------------
     Grey  = no hero
     Green = has hero
     Amber = hero older than 30 days (stale — worth regenerating)
     ========================================================================== */

  const DOT_CSS = `
.gitem { position: relative; padding-left: 30px !important; }
.gitem::before {
  content: "";
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 8px; height: 8px; border-radius: 50%;
  background: #cbd5e1;
  box-shadow: 0 0 0 1px rgba(0,0,0,.05);
}
.gitem.dot-has::before   { background: #2e8b57; }
.gitem.dot-stale::before { background: #d19a20; }
`;

  let guideStatusCache = {};

  async function fetchGuideStatuses() {
    try {
      const { fs, db } = await getFirebase();
      const snap = await fs.getDocs(fs.collection(db, "guides"));
      const now = Date.now();
      const stale = 30 * 24 * 60 * 60 * 1000;
      const out = {};
      snap.forEach(doc => {
        const g = doc.data();
        const hero = ((g.panel && g.panel.hero) || g.hero || "").trim();
        if (!hero) { out[doc.id] = "none"; return; }
        const t = g.heroUpdated || parseTimestampFromUrl(hero);
        out[doc.id] = (t && (now - t) > stale) ? "stale" : "has";
      });
      guideStatusCache = out;
      return out;
    } catch (e) {
      return {};
    }
  }

  // Firebase Storage URLs from our pipeline have the pattern
  //   guides-pending/{guideId}-{timestamp}.png
  // We can pull a rough timestamp out. Returns null if not parseable.
  function parseTimestampFromUrl(url) {
    const m = /\/guides(?:-pending)?%2F[^-]+-(\d{13})\.png/.exec(url) ||
              /\/guides(?:-pending)?\/[^-]+-(\d{13})\.png/.exec(url);
    return m ? parseInt(m[1], 10) : null;
  }

  function applyDotsToDom() {
    document.querySelectorAll(".gitem").forEach(el => {
      const id = el.dataset && el.dataset.id;
      if (!id) return;
      const status = guideStatusCache[id];
      el.classList.remove("dot-has", "dot-stale");
      if (status === "has")   el.classList.add("dot-has");
      if (status === "stale") el.classList.add("dot-stale");
    });
  }

  async function refreshSidebarDots() {
    await fetchGuideStatuses();
    applyDotsToDom();
  }

  function installSidebarDots() {
    if (document.getElementById("mpc-dots-css")) return;
    const st = document.createElement("style");
    st.id = "mpc-dots-css"; st.textContent = DOT_CSS;
    document.head.appendChild(st);

    // Initial paint (may run before .gitem elements exist — the observer catches later renders)
    refreshSidebarDots();

    // Re-paint whenever the guide list re-renders
    const listEl = document.getElementById("list");
    if (listEl && !listEl.__mpcObserver) {
      const obs = new MutationObserver(() => applyDotsToDom());
      obs.observe(listEl, { childList: true, subtree: true });
      listEl.__mpcObserver = obs;
    }
  }

  /* ==========================================================================
     FEATURE: brand consistency gallery
     ------------------------------------------------------------------------
     A grid modal showing every guide's hero side-by-side, so drift over time
     is easy to spot. Opens from a button injected into the top bar.
     ========================================================================== */

  const GALLERY_CSS = `
#galleryBtn { padding: 8px 12px; }
#galleryModal {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(20, 25, 33, .75);
  display: none; overflow: auto;
}
#galleryModal.open { display: block; }
#galleryCard {
  background: #f4f5f7; margin: 20px auto; max-width: 1200px;
  border-radius: 12px; padding: 20px 20px 40px;
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}
#galleryHead {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-bottom: 14px;
}
#galleryHead h2 { margin: 0; font-size: 18px; font-family: inherit; flex: 1; }
#galleryHead .btn { padding: 8px 14px; }
#galleryFilters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
#galleryFilters button {
  background: #fff; border: 2px solid #e3e6ea; color: #1f2733;
  padding: 6px 12px; border-radius: 999px; font-family: inherit; font-size: 13px;
  font-weight: 700; cursor: pointer; min-height: 34px;
}
#galleryFilters button.active { background: #3f6fa3; border-color: #3f6fa3; color: #fff; }
#galleryGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
#galleryGrid .g-card {
  background: #fff; border: 1px solid #e3e6ea; border-radius: 10px;
  overflow: hidden; cursor: pointer; text-align: left;
  padding: 0; font-family: inherit;
  transition: transform .12s ease, border-color .12s ease;
}
#galleryGrid .g-card:hover { transform: translateY(-2px); border-color: #3f6fa3; }
#galleryGrid .g-thumb {
  width: 100%; aspect-ratio: 3 / 2;
  background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50%/12px 12px;
  display: flex; align-items: center; justify-content: center;
  color: #6b7684; font-size: 11px; text-align: center; padding: 4px;
}
#galleryGrid .g-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }
#galleryGrid .g-title {
  padding: 8px 10px; font-size: 12px; font-weight: 700; color: #1f2733;
  border-top: 1px solid #eef1f4; line-height: 1.3;
}
#galleryGrid .g-title small { display: block; font-weight: 500; color: #6b7684; font-size: 10.5px; margin-top: 2px; }
`;

  const GALLERY_HTML = `
<div id="galleryModal" aria-hidden="true">
  <div id="galleryCard">
    <div id="galleryHead">
      <h2>🖼 Brand consistency gallery</h2>
      <button type="button" class="btn" id="galleryCloseBtn">Close</button>
    </div>
    <div id="galleryFilters">
      <button type="button" data-filter="all" class="active">All</button>
      <button type="button" data-filter="has">With hero</button>
      <button type="button" data-filter="none">Missing hero</button>
      <button type="button" data-filter="stale">Stale (>30d)</button>
    </div>
    <div id="galleryGrid"></div>
  </div>
</div>
`;

  async function openGallery() {
    document.getElementById("galleryModal").classList.add("open");
    document.getElementById("galleryModal").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    await refreshSidebarDots();  // also refresh the cache
    renderGallery(currentGalleryFilter);
  }
  function closeGallery() {
    document.getElementById("galleryModal").classList.remove("open");
    document.getElementById("galleryModal").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  let currentGalleryFilter = "all";

  async function renderGallery(filter) {
    currentGalleryFilter = filter;
    document.querySelectorAll("#galleryFilters button").forEach(b => {
      b.classList.toggle("active", b.dataset.filter === filter);
    });
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "<div style='padding:20px;color:#6b7684'>Loading guides…</div>";
    let guides = [];
    try {
      const { fs, db } = await getFirebase();
      const snap = await fs.getDocs(fs.collection(db, "guides"));
      snap.forEach(doc => guides.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
      grid.innerHTML = "<div style='padding:20px;color:#c0392b'>Failed to load: " + (e.message || e) + "</div>";
      return;
    }
    const filtered = guides.filter(g => {
      const s = guideStatusCache[g.id] || "none";
      if (filter === "all")   return true;
      if (filter === "has")   return s === "has" || s === "stale";
      if (filter === "none")  return s === "none";
      if (filter === "stale") return s === "stale";
      return true;
    });
    if (filtered.length === 0) {
      grid.innerHTML = "<div style='padding:20px;color:#6b7684'>Nothing to show for this filter.</div>";
      return;
    }
    filtered.sort((a, b) => String(a.title || a.id).localeCompare(String(b.title || b.id)));
    grid.innerHTML = "";
    filtered.forEach(g => {
      const hero = ((g.panel && g.panel.hero) || g.hero || "").trim();
      const status = guideStatusCache[g.id] || "none";
      const card = document.createElement("button");
      card.className = "g-card";
      card.type = "button";
      card.dataset.guideId = g.id;
      const badge = status === "has" ? "✓ has hero"
                  : status === "stale" ? "⚠ stale"
                  : "○ missing";
      card.innerHTML = `
        <div class="g-thumb">
          ${hero
            ? `<img src="${hero}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML+='broken URL'">`
            : "no hero yet"}
        </div>
        <div class="g-title">${escapeHtml(g.title || g.id)}<small>${badge}</small></div>
      `;
      card.addEventListener("click", () => {
        const targetId = g.id;
        closeGallery();
        // Clear any active sidebar search filter so ALL guides are re-rendered
        // — otherwise the target .gitem might not exist in the DOM.
        const searchInput = document.getElementById("q");
        if (searchInput && searchInput.value) {
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        // Give studio a beat to re-render, then click the target guide's item.
        const tryClick = (attempt) => {
          const item = document.querySelector(`.gitem[data-id="${CSS.escape(targetId)}"]`);
          if (item) { item.click(); return; }
          if (attempt < 5) setTimeout(() => tryClick(attempt + 1), 150);
          else {
            const msg = document.getElementById("gpMsg");
            if (msg) msg.textContent = "Couldn't jump to that guide — try picking it from the ☰ menu.";
          }
        };
        setTimeout(() => tryClick(0), 120);
      });
      grid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function installGallery() {
    if (document.getElementById("galleryBtn")) return;
    const top = document.querySelector(".top");
    if (!top) return;

    // CSS
    if (!document.getElementById("mpc-gallery-css")) {
      const st = document.createElement("style");
      st.id = "mpc-gallery-css"; st.textContent = GALLERY_CSS;
      document.head.appendChild(st);
    }

    // Button in top bar — insert before Sign out for prominence
    const btn = document.createElement("button");
    btn.id = "galleryBtn";
    btn.className = "btn ghost";
    btn.type = "button";
    btn.title = "Brand consistency gallery — see all hero illustrations together";
    btn.textContent = "🖼 Gallery";
    const signout = document.getElementById("signout");
    if (signout) top.insertBefore(btn, signout);
    else top.appendChild(btn);

    // Modal
    const wrap = document.createElement("div");
    wrap.innerHTML = GALLERY_HTML.trim();
    document.body.appendChild(wrap.firstElementChild);

    // Wire
    btn.addEventListener("click", openGallery);
    document.getElementById("galleryCloseBtn").addEventListener("click", closeGallery);
    document.getElementById("galleryModal").addEventListener("click", e => {
      if (e.target.id === "galleryModal") closeGallery();  // click backdrop
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && document.getElementById("galleryModal").classList.contains("open")) closeGallery();
    });
    document.querySelectorAll("#galleryFilters button").forEach(b => {
      b.addEventListener("click", () => renderGallery(b.dataset.filter));
    });
  }

  /* ---- bootstrap: also install dots + gallery once the studio DOM is up ---- */
  function bootExtras() {
    if (!document.querySelector(".top") || !document.querySelector("aside.side")) return;
    installSidebarDots();
    installGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    inject();
    bootExtras();
    if (document.getElementById("genPanel") && document.getElementById("galleryBtn") && tries > 5 || tries > 30) clearInterval(iv);
  }, 300);
})();
