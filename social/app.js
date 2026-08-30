/* ============================================================================
   THE SOCIAL DASHBOARD

   A private, authenticated tool for turning published guides into Instagram
   packages, looking at them properly, editing them, and approving them.

   WHAT THIS FILE CANNOT DO, BY DESIGN

   • It cannot write to Firestore. Every mutation is a POST to an authenticated
     Netlify function; the rules deny browser writes outright.
   • It cannot approve anything. It asks social-approve to, and that function
     recomputes the content hash from the stored document rather than trusting
     what was on screen.
   • It cannot publish. There is no publish button, publishing is locked
     server-side, and there is no Meta transport in the repository.

   The preview is drawn by scripts/lib/social/templates.js — the same module
   scripts/social-render.js screenshots — so what is on screen is what would be
   exported. A preview drawn by different code from the export is a preview of
   nothing.
   ========================================================================== */

const V = "10.12.2";
const T = window.MPCSocialTemplates;
const CFG = window.FIREBASE_CONFIG;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const state = {
  tab: "make",
  auth: null, user: null,
  status: null, guides: [], skipped: [], topics: [], ages: [],
  packages: [], current: null, slide: 0, storyMode: false,
  filter: { q: "", topic: "", age: "" },
  selected: new Set(),
  busy: false
};

