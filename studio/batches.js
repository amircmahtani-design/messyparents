/* ============================================================================
   MPC Studio — BATCH REVIEW add-on  (studio/batches.js)
   ----------------------------------------------------------------------------
   Self-installing. Adds a batch layer on top of Studio without changing a
   single existing behaviour:

     • A "Batches" list in the sidebar — click one to filter the guide list.
     • A tick-off bar at the top of the guide editor: Batch, date added,
       "Mark as checked", and "Next unchecked →" so you can walk a batch
       without going back to the sidebar between guides.
     • A "Batches" button in the top bar → overview of every batch, progress,
       approve / reopen / rename, and a per-batch import from the bundle.
     • Detects when a guide's words have changed since you ticked it, and
       quietly un-ticks it.

   WHERE THE DATA LIVES
     • Which batch a guide belongs to  → decided ONCE, on its first import, and
       recorded in meta/batches.origin. The `batch` field in the bundle only
       ever supplies that first answer; a later batch that reworks the same
       guide updates its words and is logged in meta/batches.history, but the
       guide does not move. Batches stay chronological and match the Word
       documents in Dropbox for good.
     • Whether you have checked it     → meta/batches (Studio only). Imports
       never touch this document, so re-importing a corrected batch cannot
       wipe your ticks — it only un-ticks the guides whose text changed.

   REQUIRES: one line in studio/index.html publishing window.MPCStudio, and
   the <script src="batches.js"> tag. Nothing else.
   ========================================================================== */
