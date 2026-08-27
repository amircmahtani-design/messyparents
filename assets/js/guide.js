/* ============================================================================
   GUIDE PAGE BEHAVIOUR

   A generated page at /guides/<slug>/ arrives from the CDN with the whole
   article already in it: the title, the panel, the quick answer, the red-flag
   list, the longer version, the related links, the schema. Nothing on this
   page needs JavaScript to exist.

   So this file does almost nothing, and that is the point.

   WHAT IT REPLACED

   Every guide page used to load five scripts:

     firebase-config.js     0.9KB
     guides.js            113KB   the complete catalogue, every article body
     guide-render.js       16KB
     mpc-store.js          21KB
     guide-page.js          7.6KB
                          ------
                          ~158KB of JavaScript, plus the Firebase SDK fetched
                          from gstatic, plus a Firestore connection, plus a
                          download of the entire guides collection — to display
                          one guide that was already on the page.

   At 300 guides the bundled catalogue alone would have been over a megabyte.

   Now: this file. The renderer is fetched only if something actually has to be
   re-rendered, which on a generated page is never.

   THE TWO CASES THAT STILL NEED DATA

   1. A guide added in Studio since the last deploy. It exists in Firestore but
      has no page yet, so _redirects rewrites it here with an empty #article.
      That fetches ONE document over the Firestore REST API — not the SDK, not
      the collection — and renders it. See SEO_AI_ARCHITECTURE.md → "HTTP
      status codes" for why this path exists at all.

   2. A generated page whose guide has been edited since the deploy. The build
      stamps a hash of what it rendered; this re-checks it ONCE PER SESSION,
      after the page has gone idle, with the same single-document read. If the
      hashes match — the normal case — nothing else happens and nothing is
      fetched again. It is a safety net for the window between saving in Studio
      and the rebuild finishing, not part of loading a page.

   Neither case loads the Firebase SDK. Neither reads the collection.
   ========================================================================== */
