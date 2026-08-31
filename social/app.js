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

/* ---- the asset map the renderer needs ---------------------------------- *
   templates.js resolves the character cutouts, the logo and the paper grain
   through ctx.assets.images. The EXPORT renderer fills that map with data
   URIs, because setContent() gives its page an opaque origin from which a
   root-absolute path cannot resolve. The dashboard is a real page on a real
   origin, so the map is empty and templates.js resolve() falls through to the
   real site path. Same functions, same layout, same pixels — only the bytes
   arrive differently.

   The object clues are inline SVG inside templates.js, so there is no icon
   directory to keep in step with anything. */
function frameAssets() {
  return { images: {} };
}

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const state = {
  tab: "make",
  auth: null, user: null,
  status: null, guides: [], skipped: [], topics: [], ages: [],
  packages: [], current: null, slide: 0, storyMode: false,
  refs: null,
  filter: { q: "", topic: "", age: "" },
  platform: "instagram",   /* which platform preview is on screen */
  surface: "feed",         /* feed | story */
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
  if (state.tab === "references") return renderReferences(view);
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


/* ------------------------------------------------------------------------ */
/* THE REFERENCE LIBRARY                                                     */
/*                                                                           */
/* Not documentation. Every row here is a manifest entry that the generator   */
/* reads through the SAME function it uses to choose what to attach, so the   */
/* "used by" column is the wiring rather than a description of it. If a       */
/* poster is missing, this is where it is named — by exact path, and not      */
/* replaced with something generic.                                          */
/* ------------------------------------------------------------------------ */
function renderReferences(view) {
  if (!state.refs) {
    view.innerHTML = `<div class="empty">Loading the reference library…</div>`;
    return busy(async () => { state.refs = await api("social-references"); render(); });
  }
  const r = state.refs;
  const eng = r.engine || {};
  const byGroup = new Map();
  (r.references || []).forEach(x => {
    if (!byGroup.has(x.group)) byGroup.set(x.group, []);
    byGroup.get(x.group).push(x);
  });

  const card = (x) => `
    <figure class="refcard${x.active ? "" : " is-off"}">
      <img loading="lazy" src="${esc(x.thumb)}" alt="${esc(x.name)}">
      <figcaption>
        <span class="t">${esc(x.name)}</span>
        <span class="m"><code>${esc(x.role)}</code>${x.character ? " · " + esc(x.character) : ""}</span>
        <span class="tag ${x.active ? "held" : "draft"}">${x.active ? "active" : "inactive"}</span>
        <span class="m">manifest ${esc(x.manifestVersion)}</span>
        <span class="m">used by: ${x.usedBy.map(f => `<code>${esc(f)}</code>`).join(" ")}</span>
        ${x.note ? `<span class="m note">${esc(x.note)}</span>` : ""}
      </figcaption>
    </figure>`;

  view.innerHTML = `
    <div class="panelbox ${eng.configured ? "" : "future"}">
      <h3>Image engine ${eng.configured
        ? `<span class="tag held">key configured</span>`
        : `<span class="badge-later">no key configured</span>`}</h3>
      <p style="margin:0 0 6px">${esc(eng.note || "")}</p>
      <p class="hint" style="margin:0 0 10px">
        Image model <code>${esc(eng.imageModel || "—")}</code> ·
        prompt <code>${esc((r.prompt || {}).version || "—")}</code> ·
        manifest <code>${esc((r.manifest || {}).version || "—")}</code>
        (${(r.manifest || {}).count || 0} references, updated ${esc((r.manifest || {}).updated || "—")}).
        The key is read server-side only — it is never sent to this page, logged, or written to Firestore.
      </p>
      <p class="hint" style="margin:0 0 10px">
        “Key configured” only means the variable is set. Press the button to find out whether it
        actually authenticates and whether this account can use the image model. It makes one tiny
        text request and one model listing — no image is generated.
      </p>
      <button class="btn ghost" id="enginetest">Test the connection</button>
      <div id="enginetestout" style="margin-top:10px"></div>
    </div>

    ${(r.missing || []).length ? `<div class="findings"><div class="finding error">
      <strong>missing-reference</strong> — ${r.missing.length} manifest entr${r.missing.length === 1 ? "y has" : "ies have"}
      no file behind ${r.missing.length === 1 ? "it" : "them"}. Nothing generic is substituted; add the files at these exact paths:
      <br>${r.missing.map(m => `<code>${esc(m.expected)}</code> <span class="m">(${esc(m.id)})</span>`).join("<br>")}
    </div></div>` : ""}

    <div class="panelbox">
      <h3>What each slide family sends <small>every image request</small></h3>
      <div class="rows">${(r.families || []).map(f => f.error
        ? `<div class="row"><span></span><span><span class="t">${esc(f.family)}</span>
             <span class="m" style="color:var(--red-ink)">${esc(f.error)}</span></span><span></span></div>`
        : `<div class="row">
             <span></span>
             <span>
               <span class="t">${esc(f.family)}</span>
               ${f.logoAllowed ? `<span class="tag test">logo allowed</span>` : ""}
               <span class="m">poster <code>${esc(f.posterId)}</code> ·
                 characters ${f.characterIds.map(c => `<code>${esc(c)}</code>`).join(" ")} ·
                 scene <code>${esc(f.sceneId || "none")}</code> ·
                 brand <code>${esc(f.brandId)}</code></span>
               <span class="m">${f.attachedCount} image${f.attachedCount === 1 ? "" : "s"} attached per request</span>
             </span>
             <span></span>
           </div>`).join("")}</div>
    </div>

    ${(r.manifest.groups || []).map(g => {
      const list = byGroup.get(g.id) || [];
      if (!list.length) return "";
      return `<div class="panelbox">
        <h3>${esc(g.label)} <small>${list.length}</small></h3>
        <p class="hint" style="margin:0 0 10px">${esc(g.note || "")}</p>
        <div class="refgrid">${list.map(card).join("")}</div>
      </div>`;
    }).join("")}

    <div class="panelbox future">
      <h3>The system prompt <small>${esc((r.prompt || {}).version || "")}</small></h3>
      <pre class="platcopy">${esc((r.prompt || {}).system || "")}</pre>
      <p class="hint">Sent verbatim with every image request, ahead of the family brief.
        Wording is versioned: changing it changes the prompt version, which is part of the approval hash.</p>
    </div>

    <div class="panelbox">
      <button class="btn ghost" id="refreload">Re-read the manifest</button>
    </div>`;

  $("#refreload").addEventListener("click", () => busy(async () => {
    state.refs = await api("social-references"); render(); toast("Manifest re-read.");
  }));
  $("#enginetest").addEventListener("click", () => runEngineTest($("#enginetestout")));
}

/* The honest answer to "is the OpenAI API in here and is it working". A green
   badge that only reflects `Boolean(process.env.OPENAI_API_KEY)` says the
   variable exists, which is not the same thing as the key working — a revoked
   key, or an account that has not been verified for image generation, both
   look identical until something is actually asked of them. */
function runEngineTest(host) {
  host.innerHTML = `<p class="hint">Testing…</p>`;
  busy(async () => {
    let r;
    try { r = await api("social-engine-test"); }
    catch (e) {
      host.innerHTML = `<div class="findings"><div class="finding error">
        <strong>test failed</strong> — ${esc(e.message)}</div></div>`;
      return;
    }
    const e = r.engine || {}, refs = r.references || {};
    const row = (ok, label, detail) =>
      `<div class="finding ${ok ? "" : "error"}" style="${ok
        ? "background:var(--blue-wash);border-color:var(--blue-band-line);color:var(--ink)" : ""}">
        <strong>${ok ? "✓" : "✗"} ${esc(label)}</strong>${detail ? " — " + detail : ""}</div>`;

    host.innerHTML = `
      <div class="findings">
        ${row(e.keyPresent, "OPENAI_API_KEY is set")}
        ${row(e.reachable, "api.openai.com is reachable from the function")}
        ${row(e.authOk, `the key authenticates against ${esc(e.orchestratorModel || "")}`,
          e.latencyMs ? `${e.latencyMs}ms` : "")}
        ${e.imageToolAvailable === null
          ? ""
          : row(e.imageToolAvailable, `${esc(e.imageModel || "")} is available to this account`,
              e.availableImageModels && e.availableImageModels.length
                ? "available here: " + e.availableImageModels.map(m => `<code>${esc(m)}</code>`).join(" ")
                : "")}
        ${row(refs.ok, `${refs.count || 0} reference files deployed`,
          refs.missing && refs.missing.length
            ? refs.missing.map(m => `<code>${esc(m.expected)}</code>`).join(" ") : "")}
      </div>
      <p style="margin:10px 0 0"><strong>${r.ready ? "Ready." : "Not ready."}</strong>
        ${esc(r.summary || "")}</p>
      ${r.next ? `<p class="hint" style="margin:6px 0 0"><strong>Next:</strong> ${esc(r.next)}</p>` : ""}`;
    toast(r.ready ? "Image engine is working." : "Image engine is not ready.", !r.ready);
  });
}

/* ---- a status list -----------------------------------------------------
   Deleting a rejected package used to be available ONLY after opening it,
   which is the wrong place for it: the Rejected tab is a list of things you
   have already decided about, and making somebody open each one to clear it
   is why the list never got cleared. The button is on the row. */
function renderList(view, status) {
  busy(async () => {
    const r = await api("social-list", { query: { status } });
    state.packages = r.packages;
    const rejected = status === "REJECTED";

    view.innerHTML = r.packages.length ? `
      ${rejected ? `<p class="hint" style="margin:0 0 12px">
        ${r.packages.length} rejected package${r.packages.length === 1 ? "" : "s"}.
        Deleting one removes it and the social images it generated, for good.
        The guide, its illustration and every shared reference asset are untouched.</p>` : ""}
      <div class="rows">${r.packages.map(p => `
        <div class="row">
          <span></span>
          <span>
            <span class="t">${esc(p.guideTitle)}</span>
            <span class="tag ${tagClass(p.status)}">${esc(label(p.status))}</span>
            ${p.isTest ? `<span class="tag test">test</span>` : ""}
            ${errorCount(p) ? `<span class="tag err">${errorCount(p)} to fix</span>` : ""}
            <span class="m">${esc(p.guideSlug || "")} · ${p.slides ? p.slides.length : 0} slides ·
              suggested ${when(p.scheduledFor)}
              ${p.approvedAt ? ` · approved ${when(p.approvedAt)}` : ""}
              ${p.rejectedReason ? ` · “${esc(p.rejectedReason)}”` : ""}</span>
          </span>
          <span class="acts">
            <button class="btn tiny ghost" data-open="${esc(p.id)}">Open</button>
            ${rejected ? `<button class="btn tiny warn" data-del="${esc(p.id)}"
              data-slug="${esc(p.guideSlug)}" data-title="${esc(p.guideTitle)}">Delete permanently…</button>` : ""}
          </span>
        </div>`).join("")}</div>`
      : `<div class="empty">${emptyFor(status)}</div>`;

    $$("#view [data-open]").forEach(b => b.addEventListener("click", () => openPackage(b.dataset.open)));
    $$("#view [data-del]").forEach(b => b.addEventListener("click", () => deletePackage({
      id: b.dataset.del, guideSlug: b.dataset.slug, guideTitle: b.dataset.title, status: "REJECTED"
    }, () => renderList(view, status))));
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
  const story = state.surface === "story";
  const frames = story ? ((p.story && p.story.frames) || []) : (p.slides || []);
  const idx = Math.min(state.slide, Math.max(0, frames.length - 1));
  const findings = p.validation || [];
  const errs = findings.filter(f => f.level === "error");
  const held = p.status === "APPROVED_HELD";
  const plat = (p.platforms && p.platforms[state.platform]) || null;
  const dest = p.destination || "both";
  const active = dest === "both" || dest === state.platform;

  view.innerHTML = `
    <div class="bar">
      <button class="btn quiet" id="back">← All packages</button>
      <strong style="flex:1 1 auto">${esc(p.guideTitle)}</strong>
      <span class="tag ${tagClass(p.status)}">${esc(label(p.status))}</span>
      ${p.isTest ? `<span class="tag test">test package</span>` : ""}
      <a class="btn tiny ghost" href="${esc(p.guidePath)}" target="_blank" rel="noopener">Open the guide ↗</a>
    </div>

    <div class="bar" style="margin-top:-4px">
      <span class="fldlbl">Destination</span>
      ${["instagram", "facebook", "both"].map(d =>
        `<button class="btn tiny ${dest === d ? "" : "quiet"}" data-dest="${d}">${
          d === "both" ? "Instagram + Facebook" : d[0].toUpperCase() + d.slice(1)}</button>`).join("")}
    </div>

    ${held ? `<div class="held">Approved and held for ${esc(dest === "both" ? "Instagram and Facebook" : dest)}.
      Publishing is disabled, there is no scheduler, and nothing will send this. Editing it below returns it to review.</div>` : ""}

    ${artworkBar(p)}

    <div class="pkg" style="margin-top:12px">
      <div class="stage">
        <div class="bar" style="margin:0 0 10px">
          ${["instagram", "facebook"].map(pl =>
            `<button class="btn tiny ${state.platform === pl ? "" : "quiet"}" data-plat="${pl}">${
              pl[0].toUpperCase() + pl.slice(1)}</button>`).join("")}
          <span style="flex:1 1 auto"></span>
          ${["feed", "story"].map(sf =>
            `<button class="btn tiny ${state.surface === sf ? "" : "quiet"}" data-surface="${sf}">${
              sf === "feed" ? (state.platform === "facebook" ? "Feed 4:5" : "Carousel 4:5") : "Story / Reel 9:16"}</button>`).join("")}
        </div>

        ${active ? "" : `<p class="notewarn">This package is not going to ${esc(state.platform)} —
          the destination above is set to ${esc(dest)}. The preview still works so you can compare.</p>`}

        <div class="frame" id="frame"></div>
        <div class="nav">
          <button class="btn tiny quiet" id="prev" ${idx === 0 ? "disabled" : ""}>←</button>
          <span class="pos">${frames.length ? idx + 1 : 0} / ${frames.length}</span>
          <button class="btn tiny quiet" id="next" ${idx >= frames.length - 1 ? "disabled" : ""}>→</button>
        </div>
        <div class="dots">${frames.map((f, i) =>
          `<button data-go="${i}" aria-current="${i === idx}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>
        <p id="fit" class="fitline"></p>

        ${frames[idx] && (frames[idx].variants || []).length > 1 ? `
        <div class="bar" style="margin:10px 0 0">
          <span class="fldlbl">Layout</span>
          ${frames[idx].variants.map(v =>
            `<button class="btn tiny ${frames[idx].variant === v ? "" : "quiet"}" data-variant="${esc(v)}">${esc(v)}</button>`).join("")}
        </div>
        <p class="hint">Changing the layout does not change a word — only how it is composed.</p>` : ""}

        <div class="future" style="margin-top:14px;border-top:1.5px solid var(--line-soft);padding-top:12px">
          <button class="btn tiny quiet" disabled title="Not configured in this phase">Create animated version</button>
          <span class="badge-later">Coming later</span>
          <p class="hint">Reels are 1080×1920. An animation would start from this approved illustration and keep the
            same characters, faces, clothes and style — see SOCIAL-README.md.</p>
        </div>
      </div>

      <div>
        ${findings.length ? `<div class="findings">${findings.map(f =>
          `<div class="finding ${esc(f.level)}"><strong>${esc(f.code)}</strong> — ${esc(f.message)}
           ${f.detail ? `<br><code>${esc(f.detail)}</code>` : ""}</div>`).join("")}</div>` : ""}

        ${slideEditor(p, idx)}

        <div class="panelbox">
          <h3>${esc(state.platform[0].toUpperCase() + state.platform.slice(1))} copy</h3>
          ${plat ? `<p class="hint" style="margin:0 0 8px">${esc(plat.notes)}</p>
            <pre class="platcopy">${esc(plat.caption)}</pre>
            <p class="hint">${plat.linkIsClickable
              ? `Clickable link: <code>${esc(plat.link)}</code>`
              : `Link is not clickable here — the caption says “${esc(plat.link)}”.`}
              · ${plat.caption.length} characters (comfortable up to ${plat.limits.comfortable})</p>` : ""}
          <label class="fld" for="caption">Shared caption — both platforms are built from this</label>
          <textarea id="caption" style="min-height:170px">${esc(p.caption)}</textarea>
          <label class="fld" for="hashtags">Hashtags</label>
          <input class="text" id="hashtags" value="${esc((p.hashtags || []).join(" "))}">
          <label class="fld" for="when">Suggested date and time (UTC)</label>
          <input class="text" id="when" type="datetime-local" value="${esc(toLocalInput(p.scheduledFor))}">
          <label class="fld">Destination URL</label>
          <p style="margin:0;font-size:.8rem;word-break:break-all"><code>${esc(p.destinationUrl)}</code></p>
        </div>

        <div class="actions">
          <button class="btn" id="save">Save changes</button>
          <button class="btn go" id="approve" ${errs.length ? "disabled title='Fix the errors above first'" : ""}>Approve &amp; hold</button>
          <button class="btn warn" id="reject">Reject…</button>
          ${held ? `<button class="btn quiet" id="unapprove">Return to editing</button>` : ""}
          <button class="btn quiet" id="regen">Regenerate from the guide</button>
          <button class="btn quiet" id="dry">Show the payload it would send</button>
          ${p.status === "REJECTED"
            ? `<button class="btn warn" id="delete">Delete permanently…</button>` : ""}
        </div>
      </div>
    </div>`;

  paintFrame(frames[idx], story);

  $("#back").addEventListener("click", () => { state.current = null; render(); });
  $$("#view [data-plat]").forEach(b => b.addEventListener("click", () => {
    state.platform = b.dataset.plat; render();
  }));
  $$("#view [data-surface]").forEach(b => b.addEventListener("click", () => {
    state.surface = b.dataset.surface; state.slide = 0; render();
  }));
  $$("#view [data-dest]").forEach(b => b.addEventListener("click", () => {
    state.current = Object.assign({}, p, { destination: b.dataset.dest });
    render(); toast("Destination changed. Press Save to keep it.");
  }));
  $$("#view [data-variant]").forEach(b => b.addEventListener("click", () => {
    const list = story ? p.story.frames : p.slides;
    list[idx] = Object.assign({}, list[idx], { variant: b.dataset.variant });
    render(); toast("Layout changed. Press Save to keep it.");
  }));
  $("#prev").addEventListener("click", () => { state.slide = Math.max(0, idx - 1); render(); });
  $("#next").addEventListener("click", () => { state.slide = Math.min(frames.length - 1, idx + 1); render(); });
  $$("#view [data-go]").forEach(b => b.addEventListener("click", () => { state.slide = Number(b.dataset.go); render(); }));

  const artAll = $("#artAll");
  if (artAll) artAll.addEventListener("click", () => artwork({}, "Generating artwork"));
  const artOne = $("#artOne");
  if (artOne) artOne.addEventListener("click", () => artwork(
    { only: [(story ? "story:" : "slide:") + idx], regenerateArtwork: true },
    "Regenerating this frame's artwork"));

  const del = $("#delete");
  if (del) del.addEventListener("click", () => deletePackage(p));

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


/* ---- artwork state ------------------------------------------------------
   Four states and a Retry button, and deliberately NO automatic retry: a loop
   that re-requests a failed image on a timer is a loop that spends money while
   nobody is watching. The state is what the server last wrote, the error is
   shown in full, and pressing the button is the only thing that tries again. */
const ART_LABEL = {
  QUEUED: "Queued — the artwork has not been generated yet.",
  GENERATING: "Generating…",
  READY: "Artwork ready.",
  FAILED: "Artwork generation failed."
};

function artworkBar(p) {
  const a = p.artwork || { status: "QUEUED" };
  const st = a.status || "QUEUED";
  const engine = (state.status && state.status.artwork) || {};
  const generated = countGenerated(p);
  const total = (p.slides || []).length + (((p.story || {}).frames) || []).length;

  return `<div class="artbar is-${esc(st.toLowerCase())}">
    <span class="tag ${st === "READY" ? "held" : st === "FAILED" ? "rejected" : "review"}">${esc(st)}</span>
    <span class="m">${esc(ART_LABEL[st] || st)}
      ${generated}/${total} frame${total === 1 ? "" : "s"} carry generated artwork;
      the rest use the composed approved-artwork layout.</span>
    ${a.error ? `<span class="m" style="color:var(--red-ink)">${esc(a.error)}</span>` : ""}
    ${a.imageModel ? `<span class="m">model <code>${esc(a.imageModel)}</code> ·
      prompt <code>${esc(a.promptVersion || "—")}</code> ·
      manifest <code>${esc(a.manifestVersion || "—")}</code></span>` : ""}
    <span class="acts">
      ${engine.engineConfigured === false
        ? `<span class="badge-later">no image engine configured</span>`
        : `<button class="btn tiny ghost" id="artAll">${st === "FAILED" ? "Retry artwork" : "Generate artwork"}</button>
           <button class="btn tiny quiet" id="artOne">Regenerate this frame's artwork</button>`}
    </span>
  </div>`;
}

function countGenerated(p) {
  const has = (f) => f && f.art && f.art.assetUrl && !f.art.strayText;
  return (p.slides || []).filter(has).length + ((((p.story || {}).frames) || []).filter(has).length);
}

function artwork(body, what) {
  busy(async () => {
    toast(what + "… this can take a minute.");
    const r = await api("social-artwork", { method: "POST", body: Object.assign({ id: state.current.id }, body) });
    const bad = (r.results || []).filter(x => x.status === "FAILED" || x.status === "REJECTED");
    if (bad.length) {
      toast(bad.map(x => `${x.id}: ${x.error || x.status}`).join(" · "), true);
    } else {
      toast(r.note || `${r.counts.generated} generated, ${r.counts.cached} reused.`);
    }
    if (r.approvalCleared) toast("Approval cleared — the artwork changed.", true);
    await refresh(); openPackage(state.current.id);
  });
}

/* ---- the slide editor, with the guide's own words beside it ------------ */
/* A slide is a headline of coloured lines, an optional kicker, a set of short
   labels, a band and a call to action. Same shape for the carousel and the
   Story, so there is one editor rather than two. */
function slideEditor(p, idx) {
  const story = state.surface === "story";
  const s = story ? ((p.story && p.story.frames) || [])[idx] : (p.slides || [])[idx];
  if (!s) return "";

  /* The colours a headline piece may take. Names, not values — templates.js
     owns what they look like, and the poster palette is not the site palette. */
  const COLOURS = ["ink", "blue", "orange", "cream", "red", "yellow"];

  const lines = (s.lines || []).map((l, i) => `
    <div class="lineedit">
      <input class="text" data-line="${i}" value="${esc(l.t)}">
      <select data-colour="${i}">${COLOURS.map(c =>
        `<option value="${c}"${l.c === c ? " selected" : ""}>${c}</option>`).join("")}</select>
    </div>`).join("");

  /* The object clue beside each label is the SAME inline drawing the renderer
     puts on the slide — templates.js objectSVG(). There is no icon directory
     to keep in step, and the chip cannot show something the poster will not. */
  const items = (s.items || []).map((it, i) => `
    <div class="lineedit">
      <input class="text" data-item="${i}" value="${esc(it.label)}">
      <span class="iconchip" title="${esc(it.icon || "no matching object — this label is numbered instead")}">${
        it.icon && T.objectSVG(it.icon) ? T.objectSVG(it.icon) : `<span class="noicon">—</span>`}</span>
    </div>`).join("");

  return `<div class="panelbox">
    <h3>${story ? "Story frame" : "Slide"} ${idx + 1}
      <small>${esc(s.family)}${s.variant ? " · " + esc(s.variant) : ""}${s.sourceField ? " · from " + esc(s.sourceField) : ""}</small></h3>
    <div class="sidebyside">
      <div>
        ${s.kicker !== undefined && s.kicker !== "" ? `<label class="fld">Category cue</label>
          <input class="text" data-field="kicker" value="${esc(s.kicker)}">` : ""}
        <label class="fld">Headline</label>${lines}
        ${items ? `<label class="fld">Labels — ${(s.items || []).length} of a maximum four</label>${items}` : ""}
        ${s.band ? `<label class="fld">Band</label><input class="text" data-field="band" value="${esc(s.band)}">` : ""}
        ${s.cta ? `<label class="fld">Call to action</label><input class="text" data-field="cta" value="${esc(s.cta)}">` : ""}
      </div>
      ${sourceBox(s.sourceText, "The guide's own words")}
    </div>

    ${story ? "" : `
    <label class="fld">Slides</label>
    <div class="slidelist">${(p.slides || []).map((x, i) => `
      <div class="slideitem ${i === idx ? "is-current" : ""}">
        <span class="k">${i + 1} ${esc(x.family)}</span>
        <span>${esc((x.lines || []).map(l => l.t).join(" ").slice(0, 44))}</span>
        <span class="acts">
          ${x.movable !== false ? `
            <button class="btn tiny quiet" data-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="btn tiny quiet" data-down="${i}" ${i === p.slides.length - 1 ? "disabled" : ""}>↓</button>` : ""}
          ${x.optional ? `<button class="btn tiny warn" data-remove="${i}">Remove</button>`
                       : `<span class="locked">${x.family === "warn" ? "safety — kept" : "fixed"}</span>`}
        </span>
      </div>`).join("")}</div>
    <p class="hint">The hook and the closing slide stay where they are. The warning slide cannot be removed.</p>`}
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
  const story = state.surface === "story";
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
    const s = story ? ((p.story && p.story.frames) || [])[idx] : (p.slides || [])[idx];
    if (!s) return;
    $$("#view [data-field]").forEach(el => { s[el.dataset.field] = el.value; });
    $$("#view [data-line]").forEach(el => {
      const l = (s.lines || [])[Number(el.dataset.line)];
      if (l) l.t = el.value;
    });
    $$("#view [data-colour]").forEach(el => {
      const l = (s.lines || [])[Number(el.dataset.colour)];
      if (l) l.c = el.value;
    });
    $$("#view [data-item]").forEach(el => {
      const it = (s.items || [])[Number(el.dataset.item)];
      if (it) it.label = el.value;
    });
    paintFrame(s, story);
  };
  $$("#view [data-field], #view [data-line], #view [data-item]")
    .forEach(el => el.addEventListener("input", debounce(live, 220)));
  $$("#view [data-colour]").forEach(el => el.addEventListener("change", live));
}

/* ---- the preview frame ------------------------------------------------- */
function paintFrame(frame, isStory) {
  const host = $("#frame");
  if (!host || !frame) { if (host) host.innerHTML = ""; return; }
  const W = 1080, H = isStory ? 1920 : 1350;
  const assets = frameAssets(frame);
  const html = isStory
    ? T.storyHTML(frame, { assets })
    : T.slideHTML(frame, { assets, index: state.slide, total: (state.current.slides || []).length });

  host.innerHTML = `<div class="scaler" style="width:${W}px;height:${H}px">${html}</div>`;

  if (!document.getElementById("mpc-slide-css")) {
    const st = document.createElement("style");
    st.id = "mpc-slide-css";
    st.textContent = ":root{--paper-img:url('/assets/img/paper.jpg')}" + T.css();
    document.head.appendChild(st);
  }
  /* The brush filters are SVG and have to exist in the document, once. */
  if (!document.getElementById("mpc-filters")) {
    const holder = document.createElement("div");
    holder.id = "mpc-filters";
    holder.innerHTML = T.FILTERS;
    document.body.appendChild(holder);
  }

  const avail = Math.min(host.clientWidth || W, host.parentElement ? host.parentElement.clientWidth : W);
  const scale = Math.min(1, (avail || W) / W);
  const scaler = host.firstElementChild;
  scaler.style.transform = `scale(${scale})`;
  host.style.height = Math.round(H * scale) + "px";

  /* The check only a browser can do: do the WORDS fall outside the slide? The
     torn sheets and the cutouts bleed past the edge on purpose. */
  requestAnimationFrame(() => {
    const el = scaler.querySelector(".mpc-slide");
    if (!el) return;
    const box = el.getBoundingClientRect();
    let worst = 0;
    el.querySelectorAll(".s-hl, .s-band, .s-tag, .s-kicker, .s-num").forEach(n => {
      const r = n.getBoundingClientRect();
      if (!r.width && !r.height) return;
      worst = Math.max(worst,
        (r.bottom - box.bottom) / scale, (r.right - box.right) / scale,
        (box.top - r.top) / scale, (box.left - r.left) / scale);
    });
    worst = Math.round(Math.max(0, worst));
    const fit = $("#fit");
    if (fit) {
      fit.textContent = worst
        ? `⚠ Text falls outside the slide by ${worst}px — shorten it or change the layout.`
        : `Fits. ${W}×${H}, exports as JPEG.`;
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
    destination: p.destination || "both",
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

/* Permanent deletion. Available only on a REJECTED package — the button is
   not rendered otherwise, and the server refuses anyway, which is the check
   that matters. The confirmation names the guide and asks for its slug to be
   typed, because "are you sure?" on a list of rejects is a thing people click
   without reading. */
function deletePackage(p, after) {
  const typed = prompt(
    `Delete this package permanently?\n\n` +
    `Guide:  ${p.guideTitle}\n` +
    `Slug:   ${p.guideSlug}\n\n` +
    `The package and its generated social images are removed for good.\n` +
    `The guide, its illustration and every shared reference asset are untouched.\n\n` +
    `Type the slug to confirm:`, "");
  if (typed === null) return;
  if (String(typed).trim() !== p.guideSlug) return toast("That is not the slug. Nothing was deleted.", true);

  busy(async () => {
    const r = await api("social-delete", { method: "POST", body: { id: p.id, confirmSlug: p.guideSlug } });
    toast(`Deleted “${r.guideTitle}”. ${r.mediaRemoved} generated image${r.mediaRemoved === 1 ? "" : "s"} removed.`);
    await refresh();
    if (typeof after === "function") { paintCounts(); return after(); }
    state.current = null; state.tab = "REJECTED"; render();
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
      <h3>Image engine
        ${(s.artwork && s.artwork.engineConfigured)
          ? `<span class="tag held">key configured</span>`
          : `<span class="badge-later">no key configured</span>`}</h3>
      <p style="margin:0 0 6px">Model <code>${esc((s.artwork || {}).imageModel || "—")}</code> ·
        prompt <code>${esc((s.artwork || {}).promptVersion || "—")}</code> ·
        manifest <code>${esc((s.artwork || {}).manifestVersion || "—")}</code> ·
        ${(s.artwork || {}).referenceCount || 0} references.</p>
      <p style="margin:0 0 10px">Packages by artwork state —
        queued ${(s.artwork || {}).queued || 0} ·
        generating ${(s.artwork || {}).generating || 0} ·
        ready ${(s.artwork || {}).ready || 0} ·
        failed ${(s.artwork || {}).failed || 0}.</p>
      <button class="btn ghost" id="enginetest2">Test the connection</button>
      <div id="enginetestout2" style="margin-top:10px"></div>
    </div>

    <div class="panelbox">
      <h3>Refresh</h3>
      <button class="btn ghost" id="reload">Re-read guides and packages</button>
    </div>`;
  $("#enginetest2").addEventListener("click", () => runEngineTest($("#enginetestout2")));
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