(function () {
  "use strict";

  var META = null;                 // meta/batches document
  var FILTER = { mode: "all", batch: null };
  var listObs = null, selObs = null, muting = false;
  var lastGuideId = null;

  /* ---------- tiny helpers ---------- */
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var S = function () { return window.MPCStudio; };
  var st = function () { return S().state; };
  var fb = function () { return st().fb; };
  var email = function () {
    var w = qs("#who"); return (w && w.textContent.trim()) || "";
  };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Amir's date format everywhere a human sees it: DD/MM/YYYY. */
  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    if (isNaN(d)) return "";
    var p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear();
  }
  /* A short fingerprint of the WORDS. Deliberately blind to panel.hero: adding
     or regenerating an illustration is not a change to the writing, and must
     not un-tick a guide you have already read through. */
  function contentHash(g) {
    var p = null;
    if (g.panel) { p = {}; Object.keys(g.panel).forEach(function (k) { if (k !== "hero") p[k] = g.panel[k]; }); }
    var s = JSON.stringify([g.title, g.summary, p, g.longform, g.callout, g.body || ""]);
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  /* ---------- the meta document ---------- */
  function blankMeta() {
    return { batches: {}, origin: {}, assign: {}, checked: {}, history: {}, updated: 0 };
  }

  async function loadMeta() {
    var f = fb();
    if (!f) {                                     // local preview mode
      try { META = JSON.parse(localStorage.getItem("mpcBatches") || "") || blankMeta(); }
      catch (e) { META = blankMeta(); }
      return;
    }
    try {
      var snap = await f.fs.getDoc(f.fs.doc(f.db, "meta", "batches"));
      META = snap.exists() ? snap.data() : blankMeta();
    } catch (e) { META = blankMeta(); }
    META.batches = META.batches || {};
    META.origin  = META.origin  || {};   // guide id -> the batch it FIRST arrived in. Never rewritten.
    META.assign  = META.assign  || {};   // deliberate manual moves only
    META.checked = META.checked || {};
    META.history = META.history || {};   // guide id -> [{b, at}] every later batch that reworked it
  }

  var saveTimer = null;
  function saveMeta() {
    META.updated = Date.now();
    var f = fb();
    if (!f) { try { localStorage.setItem("mpcBatches", JSON.stringify(META)); } catch (e) {} return Promise.resolve(); }
    clearTimeout(saveTimer);
    return new Promise(function (res) {
      saveTimer = setTimeout(async function () {
        try { await f.fs.setDoc(f.fs.doc(f.db, "meta", "batches"), META); } catch (e) {}
        res();
      }, 120);
    });
  }

  /* ---------- batch maths ---------- */
  var key = function (v) { return v == null || v === "" ? "" : String(v).trim(); };

  /* The batch a guide is in — and stays in, for good.

     A guide belongs to the batch it FIRST arrived in. If batch 6 later reworks
     a guide that came in with batch 1, the words update but it stays under
     Batch 1, because that is where the Word document lives in Dropbox. The
     later pass is recorded in META.history and shown on the guide, not used to
     move it.

     Order of authority: a deliberate manual move, then the recorded origin,
     then — only for a guide Studio has never seen before — the tag on the
     incoming bundle. */
  function batchOf(g) {
    if (!g) return "";
    if (META.assign[g.id] != null) return key(META.assign[g.id]);
    if (META.origin[g.id] != null) return key(META.origin[g.id]);
    return key(g.batch);
  }

  /* The most recent batch that reworked this guide, if it was not its own. */
  function lastPass(g) {
    var h = META.history[g.id];
    return (h && h.length) ? h[h.length - 1] : null;
  }
  function labelOf(k) {
    if (!k) return "Unbatched";
    var b = META.batches[k];
    return (b && b.label) || ("Batch " + k);
  }
  function shortOf(k) { return k ? "B" + k : "—"; }

  /* checked / changed / open */
  function stateOf(g) {
    var c = META.checked[g.id];
    if (!c) return "open";
    return c.hash && c.hash !== contentHash(g) ? "changed" : "done";
  }

  function guidesIn(k) {
    return (st().guides || []).filter(function (g) { return batchOf(g) === k; });
  }
  function allBatchKeys() {
    var set = {};
    (st().guides || []).forEach(function (g) { var k = batchOf(g); if (k) set[k] = 1; });
    Object.keys(META.batches || {}).forEach(function (k) { set[k] = 1; });
    return Object.keys(set).sort(function (a, b) {
      var na = parseFloat(a), nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      return String(a).localeCompare(String(b));
    });
  }
  function progress(k) {
    var gs = guidesIn(k), done = 0, changed = 0;
    gs.forEach(function (g) { var s = stateOf(g); if (s === "done") done++; else if (s === "changed") changed++; });
    return { total: gs.length, done: done, changed: changed, open: gs.length - done - changed };
  }
  function isApproved(k) { return !!(META.batches[k] && META.batches[k].approved); }

  function ensureBatch(k, label) {
    if (!k) return;
    if (!META.batches[k]) META.batches[k] = { label: label || ("Batch " + k), added: Date.now(), approved: false };
    else if (label) META.batches[k].label = label;
  }
  /* First sight of a guide carrying a batch tag: lock in its origin and make
     sure the batch itself exists with a date and a label. This also covers the
     old whole-file "Import site guides" route, so a guide can never end up
     tagged but ungrouped. */
  function adoptBundleBatches() {
    var touched = false;
    (st().guides || []).forEach(function (g) {
      var k = key(g.batch);
      if (!k) return;
      if (!META.batches[k]) { ensureBatch(k); touched = true; }
      if (META.origin[g.id] == null) { META.origin[g.id] = k; touched = true; }
    });
    if (touched) saveMeta();
  }

  /* ---------- styles ---------- */
  var CSS = `
#mpbSide{padding:0 8px 6px}
.mpb-row{display:block;width:100%;text-align:left;background:transparent;border:1px solid transparent;border-radius:9px;
  padding:7px 9px;margin:2px 0;cursor:pointer;font:inherit;font-size:13px;color:var(--ink,#1f2733);line-height:1.25}
.mpb-row:hover{background:#f3f5f8}
.mpb-row.on{background:#eef4ff;border-color:#c7dbff}
.mpb-row .mpb-top{display:flex;align-items:center;gap:6px;justify-content:space-between}
.mpb-row .mpb-name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mpb-count{font-size:11.5px;color:#6b7480;white-space:nowrap;font-variant-numeric:tabular-nums}
.mpb-meter{height:4px;border-radius:3px;background:#e6e9ee;margin-top:6px;overflow:hidden;display:flex}
.mpb-meter i{display:block;height:100%}
.mpb-meter i.d{background:#2f855a}
.mpb-meter i.c{background:#dd8b16}
.mpb-ok{color:#2f855a;font-weight:700}
.mpb-tag{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.02em;color:#5a6472;background:#eef0f4;
  border:1px solid transparent;border-radius:5px;padding:1px 5px;margin-right:6px;vertical-align:1px}
.mpb-tag.d{background:#e6f4ec;color:#256d48;border-color:#bfe3cd}
.mpb-tag.d::after{content:" ✓"}
.mpb-tag.c{background:#fdf1dd;color:#8a5a10;border-color:#f0d9ac}
.mpb-tag.c::after{content:" !"}

.mpb-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 16px;padding:10px 12px;
  border:1px solid var(--line,#e3e6ea);border-left:4px solid #c7dbff;border-radius:10px;background:#fbfcfe}
.mpb-bar.done{border-left-color:#2f855a;background:#f4faf6}
.mpb-bar.changed{border-left-color:#dd8b16;background:#fffaf1}
.mpb-bar .mpb-lbl{font-weight:700;font-size:13.5px}
.mpb-bar .mpb-sub{font-size:12px;color:#6b7480}
.mpb-bar .mpb-sp{flex:1}
.mpb-bar select{font:inherit;font-size:12.5px;padding:5px 8px;border:1px solid var(--line,#e3e6ea);border-radius:8px;background:#fff}

#mpbModal{position:fixed;inset:0;background:rgba(20,25,33,.45);display:grid;place-items:center;z-index:60;padding:16px}
#mpbModal .box{background:#fff;border-radius:14px;max-width:820px;width:100%;max-height:86vh;overflow:auto;padding:18px 20px;
  box-shadow:0 18px 50px rgba(20,25,33,.25)}
#mpbModal h3{margin:0;font-size:18px}
#mpbModal table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13.5px}
#mpbModal th,#mpbModal td{text-align:left;padding:8px 8px;border-bottom:1px solid #eef0f3;vertical-align:middle}
#mpbModal th{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:#6b7480;font-weight:700}
#mpbModal td.num{font-variant-numeric:tabular-nums;white-space:nowrap}
#mpbModal .acts{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.mpb-pill{font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px;white-space:nowrap}
.mpb-pill.ap{background:#e6f4ec;color:#256d48}
.mpb-pill.rv{background:#eef2f7;color:#5a6472}
.mpb-note{font-size:12.5px;color:#6b7480;margin:14px 0 0;line-height:1.5}
@media (max-width:900px){ .mpb-bar{position:sticky;top:0;z-index:5} }
`;

  /* ---------- sidebar ---------- */
  function installSidebar() {
    if (qs("#mpbSide")) return;
    var anchor = qs(".side .grp-guides");
    if (!anchor) return;
    var head = document.createElement("div");
    head.className = "grp";
    head.textContent = "Batches";
    var box = document.createElement("div");
    box.id = "mpbSide";
    anchor.parentNode.insertBefore(head, anchor);
    anchor.parentNode.insertBefore(box, anchor);
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mpb]");
      if (!b) return;
      var v = b.getAttribute("data-mpb");
      if (v === "*all") FILTER = { mode: "all", batch: null };
      else if (v === "*open") FILTER = { mode: "open", batch: null };
      else FILTER = (FILTER.mode === "batch" && FILTER.batch === v)
        ? { mode: "all", batch: null } : { mode: "batch", batch: v };
      renderSidebar(); applyFilter();
    });
  }

  function renderSidebar() {
    var box = qs("#mpbSide");
    if (!box) return;
    var keys = allBatchKeys();
    var unb = guidesIn("").length;
    var openTotal = (st().guides || []).filter(function (g) { return stateOf(g) !== "done"; }).length;

    var rows = [
      `<button class="mpb-row ${FILTER.mode === "all" ? "on" : ""}" data-mpb="*all">
         <span class="mpb-top"><span class="mpb-name">All guides</span>
         <span class="mpb-count">${(st().guides || []).length}</span></span></button>`,
      `<button class="mpb-row ${FILTER.mode === "open" ? "on" : ""}" data-mpb="*open">
         <span class="mpb-top"><span class="mpb-name">Still to do</span>
         <span class="mpb-count">${openTotal}</span></span></button>`
    ];

    keys.forEach(function (k) {
      var p = progress(k), ap = isApproved(k);
      var pd = p.total ? Math.round(p.done / p.total * 100) : 0;
      var pc = p.total ? Math.round(p.changed / p.total * 100) : 0;
      rows.push(
        `<button class="mpb-row ${FILTER.mode === "batch" && FILTER.batch === k ? "on" : ""}" data-mpb="${esc(k)}">
           <span class="mpb-top">
             <span class="mpb-name">${ap ? '<span class="mpb-ok">✓</span> ' : ""}${esc(labelOf(k))}</span>
             <span class="mpb-count">${p.done}/${p.total}</span>
           </span>
           <span class="mpb-meter"><i class="d" style="width:${pd}%"></i><i class="c" style="width:${pc}%"></i></span>
         </button>`);
    });

    if (unb) rows.push(
      `<button class="mpb-row ${FILTER.mode === "batch" && FILTER.batch === "" ? "on" : ""}" data-mpb="">
         <span class="mpb-top"><span class="mpb-name">Unbatched</span>
         <span class="mpb-count">${unb}</span></span></button>`);

    box.innerHTML = rows.join("");
  }

  /* ---------- the guide list: badges + filtering ---------- */
  function applyFilter() {
    var list = qs("#list");
    if (!list) return;
    var guides = {};
    (st().guides || []).forEach(function (g) { guides[g.id] = g; });

    muting = true;
    var items = list.querySelectorAll(".gitem[data-id]");
    items.forEach(function (el) {
      var g = guides[el.getAttribute("data-id")];
      if (!g) return;
      var k = batchOf(g), s = stateOf(g);

      /* One chip, carrying both facts: which batch, and whether you have
         checked it. Studio's own green dot already means "has an
         illustration", so a second dot beside it would be a trap. */
      var tag = el.querySelector(".mpb-tag");
      if (!tag) {
        tag = document.createElement("span");
        tag.className = "mpb-tag";
        el.insertBefore(tag, el.firstChild);
      }
      tag.textContent = shortOf(k);
      tag.className = "mpb-tag" + (s === "done" ? " d" : s === "changed" ? " c" : "");
      el.title = labelOf(k) + " · " + (s === "done" ? "done" : s === "changed" ? "changed since you marked it done" : "not done yet");

      var show = FILTER.mode === "all" ? true
        : FILTER.mode === "open" ? s !== "done"
        : k === FILTER.batch;
      el.style.display = show ? "" : "none";
    });

    /* hide topic headings whose guides are all hidden */
    var kids = Array.prototype.slice.call(list.children), grp = null, any = false;
    kids.forEach(function (el) {
      if (el.classList.contains("grp")) {
        if (grp) grp.style.display = any ? "" : "none";
        grp = el; any = false;
      } else if (el.style.display !== "none") any = true;
    });
    if (grp) grp.style.display = any ? "" : "none";
    muting = false;
  }

  /* ---------- the bar inside the guide editor ---------- */
  function installBar() {
    var ed = qs("#editor");
    if (!ed || qs("#mpbBar")) return;
    var bar = document.createElement("div");
    bar.id = "mpbBar";
    bar.className = "mpb-bar";
    ed.insertBefore(bar, ed.firstChild);
    bar.addEventListener("click", onBarClick);
    bar.addEventListener("change", onBarChange);
  }

  function currentGuide() {
    var id = st().current;
    return (st().guides || []).find(function (g) { return g.id === id; }) || null;
  }

  function renderBar() {
    var bar = qs("#mpbBar");
    if (!bar) return;
    var g = currentGuide();
    if (!g) { bar.style.display = "none"; return; }
    bar.style.display = "";
    var k = batchOf(g), s = stateOf(g), p = progress(k), c = META.checked[g.id];
    bar.className = "mpb-bar " + (s === "done" ? "done" : s === "changed" ? "changed" : "");

    var opts = allBatchKeys().map(function (x) {
      return `<option value="${esc(x)}" ${x === k ? "selected" : ""}>${esc(labelOf(x))}</option>`;
    }).join("");

    var lp = lastPass(g);
    var sub = s === "done" ? "Done " + fmtDate(c && c.at)
      : s === "changed" ? "The words changed since you marked it done on " + fmtDate(c && c.at)
      : "Not done yet";
    if (k) sub += ' &middot; <strong>' + p.done + " of " + p.total + "</strong> done in this batch";
    if (lp) sub += ' <span style="color:#dd8b16">· reworked in ' + esc(labelOf(key(lp.b))) + " on " + fmtDate(lp.at) + "</span>";
    var allDone = k && p.total && p.done === p.total && !isApproved(k);

    bar.innerHTML =
      `<span>
         <span class="mpb-lbl">${esc(labelOf(k))}</span>
         ${isApproved(k) ? '<span class="mpb-pill ap" style="margin-left:6px">Approved</span>' : ""}
         <br><span class="mpb-sub">${sub}</span>
       </span>
       <span class="mpb-sp"></span>
       <select data-mpb-move title="This guide stays in its first batch for good. Change it here only if it was filed wrongly.">
         ${opts}
         <option value="" ${k ? "" : "selected"}>Unbatched</option>
         <option value="*new">New batch…</option>
       </select>
       <button class="btn ${s === "done" ? "ghost" : "primary"}" type="button" data-mpb-act="tick"
         title="Saving a guide marks it done automatically. This is for marking one done without changing anything, or for undoing.">
         ${s === "done" ? "Done ✓ — undo" : s === "changed" ? "Mark done again" : "Mark as done"}
       </button>
       <button class="btn ghost" type="button" data-mpb-act="next" ${k ? "" : "disabled"}>Next one →</button>
       ${allDone ? `<button class="btn primary" type="button" data-mpb-act="approve">Approve ${esc(labelOf(k))} ✓</button>` : ""}`;
  }

  async function onBarClick(e) {
    var b = e.target.closest("[data-mpb-act]");
    if (!b) return;
    var g = currentGuide();
    if (!g) return;
    var act = b.getAttribute("data-mpb-act");

    if (act === "tick") {
      if (stateOf(g) === "done") delete META.checked[g.id];
      else META.checked[g.id] = { at: Date.now(), by: email(), hash: contentHash(g) };
      await saveMeta();
      refreshAll();
      return;
    }
    if (act === "approve") {
      await approveBatch(batchOf(g), true);
      alert(labelOf(batchOf(g)) + " approved — all " + progress(batchOf(g)).total + " done.");
      return;
    }
    if (act === "next") {
      var k = batchOf(g), gs = guidesIn(k);
      var i = gs.findIndex(function (x) { return x.id === g.id; });
      var nxt = null;
      for (var n = 1; n <= gs.length; n++) {
        var cand = gs[(i + n) % gs.length];
        if (stateOf(cand) !== "done") { nxt = cand; break; }
      }
      if (!nxt) {
        if (confirm("Every guide in " + labelOf(k) + " is done.\n\nApprove the batch and close it off?"))
          { await approveBatch(k, true); }
        return;
      }
      S().selectGuide(nxt.id);
    }
  }

  async function onBarChange(e) {
    var sel = e.target.closest("[data-mpb-move]");
    if (!sel) return;
    var g = currentGuide();
    if (!g) return;
    var v = sel.value;
    if (v === "*new") {
      var k = prompt("New batch number or name (e.g. 4):", String(allBatchKeys().length + 1));
      if (!k) { renderBar(); return; }
      k = key(k); ensureBatch(k); v = k;
    }
    META.assign[g.id] = key(v);
    META.origin[g.id] = key(v);      // a deliberate move is the new permanent home
    if (key(v)) ensureBatch(key(v));
    await saveMeta();
    refreshAll();
  }

  async function approveBatch(k, on) {
    ensureBatch(k);
    META.batches[k].approved = !!on;
    META.batches[k].approvedAt = on ? Date.now() : null;
    META.batches[k].approvedBy = on ? email() : "";
    await saveMeta();
    refreshAll();
  }

  /* ---------- the overview modal ---------- */
  function installTopButton() {
    if (qs("#mpbBtn")) return;
    var host = qs("#charBtn") || qs("#seedBtn");
    if (!host) return;
    var b = document.createElement("button");
    b.id = "mpbBtn";
    b.className = "btn ghost";
    b.type = "button";
    b.title = "Batch progress: what is checked, what is approved, what is still waiting";
    b.textContent = "Batches";
    host.parentNode.insertBefore(b, host);
    b.addEventListener("click", openModal);
  }

  function bundleBatches() {
    var out = {};
    (window.GUIDES || []).forEach(function (g) {
      var k = key(g.batch);
      (out[k] = out[k] || []).push(g);
    });
    return out;
  }

  function openModal() {
    var m = qs("#mpbModal");
    if (!m) {
      m = document.createElement("div");
      m.id = "mpbModal";
      document.body.appendChild(m);
      m.addEventListener("click", onModalClick);
    }
    m.style.display = "grid";
    renderModal();
  }
  function closeModal() { var m = qs("#mpbModal"); if (m) m.style.display = "none"; }

  function renderModal() {
    var m = qs("#mpbModal");
    if (!m) return;
    var keys = allBatchKeys();
    var rows = keys.map(function (k) {
      var p = progress(k), b = META.batches[k] || {}, ap = isApproved(k);
      return `<tr>
        <td><strong>${esc(labelOf(k))}</strong>
            ${b.note ? `<br><span class="mpb-sub" style="font-size:12px;color:#6b7480">${esc(b.note)}</span>` : ""}</td>
        <td class="num">${fmtDate(b.added)}</td>
        <td class="num">${p.total}</td>
        <td class="num">${p.done}/${p.total}${p.changed ? ` <span style="color:#dd8b16">· ${p.changed} changed</span>` : ""}</td>
        <td><span class="mpb-pill ${ap ? "ap" : "rv"}">${ap ? "Approved " + fmtDate(b.approvedAt) : "In review"}</span></td>
        <td><div class="acts">
          <button class="btn sm ghost" data-k="${esc(k)}" data-a="open">Open</button>
          <button class="btn sm ghost" data-k="${esc(k)}" data-a="rename">Rename</button>
          <button class="btn sm ${ap ? "ghost" : "primary"}" data-k="${esc(k)}" data-a="${ap ? "reopen" : "approve"}">${ap ? "Reopen" : "Approve"}</button>
        </div></td>
      </tr>`;
    }).join("");

    var unb = guidesIn("").length;
    if (unb) rows += `<tr>
      <td><strong>Unbatched</strong></td><td class="num">—</td><td class="num">${unb}</td>
      <td class="num">—</td><td><span class="mpb-pill rv">No batch</span></td>
      <td><div class="acts">
        <button class="btn sm ghost" data-k="" data-a="open">Open</button>
        <button class="btn sm ghost" data-k="" data-a="moveall">Move all to…</button>
      </div></td></tr>`;

    /* what the uploaded bundle is offering, batch by batch */
    var bb = bundleBatches(), bkeys = Object.keys(bb).filter(Boolean).sort();
    var imp = bkeys.length
      ? bkeys.map(function (k) {
          var have = guidesIn(k).length;
          return `<tr>
            <td><strong>${esc(labelOf(k))}</strong></td>
            <td class="num">${bb[k].length} in the file</td>
            <td class="num">${have} live</td>
            <td><div class="acts"><button class="btn sm" data-k="${esc(k)}" data-a="import">Import this batch</button></div></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="4" class="mpb-note" style="margin:0">The uploaded bundle has no batch tags yet — nothing to import selectively.</td></tr>`;

    m.innerHTML = `<div class="box">
      <div style="display:flex;align-items:center;gap:10px">
        <h3>Batches</h3><div style="flex:1"></div>
        <button class="btn ghost" data-a="checklist">Copy checklist</button>
        <button class="btn ghost" data-a="newbatch">New batch</button>
        <button class="btn ghost" data-a="close">Close</button>
      </div>
      <table>
        <thead><tr><th>Batch</th><th>Added</th><th>Guides</th><th>Checked</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="mpb-note" style="margin:0">No batches yet.</td></tr>`}</tbody>
      </table>

      <h3 style="margin-top:22px;font-size:15px">Import one batch from the uploaded file</h3>
      <p class="mpb-note" style="margin-top:4px">Writes only the guides tagged with that batch, and keeps whatever is already
      in Firestore for anything the file leaves blank — so illustrations you generated in Studio are not overwritten.
      Safer than “Import site guides”, which rewrites every guide on the site.</p>
      <table><tbody>${imp}</tbody></table>

      <p class="mpb-note"><strong>A guide stays in the batch it first arrived in.</strong> If a later batch reworks it,
      the words update and the guide is marked as needing another look, but it does not move — so the numbering here always
      matches the Word documents in Dropbox. Ticks live in <code>meta/batches</code>, not on the guides, so an import
      can never wipe them.</p>
    </div>`;
  }

  async function onModalClick(e) {
    if (e.target.id === "mpbModal") return closeModal();
    var b = e.target.closest("[data-a]");
    if (!b) return;
    var a = b.getAttribute("data-a"), k = b.getAttribute("data-k");

    if (a === "close") return closeModal();

    if (a === "open") {
      FILTER = { mode: "batch", batch: key(k) };
      renderSidebar(); applyFilter();
      var first = guidesIn(key(k))[0];
      if (first) S().selectGuide(first.id);
      return closeModal();
    }
    if (a === "rename") {
      var nl = prompt("Name for this batch:", labelOf(k));
      if (nl == null) return;
      ensureBatch(k, nl.trim() || ("Batch " + k));
      await saveMeta(); refreshAll(); return renderModal();
    }
    if (a === "approve" || a === "reopen") {
      var p = progress(k);
      if (a === "approve" && p.total && p.done < p.total &&
          !confirm(p.total - p.done + " guide(s) in " + labelOf(k) + " are not checked yet.\n\nApprove anyway?")) return;
      await approveBatch(k, a === "approve");
      return renderModal();
    }
    if (a === "newbatch") {
      var nk = prompt("New batch number or name (e.g. 4):", String(allBatchKeys().length + 1));
      if (!nk) return;
      ensureBatch(key(nk));
      await saveMeta(); refreshAll(); return renderModal();
    }
    if (a === "moveall") {
      var to = prompt("Move every unbatched guide into which batch?", String(allBatchKeys().length + 1));
      if (!to) return;
      to = key(to); ensureBatch(to);
      guidesIn("").forEach(function (g) { META.assign[g.id] = to; });
      await saveMeta(); refreshAll(); return renderModal();
    }
    if (a === "checklist") {
      var txt = allBatchKeys().map(function (kk) {
        var pp = progress(kk);
        return "## " + labelOf(kk) + "  (" + pp.done + "/" + pp.total + ")" +
          (isApproved(kk) ? "  — approved " + fmtDate(META.batches[kk].approvedAt) : "") + "\n" +
          guidesIn(kk).map(function (g) {
            var s = stateOf(g);
            return "- [" + (s === "done" ? "x" : " ") + "] " + g.title + (s === "changed" ? "  (changed)" : "");
          }).join("\n");
      }).join("\n\n");
      try { await navigator.clipboard.writeText(txt); b.textContent = "Copied ✓"; setTimeout(function () { b.textContent = "Copy checklist"; }, 1800); }
      catch (err) { alert(txt); }
      return;
    }
    if (a === "import") return importBatch(k, b);
  }


  /* Turn every null in the incoming guide into a Firestore delete sentinel, so
     `dont: null` in the bundle actually removes the Don't strip rather than
     storing a null the renderer would have to ignore. */
  function stripNulls(o, fs) {
    if (o === null) return fs.deleteField();
    if (Array.isArray(o) || typeof o !== "object") return o;
    var out = {};
    Object.keys(o).forEach(function (k) { out[k] = stripNulls(o[k], fs); });
    return out;
  }

  /* ---------- per-batch import from the uploaded bundle ---------- */
  async function importBatch(k, btn) {
    var f = fb();
    if (!f) return alert("Importing needs Firebase mode.");
    var src = (window.GUIDES || []).filter(function (g) { return key(g.batch) === key(k); });
    if (!src.length) return alert("Nothing tagged " + labelOf(k) + " in the uploaded file.");
    var moving = src.filter(function (g) {
      return META.origin[g.id] != null && key(META.origin[g.id]) !== key(k);
    });
    var note = moving.length
      ? "\n\n" + moving.length + " of them already belong to an earlier batch. Their words will be " +
        "updated but they stay where they are:\n" +
        moving.slice(0, 8).map(function (g) { return "  · " + g.title + "  → stays in " + labelOf(key(META.origin[g.id])); }).join("\n") +
        (moving.length > 8 ? "\n  · …and " + (moving.length - 8) + " more" : "")
      : "";
    if (!confirm("Import " + src.length + " guide(s) from " + labelOf(k) + "?\n\n" +
      "Only these are written. Existing illustrations are kept where the file has none." + note)) return;

    var old = btn.textContent; btn.disabled = true; btn.textContent = "Importing…";
    try {
      var fs = f.fs, db = f.db;
      var maxOrder = (st().guides || []).reduce(function (m, g) { return Math.max(m, g.order || 0); }, 0);
      for (var i = 0; i < src.length; i++) {
        var g = JSON.parse(JSON.stringify(src[i]));
        var ref = fs.doc(db, "guides", g.id);
        var cur = await fs.getDoc(ref);
        var prev = cur.exists() ? cur.data() : null;

        /* never blank out an illustration the generator produced */
        if (g.panel && !g.panel.hero) delete g.panel.hero;

        /* An explicit null in the bundle means REMOVE this field — the one way
           a batch can take something off a guide. Anything the document simply
           does not mention is left alone by the merge. */
        g = stripNulls(g, fs);
        if (prev && prev.order != null && g.order == null) g.order = prev.order;
        if (g.order == null) g.order = ++maxOrder;

        /* Where this guide lives is decided once, on its first import, and is
           not up for revision. A later batch reworking it writes new words and
           leaves the grouping alone. */
        var home = META.origin[g.id] != null ? key(META.origin[g.id]) : key(k);
        if (META.origin[g.id] == null) META.origin[g.id] = home;
        g.batch = home;

        if (home !== key(k)) {
          var h = META.history[g.id] = META.history[g.id] || [];
          h.push({ b: key(k), at: Date.now() });
          if (h.length > 12) h.shift();
        }

        await fs.setDoc(ref, g, { merge: true });

        /* the words moved, so any old tick is stale */
        if (META.checked[g.id]) delete META.checked[g.id];
      }
      ensureBatch(key(k));
      META.batches[key(k)].approved = false;
      META.batches[key(k)].imported = Date.now();
      META.batches[key(k)].count = src.length;
      await saveMeta();

      st().guides = await S().loadGuides();
      S().renderList(qs("#q") ? qs("#q").value : "");
      refreshAll();
      btn.textContent = "Imported " + src.length + " ✓";
      setTimeout(function () { btn.disabled = false; btn.textContent = old; renderModal(); }, 1600);
    } catch (e) {
      alert("Import failed: " + (e.message || e));
      btn.disabled = false; btn.textContent = old;
    }
  }

  /* ---------- keeping everything in step ---------- */
  function refreshAll() { renderSidebar(); applyFilter(); renderBar(); }

  function watch() {
    var list = qs("#list");
    if (list && !listObs) {
      listObs = new MutationObserver(function () {
        if (muting) return;
        applyFilter();
      });
      listObs.observe(list, { childList: true });
    }
    /* selectGuide() writes the id into #pvId — the cheapest reliable signal
       that the editor is now showing a different guide. */
    var pv = qs("#pvId");
    if (pv && !selObs) {
      selObs = new MutationObserver(function () {
        if (st().current !== lastGuideId) { lastGuideId = st().current; renderBar(); }
      });
      selObs.observe(pv, { childList: true, characterData: true, subtree: true });
    }
  }

  /* Saving IS marking it done.

     Studio writes "Saved to Firestore" into #msg with class "ok" only when the
     write actually succeeded, so that is the signal — not the click, which
     fires just as happily on a save that failed. The tick records the hash of
     what was saved, so the guide reads as done rather than immediately
     flipping to "changed". */
  var lastSaveKey = "";
  function watchSaves() {
    var msg = qs("#msg");
    if (!msg || msg.__mpbWatched) return;
    msg.__mpbWatched = true;
    new MutationObserver(async function () {
      if (!/\bok\b/.test(msg.className)) return;
      var g = currentGuide();
      if (!g) return;
      var h = contentHash(g), sig = g.id + ":" + h;
      if (sig === lastSaveKey) return;          // one tick per save
      lastSaveKey = sig;
      META.checked[g.id] = { at: Date.now(), by: email(), hash: h };
      await saveMeta();
      refreshAll();
    }).observe(msg, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- boot ---------- */
  function ready() {
    return window.MPCStudio && window.MPCStudio.state && qs("#appView") &&
      !qs("#appView").classList.contains("hidden");
  }

  async function start() {
    if (qs("#mpbSide")) return;
    var s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    await loadMeta();
    adoptBundleBatches();
    installTopButton();
    installSidebar();
    installBar();
    watch();
    refreshAll();
    watchSaves();
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.id === "deleteGuide") setTimeout(refreshAll, 900);
    });
  }

  function poll() {
    if (ready()) { start(); return; }
    setTimeout(poll, 250);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poll);
  else poll();
})();