(function () {
  "use strict";

  var el = document.getElementById("article");
  if (!el) return;

  var MPC = window.MPC || {};

  /* ==========================================================================
     FIT-TO-SCREEN

     The guide is designed to be one screen. The panel is measured and gently
     scaled so the whole thing fits the viewport, and anything below it (the
     longer version, related links) stays below the fold and scrolls normally.

     This used to run on a timer: immediately, then on the next animation
     frame, then at 150ms, then at 450ms, then again on fonts.ready, on every
     resize event, on orientationchange, and once per image load. Each run
     cleared the transform and the height and then read scrollHeight, which
     forces a synchronous layout — so a single page load did the same expensive
     measurement six or seven times, most of them producing an identical
     answer.

     It now measures when something has actually changed, batched into one
     animation frame, with every read done before any write. A ResizeObserver
     on the panel covers what the timers were guessing at: the webfont
     swapping in, an illustration decoding, the column layout reflowing. The
     timers are gone.
     ========================================================================= */

  var IS_TOP = (function () {
    try { return window.top === window.self; } catch (e) { return true; }
  })();

  var panel = null;
  var natural = 0, naturalAtWidth = -1;   // cached intrinsic panel height
  var lastVW = -1, lastVH = -1;
  var queued = false;

  function apply() {
    queued = false;
    if (!IS_TOP) return;
    panel = el.querySelector(".gpanel");
    if (!panel) { if (el.style.height) el.style.height = ""; return; }

    /* ---- reads ---------------------------------------------------------
       All of them, together, before anything is written. One layout flush. */
    var vw = window.innerWidth, vh = window.innerHeight;
    var panelW = panel.clientWidth;

    if (panelW !== naturalAtWidth) {
      /* The intrinsic height is only unknown when the width changed or the
         content did. Clearing the transform is what makes scrollHeight
         truthful, so it is done here and nowhere else. */
      if (panel.style.transform) panel.style.transform = "";
      if (el.style.height) el.style.height = "";
      natural = panel.scrollHeight;
      naturalAtWidth = panelW;
    }

    var header = document.querySelector(".site-head");
    var headH = header ? header.offsetHeight : 0;
    var crumb = document.querySelector(".gpage-crumb");
    var crumbH = crumb ? crumb.offsetHeight : 0;

    lastVW = vw; lastVH = vh;

    /* ---- writes --------------------------------------------------------- */
    var avail = vh - headH - crumbH - 16;          // small breathing room
    if (natural > avail && avail > 0) {
      var scale = avail / natural;
      if (scale >= 0.8) {                          // gentle fit — never past ~20%
        panel.style.transformOrigin = "top center";
        panel.style.transform = "scale(" + scale + ")";
        el.style.height = Math.ceil(natural * scale) + "px";
        return;
      }
      /* Shrinking more than ~18% makes everything tiny. Leave it full size and
         let the page scroll a little instead. */
    }
    if (panel.style.transform) panel.style.transform = "";
    if (el.style.height) el.style.height = "";
  }

  function schedule(force) {
    if (force) naturalAtWidth = -1;                // content changed: re-measure
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }

  function onViewportChange() {
    /* iOS fires resize as the address bar collapses during a scroll. Height-
       only changes of a few pixels are that, not a real layout change. */
    if (window.innerWidth === lastVW && Math.abs(window.innerHeight - lastVH) < 60) return;
    schedule(window.innerWidth !== lastVW);
  }

  window.addEventListener("resize", onViewportChange, { passive: true });
  window.addEventListener("orientationchange", function () { schedule(true); }, { passive: true });

  /* Covers the webfont swap, an illustration finishing decode, and any reflow
     of the three columns — the things the old timers were sampling blindly. */
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { schedule(true); });
    var watch = function () {
      var p = el.querySelector(".gpanel");
      if (p) { ro.disconnect(); ro.observe(p); }
    };
    watch();
    window.__mpcWatchPanel = watch;
  } else if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { schedule(true); });
  }

  schedule(true);

  /* ==========================================================================
     RENDERING — only ever needed off the happy path.
     ========================================================================= */

  var renderer = null;
  /* The renderer is 16KB and a generated page never uses it, so it is fetched
     on demand rather than shipped. Same file the build uses, so what it draws
     is identical to what was baked — that is what stops the two surfaces
     drifting into something indistinguishable from cloaking. */
  function loadRenderer() {
    if (renderer) return renderer;
    renderer = new Promise(function (resolve, reject) {
      if (window.MPCRender) return resolve(window.MPCRender);
      var s = document.createElement("script");
      s.src = (window.MPC_ASSET_RENDER || "/assets/js/guide-render.js");
      s.onload = function () { resolve(window.MPCRender); };
      s.onerror = function () { reject(new Error("renderer failed to load")); };
      document.head.appendChild(s);
    });
    return renderer;
  }

  /* Site settings the renderer needs to match what the build produces: the
     editable wording, the topic labels and their pill icons. A few KB,
     generated by the build, fetched only on these off-path cases. */
  var settings = null;
  function loadSettings() {
    if (settings) return settings;
    settings = fetch("/data/site-settings.json", { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
    return settings;
  }

  function opts(cfg) {
    var text = (cfg && cfg.text) || {};
    var topics = (cfg && cfg.topics) || [];
    var icons = (cfg && cfg.icons) || {};
    var label = function (id) {
      for (var i = 0; i < topics.length; i++) if (topics[i].id === id) return topics[i].label;
      return id;
    };
    return {
      t: function (k, f) {
        var v = text[k];
        return (v == null || String(v).trim() === "") ? f : v;
      },
      topicLabel: label,
      iconHTML: "",
      iconFor: function (x) { return icons[x && x.topic] || ""; }
    };
  }

  function draw(g, R, cfg) {
    var o = opts(cfg);
    o.iconHTML = o.iconFor(g);
    el.className = "";
    el.innerHTML = R.panelMarkup(g, o);
    if (window.__mpcWatchPanel) window.__mpcWatchPanel();
    schedule(true);
  }

  function drawRelated(g, R, cfg, byId) {
    var host = document.querySelector(".gpage-related");
    if (!host) return;
    var list = (g.related || []).map(function (id) { return byId[id]; })
      .filter(Boolean);
    var o = opts(cfg);
    host.innerHTML = list.length ? R.relatedHTML(g, list, o) : "";
  }

  /* ==========================================================================
     FIRESTORE — one document, over REST, no SDK.

     guides is `allow read: if true` in firestore.rules, which is what lets the
     Netlify build read it with the same public key. The same applies here, so
     a single guide can be fetched with an ordinary GET. No 300KB of SDK, no
     persistent connection, no collection scan.
     ========================================================================= */

  var FS = window.MPC_FS || null;   // { p: projectId, k: apiKey }, written by the build

  function fsDoc(v) {
    if (v == null) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("timestampValue" in v) return v.timestampValue;
    if ("nullValue" in v) return null;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(fsDoc);
    if ("mapValue" in v) return fsFields(v.mapValue.fields || {});
    return null;
  }
  function fsFields(f) {
    var out = {};
    for (var k in f) if (Object.prototype.hasOwnProperty.call(f, k)) out[k] = fsDoc(f[k]);
    return out;
  }

  var BASE = FS
    ? "https://firestore.googleapis.com/v1/projects/" + FS.p + "/databases/(default)/documents"
    : "";

  /* By document id — which is what every slug is, unless one has been renamed
     in Studio. One request, a few KB. */
  function fetchGuideById(id) {
    if (!FS) return Promise.resolve(null);
    return fetch(BASE + "/guides/" + encodeURIComponent(id) + "?key=" + FS.k,
      { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.fields ? fsFields(j.fields) : null; })
      .catch(function () { return null; });
  }

  /* By slug, for a guide whose web address was changed after it was created.
     A structured query, still one request, still one document back. */
  function fetchGuideBySlug(slug) {
    if (!FS) return Promise.resolve(null);
    var body = {
      structuredQuery: {
        from: [{ collectionId: "guides" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "seo.slug" },
            op: "EQUAL",
            value: { stringValue: slug }
          }
        },
        limit: 1
      }
    };
    return fetch(BASE + ":runQuery?key=" + FS.k, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (!rows || !rows.length) return null;
        var doc = rows[0] && rows[0].document;
        return doc && doc.fields ? fsFields(doc.fields) : null;
      })
      .catch(function () { return null; });
  }

  function fetchGuide(key) {
    return fetchGuideById(key).then(function (g) {
      return g || fetchGuideBySlug(key);
    });
  }

  /* Related cards on a fallback render need their titles. The index is
     metadata only, so this is small and cached by the CDN. */
  function fetchIndexMap() {
    return fetch("/data/guide-index.json", { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : { guides: [] }; })
      .then(function (j) {
        var by = {};
        (j.guides || []).forEach(function (g) { by[g.id] = g; });
        return by;
      })
      .catch(function () { return {}; });
  }

  /* ==========================================================================
     STUDIO LIVE PREVIEW

     Unchanged behaviour: Studio pushes a draft in and the page draws it. This
     works on both surfaces so Studio can preview a saved guide on its real URL
     as well as an unsaved draft on guide.html.
     ========================================================================= */
  window.__renderPreview = function (drafted) {
    if (!drafted) return;
    Promise.all([loadRenderer(), loadSettings()]).then(function (r) {
      draw(drafted, r[0], r[1]);
    });
  };

  /* ==========================================================================
     WHICH GUIDE IS THIS, AND DOES ANYTHING NEED DOING
     ========================================================================= */

  var params = new URLSearchParams(location.search);
  if (params.get("draft")) return;        // Studio's unsaved-draft preview

  var prerendered = el.querySelector(".gpanel[data-guide-hash]");

  /* Same three ways to identify the guide, in the same order of reliability:
     baked in by the build, then ?id= from a legacy link, then the URL path —
     which is the safety net, because _redirects rewrites unknown slugs here
     and a rewrite leaves the browser URL alone. */
  var key = window.MPC_GUIDE_ID || params.get("id") ||
    (location.pathname.match(/^\/guides\/([^\/]+)\/?$/) || [])[1] || "";

  /* -------------------------------------------------------------------------
     CASE 1 — nothing was pre-rendered.

     Either a guide saved in Studio since the last deploy, or a slug that does
     not exist. Fetch the one document and find out which.
     ---------------------------------------------------------------------- */
  function renderFromScratch() {
    if (!key || !FS) return notFound();

    /* Look the guide up FIRST, and only then fetch the things needed to draw
       it. Two of the three reasons a request lands here are dead URLs — an old
       link, a typo, a crawler guessing — and there is no sense downloading a
       16KB renderer and the site settings to discover there is nothing to
       render. It also gets the not-found message on screen sooner. */
    fetchGuide(key)
      .then(function (g) {
        if (!g || !g.id) return notFound();
        return Promise.all([loadRenderer(), loadSettings(), fetchIndexMap()])
          .then(function (r) {
            var R = r[0], cfg = r[1], byId = r[2];
            document.title = (g.title || "Guide") + " \u2014 The Messy Parents Collection";
            draw(g, R, cfg);
            drawRelated(g, R, cfg, byId);
          });
      })
      .catch(notFound);
  }

  function notFound() {
    if (el.querySelector(".gpanel")) return;
    /* The URL looks like a real guide and returns 200, so without this a dead
       address could be indexed as though it were a page. Netlify cannot decide
       this — it does not know what is in Firestore — so the page marks itself. */
    var m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, follow";
    document.head.appendChild(m);
    document.title = "Guide not found \u2014 The Messy Parents Collection";
    el.className = "article wrap";
    el.innerHTML = '<div class="article-inner"><h1>We can\u2019t find that one</h1>' +
      '<p class="lede">The link may be old, or the guide may have been renamed.</p>' +
      '<p style="margin-top:14px"><a href="/guides.html">Browse all guides</a></p></div>';
  }

  /* -------------------------------------------------------------------------
     CASE 2 — the page was pre-rendered. The normal case, and the fast one.

     Nothing is fetched during load. Once the browser is idle, and once per
     session per guide, the hash is re-checked against live data so an edit
     made between saving in Studio and the rebuild finishing still reaches a
     reader. Skipped entirely on a metered or slow connection.
     ---------------------------------------------------------------------- */
  function freshnessCheck() {
    if (!FS || !key) return;
    if (window.MPC_LIVE_CHECK === false) return;

    var conn = navigator.connection || {};
    if (conn.saveData) return;
    if (/^(slow-)?2g$/.test(conn.effectiveType || "")) return;

    var baked = prerendered.getAttribute("data-guide-hash");

    /* How often this may re-ask. The check is one small REST GET, so the gate
       is here to keep it off the hot path — not to make it a one-shot.
       "Once per session" was doing the latter: open a guide, edit it in
       Studio, reload the tab, and the mark was already set, so the page went
       on serving the old deploy until the tab was closed. That is the exact
       window this check exists to cover.

       Now: re-check when the served HTML changed (a deploy landed), when the
       reader explicitly reloaded, or when the last check has aged out. */
    var TTL_MS = 60000;
    var RELOADED = (function () {
      try {
        var nav = performance.getEntriesByType("navigation")[0];
        if (nav) return nav.type === "reload";
        return performance.navigation && performance.navigation.type === 1;
      } catch (e) { return false; }
    })();

    var mark = "mpc.fresh." + key;
    try {
      var prev = sessionStorage.getItem(mark);
      if (prev && !RELOADED) {
        var bits = prev.split("|");
        var sameBuild = bits[0] === baked;
        var fresh = (Date.now() - Number(bits[1] || 0)) < TTL_MS;
        if (sameBuild && fresh) return;
      }
      sessionStorage.setItem(mark, baked + "|" + Date.now());
    } catch (e) { /* private mode — check anyway, just do not persist */ }

    /* Deliberately fetchGuideById, not fetchGuide. On a generated page the id
       was baked in by the build, so the document lookup is exact and the
       slug-query fallback can only ever be a wasted second request — and this
       is a bonus check on a page that is already correct and already rendered.
       If the one lookup does not answer, that is the end of it. */
    var lookup = window.MPC_GUIDE_ID
      ? fetchGuideById(window.MPC_GUIDE_ID)
      : fetchGuide(key);

    lookup.then(function (g) {
      if (!g || !g.id) return;
      return loadRenderer().then(function (R) {
        if (R.guideHash(g) === baked) return;    // deployed HTML is current
        /* Firestore has moved on since the last deploy. Catch the page up and
           leave a marker the SEO audit reports on. */
        document.documentElement.setAttribute("data-mpc-stale", "1");
        return Promise.all([loadSettings(), fetchIndexMap()]).then(function (r) {
          draw(g, R, r[0]);
          drawRelated(g, R, r[0], r[1]);
        });
      });
    }).catch(function () { /* the served page is fine; this was a bonus */ });
  }

  if (prerendered) {
    if (MPC.idle) MPC.idle(freshnessCheck, 4000);
    else setTimeout(freshnessCheck, 1200);
  } else {
    renderFromScratch();
  }
})();
