/* ============================================================================
   MPC Editor · AI illustration + mobile responsive
   ----------------------------------------------------------------------------
   Self-installing snippet loaded via Netlify snippet injection.
   Reuses the /.netlify/functions/generate-illustration-background pipeline
   already used by Studio — but injects a per-slot AI panel into every image
   element on every spread, plus mobile responsive layout + jump-to-guide
   safety fallback.

   Two modes:
   • Character mode (default) — same character bible as Studio (Mama/Papa/Ari)
   • Icon mode                — small stand-alone icons (pram, bottle) with no
                                character references; user types the subject or
                                lets AI infer it from surrounding text.
   ========================================================================== */

(function(){
  "use strict";
  if (window.__mpcEditorInstalled) return;
  window.__mpcEditorInstalled = true;

  /* ---- helpers --------------------------------------------------------- */
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function q(sel){ return document.querySelector(sel); }
  function isEditor(){ return /\/editor\/?/i.test(location.pathname); }

  function showToast(text, kind) {
    let t = document.getElementById("mpcToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "mpcToast";
      t.style.cssText =
        "position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:2000;" +
        "background:#1f2733;color:#fff;padding:10px 18px;border-radius:999px;" +
        "font-family:inherit;font-size:14px;font-weight:600;" +
        "box-shadow:0 4px 16px rgba(0,0,0,.25);opacity:0;transition:opacity .2s ease;" +
        "max-width:calc(100vw - 40px);text-align:center";
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.style.background = kind === "success" ? "#2e8b57"
                       : kind === "error"   ? "#c0392b"
                       : "#1f2733";
    t.style.opacity = "1";
    clearTimeout(t.__hideTimer);
    t.__hideTimer = setTimeout(() => { t.style.opacity = "0"; }, 3200);
  }

  /* ---- Firebase — reuse config from the editor's own <script> ---------- */
  const CFG = window.FIREBASE_CONFIG || null;
  const BOOK_ID = new URLSearchParams(location.search).get("book") || "";
  let fbCache = null;
  async function getFB() {
    if (fbCache) return fbCache;
    if (!CFG) throw new Error("Firebase not configured");
    const [{ initializeApp, getApps }, fs, auth] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js")
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(CFG);
    fbCache = { app, fs, auth, db: fs.getFirestore(app) };
    return fbCache;
  }

  /* ==========================================================================
     MOBILE RESPONSIVE  — drawer for the rail, full-width work pane
     ========================================================================== */
  const MOBILE_CSS = `
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr !important; grid-template-rows: 1fr auto !important; }
  aside {
    position: fixed !important; top: 0; left: 0; bottom: 0;
    width: 82vw; max-width: 340px; z-index: 40;
    transform: translateX(-105%); transition: transform .25s ease;
    background: #fff; overflow-y: auto;
    box-shadow: 4px 0 20px rgba(20,25,33,.15);
    padding-top: env(safe-area-inset-top);
  }
  aside.mpc-open { transform: translateX(0); }
  .work { padding: 12px !important; padding-bottom: 60vh !important; }
  .pv {
    position: fixed !important; left: 0; right: 0; bottom: 0;
    height: 45vh; z-index: 30; background: #fff;
    border-top: 1px solid #cbd5e1;
    padding-bottom: env(safe-area-inset-bottom);
  }
  header { padding-top: env(safe-area-inset-top); flex-wrap: wrap; gap: 6px !important; }
  header .sp { display: none; }
  header #who, header .msg:not(#saveMsg) { display: none; }
  input, textarea, select { font-size: 16px !important; }

  #mpcMenuBtn {
    display: flex !important; align-items: center; justify-content: center;
    background: #3f6fa3; color: #fff; border: none;
    padding: 10px 14px; border-radius: 8px; font-weight: 700;
    font-family: inherit; font-size: 15px; cursor: pointer; min-height: 40px;
    margin-right: 8px;
  }
  #mpcOverlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 35;
    display: none;
  }
  #mpcOverlay.show { display: block; }
}
#mpcMenuBtn { display: none; }
`;

  function installMobile() {
    if (document.getElementById("mpc-editor-mobile-css")) return;
    const st = document.createElement("style");
    st.id = "mpc-editor-mobile-css"; st.textContent = MOBILE_CSS;
    document.head.appendChild(st);

    // Hamburger button in header
    const header = document.querySelector("header");
    if (header && !document.getElementById("mpcMenuBtn")) {
      const btn = document.createElement("button");
      btn.id = "mpcMenuBtn"; btn.type = "button"; btn.textContent = "☰";
      btn.title = "Open spread list";
      header.insertBefore(btn, header.firstChild);

      // Overlay
      const overlay = document.createElement("div");
      overlay.id = "mpcOverlay";
      document.body.appendChild(overlay);

      const openDrawer = () => {
        document.querySelector("aside").classList.add("mpc-open");
        overlay.classList.add("show");
      };
      const closeDrawer = () => {
        document.querySelector("aside").classList.remove("mpc-open");
        overlay.classList.remove("show");
      };
      btn.addEventListener("click", openDrawer);
      overlay.addEventListener("click", closeDrawer);

      // Close drawer after picking a spread on mobile
      const aside = document.querySelector("aside");
      if (aside) {
        aside.addEventListener("click", e => {
          if (e.target.closest(".item") && window.matchMedia("(max-width:900px)").matches) {
            setTimeout(closeDrawer, 80);
          }
        });
      }
    }
  }

  /* ==========================================================================
     AI ILLUSTRATION PANEL  — one panel per image element in the work pane
     ========================================================================== */
  const PANEL_CSS = `
.mpc-panel {
  background: #f4f5f7; border: 2px solid #c9d3e0; border-radius: 10px;
  padding: 12px; margin: 8px 0 4px 0; font-family: inherit; font-size: 14px;
}
.mpc-panel .mpc-hd { font-weight: 700; color: #3f6fa3; margin-bottom: 8px; font-size: 14px; }
.mpc-panel .mpc-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.mpc-panel .mpc-chip {
  background: #fff; border: 2px solid #e3e6ea; color: #1f2733;
  padding: 6px 12px; border-radius: 999px; font-family: inherit; font-size: 12px;
  font-weight: 700; cursor: pointer; min-height: 32px;
}
.mpc-panel .mpc-chip.active { background: #3f6fa3; border-color: #3f6fa3; color: #fff; }
.mpc-panel .mpc-chip[data-char="auto"].active,
.mpc-panel .mpc-chip[data-aspect="auto"].active { background: #7c56b8; border-color: #7c56b8; }
.mpc-panel .mpc-chip[data-mode].active { background: #2e8b57; border-color: #2e8b57; }
.mpc-panel .mpc-label { font-size: 11px; color: #6b7684; font-weight: 700; margin-bottom: 4px; }
.mpc-panel textarea, .mpc-panel input[type="text"] {
  width: 100%; padding: 8px 10px; font-family: inherit; font-size: 14px;
  border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 8px;
}
.mpc-panel textarea { resize: vertical; min-height: 40px; }
.mpc-panel .mpc-btn {
  padding: 10px 14px; border-radius: 6px; font-family: inherit;
  font-size: 13px; font-weight: 700; cursor: pointer; min-height: 40px;
  border: 2px solid transparent;
}
.mpc-panel .mpc-btn.primary { background: #3f6fa3; color: #fff; border-color: #3f6fa3; }
.mpc-panel .mpc-btn.ghost { background: #fff; color: #3f6fa3; border-color: #3f6fa3; }
.mpc-panel .mpc-btn:disabled { opacity: .5; cursor: default; }
.mpc-panel .mpc-buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.mpc-panel .mpc-msg { font-size: 12px; color: #41505f; margin-top: 8px; min-height: 14px; font-weight: 600; }
.mpc-panel .mpc-review { margin-top: 10px; display: none; }
.mpc-panel .mpc-review.show { display: block; }
.mpc-panel .mpc-review-imgs { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 8px; }
@media (min-width: 640px) { .mpc-panel .mpc-review-imgs { grid-template-columns: 1fr 1fr; } }
.mpc-panel .mpc-img-col { min-width: 0; }
.mpc-panel .mpc-img-col .mpc-img-label { font-size: 11px; color: #6b7684; font-weight: 700; margin-bottom: 4px; }
.mpc-panel .mpc-img-frame {
  width: 100%; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50%/16px 16px;
  border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; min-height: 100px;
}
.mpc-panel .mpc-img-frame img { width: 100%; display: block; }
.mpc-panel .mpc-img-frame .mpc-none { padding: 20px 10px; text-align: center; color: #6b7684; font-size: 12px; }
.mpc-panel pre.mpc-qa {
  margin: 0 0 8px 0; padding: 8px 10px; background: #fff;
  border: 1px solid #e3e6ea; border-radius: 6px;
  font-family: ui-monospace, Menlo, monospace; font-size: 11px;
  line-height: 1.5; white-space: pre-wrap; max-height: 200px; overflow: auto;
}
.mpc-panel .mpc-change {
  background: #fff; border: 2px solid #7c56b8; border-radius: 8px;
  padding: 10px; margin-top: 10px;
}
.mpc-panel .mpc-change-label { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.mpc-panel details.mpc-adv summary {
  cursor: pointer; font-size: 12px; color: #6b7684; padding: 6px 0; user-select: none;
}
`;

  const CHIP_CHARS = ["Mama", "Papa", "Ari"];
  const CHIP_ASPECT = [
    ["auto", "Auto"], ["square", "Square"],
    ["landscape", "Landscape"], ["portrait", "Portrait"], ["fullpage", "Full page"]
  ];

  function panelHTML(slotKey) {
    const id = "mpc-" + slotKey.replace(/[^a-z0-9]/gi, "-");
    return `
<div class="mpc-panel" data-slot="${esc(slotKey)}" data-panel-id="${id}">
  <div class="mpc-hd">✨ AI illustration</div>

  <div class="mpc-label">Type</div>
  <div class="mpc-row" data-group="mode">
    <button type="button" class="mpc-chip active" data-mode="character">Character scene</button>
    <button type="button" class="mpc-chip" data-mode="icon">Icon</button>
  </div>

  <div class="mpc-icon-only" style="display:none">
    <div class="mpc-label">Icon subject (leave blank to let AI infer from nearby text)</div>
    <input type="text" data-field="iconSubject" placeholder="e.g. pram, feeding bottle, car seat">
  </div>

  <div class="mpc-char-only">
    <div class="mpc-label">Who's in the picture?</div>
    <div class="mpc-row" data-group="char">
      <button type="button" class="mpc-chip active" data-char="auto">✨ Let AI choose</button>
      ${CHIP_CHARS.map(c => `<button type="button" class="mpc-chip" data-char="${c}">${c}</button>`).join("")}
    </div>
  </div>

  <div class="mpc-label">Shape</div>
  <div class="mpc-row" data-group="aspect">
    ${CHIP_ASPECT.map(([v,l], i) => `<button type="button" class="mpc-chip${i===0?' active':''}" data-aspect="${v}">${l}</button>`).join("")}
  </div>

  <div class="mpc-label">💡 Describe your visual (optional)</div>
  <textarea data-field="describe" placeholder="If you have a scene in mind, describe it. Leave blank to let AI decide." rows="2"></textarea>

  <div class="mpc-buttons">
    <button type="button" class="mpc-btn primary" data-act="generate">✨ Generate</button>
  </div>

  <div class="mpc-msg" data-el="msg">Ready.</div>

  <div class="mpc-review" data-el="review">
    <div class="mpc-review-imgs">
      <div class="mpc-img-col">
        <div class="mpc-img-label">Current</div>
        <div class="mpc-img-frame" data-el="currentFrame">
          <div class="mpc-none">No image yet.</div>
        </div>
      </div>
      <div class="mpc-img-col">
        <div class="mpc-img-label">Proposed (not saved yet)</div>
        <div class="mpc-img-frame" data-el="proposedFrame"></div>
      </div>
    </div>
    <pre class="mpc-qa" data-el="qa"></pre>

    <div class="mpc-change">
      <div class="mpc-change-label">💬 Tell me what to change (plain English)</div>
      <input type="text" data-field="changeInput" placeholder="e.g. Mama sitting on a chair, not floating">
      <div class="mpc-buttons">
        <button type="button" class="mpc-btn primary" data-act="applyChange">Apply change</button>
      </div>
    </div>

    <details class="mpc-adv">
      <summary>⚙️ Advanced: edit full brief as JSON</summary>
      <textarea data-field="brief" rows="10" style="font-family:ui-monospace,Menlo,monospace;font-size:11px"></textarea>
      <div class="mpc-buttons">
        <button type="button" class="mpc-btn ghost" data-act="editBrief">Edit JSON &amp; regenerate</button>
      </div>
    </details>

    <div class="mpc-buttons" style="margin-top:10px">
      <button type="button" class="mpc-btn primary" data-act="approve">Approve &amp; save</button>
      <button type="button" class="mpc-btn ghost" data-act="regen">Regenerate</button>
      <button type="button" class="mpc-btn ghost" data-act="reject">Reject</button>
    </div>
  </div>
</div>
`.trim();
  }

  // Per-panel state (keyed by slotKey)
  const panelStates = {};

  function currentSpreadId() {
    const active = document.querySelector(".item.active");
    return active ? active.dataset.sel : "";
  }

  /** Given a .el data-el value like "left:2" plus the current spread id,
      return { spreadId, side, idx } uniquely identifying an image slot. */
  function slotKeyFor(elWrapper) {
    const dataEl = elWrapper.dataset.el;      // "left:0" or "right:2"
    const spreadId = currentSpreadId();
    return spreadId + "|" + dataEl;
  }

  /** Get the panel for an image element, creating it if missing. */
  function ensurePanel(elWrapper) {
    if (elWrapper.__mpcPanel) return elWrapper.__mpcPanel;
    const slotKey = slotKeyFor(elWrapper);
    const wrap = document.createElement("div");
    wrap.innerHTML = panelHTML(slotKey);
    const panel = wrap.firstElementChild;
    elWrapper.appendChild(panel);
    wirePanel(panel, elWrapper);
    elWrapper.__mpcPanel = panel;

    // Prime the "current" image preview from the existing img in this element
    const currentImg = elWrapper.querySelector("img.thumb");
    updateCurrentPreview(panel, currentImg && currentImg.src);
    return panel;
  }

  function updateCurrentPreview(panel, url) {
    const frame = panel.querySelector('[data-el="currentFrame"]');
    if (!frame) return;
    if (url && !/^data:/.test(url)) {
      frame.innerHTML = `<img src="${esc(url)}" alt="current">`;
    } else {
      frame.innerHTML = `<div class="mpc-none">No image yet.</div>`;
    }
  }

  function updateProposedPreview(panel, url) {
    const frame = panel.querySelector('[data-el="proposedFrame"]');
    if (!frame) return;
    frame.innerHTML = url ? `<img src="${esc(url)}" alt="proposed">` : `<div class="mpc-none">Working…</div>`;
  }

  function getChipsMode(panel) {
    const active = panel.querySelector('[data-group="mode"] .mpc-chip.active');
    return active ? active.dataset.mode : "character";
  }
  function getChipsAspect(panel) {
    const active = panel.querySelector('[data-group="aspect"] .mpc-chip.active');
    return active ? active.dataset.aspect : "auto";
  }
  function getChipsChars(panel) {
    const autoChip = panel.querySelector('[data-group="char"] .mpc-chip[data-char="auto"]');
    if (!autoChip || autoChip.classList.contains("active")) return null;
    const chars = [];
    panel.querySelectorAll('[data-group="char"] .mpc-chip.active').forEach(c => {
      if (c.dataset.char !== "auto") chars.push(c.dataset.char);
    });
    return chars.length ? chars : null;
  }
  function getVal(panel, field) {
    const el = panel.querySelector(`[data-field="${field}"]`);
    return el ? (el.value || "").trim() : "";
  }
  function setVal(panel, field, v) {
    const el = panel.querySelector(`[data-field="${field}"]`);
    if (el) el.value = v || "";
  }

  function wirePanel(panel, elWrapper) {
    // Chip toggles
    panel.querySelector('[data-group="mode"]').addEventListener("click", e => {
      const chip = e.target.closest(".mpc-chip"); if (!chip) return;
      panel.querySelectorAll('[data-group="mode"] .mpc-chip').forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      // Toggle char vs icon field visibility
      const isIcon = chip.dataset.mode === "icon";
      panel.querySelector(".mpc-icon-only").style.display = isIcon ? "block" : "none";
      panel.querySelector(".mpc-char-only").style.display = isIcon ? "none" : "block";
    });
    panel.querySelector('[data-group="aspect"]').addEventListener("click", e => {
      const chip = e.target.closest(".mpc-chip"); if (!chip) return;
      panel.querySelectorAll('[data-group="aspect"] .mpc-chip').forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
    });
    panel.querySelector('[data-group="char"]').addEventListener("click", e => {
      const chip = e.target.closest(".mpc-chip"); if (!chip) return;
      const isAuto = chip.dataset.char === "auto";
      const autoChip = panel.querySelector('[data-group="char"] .mpc-chip[data-char="auto"]');
      const charChips = panel.querySelectorAll('[data-group="char"] .mpc-chip:not([data-char="auto"])');
      if (isAuto) {
        autoChip.classList.add("active");
        charChips.forEach(c => c.classList.remove("active"));
      } else {
        autoChip.classList.remove("active");
        chip.classList.toggle("active");
        const anyActive = Array.from(charChips).some(c => c.classList.contains("active"));
        if (!anyActive) autoChip.classList.add("active");
      }
    });

    // Button actions
    panel.addEventListener("click", e => {
      const btn = e.target.closest("[data-act]"); if (!btn) return;
      const act = btn.dataset.act;
      if (act === "generate")    generate(panel, elWrapper, "");
      if (act === "applyChange") {
        const txt = getVal(panel, "changeInput");
        if (!txt) { setMsg(panel, "Type what to change first."); return; }
        const st = panelStates[panel.dataset.panelId] || {};
        generate(panel, elWrapper, txt, st.brief);
      }
      if (act === "editBrief") {
        try {
          const edited = JSON.parse(getVal(panel, "brief"));
          generate(panel, elWrapper, "", edited);
        } catch (err) {
          setMsg(panel, "Brief is not valid JSON: " + (err.message || err));
        }
      }
      if (act === "approve") approve(panel, elWrapper);
      if (act === "regen") {
        const st = panelStates[panel.dataset.panelId] || {};
        generate(panel, elWrapper, "", st.brief);
      }
      if (act === "reject") {
        const st = panelStates[panel.dataset.panelId] || {};
        st.url = null; st.brief = null; st.qa = null;
        panel.querySelector('[data-el="review"]').classList.remove("show");
        setMsg(panel, "Rejected.");
      }
    });
  }

  function setMsg(panel, text) {
    const el = panel.querySelector('[data-el="msg"]');
    if (el) el.textContent = text;
  }

  /* ---- Generation flow ------------------------------------------------- */

  async function generate(panel, elWrapper, userInstructions, briefOverride) {
    const pid = panel.dataset.panelId;
    const st = panelStates[pid] = panelStates[pid] || {};

    // Editor image slots don't have a "guide" — the pipeline needs a guideId
    // for state tracking. We use a synthetic per-slot key stored under
    // illustration_jobs so results don't collide with Studio jobs.
    const slotKey = panel.dataset.slot;
    const jobId = "book-" + BOOK_ID + "-" + slotKey.replace(/[^a-z0-9]/gi, "-");

    const mode = getChipsMode(panel);
    const aspect = getChipsAspect(panel);
    const chars = getChipsChars(panel);
    const describe = getVal(panel, "describe");
    const iconSubject = getVal(panel, "iconSubject");

    setMsg(panel, "🧠 Starting…");
    updateProposedPreview(panel, null);
    panel.querySelector('[data-el="review"]').classList.add("show");
    btnDisabled(panel, true);

    try {
      // Subscribe to the job doc for live status
      subscribeToJob(panel, jobId);
      await fetch("/.netlify/functions/generate-illustration-background", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // We pass the synthetic id as guideId + a sceneOverride so the
          // planner has SOMETHING to think about even without a guide doc.
          guideId: jobId,
          sceneOverride: describe || currentSpreadId() || "book illustration",
          refsBase: location.origin + "/assets/img/refs",
          briefOverride: briefOverride || null,
          characterSelection: chars,
          userInstructions: userInstructions || "",
          userVisualDescription: describe,
          aspectRatio: aspect,
          mode,
          iconSubject
        })
      });
    } catch (e) {
      setMsg(panel, "Could not start: " + (e.message || e));
      btnDisabled(panel, false);
    }
  }

  function btnDisabled(panel, disabled) {
    panel.querySelectorAll(".mpc-btn").forEach(b => { b.disabled = disabled; });
  }

  async function subscribeToJob(panel, jobId) {
    const pid = panel.dataset.panelId;
    const st = panelStates[pid] = panelStates[pid] || {};
    if (st.unsub) { try { st.unsub(); } catch(_) {} }
    const { fs, db } = await getFB();
    st.unsub = fs.onSnapshot(fs.doc(db, "illustration_jobs", jobId), snap => {
      const d = snap.data(); if (!d) return;
      if (d.status === "planning")   setMsg(panel, "🧠 Planning the scene…");
      if (d.status === "generating") setMsg(panel, "🎨 Drawing (attempt " + (d.attempt || 1) + ")…");
      if (d.status === "reviewing")  setMsg(panel, "🔍 Reviewing for brand fidelity…");
      if (d.status === "awaiting-approval" || d.status === "awaiting-approval-with-issues") {
        try { st.unsub(); } catch(_) {}
        st.url = d.url; st.brief = d.brief; st.qa = d.qa;
        updateProposedPreview(panel, d.url);
        panel.querySelector('[data-el="qa"]').textContent = readableQA(d.qa);
        setVal(panel, "brief", JSON.stringify(d.brief || {}, null, 2));
        setVal(panel, "changeInput", "");
        const flag = d.status === "awaiting-approval-with-issues"
          ? "⚠ QA flagged issues — review before approving."
          : "✓ Ready for approval.";
        setMsg(panel, flag + " Attempts: " + (d.attempts || 1));
        btnDisabled(panel, false);
      }
      if (d.status === "error") {
        try { st.unsub(); } catch(_) {}
        setMsg(panel, "✗ Failed: " + (d.error || "generation error"));
        btnDisabled(panel, false);
      }
    });
  }

  function readableQA(qa) {
    if (!qa) return "No QA data.";
    const L = [];
    if (qa.identity) for (const n of ["Mama","Papa","Ari"]) {
      const i = qa.identity[n]; if (!i || !i.required) continue;
      L.push((i.matches ? "✓ " : "⚠ ") + n + (i.matches ? " identity OK" : ": " + ((i.issues||[]).join("; ") || "mismatch")));
    }
    if ("subjectMatches" in qa)       L.push((qa.subjectMatches?"✓":"⚠") + " Icon subject drawn");
    if ("sceneMeaningMatches" in qa)  L.push((qa.sceneMeaningMatches?"✓":"⚠") + " Scene matches meaning");
    if ("containsPeople" in qa)       L.push((qa.containsPeople?"⚠":"✓") + " " + (qa.containsPeople?"People visible":"No people (correct for icon)"));
    if ("containsUnrequestedText" in qa) L.push((qa.containsUnrequestedText?"⚠":"✓") + " " + (qa.containsUnrequestedText?"Unrequested text":"No unrequested text"));
    if ("containsUnrequestedObjects" in qa) L.push((qa.containsUnrequestedObjects?"⚠":"✓") + " " + (qa.containsUnrequestedObjects?"Unrequested objects":"No unrequested objects"));
    if ("backgroundIsClean" in qa)    L.push((qa.backgroundIsClean?"✓":"⚠") + " Background clean");
    if (qa.decision) { L.push(""); L.push("Verdict: " + String(qa.decision).toUpperCase()); }
    if (qa.altText)  { L.push(""); L.push("Alt: " + qa.altText); }
    if (qa.issues && qa.issues.length) { L.push(""); L.push("Notes:"); qa.issues.forEach(i => L.push("• " + i)); }
    return L.join("\n");
  }

  /* ---- Approve → write URL back into the book -------------------------- */

  async function approve(panel, elWrapper) {
    const pid = panel.dataset.panelId;
    const st = panelStates[pid] || {};
    if (!st.url) return;

    // 1) Visual update — set the .thumb img
    const currentImg = elWrapper.querySelector("img.thumb");
    if (currentImg) {
      currentImg.src = st.url;
      currentImg.removeAttribute("srcset");
    }
    updateCurrentPreview(panel, st.url);

    // 2) Persist to Firestore. Editor stores the whole book as one doc; we
    //    fetch, modify the specific slot's URL, write back with merge.
    //    Risk: if user has other unsaved edits in this session, they may be
    //    lost. Warn them.
    const [, dataEl] = panel.dataset.slot.split("|");
    const [side, idxStr] = dataEl.split(":");
    const idx = parseInt(idxStr, 10);
    const spreadId = currentSpreadId();

    try {
      const { fs, db } = await getFB();
      const ref = fs.doc(db, "book", BOOK_ID);
      const snap = await fs.getDoc(ref);
      if (!snap.exists()) throw new Error("Book document not found");
      const book = snap.data();
      const spread = (book.spreads || []).find(s => s.id === spreadId);
      if (!spread) throw new Error("Spread not found: " + spreadId);
      const arr = spread[side];
      if (!arr || !arr[idx]) throw new Error("Slot not found: " + side + "[" + idx + "]");
      // Determine which field to set — image element uses `url`, box.icon uses `icon`
      if ("url" in arr[idx]) arr[idx].url = st.url;
      else if ("icon" in arr[idx]) arr[idx].icon = st.url;
      else arr[idx].url = st.url;
      // Also stash alt-text if present
      if (st.qa && st.qa.altText) arr[idx].alt = st.qa.altText;
      await fs.setDoc(ref, book);
      setMsg(panel, "✓ Approved and saved.");
      showToast("Saved. If you had unsaved edits, reload to sync.", "success");
    } catch (e) {
      setMsg(panel, "Save failed: " + (e.message || e));
    }

    panel.querySelector('[data-el="review"]').classList.remove("show");
  }

  /* ==========================================================================
     BOOTSTRAP  — MutationObserver on the work pane injects panels as spreads
     render / re-render. Editor uses redraw() which nukes the DOM, so we can't
     just inject once — we watch and re-inject.
     ========================================================================== */
  function scanAndInject() {
    // Every element wrapper has data-el
    document.querySelectorAll(".work .el[data-el]").forEach(el => {
      // Skip if this element isn't an image type — image row has .imgrow
      if (!el.querySelector(".imgrow")) return;
      // Already injected?
      if (el.__mpcPanel && el.contains(el.__mpcPanel)) return;
      // Injected but detached (post-redraw)? — clear cache
      if (el.__mpcPanel && !el.contains(el.__mpcPanel)) el.__mpcPanel = null;
      ensurePanel(el);
    });
  }

  let paneObserver = null;
  function watchWorkPane() {
    const work = document.getElementById("work");
    if (!work || paneObserver) return;
    paneObserver = new MutationObserver(() => {
      // Debounce with rAF to avoid re-entrancy
      requestAnimationFrame(scanAndInject);
    });
    paneObserver.observe(work, { childList: true, subtree: true });
    scanAndInject();
  }

  /* ---- CSS install once ---- */
  function installCss() {
    if (document.getElementById("mpc-editor-panel-css")) return;
    const st = document.createElement("style");
    st.id = "mpc-editor-panel-css"; st.textContent = PANEL_CSS;
    document.head.appendChild(st);
  }

  /* ---- Init ---- */
  function boot() {
    if (!isEditor()) return;
    installCss();
    installMobile();
    watchWorkPane();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  // Also retry periodically in case editor's own DOM isn't up yet
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    boot();
    if ((document.getElementById("work") && document.getElementById("mpcMenuBtn")) || tries > 30) clearInterval(iv);
  }, 400);
})();
