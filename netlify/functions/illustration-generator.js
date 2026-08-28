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
  const MPC_VERSION = "v4-fixed";

  /** Safe escape for use inside a `[data-id="..."]` attribute selector.
      Guide IDs are always slugs (a-z, 0-9, hyphens), but we handle quotes
      and backslashes defensively. We DON'T use CSS.escape because some
      browser/extension combinations have broken or missing implementations. */
  function safeAttr(v) {
    return String(v == null ? "" : v).replace(/["\\]/g, "\\$&");
  }
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
#genPanel .gp-qa{margin:8px 0 0;padding:10px;background:#111;color:#c6f6c6;font-size:11px;line-height:1.4;border-radius:8px;max-height:220px;overflow:auto;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace}
#genPanel .gp-qa-summary{cursor:pointer;font-size:13px;font-weight:700;color:#41505f;padding:6px 0;user-select:none;list-style:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#genPanel .gp-qa-summary::-webkit-details-marker{display:none}
#genPanel .gp-qa-summary::after{content:"▸";color:#6b7684;font-size:11px}
#genPanel .gp-qa-details[open] .gp-qa-summary::after{content:"▾"}
#genPanel .gp-qa-verdict{font-size:12px;font-weight:800;padding:2px 8px;border-radius:999px}
#genPanel .gp-qa-verdict.good{background:#dcfce7;color:#166534}
#genPanel .gp-qa-verdict.bad{background:#fef3c7;color:#92400e}
#genPanel .gp-images{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px}
#genPanel .gp-img-col{min-width:0}
#genPanel .gp-img-label{font-size:12px;color:#6b7684;margin-bottom:6px;font-weight:700}
#genPanel .gp-img-frame{width:100%;background:repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50%/16px 16px;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;min-height:120px;position:relative}
#genPanel .gp-img{width:100%;display:block}
#genPanel .gp-img-none{padding:24px 12px;text-align:center;color:#6b7684;font-size:13px}
#genPanel .gp-img-col.gp-regenerating .gp-img{opacity:.35;filter:grayscale(.4)}
#genPanel .gp-img-col.gp-regenerating .gp-img-frame::after{
  content:"🎨 Regenerating…";
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  background:rgba(20,25,33,.9);color:#fff;padding:10px 18px;border-radius:999px;
  font-size:13px;font-weight:700;letter-spacing:.3px;
  box-shadow:0 4px 16px rgba(0,0,0,.25);
}
#genPanel .gp-chars{margin-bottom:12px}
#genPanel .gp-chars-label{font-size:12px;color:#6b7684;font-weight:700;margin-bottom:6px}
#genPanel .gp-chars-chips{display:flex;gap:6px;flex-wrap:wrap}
#genPanel .gp-chip{background:#fff;border:2px solid #e3e6ea;color:#1f2733;padding:8px 14px;border-radius:999px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;min-height:36px}
#genPanel .gp-chip:hover{border-color:#c9ced6}
#genPanel .gp-chip.active{background:#3f6fa3;border-color:#3f6fa3;color:#fff}
#genPanel .gp-chip[data-char="auto"].active,#genPanel .gp-chip[data-aspect="auto"].active{background:#7c56b8;border-color:#7c56b8}
#genPanel .gp-describe{margin-bottom:12px}
#genPanel .gp-describe-label{font-size:12px;color:#6b7684;font-weight:700;margin-bottom:6px}
#genPanel .gp-describe-input{width:100%;padding:10px 12px;font-family:inherit;font-size:15px;border:1px solid #cbd5e1;border-radius:8px;resize:vertical}
#genPanel .gp-aspect{margin-bottom:12px}
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

  <div class="gp-describe">
    <div class="gp-describe-label">💡 Describe your visual (optional)</div>
    <textarea id="gpDescribeInput" class="gp-describe-input" rows="2"
              placeholder="If you already have a scene in mind, describe it here. Leave blank to let AI decide."></textarea>
  </div>

  <div class="gp-aspect">
    <div class="gp-chars-label">Shape</div>
    <div class="gp-chars-chips">
      <button type="button" class="gp-chip active" data-aspect="auto">Auto</button>
      <button type="button" class="gp-chip" data-aspect="square">Square</button>
      <button type="button" class="gp-chip" data-aspect="landscape">Landscape</button>
      <button type="button" class="gp-chip" data-aspect="portrait">Portrait</button>
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
    <button type="button" id="gpCancelBtn" class="gp-btn ghost gp-hidden">✕ Cancel</button>
    <button type="button" id="gpRegenBtn" class="gp-btn ghost gp-hidden">Regenerate</button>
    <button type="button" id="gpApproveBtn" class="gp-btn primary gp-hidden">Approve &amp; use</button>
    <button type="button" id="gpRejectBtn" class="gp-btn ghost gp-hidden">Reject</button>
    <button type="button" id="gpReportBtn" class="gp-btn ghost gp-hidden">🐞 Report a problem</button>
  </div>

  <div class="gp-msg" id="gpMsg">Ready.</div>

  <div id="gpChangeWrap" class="gp-change gp-hidden">
    <div class="gp-change-label">💬 Tell me what to change (plain English)</div>
    <div class="gp-change-row">
      <input id="gpChangeInput" class="gp-change-input" type="text"
             placeholder="e.g. Papa standing up, or Mama sitting on a chair not floating">
      <button type="button" id="gpChangeBtn" class="gp-btn primary">Apply change</button>
    </div>
    <div class="gp-change-hint">This is usually all you need — it keeps everything else the same and just applies your fix.</div>
  </div>

  <!-- QA sits BELOW the change box on purpose: the change box is the thing you
       reach for nine times out of ten, so it must never be pushed off-screen by
       a long QA readout. Open the details below when you want the detail. -->
  <details id="gpQAWrap" class="gp-hidden gp-qa-details" style="margin-top:12px">
    <summary class="gp-qa-summary">🔍 QA verdict <span class="gp-qa-verdict" id="gpQAVerdict"></span></summary>
    <pre id="gpQAPre" class="gp-qa"></pre>
  </details>

  <div id="gpBriefWrap" class="gp-brief gp-hidden">
    <details>
      <summary class="gp-brief-summary">⚙️ Advanced: edit full brief as JSON</summary>
      <div class="gp-brief-label">Edit the raw brief below, then click regenerate to apply.</div>
      <textarea id="gpBriefTA" class="gp-brief-ta"></textarea>
      <div class="gp-buttons" style="margin-top:8px">
        <button type="button" id="gpEditBriefBtn" class="gp-btn primary">Regenerate with edited JSON</button>
      </div>
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
    const autoChip = document.querySelector('#genPanel .gp-chars .gp-chip[data-char="auto"]');
    if (!autoChip || autoChip.classList.contains("active")) return null;
    const chars = [];
    document.querySelectorAll('#genPanel .gp-chars .gp-chip.active').forEach(c => {
      if (c.dataset.char !== "auto") chars.push(c.dataset.char);
    });
    return chars.length ? chars : null;
  }

  /** Read the currently-active aspect ratio chip. Returns "auto" if none. */
  function getSelectedAspect() {
    const active = document.querySelector('#genPanel .gp-aspect .gp-chip.active');
    return (active && active.dataset.aspect) || "auto";
  }

  /** Read the describe-your-visual textarea. */
  function getDescribeText() {
    const el = document.getElementById("gpDescribeInput");
    return el ? (el.value || "").trim() : "";
  }

  /** Set the chip UI to match a saved selection.
      null / empty array → "Let AI choose"; array of names → those chars active. */
  function setSelectedCharacters(chars) {
    const autoChip = document.querySelector('#genPanel .gp-chars .gp-chip[data-char="auto"]');
    const charChips = document.querySelectorAll('#genPanel .gp-chars .gp-chip:not([data-char="auto"])');
    if (!autoChip) return;
    if (!chars || !chars.length) {
      autoChip.classList.add("active");
      charChips.forEach(c => c.classList.remove("active"));
      return;
    }
    autoChip.classList.remove("active");
    const set = new Set(chars);
    charChips.forEach(c => {
      c.classList.toggle("active", set.has(c.dataset.char));
    });
  }

  /** Load a guide's saved chip selection from Firestore and apply to UI.
      Called whenever the guide changes (detected by f_id / active gitem). */
  let lastLoadedSelectionFor = null;
  async function loadCharacterSelectionForCurrentGuide() {
    const id = currentGuideId();
    if (!id || id === lastLoadedSelectionFor) return;
    lastLoadedSelectionFor = id;
    try {
      const { fs, db } = await getFirebase();
      const snap = await fs.getDoc(fs.doc(db, "guides", id));
      if (!snap.exists()) return;
      const g = snap.data();
      setSelectedCharacters(g.characterSelection || null);
    } catch (_) { /* silent — default AI-choose is fine fallback */ }
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
    gpState.promptVersion = d.promptVersion || null;
    document.getElementById("gpPreviewImg").src = d.url;
    const pendingCol = document.getElementById("gpPendingCol");
    pendingCol.classList.remove("gp-hidden");
    pendingCol.classList.remove("gp-regenerating"); // clear dim overlay
    document.getElementById("gpQAPre").textContent = readableQA(d.qa);
    document.getElementById("gpBriefTA").value = JSON.stringify(d.brief || {}, null, 2);
    document.getElementById("gpChangeInput").value = "";
    show("gpQAWrap"); show("gpBriefWrap"); show("gpChangeWrap");

    // Collapse the QA readout when it's clean — open it only when there's
    // something to look at, so a passing check never costs you a scroll.
    const flagged = d.status === "awaiting-approval-with-issues";
    const qaWrap = document.getElementById("gpQAWrap");
    const verdictEl = document.getElementById("gpQAVerdict");
    if (verdictEl) {
      verdictEl.textContent = flagged ? "⚠ issues flagged" : "✓ all clear";
      verdictEl.className = "gp-qa-verdict " + (flagged ? "bad" : "good");
    }
    if (qaWrap && qaWrap.tagName === "DETAILS") qaWrap.open = flagged;
    show("gpRegenBtn"); show("gpApproveBtn"); show("gpRejectBtn"); show("gpReportBtn");
    hide("gpCancelBtn");
    document.getElementById("gpGenerateBtn").disabled = false;

    const flag = d.status === "awaiting-approval-with-issues"
      ? "⚠ QA flagged issues — review carefully before approving."
      : "✓ Ready for your approval.";
    document.getElementById("gpMsg").textContent = flag + " Attempts: " + (d.attempts || 1);
  }

  function hideReview() {
    const pendingCol = document.getElementById("gpPendingCol");
    pendingCol.classList.add("gp-hidden");
    pendingCol.classList.remove("gp-regenerating");
    hide("gpQAWrap"); hide("gpBriefWrap"); hide("gpChangeWrap");
    hide("gpRegenBtn"); hide("gpApproveBtn"); hide("gpRejectBtn"); hide("gpReportBtn");
    hide("gpCancelBtn");
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
      if (gpState.cancelled) return;
      const d = snap.data(); if (!d) return;
      if (first) { first = false; if (!["planning","generating","reviewing"].includes(d.status)) return; }
      const msg = document.getElementById("gpMsg");
      if (d.status === "planning")   msg.textContent = "🧠 Planning the scene…";
      if (d.status === "generating") msg.textContent = (d.plannerSkipped ? "🎨 Drawing your description" : "🎨 Drawing") + " (attempt " + (d.attempt || 1) + ")…";
      if (d.status === "reviewing")  msg.textContent = "🔍 Reviewing for brand fidelity…";
      if (d.status === "awaiting-approval" || d.status === "awaiting-approval-with-issues") {
        try { gpState.unsub(); } catch(_) {}
        showReview(d);
      }
      if (d.status === "error") {
        try { gpState.unsub(); } catch(_) {}
        msg.textContent = "✗ Failed: " + (d.error || "generation error");
        finishGeneration();
      }
    });
  }

  async function startGeneration(briefOverride, userInstructions) {
    const id = currentGuideId();
    if (!id) {
      document.getElementById("gpMsg").textContent = "Pick a guide first (open one from the ☰ menu).";
      return;
    }
    // Show Cancel button, hide Generate/Regenerate. Keep the previous
    // Proposed image visible with a dimmed "Regenerating…" overlay so the
    // user still has visual context while the new one is being generated.
    document.getElementById("gpGenerateBtn").disabled = true;
    hide("gpRegenBtn");
    show("gpCancelBtn");

    const pendingCol = document.getElementById("gpPendingCol");
    const hadPrevious = !pendingCol.classList.contains("gp-hidden");
    if (hadPrevious) {
      pendingCol.classList.add("gp-regenerating");
    }
    // Hide the QA / change / brief blocks while generating — they belong
    // to the previous result and would be misleading. We'll re-show on new result.
    hide("gpQAWrap"); hide("gpBriefWrap"); hide("gpChangeWrap");
    hide("gpApproveBtn"); hide("gpRejectBtn"); hide("gpReportBtn");

    document.getElementById("gpMsg").textContent = "Starting…";
    gpState.cancelled = false;

    // Persist current draft so the planner sees the latest content.
    // Also save the current character-chip selection so it's remembered next time.
    const currentSelection = getSelectedCharacters();
    try {
      if (typeof window.draftGuide === "function") {
        const g = window.draftGuide();
        const { fs, db } = await getFirebase();
        await fs.setDoc(fs.doc(db, "guides", g.id), g, { merge: true });
      }
      const { fs, db } = await getFirebase();
      await fs.setDoc(fs.doc(db, "guides", id), {
        characterSelection: currentSelection
      }, { merge: true });
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
          userInstructions: userInstructions || "",
          userVisualDescription: getDescribeText(),
          aspectRatio: getSelectedAspect(),
          mode: "character"
        })
      });
    } catch (e) {
      document.getElementById("gpMsg").textContent = "Could not start: " + (e.message || e);
      finishGeneration();
    }

    /* Studio used to stop watching after 6 minutes and tell you to come back
       later — while the job carried on running perfectly well in the
       background. A run is a planning call, then per attempt an image
       generation plus a vision QA call, so several minutes is normal rather
       than a symptom of anything being stuck.

       The Firestore listener now stays attached for the full 15 minutes a
       Netlify background function is allowed to run, and the message reports
       elapsed time instead of implying something has gone wrong. */
    const NETLIFY_BACKGROUND_LIMIT_MS = 15 * 60 * 1000;
    const startedAt = Date.now();

    gpState.tick = setInterval(() => {
      if (gpState.url || gpState.cancelled) { clearInterval(gpState.tick); return; }
      if (!document.getElementById("gpGenerateBtn").disabled) { clearInterval(gpState.tick); return; }

      const mins = Math.floor((Date.now() - startedAt) / 60000);
      if (mins >= 3) {
        const msg = document.getElementById("gpMsg");
        /* Don't stamp over the live stage text the snapshot handler writes. */
        if (msg && !/^(🧠|🎨|🔍)/.test(msg.textContent)) {
          msg.textContent = "Still drawing — " + mins + " min so far. This is normal; leave it running.";
        }
      }

      if (Date.now() - startedAt >= NETLIFY_BACKGROUND_LIMIT_MS) {
        clearInterval(gpState.tick);
        try { gpState.unsub && gpState.unsub(); } catch(_) {}
        document.getElementById("gpMsg").textContent =
          "No result after 15 min — past the background function's limit. Reopen the guide to check, then try again.";
        finishGeneration();
      }
    }, 15000);
  }

  /** Capture everything needed to debug a bad generation, as one file.

      Typing "get rid of the green" into the change box could never work: that
      text goes to the image model, but leftover green is produced by the cutout
      code afterwards. This writes the actual evidence to disk instead — the
      exact PNG the cutout produced, plus the brief, the QA verdict and the
      measured transparency — so the failure can be reproduced rather than
      described second-hand. */
  async function reportProblem() {
    const msg = document.getElementById("gpMsg");
    try {
      const id = currentGuideId();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");

      const report = {
        capturedAt:   new Date().toISOString(),
        guideId:      id,
        guideTitle:   (document.getElementById("f_title") || {}).value || "",
        imageUrl:     gpState.url || null,
        brief:        gpState.brief || null,
        qa:           gpState.qa || null,
        promptVersion: gpState.promptVersion || null,
        note:         (document.getElementById("gpChangeInput") || {}).value || "",
        userAgent:    navigator.userAgent
      };

      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
      a.download = "illustration-report-" + id + "-" + stamp + ".json";
      a.click();
      URL.revokeObjectURL(a.href);

      /* The rendered PNG matters more than the JSON — it is the only way to see
         what the cutout actually left behind, including alpha. A screenshot
         flattens the transparency away and loses exactly the evidence needed. */
      if (gpState.url) {
        const b = document.createElement("a");
        b.href = gpState.url;
        b.download = "illustration-" + id + "-" + stamp + ".png";
        b.target = "_blank";
        b.click();
      }

      msg.textContent = "Report saved (JSON + PNG in your downloads). Send both — the PNG keeps its transparency, a screenshot doesn't.";
    } catch (e) {
      msg.textContent = "Could not build report: " + (e.message || e);
    }
  }

  /** Reset the UI back to the "not generating" state. */
  function finishGeneration() {
    if (gpState.tick) { clearInterval(gpState.tick); gpState.tick = null; }
    document.getElementById("gpGenerateBtn").disabled = false;
    hide("gpCancelBtn");
    const pendingCol = document.getElementById("gpPendingCol");
    if (pendingCol) pendingCol.classList.remove("gp-regenerating");
  }

  /** User clicked Cancel while a generation was in flight.
      Unsubscribes from the job (so we stop reacting to it), restores
      the previous review UI if there was one, and asks the backend to
      abort by writing to Firestore. The Netlify function checks for this
      between stages and stops early. */
  async function cancelGeneration() {
    gpState.cancelled = true;
    try { gpState.unsub && gpState.unsub(); } catch(_) {}
    finishGeneration();

    // Tell the backend to abort — best-effort, silent failure
    try {
      const id = currentGuideId();
      if (id) {
        const { fs, db } = await getFirebase();
        await fs.setDoc(fs.doc(db, "illustration_jobs", id), {
          cancelRequested: true,
          cancelRequestedAt: Date.now()
        }, { merge: true });
      }
    } catch(_) {}

    // If we had a previous Proposed image showing, restore its controls
    if (gpState.url) {
      show("gpRegenBtn"); show("gpApproveBtn"); show("gpRejectBtn"); show("gpReportBtn");
      show("gpQAWrap"); show("gpChangeWrap"); show("gpBriefWrap");
      document.getElementById("gpMsg").textContent = "✕ Cancelled — previous version still shown.";
    } else {
      document.getElementById("gpMsg").textContent = "✕ Cancelled.";
    }
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
    // Also save the alt-text produced by QA — nested under panel so it sits
    // next to hero and can be used as the <img alt="..."> on the live site.
    const altText = (gpState.qa && gpState.qa.altText) ? String(gpState.qa.altText).trim() : "";
    let savedOk = false;
    try {
      const id = currentGuideId();
      if (id) {
        const { fs, db } = await getFirebase();
        const patch = {
          panel: { hero: gpState.url },
          heroUpdated: Date.now()
        };
        if (altText) patch.panel.heroAlt = altText;
        await fs.setDoc(fs.doc(db, "guides", id), patch, { merge: true });
        savedOk = true;
      }
    } catch (e) {
      document.getElementById("gpMsg").textContent =
        "✓ Approved — but auto-save failed (tap Save to keep): " + (e.message || e);
    }
    if (savedOk) {
      const altNote = altText ? " (with alt-text)" : "";
      document.getElementById("gpMsg").textContent = "✓ Approved and saved" + altNote + ".";
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
    on("gpCancelBtn",    "click", cancelGeneration);
    on("gpRegenBtn",     "click", () => startGeneration(gpState.brief, ""));
    on("gpEditBriefBtn", "click", tryEditBrief);
    on("gpReportBtn",    "click", reportProblem);
    on("gpApproveBtn",   "click", approve);
    on("gpRejectBtn",    "click", reject);
    on("gpChangeBtn",    "click", () => {
      const txt = (document.getElementById("gpChangeInput").value || "").trim();
      if (!txt) {
        document.getElementById("gpMsg").textContent = "Type what to change first (e.g. 'Papa standing up').";
        return;
      }

      /* Guard against instructions that fight the pipeline rather than the
         drawing. The green background is not a mistake the model made — it is
         a chroma key we deliberately ask for and then remove in code. Asking
         the model to stop painting it produces a cream background that cannot
         be keyed out at all, which is strictly worse: instead of a green
         fringe you get the whole opaque rectangle. Same for asking it to make
         the background transparent, which no image model can do here.

         Leftover green is a cutout bug and belongs in a bug report, not in the
         drawing prompt, so we say so instead of forwarding the instruction. */
      if (/\b(green|chroma|background)\b/i.test(txt) &&
          /\b(remove|removing|get rid|delete|no more|stop|without|transparent|transparency)\b/i.test(txt)) {
        document.getElementById("gpMsg").innerHTML =
          "That instruction would make things worse. The green background is deliberate — " +
          "it's a chroma key the pipeline removes after drawing. Telling the model not to " +
          "paint it means there's nothing left to key out, and you get a solid rectangle " +
          "instead.<br><br>Leftover green is a bug in the cutout. Use <b>Report a problem</b> " +
          "below to capture it instead, and change your note to describe the drawing itself " +
          "(pose, expression, props) — or clear the box and just hit Regenerate.";
        return;
      }

      startGeneration(gpState.brief, txt);
    });

    // 3b) Wire up character-selector chips (multi-select, auto if none)
    document.querySelectorAll('#genPanel .gp-chars .gp-chip').forEach(chip => {
      chip.addEventListener("click", () => {
        const isAuto = chip.dataset.char === "auto";
        const autoChip = document.querySelector('#genPanel .gp-chars .gp-chip[data-char="auto"]');
        const charChips = document.querySelectorAll('#genPanel .gp-chars .gp-chip:not([data-char="auto"])');
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
    });

    // 3c) Wire up aspect-ratio chips (single-select)
    document.querySelectorAll('#genPanel .gp-aspect .gp-chip').forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll('#genPanel .gp-aspect .gp-chip').forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
      });
    });

    // 4) Wire up the hero-input to refresh the current preview
    heroInput.addEventListener("input",  refreshCurrentPreview);
    heroInput.addEventListener("change", refreshCurrentPreview);
    refreshCurrentPreview();

    // 4b) Studio sets #f_hero.value programmatically when you pick a guide,
    //     which does NOT fire input/change events. Poll for value changes
    //     every 500ms — bullet-proof way to catch programmatic assignments.
    //     Same trick catches guide changes so we can also refresh chips.
    let lastHeroValue = heroInput.value;
    setInterval(() => {
      const el = document.getElementById("f_hero");
      if (!el) return;
      if (el.value !== lastHeroValue) {
        lastHeroValue = el.value;
        refreshCurrentPreview();
        // Guide likely just changed — reload its saved character selection
        loadCharacterSelectionForCurrentGuide();
      }
    }, 500);

    // 5) When the user picks a different guide from the sidebar, refresh
    //    the current preview a moment later (belt-and-braces on top of the poll)
    document.addEventListener("click", e => {
      if (e.target.closest(".gitem")) {
        setTimeout(refreshCurrentPreview, 200);
        setTimeout(refreshCurrentPreview, 700);
        setTimeout(loadCharacterSelectionForCurrentGuide, 300);
      }
    });

    // Initial load — first guide the studio opens on boot
    setTimeout(loadCharacterSelectionForCurrentGuide, 800);
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
        const targetTitle = g.title || g.id;
        closeGallery();

        // If they clicked the guide they're already on, no-op
        const currentlyActive = document.querySelector(".gitem.active");
        if (currentlyActive && currentlyActive.dataset.id === targetId) {
          showToast("Already on this guide", "success");
          return;
        }

        // No fast-path anymore — the .gitem click was failing silently
        // for reasons that vary per guide (state.guides can lag Firestore,
        // some guides may lack an `id` field in data, etc.). Reload always
        // works because Studio re-reads guides fresh from Firestore.
        // We store the target in localStorage; the boot handler picks it up.
        showToast("Opening " + targetTitle + "…");
        try { localStorage.setItem("mpc-jump-to-guide", targetId); } catch(_) {}
        try { localStorage.setItem("mpc-jump-to-guide-title", targetTitle); } catch(_) {}
        // Short delay so the toast is visible before the reload wipes it
        setTimeout(() => { location.reload(); }, 400);
      });
      grid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Show a floating toast at the top of the screen. Auto-dismisses. */
  function showToast(text, kind) {
    let t = document.getElementById("mpcToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "mpcToast";
      t.style.cssText =
        "position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:200;" +
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

  /** Nuclear fallback — kept for other code paths that might need it. */
  function triggerReloadFallback(guideId, title) {
    try { localStorage.setItem("mpc-jump-to-guide", guideId); } catch(_) {}
    if (title) { try { localStorage.setItem("mpc-jump-to-guide-title", title); } catch(_) {} }
    location.reload();
  }

  /* ==========================================================================
     REMEMBER + RESTORE LAST GUIDE
     ------------------------------------------------------------------------
     Studio's built-in behaviour ALWAYS opens the first guide (state.guides[0])
     on every boot — there's no memory of what you last had open. That means
     every refresh dumps you back on "Why is my baby drinking less milk".
     Also breaks gallery jumps because my post-reload click races Studio's
     auto-select-first-guide and loses.

     This system fixes both:
     1. MutationObserver on the sidebar watches for the .active class moving
        to a different .gitem, and auto-saves that guide's id to localStorage.
     2. On boot, after Studio has run its own init, we check localStorage.
        If the saved id != currently-active id, we click that guide's .gitem.
     3. Gallery jumps just write to the same localStorage key before reload.
     ========================================================================== */

  const LAST_GUIDE_KEY = "mpc-last-guide";
  const JUMP_GUIDE_KEY = "mpc-jump-to-guide";  // priority over last-guide
  const JUMP_TITLE_KEY = "mpc-jump-to-guide-title";

  // CRITICAL: snapshot the last-guide value at snippet load, BEFORE Studio's
  // own boot causes my watchActiveGuide to overwrite it with guide[0].
  // Without this, watchActiveGuide fires first (guide[0] is active), saves
  // guide[0] to localStorage, then processPendingJump reads guide[0], sees
  // it's already active, does nothing. Your real last guide gets lost.
  let LAST_GUIDE_AT_BOOT = null;
  let JUMP_TARGET_AT_BOOT = null;
  let JUMP_TITLE_AT_BOOT = null;
  try {
    LAST_GUIDE_AT_BOOT = localStorage.getItem(LAST_GUIDE_KEY);
    JUMP_TARGET_AT_BOOT = localStorage.getItem(JUMP_GUIDE_KEY);
    JUMP_TITLE_AT_BOOT = localStorage.getItem(JUMP_TITLE_KEY);
    // Clear the one-shot jump keys immediately
    if (JUMP_TARGET_AT_BOOT) {
      localStorage.removeItem(JUMP_GUIDE_KEY);
      localStorage.removeItem(JUMP_TITLE_KEY);
    }
  } catch(_) {}

  function currentActiveGuideId() {
    const active = document.querySelector(".gitem.active[data-id]");
    return active ? active.dataset.id : null;
  }

  /** Watch for guide changes and auto-save the active guide id.
      Only saves AFTER the initial Studio-default guide has been observed —
      otherwise every boot would re-save Studio's default (guide[0]) and
      overwrite the user's real "last guide" the moment they land. */
  function watchActiveGuide() {
    const list = document.getElementById("list");
    if (!list || list.__mpcActiveWatcher) return;
    list.__mpcActiveWatcher = true;
    let lastSeen = null;
    let sawInitial = false;   // Set true after we see Studio's boot-default
    let saveCount = 0;
    const check = () => {
      const now = currentActiveGuideId();
      if (!now) return;
      if (!sawInitial) {
        // First time seeing an active guide — record but DO NOT save.
        // This is Studio's boot-default, not a user choice.
        lastSeen = now;
        sawInitial = true;
        return;
      }
      if (now !== lastSeen) {
        // User (or my restore code) changed the active guide.
        lastSeen = now;
        try {
          localStorage.setItem(LAST_GUIDE_KEY, now);
          saveCount++;
          if (saveCount <= 3) diag("💾 saved: " + now, "success");
        } catch(_) {}
      }
    };
    setInterval(check, 400);
    check();
  }

  /** On boot, restore the last-opened guide (or one-shot jump target).
      Polling approach: check every 300ms whether Studio's sidebar has
      rendered the target guide's item. As soon as it has, click. Keep
      polling until success or 20 seconds. */
  function processPendingJump() {
    if (processPendingJump.__ran) return;
    processPendingJump.__ran = true;
    const target = JUMP_TARGET_AT_BOOT || LAST_GUIDE_AT_BOOT;
    if (!target) { diag("nothing to restore"); return; }

    diag("restore target: " + target, "success");
    const startTime = Date.now();
    let attempts = 0;
    let clickedOnce = false;

    const iv = setInterval(() => {
      attempts++;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (Date.now() - startTime > 20000) {
        clearInterval(iv);
        diag("gave up at " + elapsed + "s (attempts=" + attempts + ")", "error");
        return;
      }

      const item = document.querySelector(`.gitem[data-id="${safeAttr(target)}"]`);
      const activeId = currentActiveGuideId();
      const itemCount = document.querySelectorAll(".gitem[data-id]").length;

      // Log key checkpoints only (avoid spam)
      if (attempts === 1 || attempts === 5 || attempts === 10 || attempts === 20 || attempts === 40) {
        diag("t=" + elapsed + "s attempts=" + attempts + " items=" + itemCount +
             " active=" + (activeId || "?") + " found=" + (!!item));
      }

      if (activeId === target) {
        clearInterval(iv);
        diag("✓ RESTORED at " + elapsed + "s", "success");
        return;
      }

      if (item && !clickedOnce) {
        // First click attempt
        diag("clicking .gitem for " + target + " at " + elapsed + "s");
        item.click();
        clickedOnce = true;
      } else if (item && clickedOnce && attempts % 5 === 0) {
        // Retry the click every ~1.5s if it's not switching
        diag("re-clicking (click didn't stick) at " + elapsed + "s");
        item.click();
      }
    }, 300);
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

  /* ==========================================================================
     FEATURE: batch generation
     ------------------------------------------------------------------------
     Kick off illustration generation across many guides at once.
     • 🚀 Batch button in the top bar
     • Modal to pick guides (quick picks + individual checkboxes)
     • Cost + time estimate shown before starting
     • Live progress updates from Firestore
     • Floating pill shows progress when modal is closed
     • Abort button flips batch.status to "aborted" — chain function checks
       this and stops
     ========================================================================== */

  const BATCH_CSS = `
#batchBtn { padding: 8px 12px; }
#batchModal {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(20, 25, 33, .75);
  display: none; overflow: auto;
}
#batchModal.open { display: block; }
#batchCard {
  background: #f4f5f7; margin: 20px auto; max-width: 900px;
  border-radius: 12px; padding: 20px 20px 40px;
  padding-bottom: calc(40px + env(safe-area-inset-bottom));
}
#batchHead {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-bottom: 14px;
}
#batchHead h2 { margin: 0; font-size: 18px; font-family: inherit; flex: 1; }
#batchQuickPicks { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
#batchQuickPicks button {
  background: #fff; border: 2px solid #e3e6ea; color: #1f2733;
  padding: 6px 12px; border-radius: 999px; font-family: inherit; font-size: 13px;
  font-weight: 700; cursor: pointer; min-height: 34px;
}
#batchQuickPicks button:hover { border-color: #3f6fa3; }
#batchSummary {
  background: #fff; border: 1px solid #cbd5e1; border-radius: 10px;
  padding: 12px 14px; margin-bottom: 12px; font-size: 14px;
}
#batchSummary strong { color: #3f6fa3; }
#batchSummary .warn { color: #c0392b; margin-top: 6px; display: block; font-size: 13px; }
#batchList {
  background: #fff; border: 1px solid #cbd5e1; border-radius: 10px;
  padding: 8px; max-height: 320px; overflow-y: auto; margin-bottom: 12px;
}
#batchList .g-topic {
  font-size: 11px; font-weight: 700; color: #6b7684; text-transform: uppercase;
  padding: 6px 8px; letter-spacing: .5px;
}
#batchList .g-row {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 6px; cursor: pointer;
}
#batchList .g-row:hover { background: #f4f5f7; }
#batchList .g-row input { width: 18px; height: 18px; margin: 0; flex-shrink: 0; }
#batchList .g-row .g-title-text { font-size: 14px; color: #1f2733; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#batchList .g-row .g-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: #cbd5e1;
}
#batchList .g-row.has-hero .g-dot { background: #2e8b57; }
#batchList .g-row.stale .g-dot { background: #d19a20; }
#batchStartBtn { padding: 14px 20px; font-size: 15px; min-height: 48px; width: 100%; }
#batchProgress {
  background: #fff; border: 1px solid #cbd5e1; border-radius: 10px;
  padding: 14px; margin-top: 14px;
}
#batchProgressBar {
  height: 10px; background: #e3e6ea; border-radius: 5px; overflow: hidden;
  margin: 8px 0;
}
#batchProgressBar > div {
  height: 100%; background: #3f6fa3; transition: width .3s ease;
  width: 0%;
}
#batchStatusLine { font-size: 13px; color: #41505f; margin-bottom: 4px; }
#batchResults {
  display: grid; grid-template-columns: 1fr; gap: 6px; margin-top: 10px;
  max-height: 280px; overflow-y: auto;
}
#batchResults .r-row {
  display: block; padding: 0;
  background: #f7f8fa; border-radius: 6px; font-size: 13px;
  overflow: hidden;
}
#batchResults .r-row .r-head {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
}
#batchResults .r-row .r-status {
  padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; flex-shrink: 0;
}
#batchResults .r-row.pending .r-status  { background: #eaeaea; color: #6b7684; }
#batchResults .r-row.processing .r-status { background: #dbeafe; color: #1e40af; }
#batchResults .r-row.done .r-status     { background: #dcfce7; color: #166534; }
#batchResults .r-row.issues .r-status   { background: #fef3c7; color: #92400e; }
#batchResults .r-row.error .r-status    { background: #fecaca; color: #991b1b; }
#batchResults .r-row .r-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#batchResults .r-row .r-expand { color: #6b7684; font-weight: 700; }
#batchResults .r-body { padding: 12px; border-top: 1px solid #e3e6ea; background: #fff; }
#batchResults .r-preview {
  width: 100%; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 50%/16px 16px;
  border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 10px; overflow: hidden;
}
#batchResults .r-preview img { width: 100%; display: block; }
#batchResults .r-qa-details[open] > summary { margin-bottom: 4px; }
#batchResults .r-qa {
  margin: 0 0 10px 0; padding: 10px; background: #f7f8fa; color: #1f2733;
  font-size: 12px; line-height: 1.5; border-radius: 6px;
  white-space: pre-wrap; font-family: ui-monospace, Menlo, monospace;
}
#batchResults .r-actions { display: flex; gap: 6px; flex-wrap: wrap; }
#batchResults .r-actions .gp-btn { padding: 10px 14px; min-height: 40px; font-size: 13px; }
#batchAbortBtn {
  background: #c0392b; color: #fff; border: 2px solid #a03020;
  padding: 10px 16px; border-radius: 8px; font-family: inherit;
  font-weight: 700; cursor: pointer; margin-top: 10px;
}
#batchNewBtn { padding: 14px 20px; font-size: 15px; min-height: 48px; width: 100%; margin-top: 12px; }
#batchPill {
  position: fixed; bottom: 20px; right: 20px; z-index: 60;
  background: #3f6fa3; color: #fff; padding: 12px 18px; border-radius: 999px;
  box-shadow: 0 4px 20px rgba(20, 25, 33, .3);
  font-family: inherit; font-size: 14px; font-weight: 700;
  cursor: pointer; display: none;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
#batchPill.show { display: block; }
`;

  const BATCH_HTML = `
<div id="batchModal" aria-hidden="true">
  <div id="batchCard">
    <div id="batchHead">
      <h2>🚀 Batch generate illustrations</h2>
      <button type="button" class="btn" id="batchCloseBtn">Close</button>
    </div>

    <div id="batchSetup">
      <div style="font-size:13px;color:#6b7684;margin-bottom:8px">Quick pick:</div>
      <div id="batchQuickPicks">
        <button type="button" data-quick="missing">All missing hero</button>
        <button type="button" data-quick="topic">All in topic…</button>
        <button type="button" data-quick="all">Everything</button>
        <button type="button" data-quick="clear">Clear</button>
      </div>

      <div id="batchSummary">
        <div><strong id="batchCount">0</strong> guides selected · estimated cost <strong id="batchCost">$0.00</strong> · runtime <strong id="batchRuntime">~0 min</strong></div>
        <span class="warn" id="batchWarn" style="display:none"></span>
      </div>

      <div id="batchList"></div>

      <button type="button" id="batchStartBtn" class="gp-btn primary">🚀 Start batch</button>
    </div>

    <div id="batchProgress" style="display:none">
      <div id="batchStatusLine">Preparing…</div>
      <div id="batchProgressBar"><div></div></div>
      <div id="batchResults"></div>
      <button type="button" id="batchAbortBtn">Abort batch</button>
      <button type="button" id="batchNewBtn" class="gp-btn primary" style="display:none">🚀 Start another batch</button>
    </div>
  </div>
</div>

<div id="batchPill" title="Batch running — tap to view"></div>
`;

  // Module state
  const batchState = {
    guides: [],
    selection: new Set(),
    topics: new Set(),
    unsub: null,
    activeBatchId: null,
    lastBatchDoc: null
  };

  // Which result rows the user has open, so live re-renders don't close them.
  const batchExpanded = new Set();

  function openBatchModal() {
    document.getElementById("batchModal").classList.add("open");
    document.body.style.overflow = "hidden";
    checkAndSubscribeExistingBatch().then(live => {
      if (live) return;                       // running batch — progress view
      // Not running. If we still hold the last finished run in memory, show it
      // again so a half-finished review isn't lost by closing the modal — the
      // "Start another batch" button is there whenever you're done with it.
      if (batchState.lastBatchDoc) renderBatchProgress(batchState.lastBatchDoc);
      else loadGuidesForBatch();
    });
  }
  function closeBatchModal() {
    document.getElementById("batchModal").classList.remove("open");
    document.body.style.overflow = "";
  }

  async function loadGuidesForBatch() {
    document.getElementById("batchSetup").style.display = "block";
    document.getElementById("batchProgress").style.display = "none";
    const list = document.getElementById("batchList");
    list.innerHTML = "<div style='padding:16px;color:#6b7684'>Loading guides…</div>";
    try {
      const { fs, db } = await getFirebase();
      const snap = await fs.getDocs(fs.collection(db, "guides"));
      batchState.guides = [];
      batchState.topics = new Set();
      snap.forEach(doc => {
        const g = { ...doc.data(), _docId: doc.id };
        if (!g.id) g.id = doc.id;
        batchState.guides.push(g);
        if (g.topic) batchState.topics.add(g.topic);
      });
      batchState.guides.sort((a, b) =>
        String(a.topic || "").localeCompare(String(b.topic || "")) ||
        String(a.title || a.id).localeCompare(String(b.title || b.id))
      );
      renderBatchList();
      updateBatchSummary();
    } catch (e) {
      list.innerHTML = "<div style='padding:16px;color:#c0392b'>Failed to load: " + escapeHtml(e.message || e) + "</div>";
    }
  }

  function renderBatchList() {
    const list = document.getElementById("batchList");
    list.innerHTML = "";
    let currentTopic = null;
    batchState.guides.forEach(g => {
      if (g.topic !== currentTopic) {
        currentTopic = g.topic;
        const h = document.createElement("div");
        h.className = "g-topic";
        h.textContent = currentTopic || "(no topic)";
        list.appendChild(h);
      }
      const row = document.createElement("label");
      row.className = "g-row";
      const status = guideStatusCache[g.id] || "none";
      if (status === "has") row.classList.add("has-hero");
      if (status === "stale") row.classList.add("stale");
      const checked = batchState.selection.has(g.id) ? " checked" : "";
      row.innerHTML = `
        <input type="checkbox" data-gid="${escapeHtml(g.id)}"${checked}>
        <span class="g-dot"></span>
        <span class="g-title-text">${escapeHtml(g.title || g.id)}</span>
      `;
      row.querySelector("input").addEventListener("change", e => {
        if (e.target.checked) batchState.selection.add(g.id);
        else batchState.selection.delete(g.id);
        updateBatchSummary();
      });
      list.appendChild(row);
    });
  }

  function updateBatchSummary() {
    const n = batchState.selection.size;
    document.getElementById("batchCount").textContent = n;
    document.getElementById("batchCost").textContent = "$" + (n * 0.08).toFixed(2);
    const mins = Math.ceil(n * 2.5);
    document.getElementById("batchRuntime").textContent = "~" + mins + " min";
    const warn = document.getElementById("batchWarn");
    const overwriting = Array.from(batchState.selection).filter(id => {
      const s = guideStatusCache[id];
      return s === "has" || s === "stale";
    }).length;
    if (overwriting > 0) {
      warn.textContent = "⚠ " + overwriting + " selected guide" + (overwriting === 1 ? "" : "s") + " already ha" + (overwriting === 1 ? "s" : "ve") + " a hero — batch will queue new versions requiring approval.";
      warn.style.display = "block";
    } else {
      warn.style.display = "none";
    }
    document.getElementById("batchStartBtn").disabled = n === 0;
  }

  function applyQuickPick(kind) {
    if (kind === "clear") {
      batchState.selection.clear();
    } else if (kind === "missing") {
      batchState.selection.clear();
      batchState.guides.forEach(g => {
        if ((guideStatusCache[g.id] || "none") === "none") batchState.selection.add(g.id);
      });
    } else if (kind === "all") {
      batchState.selection.clear();
      batchState.guides.forEach(g => batchState.selection.add(g.id));
    } else if (kind === "topic") {
      const topics = Array.from(batchState.topics).sort();
      const picked = prompt("Which topic?\n\n" + topics.map((t,i) => (i+1) + ". " + t).join("\n") + "\n\nEnter the number:");
      if (!picked) return;
      const idx = parseInt(picked, 10) - 1;
      if (isNaN(idx) || !topics[idx]) return;
      const targetTopic = topics[idx];
      batchState.selection.clear();
      batchState.guides.forEach(g => {
        if (g.topic === targetTopic) batchState.selection.add(g.id);
      });
    }
    renderBatchList();
    updateBatchSummary();
  }

  async function startBatch() {
    const guideIds = Array.from(batchState.selection);
    if (guideIds.length === 0) return;

    // Confirm for large or expensive batches
    const cost = guideIds.length * 0.08;
    if (guideIds.length > 20 || cost > 3) {
      const ok = confirm(`Kick off ${guideIds.length} generations?\n\nEstimated cost: $${cost.toFixed(2)}\nRuntime: ~${Math.ceil(guideIds.length * 2.5)} minutes.\n\nEach result will need your approval before it attaches to a guide.`);
      if (!ok) return;
    }

    document.getElementById("batchStartBtn").disabled = true;
    document.getElementById("batchStartBtn").textContent = "Starting…";

    try {
      const r = await fetch("/.netlify/functions/start-batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          guideIds,
          refsBase: location.origin + "/assets/img/refs"
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "start-batch failed");
      batchState.activeBatchId = j.batchId;
      subscribeToBatch(j.batchId);
    } catch (e) {
      alert("Failed to start batch: " + (e.message || e));
      document.getElementById("batchStartBtn").disabled = false;
      document.getElementById("batchStartBtn").textContent = "🚀 Start batch";
    }
  }

  async function checkAndSubscribeExistingBatch() {
    try {
      const { fs, db } = await getFirebase();
      const snap = await fs.getDocs(
        fs.query(fs.collection(db, "batches"),
          fs.where("status", "in", ["queued", "running"]),
          fs.limit(1))
      );
      if (!snap.empty) {
        const doc = snap.docs[0];
        batchState.activeBatchId = doc.id;
        subscribeToBatch(doc.id);
        return true;
      }
      // Nothing running. THIS is the line that was missing: activeBatchId used
      // to keep pointing at the finished batch forever, so openBatchModal()
      // never called loadGuidesForBatch() again and you were stuck looking at
      // the completed run with no way back to the picker.
      batchState.activeBatchId = null;
      if (batchState.unsub) { try { batchState.unsub(); } catch(_) {} batchState.unsub = null; }
    } catch (_) {}
    return false;
  }

  /** Tear down a finished batch and go back to the guide picker so another
      run can be started without reloading Studio. */
  async function resetBatchToSetup() {
    // Unsubscribe FIRST — otherwise a late snapshot from the finished batch
    // re-renders the progress view over the top of the picker.
    if (batchState.unsub) { try { batchState.unsub(); } catch(_) {} batchState.unsub = null; }
    batchState.activeBatchId = null;
    batchState.lastBatchDoc = null;
    batchState.selection.clear();
    batchExpanded.clear();
    document.getElementById("batchProgress").style.display = "none";
    document.getElementById("batchSetup").style.display = "block";
    const startBtn = document.getElementById("batchStartBtn");
    startBtn.disabled = true;
    startBtn.textContent = "🚀 Start batch";
    document.getElementById("batchPill").classList.remove("show");
    // Refresh hero statuses so guides you just approved show up green and the
    // "Missing only" quick pick is accurate for the next run.
    await refreshSidebarDots();
    await loadGuidesForBatch();
  }

  async function subscribeToBatch(batchId) {
    const { fs, db } = await getFirebase();
    if (batchState.unsub) { try { batchState.unsub(); } catch(_) {} }
    batchState.unsub = fs.onSnapshot(fs.doc(db, "batches", batchId), snap => {
      const d = snap.data();
      if (!d) return;
      renderBatchProgress(d);
    });
  }

  function renderBatchProgress(batch) {
    batchState.lastBatchDoc = batch;
    document.getElementById("batchSetup").style.display = "none";
    document.getElementById("batchProgress").style.display = "block";
    const total = (batch.guideIds || []).length;
    const done = Object.keys(batch.results || {}).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const currentTitle = getTitle(batch.currentGuideId);
    let statusText;
    if (batch.status === "completed") {
      const s = batch.summary || {};
      statusText = `✓ Complete · ${s.ok || 0} clean · ${s.withIssues || 0} with issues · ${s.errored || 0} errors`;
    } else if (batch.status === "aborted") {
      statusText = `✗ Aborted at ${done} of ${total}`;
    } else if (batch.status === "running") {
      statusText = `Generating ${done + 1} of ${total}: ${currentTitle || batch.currentGuideId || ""}`;
    } else {
      statusText = `Queued…`;
    }
    document.getElementById("batchStatusLine").textContent = statusText;
    document.getElementById("batchProgressBar").firstElementChild.style.width = pct + "%";

    // Results list
    const results = batch.results || {};
    const grid = document.getElementById("batchResults");
    grid.innerHTML = "";
    (batch.guideIds || []).forEach(gid => {
      const r = results[gid];
      const title = getTitle(gid) || gid;
      const isCurrent = batch.currentGuideId === gid && batch.status === "running" && !r;
      const cls = r ? (r.status === "awaiting-approval" ? "done"
                     : r.status === "awaiting-approval-with-issues" ? "issues"
                     : r.status === "error" ? "error" : "processing")
                    : (isCurrent ? "processing" : "pending");
      const badge = r ? (r.status === "awaiting-approval" ? "✓ ready"
                       : r.status === "awaiting-approval-with-issues" ? "⚠ issues"
                       : r.status === "error" ? "✗ error" : "…")
                      : (isCurrent ? "generating…" : "pending");
      const isReviewable = r && (r.status === "awaiting-approval" || r.status === "awaiting-approval-with-issues");
      const row = document.createElement("div");
      row.className = "r-row " + cls;
      row.innerHTML = `
        <div class="r-head">
          <span class="r-status">${badge}</span>
          <span class="r-title">${escapeHtml(title)}</span>
          ${isReviewable ? '<span class="r-expand">▸</span>' : ''}
        </div>
        <div class="r-body" style="display:none"></div>
      `;
      if (r && r.status === "error") {
        row.querySelector(".r-body").innerHTML = `<div style="padding:8px 10px;color:#991b1b;font-size:12px">${escapeHtml(r.error || "unknown error")}</div>`;
        row.querySelector(".r-body").style.display = "block";
      }
      if (isReviewable) {
        row.style.cursor = "pointer";
        row.querySelector(".r-head").addEventListener("click", () => {
          const body = row.querySelector(".r-body");
          const isOpen = body.style.display !== "none";
          if (isOpen) {
            body.style.display = "none";
            row.querySelector(".r-expand").textContent = "▸";
            batchExpanded.delete(gid);
          } else {
            renderBatchExpanded(body, gid, r);
            body.style.display = "block";
            row.querySelector(".r-expand").textContent = "▾";
            batchExpanded.add(gid);
          }
        });
        // A snapshot from a still-running batch rebuilds this whole list. Put
        // back anything you already had open so reviewing doesn't keep
        // collapsing under you while later guides finish.
        if (batchExpanded.has(gid)) {
          const body = row.querySelector(".r-body");
          renderBatchExpanded(body, gid, r);
          body.style.display = "block";
          row.querySelector(".r-expand").textContent = "▾";
        }
      }
      grid.appendChild(row);
    });

    // Abort while it runs; "Start another batch" once it doesn't.
    const isLive = (batch.status === "running" || batch.status === "queued");
    const abortBtn = document.getElementById("batchAbortBtn");
    abortBtn.style.display = isLive ? "inline-block" : "none";
    const newBtn = document.getElementById("batchNewBtn");
    if (newBtn) newBtn.style.display = isLive ? "none" : "block";

    // Floating pill
    const pill = document.getElementById("batchPill");
    if (batch.status === "running" || batch.status === "queued") {
      pill.classList.add("show");
      pill.textContent = `🚀 ${done}/${total}`;
    } else {
      pill.classList.remove("show");
    }

    // When completed, refresh dots so newly-generated ones show
    if (batch.status === "completed") {
      setTimeout(() => refreshSidebarDots(), 500);
    }
  }

  function getTitle(guideId) {
    if (!guideId) return "";
    const g = batchState.guides.find(x => x.id === guideId);
    return g ? (g.title || g.id) : "";
  }

  /** Turn the raw QA JSON into a human-readable checklist. Handles both
      character-mode QA and icon-mode QA response shapes. */
  function readableQA(qa) {
    if (!qa) return "No QA data.";
    const lines = [];
    // Character identity checks
    if (qa.identity) {
      for (const name of ["Mama", "Papa", "Ari"]) {
        const info = qa.identity[name];
        if (!info || !info.required) continue;
        if (info.matches) lines.push("✓ " + name + " identity OK");
        else lines.push("⚠ " + name + ": " + ((info.issues || []).join("; ") || "identity mismatch"));
      }
    }
    // Scene / narrative
    if ("sceneMeaningMatches" in qa) {
      lines.push((qa.sceneMeaningMatches ? "✓" : "⚠") + " Scene matches the guide's meaning");
    }
    if ("anatomyIsCoherent" in qa) {
      lines.push((qa.anatomyIsCoherent ? "✓" : "⚠") + " Anatomy / hands / arms look right");
    }
    if ("propsAreCorrect" in qa) {
      lines.push((qa.propsAreCorrect ? "✓" : "⚠") + " Props / objects correct");
    }
    if ("containsUnrequestedText" in qa) {
      lines.push((qa.containsUnrequestedText ? "⚠" : "✓") + " " + (qa.containsUnrequestedText ? "Contains unrequested text" : "No unrequested text"));
    }
    if ("containsUnrequestedObjects" in qa) {
      lines.push((qa.containsUnrequestedObjects ? "⚠" : "✓") + " " + (qa.containsUnrequestedObjects ? "Contains unrequested objects" : "No unrequested objects"));
    }
    if ("toneIsAppropriate" in qa) {
      lines.push((qa.toneIsAppropriate ? "✓" : "⚠") + " Tone appropriate");
    }
    // Icon-only fields
    if ("subjectMatches" in qa) {
      lines.push((qa.subjectMatches ? "✓" : "⚠") + " Requested icon subject drawn");
    }
    if ("containsPeople" in qa) {
      lines.push((qa.containsPeople ? "⚠" : "✓") + " " + (qa.containsPeople ? "People visible (icons should not have people)" : "No people (correct for icon)"));
    }
    if ("isSingleObject" in qa && !("containsUnrequestedObjects" in qa)) {
      lines.push((qa.isSingleObject ? "✓" : "⚠") + " Single focused object");
    }
    if ("backgroundIsClean" in qa) {
      lines.push((qa.backgroundIsClean ? "✓" : "⚠") + " Background clean");
    }
    if (qa.issues && qa.issues.length) {
      lines.push("");
      lines.push("Other notes:");
      qa.issues.forEach(i => lines.push("• " + i));
    }
    if (qa.decision) {
      lines.push("");
      lines.push("Verdict: " + qa.decision.toUpperCase());
    }
    if (qa.altText) {
      lines.push("");
      lines.push("Alt text: " + qa.altText);
    }
    return lines.join("\n");
  }

  /** Render the expanded review body for a single batch result — image
      preview, readable QA checklist, and per-item action buttons. */
  function renderBatchExpanded(bodyEl, guideId, result) {
    const qaText = readableQA(result.qa);
    bodyEl.innerHTML = `
      <div class="r-preview">
        ${result.url ? `<img src="${escapeHtml(result.url)}" alt="proposed illustration">` : `<div style="padding:20px;color:#6b7684;font-size:12px">No image URL</div>`}
      </div>
      <div class="r-actions">
        <button type="button" class="gp-btn primary" data-act="approve">Approve &amp; save</button>
        <button type="button" class="gp-btn ghost" data-act="regen">Regenerate</button>
        <button type="button" class="gp-btn ghost" data-act="jump">Open in editor</button>
        <button type="button" class="gp-btn ghost" data-act="reject">Reject</button>
      </div>
      <div class="r-msg" style="font-size:12px;color:#6b7684;margin-top:8px;min-height:14px"></div>
      <details class="r-qa-details" style="margin-top:10px">
        <summary style="cursor:pointer;font-size:12px;font-weight:700;color:#41505f;padding:4px 0">🔍 QA verdict</summary>
        <pre class="r-qa">${escapeHtml(qaText)}</pre>
      </details>
    `;
    const msg = bodyEl.querySelector(".r-msg");

    bodyEl.querySelector('[data-act="approve"]').addEventListener("click", async () => {
      msg.textContent = "Saving…";
      try {
        const { fs, db } = await getFirebase();
        const patch = {
          panel: { hero: result.url },
          heroUpdated: Date.now()
        };
        if (result.qa && result.qa.altText) patch.panel.heroAlt = result.qa.altText;
        await fs.setDoc(fs.doc(db, "guides", guideId), patch, { merge: true });
        msg.textContent = "✓ Saved to guide.";
        setTimeout(() => refreshSidebarDots(), 500);
      } catch (e) {
        msg.textContent = "Save failed: " + (e.message || e);
      }
    });

    bodyEl.querySelector('[data-act="regen"]').addEventListener("click", async () => {
      msg.textContent = "Kicking off regeneration…";
      try {
        await fetch("/.netlify/functions/generate-illustration-background", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            guideId,
            refsBase: location.origin + "/assets/img/refs",
            mode: (result.brief && result.brief.mode) || "character",
            aspectRatio: (result.brief && result.brief.aspectRatio) || "auto"
          })
        });
        msg.textContent = "🎨 Regenerating — open the guide to watch, or check back here in ~2 min.";
      } catch (e) {
        msg.textContent = "Failed to start: " + (e.message || e);
      }
    });

    bodyEl.querySelector('[data-act="jump"]').addEventListener("click", () => {
      closeBatchModal();
      const searchInput = document.getElementById("q");
      if (searchInput && searchInput.value) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      setTimeout(() => {
        const item = document.querySelector(`.gitem[data-id="${safeAttr(guideId)}"]`);
        if (item) item.click();
        else showToast("Couldn't find in sidebar — try search", "error");
      }, 200);
    });

    bodyEl.querySelector('[data-act="reject"]').addEventListener("click", () => {
      msg.textContent = "Rejected — nothing attached to the guide.";
    });
  }

  async function abortBatch() {
    if (!batchState.activeBatchId) return;
    if (!confirm("Abort the running batch? The in-flight guide will finish but no more will start.")) return;
    try {
      const { fs, db } = await getFirebase();
      await fs.setDoc(fs.doc(db, "batches", batchState.activeBatchId), {
        status: "aborted",
        abortedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      alert("Abort failed: " + (e.message || e));
    }
  }

  function installBatch() {
    if (document.getElementById("batchBtn")) return;
    const top = document.querySelector(".top");
    if (!top) return;

    if (!document.getElementById("mpc-batch-css")) {
      const st = document.createElement("style");
      st.id = "mpc-batch-css"; st.textContent = BATCH_CSS;
      document.head.appendChild(st);
    }

    // Button — insert before the gallery button, both before signout
    const btn = document.createElement("button");
    btn.id = "batchBtn";
    btn.className = "btn ghost";
    btn.type = "button";
    btn.title = "Generate illustrations for many guides at once";
    btn.textContent = "🚀 Batch";
    const galleryBtn = document.getElementById("galleryBtn");
    if (galleryBtn) top.insertBefore(btn, galleryBtn);
    else top.appendChild(btn);

    // Modal + pill
    const wrap = document.createElement("div");
    wrap.innerHTML = BATCH_HTML.trim();
    while (wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);

    // Wire
    btn.addEventListener("click", openBatchModal);
    document.getElementById("batchCloseBtn").addEventListener("click", closeBatchModal);
    document.getElementById("batchModal").addEventListener("click", e => {
      if (e.target.id === "batchModal") closeBatchModal();
    });
    document.getElementById("batchStartBtn").addEventListener("click", startBatch);
    document.getElementById("batchAbortBtn").addEventListener("click", abortBatch);
    document.getElementById("batchNewBtn").addEventListener("click", resetBatchToSetup);
    document.getElementById("batchPill").addEventListener("click", openBatchModal);
    document.querySelectorAll("#batchQuickPicks button").forEach(b => {
      b.addEventListener("click", () => applyQuickPick(b.dataset.quick));
    });

    // On boot, subscribe to any already-running batch (so pill shows immediately)
    checkAndSubscribeExistingBatch();
  }

  /* ==========================================================================
     FEATURE: collapsible sections
     ------------------------------------------------------------------------
     The guide editor is one long unbroken column of fields, so getting to the
     bottom of a guide means scrolling past everything above it. This groups
     the existing fields into named sections you can fold shut, with the open /
     closed state remembered between guides and between visits.

     It works by MOVING the existing DOM nodes into wrappers — no field is
     recreated, no id changes, so every save / load / validation path in
     index.html keeps working untouched. Collapsing uses display:none on the
     wrapper, and a hidden input still reports its value, so a folded section
     saves exactly as it did before.

     The sidebar topic groups get the same treatment, with one safeguard: the
     group holding the currently-selected guide always springs open, which is
     what keeps the last-guide restore and the batch "Open in editor" jump
     visible after they fire.
     ====================================================================== */

  const SEC_CSS = `
.mpc-sec{border:1px solid #e3e6ea;border-radius:12px;background:#fff;margin-bottom:12px;overflow:hidden}
.mpc-sec-head{display:flex;align-items:center;gap:10px;width:100%;padding:13px 14px;background:#f7f8fa;
  border:0;border-bottom:1px solid #e3e6ea;cursor:pointer;font-family:inherit;font-size:14.5px;
  font-weight:800;color:#1f2733;text-align:left;min-height:48px}
.mpc-sec-head:hover{background:#eef1f5}
.mpc-sec-head .mpc-sec-chev{color:#6b7684;font-size:12px;transition:transform .15s ease;flex-shrink:0}
.mpc-sec-head .mpc-sec-title{flex:1;min-width:0}
.mpc-sec-head .mpc-sec-note{font-weight:600;font-size:11.5px;color:#6b7684}
.mpc-sec-body{padding:14px 14px 2px}
.mpc-sec.closed .mpc-sec-body{display:none}
.mpc-sec.closed .mpc-sec-head{border-bottom-color:transparent}
.mpc-sec.closed .mpc-sec-chev{transform:rotate(-90deg)}
.mpc-sec-body > .field:last-child,
.mpc-sec-body > .col-card:last-child{margin-bottom:12px}

.mpc-sec-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 12px}
.mpc-sec-bar button{background:#fff;border:1px solid #e3e6ea;border-radius:8px;padding:7px 12px;
  font-family:inherit;font-size:12.5px;font-weight:700;color:#41505f;cursor:pointer;min-height:36px}
.mpc-sec-bar button:hover{border-color:#c9ced6}

/* Search & sharing is already a <details>; make it read like the rest. */
#seoCard.col-card{border:1px solid #e3e6ea;border-radius:12px;background:#fff;padding:0;margin-bottom:12px}
#seoCard > summary{padding:13px 14px;background:#f7f8fa;border-bottom:1px solid #e3e6ea;
  font-size:14.5px;font-weight:800;color:#1f2733;list-style:none;display:flex;align-items:center;gap:10px;min-height:48px}
#seoCard > summary::-webkit-details-marker{display:none}
#seoCard > summary::before{content:"▸";color:#6b7684;font-size:12px}
#seoCard[open] > summary::before{content:"▾"}
#seoCard > summary:hover{background:#eef1f5}
#seoCard > *:not(summary){margin-left:14px;margin-right:14px}
#seoCard[open]{padding-bottom:2px}

/* Sidebar topic groups */
.grp{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none}
.grp:hover{color:#41505f}
.grp .mpc-grp-chev{font-size:9px;transition:transform .15s ease}
.grp.mpc-grp-closed .mpc-grp-chev{transform:rotate(-90deg)}
.grp .mpc-grp-count{margin-left:auto;font-size:10px;opacity:.7;letter-spacing:0}
.gitem.mpc-grp-hidden{display:none}
`;

  const SEC_KEY = "mpc.studio.sections.v1";
  const GRP_KEY = "mpc.studio.groups.v1";

  function loadSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
    catch (_) { return new Set(); }
  }
  function saveSet(key, set) {
    try { localStorage.setItem(key, JSON.stringify(Array.from(set))); } catch (_) {}
  }

  let closedSections = loadSet(SEC_KEY);
  let closedGroups   = loadSet(GRP_KEY);

  /** Move every sibling from startEl to endEl (inclusive) into a new
      collapsible section inserted where startEl used to be. */
  function wrapRange(startEl, endEl, key, title, note) {
    if (!startEl || !endEl) return null;
    const parent = startEl.parentElement;
    if (!parent) return null;
    // Both ends must be siblings and in the right order. If Studio's markup
    // ever moves, we skip the section rather than swallow everything down to
    // the Save button.
    if (endEl.parentElement !== parent) return null;
    if (startEl !== endEl &&
        !(startEl.compareDocumentPosition(endEl) & Node.DOCUMENT_POSITION_FOLLOWING)) return null;

    const sec = document.createElement("div");
    sec.className = "mpc-sec";
    sec.dataset.secKey = key;
    sec.innerHTML = `
      <button type="button" class="mpc-sec-head">
        <span class="mpc-sec-chev">▾</span>
        <span class="mpc-sec-title">${escapeHtml(title)}</span>
        ${note ? `<span class="mpc-sec-note">${escapeHtml(note)}</span>` : ""}
      </button>
      <div class="mpc-sec-body"></div>
    `;
    parent.insertBefore(sec, startEl);
    const body = sec.querySelector(".mpc-sec-body");

    // Walk forward from startEl, moving nodes across until endEl has moved.
    let node = startEl;
    while (node) {
      const next = node.nextSibling;
      const isLast = (node === endEl);
      body.appendChild(node);
      if (isLast) break;
      node = next;
    }

    if (closedSections.has(key)) sec.classList.add("closed");
    sec.querySelector(".mpc-sec-head").addEventListener("click", () => {
      const nowClosed = sec.classList.toggle("closed");
      if (nowClosed) closedSections.add(key); else closedSections.delete(key);
      saveSet(SEC_KEY, closedSections);
    });
    return sec;
  }

  function setAllSections(closed) {
    document.querySelectorAll("#editor .mpc-sec").forEach(sec => {
      sec.classList.toggle("closed", closed);
      const k = sec.dataset.secKey;
      if (closed) closedSections.add(k); else closedSections.delete(k);
    });
    const seo = document.getElementById("seoCard");
    if (seo) seo.open = !closed;
    saveSet(SEC_KEY, closedSections);
  }

  function installEditorSections() {
    const editor = document.getElementById("editor");
    if (!editor || editor.dataset.mpcSectioned === "1") return;
    // Wait until the illustration panel has been injected, otherwise it lands
    // outside the section we just built around the hero fields.
    if (!document.getElementById("genPanel")) return;
    if (!document.getElementById("f_title") || !document.getElementById("f_quick")) return;
    editor.dataset.mpcSectioned = "1";

    const fieldOf = id => {
      const el = document.getElementById(id);
      if (!el) return null;
      let n = el;
      while (n && n.parentElement !== editor) n = n.parentElement;
      return n;
    };

    // 1) The basics — title through the featured / read-time row.
    wrapRange(fieldOf("f_title"), fieldOf("f_featured"),
              "basics", "📝 The basics", "title, summary, eyebrow, topic");

    // 2) Hero image — the path field, the AI panel, and the upload box.
    wrapRange(fieldOf("f_hero"), document.getElementById("genWrap"),
              "hero", "🖼️ Hero image", "upload or generate the illustration");

    // 3) The three coloured columns plus the optional Don't strip.
    const firstCol = document.getElementById("f_n_title")
      ? document.getElementById("f_n_title").closest(".col-card") : null;
    wrapRange(firstCol, document.getElementById("dontCard"),
              "columns", "🗂️ The three columns", "green, yellow, amber, don't");

    // 4) The fuller answer (carries the doctor callout inside it).
    wrapRange(fieldOf("f_long_list"), fieldOf("f_long_list"),
              "longform", "📖 The fuller answer", "the longer write-up");

    // 5) The quick answer box.
    wrapRange(fieldOf("f_quick"), fieldOf("f_quick"),
              "quick", "💬 The quick answer box", "");

    // 6) Search & sharing is already a <details> — just remember its state.
    const seo = document.getElementById("seoCard");
    if (seo && !seo.dataset.mpcWired) {
      seo.dataset.mpcWired = "1";
      seo.open = !closedSections.has("seo");
      seo.addEventListener("toggle", () => {
        if (seo.open) closedSections.delete("seo"); else closedSections.add("seo");
        saveSet(SEC_KEY, closedSections);
      });
    }

    // Expand / collapse all, pinned above the first section.
    const bar = document.createElement("div");
    bar.className = "mpc-sec-bar";
    bar.innerHTML = `
      <button type="button" data-sec-all="open">Expand all</button>
      <button type="button" data-sec-all="close">Collapse all</button>
    `;
    editor.insertBefore(bar, editor.firstChild);
    bar.querySelector('[data-sec-all="open"]').addEventListener("click", () => setAllSections(false));
    bar.querySelector('[data-sec-all="close"]').addEventListener("click", () => setAllSections(true));
  }

  /* ---- sidebar topic groups ---- */

  let applyingGroups = false;
  let groupsDirty = false;

  function applyGroupCollapse() {
    const list = document.getElementById("list");
    if (!list) return;
    // Our own writes re-enter through the observer. Swallow those, but
    // remember that something came in so a real re-render isn't lost.
    if (applyingGroups) { groupsDirty = true; return; }
    applyingGroups = true;
    try {
      const searchEl = document.getElementById("q");
      const searching = !!(searchEl && searchEl.value.trim());

      // Pass one: label every group and note which one holds the active guide.
      let activeKey = null;
      let cur = null;
      Array.from(list.children).forEach(el => {
        if (el.classList.contains("grp")) {
          if (!el.dataset.grpKey) {
            el.dataset.grpKey = el.textContent.trim();
            const count = document.createElement("span");
            count.className = "mpc-grp-count";
            const chev = document.createElement("span");
            chev.className = "mpc-grp-chev";
            chev.textContent = "▾";
            el.textContent = "";
            el.appendChild(chev);
            el.appendChild(document.createTextNode(el.dataset.grpKey));
            el.appendChild(count);
          }
          cur = el;
          cur.__count = 0;
        } else if (el.classList.contains("gitem") && cur) {
          cur.__count++;
          if (el.classList.contains("active")) activeKey = cur.dataset.grpKey;
        }
      });

      // The group holding the selected guide is never left folded shut —
      // that's what keeps the restore and the batch jump visible.
      if (activeKey && closedGroups.has(activeKey)) {
        closedGroups.delete(activeKey);
        saveSet(GRP_KEY, closedGroups);
      }

      // Pass two: fold.
      let closed = false;
      Array.from(list.children).forEach(el => {
        if (el.classList.contains("grp")) {
          const key = el.dataset.grpKey;
          closed = !searching && closedGroups.has(key);
          el.classList.toggle("mpc-grp-closed", closed);
          const c = el.querySelector(".mpc-grp-count");
          if (c) c.textContent = closed ? (el.__count || 0) : "";
        } else if (el.classList.contains("gitem")) {
          el.classList.toggle("mpc-grp-hidden", closed);
        }
      });
    } finally {
      setTimeout(() => {
        applyingGroups = false;
        if (groupsDirty) { groupsDirty = false; applyGroupCollapse(); }
      }, 0);
    }
  }

  function installSidebarGroups() {
    const list = document.getElementById("list");
    if (!list || list.dataset.mpcGroups === "1") return;
    list.dataset.mpcGroups = "1";

    list.addEventListener("click", e => {
      const grp = e.target.closest(".grp");
      if (!grp || !list.contains(grp)) return;
      const key = grp.dataset.grpKey;
      if (!key) return;
      if (closedGroups.has(key)) closedGroups.delete(key); else closedGroups.add(key);
      saveSet(GRP_KEY, closedGroups);
      applyGroupCollapse();
    });

    const obs = new MutationObserver(() => applyGroupCollapse());
    obs.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    const searchEl = document.getElementById("q");
    if (searchEl) searchEl.addEventListener("input", () => setTimeout(applyGroupCollapse, 0));

    applyGroupCollapse();
  }

  function installSections() {
    if (!document.getElementById("mpc-sec-css")) {
      const st = document.createElement("style");
      st.id = "mpc-sec-css"; st.textContent = SEC_CSS;
      document.head.appendChild(st);
    }
    installEditorSections();
    installSidebarGroups();
  }

  /* ---- diag() is now silent — the restore system works reliably so we
          don't need the visible diagnostic panel anymore ---- */
  function diag(msg, kind) { /* no-op */ }
  const PAGE_START_TIME = Date.now();

  /* ---- bootstrap: also install dots + gallery + batch once the studio DOM is up ---- */
  let bootToastShown = false;
  function bootExtras() {
    if (!document.querySelector(".top") || !document.querySelector("aside.side")) return;
    installSidebarDots();
    installGallery();
    installBatch();
    installSections();
    watchActiveGuide();
    processPendingJump();
    if (!bootToastShown) {
      bootToastShown = true;
      diag("v3-diag loaded", "success");
      diag("LAST_GUIDE_AT_BOOT = " + (LAST_GUIDE_AT_BOOT || "(null)"),
           LAST_GUIDE_AT_BOOT ? "success" : "error");
      diag("JUMP_TARGET_AT_BOOT = " + (JUMP_TARGET_AT_BOOT || "(null)"),
           JUMP_TARGET_AT_BOOT ? "success" : null);
      const activeNow = currentActiveGuideId();
      diag("Studio's active guide now: " + (activeNow || "(none)"));
      diag("state.guides in DOM (.gitem count): " + document.querySelectorAll(".gitem[data-id]").length);
    }
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
    const ready = document.getElementById("genPanel")
      && document.getElementById("batchBtn")
      && document.querySelector("#editor .mpc-sec");
    if ((ready && tries > 5) || tries > 30) clearInterval(iv);
  }, 300);
})();
