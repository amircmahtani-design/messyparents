/* ============================================================================
   GUIDE PAGE BEHAVIOUR

   Runs on both surfaces:

     - /guides/<slug>/     a page the build already rendered. The markup is
                           complete before this file loads. All this does is
                           fit the panel to the screen and, in the rare case
                           that Firestore has moved on since the last deploy,
                           quietly redraw.
     - /guide.html?draft=1 the Studio preview of an unsaved guide, which has
                           nothing in it until Studio pushes a draft in.

   The redraw is deliberately conditional. The build stamps a hash of what it
   rendered onto the panel; this recomputes the same hash from live data and
   only touches the DOM when they differ. On a normal visit nothing is
   replaced, so there is no flash and no layout shift — the page a reader sees
   is the HTML that arrived over the wire, which is also exactly what a crawler
   sees.
   ========================================================================== */
(function () {
  "use strict";

  var el = document.getElementById("article");
  if (!el) return;

  var R = window.MPCRender;

  /* ---- Fit-to-screen ----------------------------------------------------
     Measure the real guide and scale it so the whole thing (header + guide)
     fits the viewport on any screen. Only the panel is measured, so anything
     rendered below it stays below the fold and scrolls normally.
     Never runs inside the Studio preview iframe. */
  var IS_TOP = (function () {
    try { return window.top === window.self; } catch (e) { return true; }
  })();

  function fitGuide() {
    if (!IS_TOP) return;
    var panel = el.querySelector(".gpanel");
    if (!panel) { el.style.height = ""; return; }
    panel.style.transformOrigin = "top center";
    panel.style.transform = "";
    el.style.height = "";
    var header = document.querySelector(".site-head");
    var headH = header ? header.getBoundingClientRect().height : 0;
    var crumb = document.querySelector(".gpage-crumb");
    var crumbH = crumb ? crumb.getBoundingClientRect().height : 0;
    var avail = window.innerHeight - headH - crumbH - 16;   // small breathing room
    var natural = panel.scrollHeight;
    if (natural > avail && avail > 0) {
      var scale = avail / natural;
      if (scale >= 0.8) {                 // gentle fit — never shrink past ~20%
        panel.style.transform = "scale(" + scale + ")";
        el.style.height = Math.ceil(natural * scale) + "px";
      }
      // if it would shrink more than ~18%, leave full size and let the page
      // scroll a little instead of making everything tiny.
    }
  }

  function scheduleFit() {
    fitGuide();
    requestAnimationFrame(fitGuide);
    setTimeout(fitGuide, 150);
    setTimeout(fitGuide, 450);
  }

  window.addEventListener("resize", fitGuide);
  window.addEventListener("orientationchange", scheduleFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitGuide);

  /* ---- shared render options ------------------------------------------- */

  function opts(g) {
    return {
      t: function (k, f) { return window.MPCStore ? MPCStore.t(k, f) : f; },
      iconHTML: g && window.ICONS ? (ICONS[g.topic] || "") : "",
      topicLabel: function (id) {
        return window.topicById ? topicById(id).label : id;
      },
      iconFor: function (x) { return window.ICONS ? (ICONS[x.topic] || "") : ""; }
    };
  }

  function draw(g) {
    el.className = "";
    el.innerHTML = R.panelMarkup(g, opts(g));
    var imgs = el.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      if (!imgs[i].complete) imgs[i].addEventListener("load", fitGuide, { once: true });
    }
    scheduleFit();
  }

  /* Keep "Read next" in step when a redraw happens (Studio edit, or live data
     that has moved past the last deploy). */
  function drawRelated(g) {
    var host = document.querySelector(".gpage-related");
    if (!host || !window.guideById) return;
    var list = (g.related || []).map(guideById).filter(Boolean);
    host.innerHTML = list.length ? R.relatedHTML(g, list, opts(g)) : "";
  }

  /* ---- Studio live preview ---------------------------------------------
     Always available, on both surfaces, so Studio can preview a saved guide on
     its real URL as well as an unsaved draft on guide.html. */
  window.__renderPreview = function (drafted) {
    if (!drafted) return;
    draw(drafted);
  };

  /* ---- the real page ---------------------------------------------------- */

  if (!window.MPCStore) return;

  MPCStore.ready.then(function () {
    var params = new URLSearchParams(location.search);

    // Studio "new guide" preview: leave whatever __renderPreview drew.
    if (params.get("draft")) { scheduleFit(); return; }

    /* Three ways to know which guide this is, in order of reliability:
         - baked in by the build (a generated page)
         - ?id= (a legacy link, before _redirects catches it)
         - the URL path itself

       The last one is the safety net. If the build ever fails to write the
       generated pages, _redirects falls back to rewriting /guides/<slug>/ to
       this file — and a rewrite leaves the browser URL alone, so the slug can
       only be read from the path. That keeps every clean URL working even on
       a broken deploy. */
    var id = window.MPC_GUIDE_ID || params.get("id") ||
      (location.pathname.match(/^\/guides\/([^\/]+)\/?$/) || [])[1] || "";
    var g = null;
    if (id && window.GUIDES) {
      g = GUIDES.filter(function (x) { return x.id === id; })[0] ||
          GUIDES.filter(function (x) { return (x.slug || x.id) === id; })[0] || null;
    }

    if (!g) {
      // A generated page always has its guide, so this can only be a legacy
      // link, or a slug that does not exist, reaching the fallback rewrite.
      if (!el.querySelector(".gpanel")) {
        /* The URL looks like a real guide and returns 200, so without this a
           dead address could be indexed as though it were a page. Netlify
           cannot decide this — it does not know what is in Firestore — so the
           page has to mark itself. */
        var m = document.createElement("meta");
        m.name = "robots";
        m.content = "noindex, follow";
        document.head.appendChild(m);
        document.title = "Guide not found — The Messy Parents Collection";
        el.className = "article wrap";
        el.innerHTML = '<div class="article-inner"><h1>We can\u2019t find that one</h1>' +
          '<p class="lede">The link may be old, or the guide may have been renamed.</p>' +
          '<p style="margin-top:14px"><a href="/guides.html">Browse all guides</a></p></div>';
      }
      return;
    }

    var prerendered = el.querySelector(".gpanel[data-guide-hash]");

    if (prerendered) {
      // The common case: the deployed HTML is current. Touch nothing.
      if (prerendered.getAttribute("data-guide-hash") === R.guideHash(g)) {
        scheduleFit();
        return;
      }
      // Firestore has moved on since the last deploy. Catch the page up, and
      // leave a marker the SEO audit can report on.
      document.documentElement.setAttribute("data-mpc-stale", "1");
    } else {
      document.title = g.title + " \u2014 The Messy Parents Collection";
    }

    draw(g);
    drawRelated(g);

    // Studio edits to the guide layout wording redraw the guide immediately.
    window.addEventListener("mpc:textchange", function () { draw(g); drawRelated(g); });
  });
})();