/* ------------------------------------------------------------------------ */
/* API                                                                       */
/* ------------------------------------------------------------------------ */
async function api(name, { method = "GET", body, query } = {}) {
  const token = await state.user.getIdToken();
  const qs = query ? "?" + new URLSearchParams(query).toString() : "";
  const res = await fetch(`/.netlify/functions/${name}${qs}`, {
    method,
    headers: Object.assign({ Authorization: "Bearer " + token },
      body ? { "Content-Type": "application/json" } : {}),
    body: body ? JSON.stringify(body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data.error || `${name} failed (${res.status})`);
    err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}

let toastTimer;
function toast(msg, bad) {
  const el = $("#toast");
  el.textContent = msg;
  el.className = "toast" + (bad ? " bad" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 4200);
}
async function busy(fn) {
  if (state.busy) return;
  state.busy = true;
  try { await fn(); }
  catch (e) { toast(e.message || String(e), true); }
  finally { state.busy = false; }
}

/* ------------------------------------------------------------------------ */
/* LOADING                                                                   */
/* ------------------------------------------------------------------------ */
async function refresh() {
  const [status, guides] = await Promise.all([
    api("social-status"),
    api("social-guides", { query: state.filter })
  ]);
  state.status = status;
  state.guides = guides.guides;
  state.skipped = guides.skipped;
  state.topics = guides.topics;
  state.ages = guides.ages;
  paintLock();
  paintCounts();
}

function paintLock() {
  const s = state.status && state.status.publishing;
  const bar = $("#lockbar");
  if (!s) return;
  if (s.enabled && s.metaConnected) {
    bar.classList.add("is-live");
    $("#lockTitle").textContent = "Publishing enabled";
    $("#lockWhy").textContent = "Approved packages can reach Instagram. Read SOCIAL-README before using this mode.";
  } else {
    bar.classList.remove("is-live");
    $("#lockTitle").textContent = "Publishing disabled";
    $("#lockWhy").textContent =
      "Approving means approved and held. Nothing can reach Instagram. " + (s.reasons || []).join(" ");
  }
  $("#metaBadge").textContent = s.metaConnected ? "Meta connected" : "Meta not connected";
}

function paintCounts() {
  const p = (state.status && state.status.packages) || {};
  const map = { DRAFT: p.draft, NEEDS_REVIEW: p.needsReview, APPROVED_HELD: p.approvedHeld,
    REJECTED: p.rejected, PUBLISHED: p.published };
  Object.keys(map).forEach(k => {
    const el = $(`[data-count="${k}"]`);
    if (el) el.textContent = map[k] == null ? "0" : map[k];
  });
}

/* ------------------------------------------------------------------------ */
/* VIEWS                                                                     */
/* ------------------------------------------------------------------------ */
function render() {
  $$("#tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === state.tab)));
  const view = $("#view");
  if (state.current) return renderPackage(view);
  if (state.tab === "make") return renderMake(view);
  if (state.tab === "status") return renderStatus(view);
  return renderList(view, state.tab);
}

/* ---- make a package ---------------------------------------------------- */
function renderMake(view) {
  const g = state.guides;
  const sel = state.selected;

  view.innerHTML = `
    <div class="bar">
      <input type="search" id="q" placeholder="Search title or slug" value="${esc(state.filter.q)}">
      <select id="topic"><option value="">All topics</option>${
        state.topics.map(t => `<option value="${esc(t.id)}"${t.id === state.filter.topic ? " selected" : ""}>${esc(t.label)}</option>`).join("")
      }</select>
      <select id="age"><option value="">All ages</option>${
        state.ages.map(a => `<option value="${esc(a)}"${a === state.filter.age ? " selected" : ""}>${esc(a)}</option>`).join("")
      }</select>
      <button class="btn ghost" id="selAll">Select all shown</button>
      <button class="btn ghost" id="selNone">Clear</button>
      <button class="btn" id="gen" ${sel.size ? "" : "disabled"}>Generate ${sel.size || ""} package${sel.size === 1 ? "" : "s"}</button>
      <button class="btn quiet" id="genTest">Generate one test package</button>
    </div>
    <p style="color:var(--ink-50);font-size:.85rem;margin:0 0 12px">
      ${g.length} eligible guide${g.length === 1 ? "" : "s"} shown.
      A guide already carrying a package is marked; regenerating one is deliberate and asks first.
    </p>
    <div class="rows">${g.map(row => guideRow(row)).join("") || `<div class="empty">No guides match that.</div>`}</div>
    ${state.skipped.length ? `<div class="panelbox" style="margin-top:16px">
      <h3>Not eligible <small>${state.skipped.length}</small></h3>
      <div class="rows">${state.skipped.map(s =>
        `<div class="row"><span></span><span><span class="t">${esc(s.title || s.slug)}</span>
         <span class="m">${esc(s.reason)}</span></span><span></span></div>`).join("")}</div>
    </div>` : ""}
  `;

  $("#q").addEventListener("input", debounce(e => { state.filter.q = e.target.value; busy(async () => { await refresh(); render(); }); }, 250));
  $("#topic").addEventListener("change", e => { state.filter.topic = e.target.value; busy(async () => { await refresh(); render(); }); });
  $("#age").addEventListener("change", e => { state.filter.age = e.target.value; busy(async () => { await refresh(); render(); }); });
  $("#selAll").addEventListener("click", () => { g.forEach(x => sel.add(x.slug)); render(); });
  $("#selNone").addEventListener("click", () => { sel.clear(); render(); });
  $$("#view input[type=checkbox]").forEach(cb => cb.addEventListener("change", () => {
    cb.checked ? sel.add(cb.value) : sel.delete(cb.value);
    $("#gen").disabled = !sel.size;
    $("#gen").textContent = `Generate ${sel.size || ""} package${sel.size === 1 ? "" : "s"}`;
  }));
  $("#gen").addEventListener("click", () => generate(Array.from(sel), false, false));
  $("#genTest").addEventListener("click", () => {
    const one = Array.from(sel)[0] || (g[0] && g[0].slug);
    if (!one) return toast("No guide to test with.", true);
    generate([one], true, true);
  });
  $$("#view [data-regen]").forEach(b => b.addEventListener("click", () => {
    if (!confirm(`Regenerate the package for “${b.dataset.title}”?\n\nThe current one is replaced, and any approval on it is cleared.`)) return;
    generate([b.dataset.regen], false, true);
  }));
  $$("#view [data-open]").forEach(b => b.addEventListener("click", () => openPackage(b.dataset.open)));
}

function guideRow(row) {
  const f = row.fields;
  const bits = [
    f.quick ? "quick" : null,
    f.normal ? `${f.normal} normal` : null,
    f.helped ? `${f.helped} helped` : null,
    f.warn ? `${f.warn} warn` : null,
    f.dont ? `${f.dont} don't` : null,
    row.hasHero ? "illustration" : "no illustration"
  ].filter(Boolean).join(" · ");
  const has = row.packageId;
  return `<div class="row">
    <input type="checkbox" value="${esc(row.slug)}" ${state.selected.has(row.slug) ? "checked" : ""} aria-label="Select ${esc(row.title)}">
    <span>
      <span class="t">${esc(row.title)}</span>
      ${has ? `<span class="tag ${tagClass(row.packageStatus)}">${esc(label(row.packageStatus))}</span>` : ""}
      <span class="m">${esc(row.slug)} · ${esc(row.topic)} · ${bits}</span>
    </span>
    <span class="acts">
      ${has ? `<button class="btn tiny ghost" data-open="${esc(has)}">Open</button>
               <button class="btn tiny quiet" data-regen="${esc(row.slug)}" data-title="${esc(row.title)}">Regenerate</button>`
            : ``}
    </span>
  </div>`;
}

function generate(slugs, isTest, replace) {
  busy(async () => {
    const r = await api("social-generate", { method: "POST", body: { slugs, isTest, replace } });
    state.selected.clear();
    await refresh();
    if (r.skipped && r.skipped.length && !r.created.length) {
      toast(r.skipped.map(s => `${s.slug}: ${s.reason}`).join(" · "), true);
      return render();
    }
    toast(`${r.created.length} package${r.created.length === 1 ? "" : "s"} generated as drafts.`);
    if (r.created.length === 1) return openPackage(r.created[0].id);
    state.tab = "DRAFT"; render();
  });
}

/* ---- a status list ----------------------------------------------------- */
function renderList(view, status) {
  busy(async () => {
    const r = await api("social-list", { query: { status } });
    state.packages = r.packages;
    view.innerHTML = r.packages.length ? `
      <div class="rows">${r.packages.map(p => `
        <div class="row">
          <span></span>
          <span>
            <span class="t">${esc(p.guideTitle)}</span>
            <span class="tag ${tagClass(p.status)}">${esc(label(p.status))}</span>
            ${p.isTest ? `<span class="tag test">test</span>` : ""}
            ${errorCount(p) ? `<span class="tag err">${errorCount(p)} to fix</span>` : ""}
            <span class="m">${p.slides ? p.slides.length : 0} slides · suggested ${when(p.scheduledFor)}
              ${p.approvedAt ? ` · approved ${when(p.approvedAt)}` : ""}</span>
          </span>
          <span class="acts"><button class="btn tiny ghost" data-open="${esc(p.id)}">Open</button></span>
        </div>`).join("")}</div>`
      : `<div class="empty">${emptyFor(status)}</div>`;
    $$("#view [data-open]").forEach(b => b.addEventListener("click", () => openPackage(b.dataset.open)));
  });
  view.innerHTML = `<div class="empty">Loading…</div>`;
}

const emptyFor = (s) => ({
  DRAFT: "No drafts. Make one from the “Make a package” tab.",
  NEEDS_REVIEW: "Nothing waiting for you.",
  APPROVED_HELD: "Nothing approved yet.",
  REJECTED: "Nothing rejected.",
  PUBLISHED: "Nothing has been published, and nothing can be — publishing is disabled for this phase. This tab is here for later."
}[s] || "Nothing here.");

/* ---- one package ------------------------------------------------------- */
function openPackage(id) {
  busy(async () => {
    const r = await api("social-get", { query: { id } });
    state.current = r.package;
    state.guideSource = r.guide;
    state.slide = 0; state.storyMode = false;
    render();
  });
}

function renderPackage(view) {
  const p = state.current;
  const frames = state.storyMode ? ((p.story && p.story.frames) || []) : (p.slides || []);
  const idx = Math.min(state.slide, Math.max(0, frames.length - 1));
  const findings = p.validation || [];
  const errs = findings.filter(f => f.level === "error");
  const held = p.status === "APPROVED_HELD";

  view.innerHTML = `
    <div class="bar">
      <button class="btn quiet" id="back">← All packages</button>
      <strong style="flex:1 1 auto">${esc(p.guideTitle)}</strong>
      <span class="tag ${tagClass(p.status)}">${esc(label(p.status))}</span>
      ${p.isTest ? `<span class="tag test">test package</span>` : ""}
      <a class="btn tiny ghost" href="${esc(p.guidePath)}" target="_blank" rel="noopener">Open the guide ↗</a>
    </div>

    ${held ? `<div class="held">Approved and held. Publishing is disabled, there is no scheduler, and nothing will send this. Editing it below returns it to review.</div>` : ""}

    <div class="pkg" style="margin-top:12px">
      <div class="stage">
        <div class="bar" style="margin:0 0 10px">
          <button class="btn tiny ${state.storyMode ? "quiet" : ""}" data-mode="carousel">Carousel 4:5</button>
          <button class="btn tiny ${state.storyMode ? "" : "quiet"}" data-mode="story">Story 9:16</button>
        </div>
        <div class="frame" id="frame"></div>
        <div class="nav">
          <button class="btn tiny quiet" id="prev" ${idx === 0 ? "disabled" : ""}>←</button>
          <span class="pos">${frames.length ? idx + 1 : 0} / ${frames.length}</span>
          <button class="btn tiny quiet" id="next" ${idx >= frames.length - 1 ? "disabled" : ""}>→</button>
        </div>
        <div class="dots">${frames.map((f, i) =>
          `<button data-go="${i}" aria-current="${i === idx}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>
        <p id="fit" style="text-align:center;color:var(--ink-50);font-size:.8rem;margin:8px 0 0"></p>

        <div class="future" style="margin-top:14px;border-top:1.5px solid var(--line-soft);padding-top:12px">
          <button class="btn tiny quiet" disabled title="Not configured in this phase">Create animated version</button>
          <span class="badge-later">Coming later</span>
          <p style="font-size:.78rem;color:var(--ink-50);margin:8px 0 0">
            Reels are 1080×1920. An animation would start from this approved illustration and keep the
            same characters, faces, clothes and style — see SOCIAL-README.md.
          </p>
        </div>
      </div>

      <div>
        ${findings.length ? `<div class="findings">${findings.map(f =>
          `<div class="finding ${esc(f.level)}"><strong>${esc(f.code)}</strong> — ${esc(f.message)}
           ${f.detail ? `<br><code>${esc(f.detail)}</code>` : ""}</div>`).join("")}</div>` : ""}

        ${slideEditor(p, idx)}

        <div class="panelbox">
          <h3>Caption</h3>
          <textarea id="caption" style="min-height:190px">${esc(p.caption)}</textarea>
          <label class="fld" for="hashtags">Hashtags</label>
          <input class="text" id="hashtags" value="${esc((p.hashtags || []).join(" "))}">
          <label class="fld" for="when">Suggested date and time (UTC)</label>
          <input class="text" id="when" type="datetime-local" value="${esc(toLocalInput(p.scheduledFor))}">
          <label class="fld">Destination</label>
          <p style="margin:0;font-size:.8rem;word-break:break-all"><code>${esc(p.destinationUrl)}</code></p>
        </div>

        <div class="actions">
          <button class="btn" id="save">Save changes</button>
          <button class="btn go" id="approve" ${errs.length ? "disabled title='Fix the errors above first'" : ""}>Approve &amp; hold</button>
          <button class="btn warn" id="reject">Reject…</button>
          ${held ? `<button class="btn quiet" id="unapprove">Return to editing</button>` : ""}
          <button class="btn quiet" id="regen">Regenerate from the guide</button>
          <button class="btn quiet" id="dry">Show the payload it would send</button>
        </div>
      </div>
    </div>`;

  paintFrame(frames[idx], state.storyMode);

  $("#back").addEventListener("click", () => { state.current = null; render(); });
  $$("#view [data-mode]").forEach(b => b.addEventListener("click", () => {
    state.storyMode = b.dataset.mode === "story"; state.slide = 0; render();
  }));
  $("#prev").addEventListener("click", () => { state.slide = Math.max(0, idx - 1); render(); });
  $("#next").addEventListener("click", () => { state.slide = Math.min(frames.length - 1, idx + 1); render(); });
  $$("#view [data-go]").forEach(b => b.addEventListener("click", () => { state.slide = Number(b.dataset.go); render(); }));

  $("#save").addEventListener("click", saveEdits);
  $("#approve").addEventListener("click", approve);
  $("#reject").addEventListener("click", reject);
  const un = $("#unapprove"); if (un) un.addEventListener("click", () => sendBack());
  $("#regen").addEventListener("click", () => {
    if (!confirm("Regenerate this package from the guide?\n\nYour edits and any approval are discarded.")) return;
    generate([p.guideSlug], p.isTest, true);
  });
  $("#dry").addEventListener("click", () => busy(async () => {
    const r = await api("social-publish", { method: "POST", body: { id: p.id, dryRun: true } });
    alert("NOTHING WAS SENT.\n\nLocked: " + r.locked + "\n" + (r.reasons || []).join("\n") +
      "\n\nPayload that would be built:\n\n" + JSON.stringify(r.payload, null, 2).slice(0, 2000));
  }));

  wireSlideEditor(p, idx);
}

/* ---- the slide editor, with the guide's own words beside it ------------ */
function slideEditor(p, idx) {
  if (state.storyMode) {
    const f = ((p.story && p.story.frames) || [])[idx];
    if (!f) return "";
    return `<div class="panelbox">
      <h3>Story frame ${idx + 1} <small>${esc(f.kind)}</small></h3>
      <div class="sidebyside">
        <div>
          <label class="fld">Heading</label>
          <input class="text" data-story="heading" value="${esc(f.heading)}">
          <label class="fld">Body</label>
          <textarea data-story="body">${esc(f.body || "")}</textarea>
        </div>
        ${sourceBox(f.sourceText, "Story source")}
      </div>
    </div>`;
  }

  const s = (p.slides || [])[idx];
  if (!s) return "";
  const canMove = s.movable !== false;
  return `<div class="panelbox">
    <h3>Slide ${idx + 1} <small>${esc(s.kind)} · from ${esc(s.sourceField)}</small></h3>
    <div class="sidebyside">
      <div>
        ${s.eyebrow !== undefined ? `<label class="fld">Eyebrow</label>
          <input class="text" data-slide="eyebrow" value="${esc(s.eyebrow)}">` : ""}
        ${s.heading !== undefined ? `<label class="fld">Heading</label>
          <input class="text" data-slide="heading" value="${esc(s.heading)}">` : ""}
        <label class="fld">Lines</label>
        ${(s.lines || []).map((l, i) =>
          `<textarea data-line="${i}" style="min-height:60px;margin-bottom:6px">${esc(l)}</textarea>`).join("")
          || `<p style="font-size:.85rem;color:var(--ink-50)">This slide has no text lines.</p>`}
      </div>
      ${sourceBox(s.sourceText, "The guide's own words")}
    </div>

    <label class="fld">Slides</label>
    <div class="slidelist">${(p.slides || []).map((x, i) => `
      <div class="slideitem ${i === idx ? "is-current" : ""}">
        <span class="k">${i + 1} ${esc(x.kind)}</span>
        <span>${esc(x.heading || (x.lines || [])[0] || "")}</span>
        <span class="acts">
          ${x.movable !== false ? `
            <button class="btn tiny quiet" data-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="btn tiny quiet" data-down="${i}" ${i === p.slides.length - 1 ? "disabled" : ""}>↓</button>` : ""}
          ${x.optional ? `<button class="btn tiny warn" data-remove="${i}">Remove</button>`
                       : `<span class="locked">${x.kind === "warn" ? "safety — kept" : "fixed"}</span>`}
        </span>
      </div>`).join("")}</div>
    ${canMove ? "" : `<p style="font-size:.78rem;color:var(--ink-50);margin:8px 0 0">The cover and closing slides stay where they are.</p>`}
  </div>`;
}

function sourceBox(sourceText, title) {
  const list = [].concat(sourceText || []).filter(Boolean);
  return `<div class="source">
    <h4>${esc(title)}</h4>
    ${list.length ? `<ul>${list.map(s => `<li>${esc(s)}</li>`).join("")}</ul>`
                  : `<p style="margin:0">Template wording — not taken from the guide.</p>`}
  </div>`;
}

function wireSlideEditor(p, idx) {
  $$("#view [data-remove]").forEach(b => b.addEventListener("click", () => {
    const i = Number(b.dataset.remove);
    const copy = p.slides.slice(); copy.splice(i, 1);
    state.current = Object.assign({}, p, { slides: copy });
    state.slide = Math.min(state.slide, copy.length - 1);
    render(); toast("Slide removed. Press Save to keep it.");
  }));
  const swap = (a, b) => {
    const copy = p.slides.slice();
    if (copy[a].movable === false || copy[b].movable === false) return toast("That slide is fixed in place.", true);
    [copy[a], copy[b]] = [copy[b], copy[a]];
    state.current = Object.assign({}, p, { slides: copy });
    state.slide = b; render();
  };
  $$("#view [data-up]").forEach(b => b.addEventListener("click", () => swap(Number(b.dataset.up), Number(b.dataset.up) - 1)));
  $$("#view [data-down]").forEach(b => b.addEventListener("click", () => swap(Number(b.dataset.down), Number(b.dataset.down) + 1)));

  const live = () => {
    const s = state.storyMode ? ((p.story && p.story.frames) || [])[idx] : (p.slides || [])[idx];
    if (!s) return;
    $$("#view [data-slide]").forEach(el => { s[el.dataset.slide] = el.value; });
    $$("#view [data-story]").forEach(el => { s[el.dataset.story] = el.value; });
    const lines = $$("#view [data-line]");
    if (lines.length) s.lines = lines.map(el => el.value);
    paintFrame(s, state.storyMode);
  };
  $$("#view [data-slide], #view [data-story], #view [data-line]")
    .forEach(el => el.addEventListener("input", debounce(live, 200)));
}

/* ---- the preview frame ------------------------------------------------- */
function paintFrame(frame, isStory) {
  const host = $("#frame");
  if (!host || !frame) { if (host) host.innerHTML = ""; return; }
  const W = 1080, H = isStory ? 1920 : 1350;
  const html = isStory ? T.storyHTML(frame)
                       : T.slideHTML(frame, { index: state.slide, total: (state.current.slides || []).length });

  host.innerHTML = `<div class="scaler" style="width:${W}px;height:${H}px">${html}</div>`;
  if (!document.getElementById("mpc-slide-css")) {
    const st = document.createElement("style");
    st.id = "mpc-slide-css"; st.textContent = T.css();
    document.head.appendChild(st);
  }
  /* Measure the space available BEFORE the 1080px slide can influence it.
     The stylesheet pins the grid children to min-width:0 for the same reason;
     this clamp is the belt to that braces, so a future layout change cannot
     silently produce a preview at the wrong size. */
  const avail = Math.min(host.clientWidth || W, host.parentElement ? host.parentElement.clientWidth : W);
  const scale = Math.min(1, (avail || W) / W);
  const scaler = host.firstElementChild;
  scaler.style.transform = `scale(${scale})`;
  host.style.height = Math.round(H * scale) + "px";

  /* The overflow check that only a browser can do. */
  requestAnimationFrame(() => {
    const el = scaler.querySelector(".mpc-slide");
    if (!el) return;
    let worst = Math.max(0, el.scrollHeight - el.clientHeight, el.scrollWidth - el.clientWidth);
    el.querySelectorAll("*").forEach(n => {
      const r = n.getBoundingClientRect(), b = el.getBoundingClientRect();
      if (r.bottom > b.bottom + 1) worst = Math.max(worst, Math.round((r.bottom - b.bottom) / scale));
      if (r.right > b.right + 1) worst = Math.max(worst, Math.round((r.right - b.right) / scale));
    });
    const fit = $("#fit");
    if (fit) {
      fit.textContent = worst
        ? `⚠ Text overflows this slide by ${worst}px — shorten it.`
        : `Fits, with room inside the safe area. ${W}×${H}, exports as JPEG.`;
      fit.style.color = worst ? "var(--red-ink)" : "var(--ink-50)";
    }
  });
}

/* ---- actions ----------------------------------------------------------- */
function collect() {
  const p = state.current;
  const when = $("#when").value;
  return {
    caption: $("#caption").value,
    hashtags: $("#hashtags").value.split(/[\s,]+/).map(h => h.replace(/^#/, "")).filter(Boolean),
    slides: p.slides,
    story: p.story,
    scheduledFor: when ? new Date(when).toISOString() : p.scheduledFor
  };
}

function saveEdits() {
  busy(async () => {
    const r = await api("social-update", { method: "POST", body: { id: state.current.id, patch: collect() } });
    toast(r.approvalNote || "Saved.");
    await refresh(); openPackage(state.current.id);
  });
}

function approve() {
  busy(async () => {
    /* Save first, so what is approved is what is on screen. The server hashes
       the stored document either way — this just avoids a pointless 409. */
    await api("social-update", { method: "POST", body: { id: state.current.id, patch: collect() } });
    const r = await api("social-approve", { method: "POST", body: { id: state.current.id } });
    toast(r.note || "Approved and held.");
    await refresh(); openPackage(state.current.id);
  });
}

function reject() {
  const reason = prompt("Reject this package. Reason (optional):", "");
  if (reason === null) return;
  busy(async () => {
    await api("social-reject", { method: "POST", body: { id: state.current.id, reason } });
    toast("Rejected.");
    await refresh(); state.current = null; state.tab = "REJECTED"; render();
  });
}

function sendBack() {
  busy(async () => {
    await api("social-reject", { method: "POST", body: { id: state.current.id, toEditing: true } });
    toast("Back in review. The approval was cleared.");
    await refresh(); openPackage(state.current.id);
  });
}

/* ---- status ------------------------------------------------------------ */
function renderStatus(view) {
  const s = state.status || {};
  const g = s.guides || {}, p = s.packages || {}, pub = s.publishing || {};
  const stat = (n, label, bad) => `<div class="stat${bad ? " is-bad" : ""}"><b>${n}</b><span>${label}</span></div>`;

  view.innerHTML = `
    <div class="stats">
      ${stat(pub.enabled ? "ON" : "OFF", "Publishing", !pub.enabled ? false : true)}
      ${stat(pub.metaConnected ? "YES" : "NO", "Meta connected")}
      ${stat(g.eligible ?? "—", "Guides available")}
      ${stat(p.total ?? 0, "Packages generated")}
      ${stat(p.needsReview ?? 0, "Awaiting review")}
      ${stat(p.approvedHeld ?? 0, "Approved &amp; held")}
      ${stat(p.withErrors ?? 0, "With errors", (p.withErrors || 0) > 0)}
      ${stat(p.tests ?? 0, "Test packages")}
    </div>

    <div class="panelbox">
      <h3>Publishing</h3>
      <p style="margin:0 0 6px"><strong>${pub.enabled ? "Enabled" : "Disabled"}</strong> —
      the server refuses every publish attempt while this is off, and it defaults to off when
      <code>SOCIAL_PUBLISHING_ENABLED</code> is absent.</p>
      <ul style="margin:6px 0 0">${(pub.reasons || []).map(r => `<li>${esc(r)}</li>`).join("") || "<li>No blockers.</li>"}</ul>
    </div>

    <div class="panelbox">
      <h3>Guide data</h3>
      <p style="margin:0">Read from <strong>${esc(g.source || "?")}</strong>,
      last refreshed ${when(g.refreshedAt)}.<br>
      ${g.total} guide${g.total === 1 ? "" : "s"} visible ·
      ${g.eligible} eligible · ${g.ineligible} not ready · ${g.hidden} held back by an age band.</p>
      ${(g.warnings || []).length ? `<div class="findings">${g.warnings.map(w =>
        `<div class="finding warn">${esc(w)}</div>`).join("")}</div>` : ""}
    </div>

    <div class="panelbox future">
      <h3>Animation <span class="badge-later">Not configured</span></h3>
      <p style="margin:0">No provider is connected and no animation code exists. The intended flow is
      approved illustration → animation request → motion preview → manual review → held Reel asset,
      at 1080×1920. See <code>SOCIAL-README.md</code>.</p>
    </div>

    <div class="panelbox">
      <h3>Refresh</h3>
      <button class="btn ghost" id="reload">Re-read guides and packages</button>
    </div>`;
  $("#reload").addEventListener("click", () => busy(async () => { await refresh(); render(); toast("Refreshed."); }));
}

/* ------------------------------------------------------------------------ */
/* helpers                                                                   */
/* ------------------------------------------------------------------------ */
const label = (s) => ({ DRAFT: "draft", NEEDS_REVIEW: "needs review", APPROVED_HELD: "approved & held",
  REJECTED: "rejected", PUBLISHED: "published" }[s] || s);
const tagClass = (s) => ({ DRAFT: "draft", NEEDS_REVIEW: "review", APPROVED_HELD: "held",
  REJECTED: "rejected", PUBLISHED: "held" }[s] || "draft");
const errorCount = (p) => (p.validation || []).filter(f => f.level === "error").length;
const when = (iso) => { if (!iso) return "—"; const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); };
const toLocalInput = (iso) => { const d = new Date(iso); if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

/* ------------------------------------------------------------------------ */
/* boot                                                                      */
/* ------------------------------------------------------------------------ */
async function boot() {
  if (!CFG || !CFG.projectId) {
    $("#loginErr").textContent = "Firebase is not configured in assets/js/firebase-config.js.";
    return;
  }
  const [{ initializeApp }, auth] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`)
  ]);
  const app = initializeApp(CFG);
  const a = auth.getAuth(app);

  $("#loginBtn").addEventListener("click", async () => {
    $("#loginErr").textContent = "";
    try { await auth.signInWithEmailAndPassword(a, $("#email").value.trim(), $("#pw").value); }
    catch (err) { $("#loginErr").textContent = err.message || "Sign-in failed."; }
  });
  $("#pw").addEventListener("keydown", e => { if (e.key === "Enter") $("#loginBtn").click(); });
  $("#signout").addEventListener("click", () => auth.signOut(a));

  $$("#tabs button").forEach(b => b.addEventListener("click", () => {
    state.tab = b.dataset.tab; state.current = null; render();
  }));

  auth.onAuthStateChanged(a, async user => {
    if (!user) {
      state.user = null;
      $("#appView").classList.add("hidden");
      $("#loginView").classList.remove("hidden");
      return;
    }
    state.user = user;
    $("#who").textContent = user.email || "";
    $("#loginView").classList.add("hidden");
    $("#appView").classList.remove("hidden");
    await busy(async () => { await refresh(); render(); });
  });
}

window.addEventListener("resize", debounce(() => {
  if (state.current) {
    const frames = state.storyMode ? ((state.current.story && state.current.story.frames) || []) : (state.current.slides || []);
    paintFrame(frames[state.slide], state.storyMode);
  }
}, 150));

boot();
