/* ============================================================================
   THE PUBLIC RUNTIME — the only script every public page loads.

   This replaces mpc-store.js on the public site. mpc-store.js is a CMS data
   layer: it boots the Firebase SDK, opens a Firestore connection and downloads
   the entire guides collection before a page can finish rendering. That is the
   right shape for Studio. It is the wrong shape for a reader who has already
   been served complete HTML from the CDN.

   Everything that used to arrive from Firestore at runtime — the editable
   wording, the footer lines, the hero illustrations, the topic pills, the
   books list — is now baked into the HTML by scripts/build.js from the same
   Firestore data, at deploy time, once, for everybody. So there is nothing
   left for this file to fetch.

   What remains is genuinely behavioural: the mobile nav, the header height
   variable the sticky layout needs, and the copyright year. Plus two helpers
   the page scripts share.

   No Firebase. No data. No network.
   ========================================================================== */
(function () {
  "use strict";

  var MPC = window.MPC = window.MPC || {};

  /* ---- escaping --------------------------------------------------------
     Page scripts build strings (result counts, empty states). Same behaviour
     as the old MPCStore.esc so nothing downstream had to change. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* The small amount of formatting Studio-authored text is allowed to carry.
     Kept identical to the old MPCStore.inline: [label](url) becomes a link,
     but only for same-site paths and http(s)/mailto, so a stray
     "javascript:" can never reach an href. *stars* become the cream
     highlight. Everything else is escaped. */
  function inline(text) {
    return esc(text)
      .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, function (whole, label, href) {
        return /^(https?:\/\/|mailto:|\/|[\w.-]+\.html|#)/i.test(href)
          ? '<a href="' + href + '">' + label + "</a>"
          : whole;
      })
      .replace(/\*([^*\n]+)\*/g, '<span class="hl">$1</span>');
  }

  /* ---- Studio-uploaded illustrations -----------------------------------
     Identical to the old MPCStore.img. Illustrations live in Firebase Storage
     and the older ones are full-size PNGs, so they are routed through
     Netlify's image CDN, which re-encodes them to WebP at display size.
     Only hosts listed under [images] in netlify.toml are transformed;
     anything else is handed back untouched.

     The build now writes these URLs into the HTML itself, so this is only
     needed by the page scripts that still build markup in the browser. */
  var REMOTE_IMG = /^https:\/\/firebasestorage\.googleapis\.com\//;
  MPC.img = function (url, width) {
    if (!url || !REMOTE_IMG.test(url)) return url || "";
    return "/.netlify/images?url=" + encodeURIComponent(url) +
           "&w=" + (width || 800) + "&fm=webp&q=78";
  };

  /* ---- illustrations fading in ------------------------------------------
     Text paints almost immediately now that the CSS travels inside the HTML,
     so an illustration landing a few hundred ms later pops rather than
     arrives. Adding .is-in on load runs the fade in style.css.

     Deliberately does nothing when the image is already complete: adding the
     class then would animate from transparent something the browser has
     already painted, which is a flash, not a fade. And nothing here is
     load-bearing — if this never runs, the illustrations appear exactly as
     they do now. */
  var ILLUS = ".hero-art img, .page-hero-art img, .about-art img, .band-art img";
  function fadeIllustrations() {
    var imgs = document.querySelectorAll(ILLUS);
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        if (img.complete && img.naturalWidth) return;   /* already painted */
        img.addEventListener("load", function () {
          /* .ready means the anti-flash gate has already revealed this image.
             Starting the keyframes now would animate opacity from 0 on
             something the reader can see — a blink, not a fade. The two
             mechanisms must never both own the reveal. */
          if (img.classList.contains("ready")) return;
          img.classList.add("is-in");
        }, { once: true });
      })(imgs[i]);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fadeIllustrations);
  } else {
    fadeIllustrations();
  }

  MPC.esc = esc;
  MPC.inline = inline;

  /* ---- filter pill state -----------------------------------------------
     One definition, because the home page and the browse/landing pages both
     light pills up and they must agree.

     The pills carried aria-pressed until they became links. aria-pressed is
     only allowed on a button, so on an anchor it is invalid ARIA — Lighthouse
     fails the page for it, and a screen reader may ignore it, which means the
     state it existed to announce was not dependably announced.

     data-on drives the styling (the CSS matches on it). aria-current="true"
     is allowed on a link and is how the current filter is announced; "not
     current" is expressed by the attribute being absent, not by ="false",
     so it is removed rather than set. Must match state() in
     scripts/lib/bake.js, which writes the same two attributes at build time. */
  MPC.pillState = function (el, on) {
    if (!el) return;
    el.setAttribute("data-on", String(!!on));
    if (on) el.setAttribute("aria-current", "true");
    else el.removeAttribute("aria-current");
  };

  /* ---- the baked-grid handshake ----------------------------------------
     The build writes real cards into each grid and stamps a hash of that list
     onto it. Before a page rebuilds a grid it asks: is what you were served
     already the right list? If so the DOM is left alone — no flash, no layout
     shift, no work. One-shot: cleared afterwards so a later filter or search
     always renders normally.

     Must match bakedHash() in scripts/build.js and hash() in guide-render.js. */
  function bakedHash(list) {
    var s = list.map(function (g) { return g.id + ":" + g.title; }).join("|");
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  MPC.bakedHash = bakedHash;
  MPC.gridAlreadyCorrect = function (el, list) {
    if (!el) return false;
    var baked = el.getAttribute("data-baked-hash");
    if (!baked) return false;
    el.removeAttribute("data-baked-hash");
    return baked === bakedHash(list);
  };

  /* ---- header ----------------------------------------------------------
     The mobile nav, and the --head-h custom property the sticky layout reads.
     Measured once, then only on resize and when the webfont lands (the nav is
     set in Patrick Hand, so its height changes when the font swaps in). */
  function initHeader() {
    var head = document.querySelector(".site-head");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    if (head) {
      var last = -1;
      var setH = function () {
        var h = head.offsetHeight;
        if (h === last) return;              // nothing changed: no style write
        last = h;
        document.documentElement.style.setProperty("--head-h", h + "px");
      };
      setH();
      /* ResizeObserver fires only when the header's box actually changes,
         which covers resize, orientation change and the font swap in one
         callback instead of three listeners each forcing their own layout. */
      if (window.ResizeObserver) {
        new ResizeObserver(setH).observe(head);
      } else {
        window.addEventListener("resize", setH);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(setH);
      }
    }

    /* Mark the document once Patrick Hand has actually rendered.

       Patrick Hand ships in one weight, so guide headlines fake bold with
       -webkit-text-stroke. That stroke is calibrated for a thin handwritten
       face. When the font fails to arrive and the browser draws the fallback
       instead, the same stroke lands on a system font that is already normal
       weight, and the headline comes out looking doubled and outlined — which
       is far more obviously wrong than the substituted font alone.

       The stroke is now gated on this class, so a page that falls back renders
       plainly rather than badly. If document.fonts is unavailable the class is
       set anyway, keeping the intended appearance on older browsers. */
    (function markFontReady() {
      var html = document.documentElement;
      var ok = function () { html.classList.add("fonts-ready"); };
      if (!document.fonts || !document.fonts.load) { ok(); return; }
      try {
        document.fonts.load('1em "Patrick Hand"').then(function () {
          ok();
        }, ok);
      } catch (e) { ok(); }
    })();

    /* The Studio-edited copyright line writes its own year, so this span may
       already have been replaced by the time this runs. */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }

  /* ---- idle work -------------------------------------------------------
     Page scripts use this to keep anything non-essential off the critical
     path. Falls back to a timeout where requestIdleCallback is missing
     (Safari shipped it late). */
  MPC.idle = function (fn, timeout) {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(fn, { timeout: timeout || 2000 });
    } else {
      setTimeout(fn, 1);
    }
  };
})();
