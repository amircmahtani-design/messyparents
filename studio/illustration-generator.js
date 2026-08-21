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
#genPanel .gp-brief-ta{width:100%;font-family:ui-monospace,Menlo,monospace;font-size:12px;padding:10px;border:1px solid #cbd5e1;border-radius:8px;min-height:180px}
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
    <button type="button" id="gpEditBriefBtn" class="gp-btn ghost gp-hidden">Edit brief &amp; regenerate</button>
    <button type="button" id="gpRegenBtn" class="gp-btn ghost gp-hidden">Regenerate</button>
    <button type="button" id="gpApproveBtn" class="gp-btn primary gp-hidden">Approve &amp; use</button>
    <button type="button" id="gpRejectBtn" class="gp-btn ghost gp-hidden">Reject</button>
  </div>

  <div class="gp-msg" id="gpMsg">Ready.</div>

  <div id="gpQAWrap" class="gp-hidden" style="margin-top:12px">
    <div class="gp-img-label">QA verdict</div>
    <pre id="gpQAPre" class="gp-qa"></pre>
  </div>

  <div id="gpBriefWrap" class="gp-brief gp-hidden">
    <div class="gp-brief-label">Scene brief — edit &amp; regenerate to steer the illustration</div>
    <textarea id="gpBriefTA" class="gp-brief-ta"></textarea>
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
    show("gpQAWrap"); show("gpBriefWrap");
    show("gpEditBriefBtn"); show("gpRegenBtn"); show("gpApproveBtn"); show("gpRejectBtn");
    document.getElementById("gpGenerateBtn").disabled = false;

    const flag = d.status === "awaiting-approval-with-issues"
      ? "⚠ QA flagged issues — review carefully before approving."
      : "✓ Ready for your approval.";
    document.getElementById("gpMsg").textContent = flag + " Attempts: " + (d.attempts || 1);
  }

  function hideReview() {
    document.getElementById("gpPendingCol").classList.add("gp-hidden");
    hide("gpQAWrap"); hide("gpBriefWrap");
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

  async function startGeneration(briefOverride) {
    const id = currentGuideId();
    if (!id) {
      document.getElementById("gpMsg").textContent = "Pick a guide first (open one from the ☰ menu).";
      return;
    }
    document.getElementById("gpGenerateBtn").disabled = true;
    hideReview();
    document.getElementById("gpMsg").textContent = "Starting…";

    // Persist current draft so the planner sees the latest content.
    // draftGuide() lives in studio's script scope — we can only reach it if
    // studio exposed it on window. Skip if not available; the planner will
    // fall back to the Firestore-stored version.
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
          characterSelection: getSelectedCharacters()
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

  function approve() {
    if (!gpState.url) return;
    const heroInput = document.getElementById("f_hero");
    if (heroInput) {
      heroInput.value = gpState.url;
      heroInput.dispatchEvent(new Event("input", { bubbles: true }));
      heroInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    refreshCurrentPreview();
    document.getElementById("gpMsg").textContent = "✓ Approved — now tap Save on the guide to keep it.";
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
      startGeneration(edited);
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
    on("gpGenerateBtn",  "click", () => startGeneration(null));
    on("gpRegenBtn",     "click", () => startGeneration(gpState.brief));
    on("gpEditBriefBtn", "click", tryEditBrief);
    on("gpApproveBtn",   "click", approve);
    on("gpRejectBtn",    "click", reject);

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

    // 5) When the user picks a different guide from the sidebar, refresh
    //    the current preview a moment later (after the form re-renders)
    document.addEventListener("click", e => {
      if (e.target.closest(".gitem")) {
        setTimeout(refreshCurrentPreview, 200);
        setTimeout(refreshCurrentPreview, 700);
      }
    });
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
    if (document.getElementById("genPanel") || tries > 20) clearInterval(iv);
  }, 300);
})();
