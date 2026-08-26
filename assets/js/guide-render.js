/* ============================================================================
   THE GUIDE RENDERER — shared by the build and the browser.

   This file runs in two places:

     - Node, during the Netlify build, to write the real HTML that lands at
       /guides/<slug>/index.html and that Google, Bingbot and OAI-SearchBot
       read.
     - The browser, to redraw a guide when Studio pushes a live edit, and to
       refresh a built page if Firestore has moved on since the last deploy.

   It is one file on purpose. If the server and the client each had their own
   copy of this markup they would drift, and a drifted copy is indistinguishable
   from cloaking: bots would see one page and readers another. Sharing the
   function makes them identical by construction.

   No dependencies, no DOM access, no framework. Give it a guide and some
   options, get a string back.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MPCRender = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---- small helpers --------------------------------------------------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Illustrations uploaded through Studio live in Firebase Storage and are
     routed through Netlify's image CDN, exactly as MPCStore.img does. Anything
     else (a local asset, a data: URI) is handed back untouched. */
  var REMOTE_IMG = /^https:\/\/firebasestorage\.googleapis\.com\//;
  function img(url, width) {
    if (!url || !REMOTE_IMG.test(url)) return url || "";
    return "/.netlify/images?url=" + encodeURIComponent(url) +
           "&w=" + (width || 800) + "&fm=webp&q=78";
  }

  /* Pages now live at /guides/<slug>/, two levels deep, so every asset path
     has to be root-absolute. A path that is already absolute, external or a
     data URI is left alone. */
  function assetPath(p) {
    if (!p) return "";
    if (/^(https?:|data:|\/|#)/i.test(p)) return p;
    return "/" + p.replace(/^\.?\//, "");
  }

  function guideUrl(g) {
    var slug = (g && (g.slug || g.id)) || "";
    return "/guides/" + slug + "/";
  }

  /* A tiny stable hash. The build stamps the hash of what it rendered onto the
     page; the browser recomputes it from live data and only redraws when they
     differ. That is what stops a built page flashing and reflowing on every
     load for the 99% of visits where nothing has changed. */
  function hash(str) {
    var h = 5381, i = 0, s = String(str == null ? "" : str);
    for (; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function guideHash(g) {
    var p = (g && g.panel) || {};
    function blk(b) {
      if (!b) return "";
      return (b.title || "") + "|" + ((b.items || []).join("~")) + "|" + (b.text || "");
    }
    return hash([
      g && g.id, g && g.title, g && g.summary, p.eyebrow, p.hero, p.quick, p.layout,
      blk(p.normal), blk(p.helped), blk(p.warn), blk(p.dont),
      (g && g.related || []).join(",")
    ].join("\u0001"));
  }

  /* ---- badges (unchanged from the original guide template) ------------- */

  var BADGE = {
    ok:   '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#3f7a2f" stroke-width="2"/><path d="M7 12.5l3.2 3.2L17 8.5" stroke="#5aa14a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warn: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 3.5l9 16H3l9-16z" stroke="#c9761f" stroke-width="2" stroke-linejoin="round" fill="#f6d9b0"/><path d="M12 9.5v4.2" stroke="#c9761f" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.15" fill="#c9761f"/></svg>',
    dont: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#9B2C1F" stroke-width="2" fill="#f7e3e0"/><path d="M9 9l6 6M15 9l-6 6" stroke="#9B2C1F" stroke-width="2.2" stroke-linecap="round"/></svg>',
    tip:  '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 1 3.6 10.8c-.7.5-1.1 1-1.2 1.9H9.6c-.1-.9-.5-1.4-1.2-1.9A6 6 0 0 1 12 3z" fill="#fbe08a" stroke="#c9a520" stroke-width="1.6"/><path d="M9.6 18h4.8M10.2 20.4h3.6" stroke="#c9a520" stroke-width="1.8" stroke-linecap="round"/><path d="M12 1.4v1.2M4.3 5.2l.8.8M19.7 5.2l-.8.8" stroke="#d9b62a" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  /* ---- the notepad badge beside the quick answer ------------------------ */

  function noteMarkup(t) {
    var custom = t("note.image", "");
    if (custom) {
      return '<img class="g-note g-note--img" src="' + esc(assetPath(custom)) +
             '" alt="" width="108" height="90" loading="lazy" decoding="async">';
    }
    var l1 = esc(t("note.line1", "BY ARI"));
    var l2 = esc(t("note.line2", "& PAPA"));
    return '<svg class="g-note" viewBox="0 0 120 98" role="img" aria-label="' + l1 + " " + l2 +
      '"><rect x="16" y="8" width="96" height="84" rx="6" fill="#fbf5e6" stroke="#2b2622" stroke-width="2.2"/>' +
      '<line x1="30" y1="4" x2="30" y2="96" stroke="#2b2622" stroke-width="2"/>' +
      '<g stroke="#2b2622" stroke-width="2" fill="none"><circle cx="24" cy="16" r="4"/><circle cx="24" cy="34" r="4"/>' +
      '<circle cx="24" cy="52" r="4"/><circle cx="24" cy="70" r="4"/><circle cx="24" cy="86" r="4"/></g>' +
      '<text x="42" y="42" font-family="Patrick Hand, cursive" font-size="16" fill="#2b2622">' + l1 + '</text>' +
      '<text x="42" y="62" font-family="Patrick Hand, cursive" font-size="16" fill="#2b2622">' + l2 + '</text>' +
      '<path d="M92 74l14-8 6 12" fill="#3f6fa3" stroke="#2b2622" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }

  /* ---- one of the three columns ---------------------------------------- */

  function col(kind, block) {
    if (!block) return "";
    var body = (block.items && block.items.length)
      ? "<ul>" + block.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>"
      : "<p>" + (block.text || "") + "</p>";
    return '<div class="g-col"><div class="g-colhead"><span class="g-badge" aria-hidden="true">' +
      BADGE[kind] + '</span>\n      <h2>' + (block.title || "") + "</h2></div>" + body + "</div>";
  }

  /* ---- the guide panel -------------------------------------------------
     Markup is byte-for-byte what the site has always produced, with three
     changes, all of them semantic rather than visual:
       - the wrapper is <article> instead of <div>
       - asset paths are root-absolute so the page works at /guides/<slug>/
       - the illustration carries width/height, so it reserves its space and
         stops the layout shifting as it loads
     -------------------------------------------------------------------- */

  function panelMarkup(g, opts) {
    opts = opts || {};
    var t = opts.t || function (k, f) { return f; };
    var p = (g && g.panel) || {};
    var title = (g && g.title) || "";
    var eyebrow = p.eyebrow || "";
    var layoutClass = p.layout ? " g--" + p.layout : "";
    var bandArt = assetPath(p.band || t("band.image", "") || "assets/img/couple.webp");
    var iconHTML = opts.iconHTML || "";

    var heroHTML;
    if (p.hero) {
      var alt = (g.imageAlt || p.heroAlt || title || "");
      heroHTML = '<div class="g-art"><img src="' + esc(img(assetPath(p.hero), 1060)) +
        '" alt="' + esc(alt) + '" width="530" height="285" loading="eager" ' +
        'fetchpriority="high" decoding="async" ' +
        'onerror="this.onerror=null;this.src=\'' + esc(assetPath(p.hero)).replace(/'/g, "&#39;") + '\'"></div>';
    } else {
      heroHTML = '<div class="g-art g-art--ph" aria-hidden="true"><span>Illustration<small>generated for this guide</small></span></div>';
    }

    var dont = "";
    if (p.dont && p.dont.items && p.dont.items.length) {
      dont = '<div class="g-dont"><div class="g-colhead"><span class="g-badge" aria-hidden="true">' +
        BADGE.dont + "</span>\n        <h2>" + (p.dont.title || "Don&rsquo;t") + "</h2></div>" +
        "<ul>" + p.dont.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
    }

    return '<article class="gpanel' + layoutClass + '" data-guide-hash="' + guideHash(g) + '">\n' +
      '      <header class="g-hero">\n' +
      '        <div class="g-copy">\n' +
      '          <p class="g-eyebrow">' + iconHTML + "<span>" + eyebrow + "</span></p>\n" +
      "          <h1>" + title + "</h1>\n" +
      "        </div>\n        " + heroHTML + "\n      </header>\n" +
      '      <div class="g-cols">\n' +
      /* Reassurance, then what to try, then when to get help. The warning
         column is last deliberately: a worried parent should meet the normal
         explanation and something actionable before the red flags. */
      "        " + col("ok", p.normal) + "\n" +
      "        " + col("tip", p.helped) + "\n" +
      "        " + col("warn", p.warn) + "\n" +
      "      </div>\n      " + dont + "\n" +
      '      <div class="g-bandwrap">\n        <div class="g-band">\n          ' +
      noteMarkup(t) + "\n" +
      '          <div class="g-band-text"><b>' + esc(t("quick.label", "The quick answer:")) +
      "</b> " + (p.quick || g.summary || "") + "</div>\n" +
      '          <div class="g-couple"><img src="' + esc(bandArt) +
      '" alt="" width="184" height="147" loading="lazy" decoding="async"></div>\n' +
      "        </div>\n      </div>\n    </article>";
  }

  /* ---- breadcrumbs ------------------------------------------------------
     Home > <Age> > <Topic> > <this guide>. Rendered only when the site is set
     to show them; the BreadcrumbList structured data is emitted on exactly the
     same condition, so schema never describes something invisible.
     -------------------------------------------------------------------- */

  function crumbTrail(g, opts) {
    opts = opts || {};
    var trail = [{ name: "Home", url: "/" }];
    var age = (g.ages && g.ages[0]) || g.stage || "";
    if (age && opts.ageUrl) trail.push({ name: age, url: opts.ageUrl(age) });
    if (opts.topicLabel && g.topic) {
      trail.push({ name: opts.topicLabel(g.topic), url: "/topics/" + g.topic + "/" });
    }
    trail.push({ name: g.title, url: guideUrl(g) });
    return trail;
  }

  function crumbHTML(trail) {
    var parts = trail.map(function (c, i) {
      if (i === trail.length - 1) return "<span aria-current=\"page\">" + esc(c.name) + "</span>";
      return '<a href="' + esc(c.url) + '">' + esc(c.name) + "</a>";
    });
    return '<nav class="crumb" aria-label="Breadcrumb">' +
      parts.join(' <span aria-hidden="true">&rsaquo;</span> ') + "</nav>";
  }

  /* ---- the optional longer version -------------------------------------
     Every guide already carries several hundred words of original prose in its
     `body` field. The panel template does not display it, so today it is
     invisible to readers and to search engines alike. This renders it beneath
     the panel — below the fold, so the one-screen guide is untouched on first
     paint — when the switch is on.
     -------------------------------------------------------------------- */

  function detailHTML(g, opts) {
    opts = opts || {};
    var t = opts.t || function (k, f) { return f; };
    if (!g.body || !String(g.body).trim()) return "";
    var callout = "";
    if (g.callout && g.callout.items && g.callout.items.length) {
      callout = '<div class="callout"><h3>' + (g.callout.title || "Call your doctor if") + "</h3><ul>" +
        g.callout.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
    }
    /* The guide's prose has its own <h2>s. Left alone they would sit at the
       same level as "The longer version" that introduces them, which reads as
       a flat list of equal sections to a screen reader and to a crawler
       working out what the page is about. Demoting them one level makes the
       structure match the meaning. Only the tags change; not a word moves. */
    var body = String(g.body)
      .replace(/<(\/?)h3\b/gi, "<$1h4")
      .replace(/<(\/?)h2\b/gi, "<$1h3");

    /* Collapsed by default, using <details> rather than a scripted toggle.

       The reason this matters beyond taste: the prose stays in the HTML
       either way. Google indexes content inside a closed accordion normally —
       that has been its position since mobile-first indexing, because so much
       mobile content lives behind expanders — and the AI crawlers read the
       markup rather than clicking anything. So nothing is hidden from search
       or from a retrieval engine; it is only folded away from the reader
       until they ask for it.

       <details> also needs no JavaScript, which keeps it working on a page
       whose whole point is that it does not need any, and it stays keyboard
       and screen-reader accessible for free. */
    return '<section class="g-detail article" aria-labelledby="detail-h">\n' +
      '  <div class="article-inner">\n' +
      '    <details class="g-detail-fold">\n' +
      '      <summary><h2 id="detail-h">' +
      esc(t("detail.heading", "Want the fuller answer?")) +
      '</h2><span class="g-fold-chev" aria-hidden="true"></span></summary>\n' +
      '      <div class="article-body">' + body + callout + "</div>\n" +
      "    </details>\n  </div>\n</section>";
  }

  /* ---- where this guide came from --------------------------------------
     The real questions that produced the guide, with the date they were asked.
     This is the site's actual provenance and the reason it is not a content
     farm — but it is only rendered when the switch is on, and only from data
     that genuinely exists.
     -------------------------------------------------------------------- */

  function questionsHTML(g, opts) {
    opts = opts || {};
    var t = opts.t || function (k, f) { return f; };
    if (!g.originalQuestions || !g.originalQuestions.length) return "";
    return '<section class="g-origin article" aria-labelledby="origin-h">\n' +
      '  <div class="article-inner">\n' +
      '    <h2 id="origin-h">' + esc(t("origin.heading", "Where this one came from")) + "</h2>\n" +
      "    <ul>" + g.originalQuestions.map(function (q) {
        return "<li>" + esc(q) + "</li>";
      }).join("") + "</ul>\n  </div>\n</section>";
  }

  /* ---- references ------------------------------------------------------- */

  function referencesHTML(g) {
    if (!g.references || !g.references.length) return "";
    return '<section class="g-refs article" aria-labelledby="refs-h">\n' +
      '  <div class="article-inner">\n    <h2 id="refs-h">What we checked this against</h2>\n' +
      "    <ul>" + g.references.map(function (r) {
        return '<li><a href="' + esc(r.url) + '" rel="nofollow noopener" target="_blank">' +
          esc(r.title || r.url) + "</a>" + (r.publisher ? " — " + esc(r.publisher) : "") + "</li>";
      }).join("") + "</ul>\n  </div>\n</section>";
  }

  /* ---- a guide card (the grid item used on every index page) ------------
     The output of this function has to be byte-for-byte what cardHTML() in
     guides.js produces, including the whitespace. The build writes cards into
     the HTML and the browser may rebuild the same grid; if the two disagreed,
     the page would silently reflow on every visit and bots and readers would
     be getting different markup. tests/verify.js asserts they match. */

  function cardHTML(g, opts) {
    opts = opts || {};
    var icon = opts.iconHTML || "";
    var topicLabel = opts.topicLabel ? opts.topicLabel(g.topic) : "";
    return '<a class="card" href="' + guideUrl(g) + '">\n' +
      '    <div class="card-icon" aria-hidden="true">' + icon + "</div>\n" +
      '    <div class="card-text">\n' +
      "      <h3>" + (g.title || "") + "</h3>\n" +
      '      <p class="card-meta"><span class="topic">' + topicLabel +
      '</span><span class="dot">\u2022</span><span>' + (g.read || 3) +
      " min read</span></p>\n" +
      "    </div>\n  </a>";
  }

  /* ---- previous / next --------------------------------------------------
     Arrows either side of the guide, in the library's own order.

     Real <a href> elements written by the build, not a scripted control, so a
     crawler follows them and every guide gains two more inbound links from its
     neighbours. That matters at 300+ guides, where the ones nothing links to
     are the ones that never get found. "Read next" at the bottom is topical;
     this is sequential, and the two do different jobs.

     The title goes in aria-label and in a tooltip rather than on screen, so
     the control stays a quiet arrow and does not compete with the guide. */
  function prevNextHTML(prev, next, opts) {
    if (!prev && !next) return "";
    opts = opts || {};
    var t = opts.t || function (k, f) { return f; };

    /* The chevron is drawn in CSS rather than set as a character, so it keeps
       its exact weight and size whatever the reader's font settings do. The
       guide's title rides along in aria-label and title, so the control stays
       a quiet arrow on screen while still announcing where it goes. */
    var link = function (g, dir, label) {
      if (!g) return '<span class="g-step g-step--' + dir + ' is-empty" aria-hidden="true"></span>';
      return '<a class="g-step g-step--' + dir + '" href="' + guideUrl(g) + '"' +
        ' rel="' + dir + '" title="' + esc(g.title) + '"' +
        ' aria-label="' + esc(label) + ": " + esc(g.title) + '">' +
        '<span class="g-step-chev" aria-hidden="true"></span>' +
        '<span class="g-step-text"><span class="g-step-dir">' + esc(label) + "</span>" +
        '<span class="g-step-title">' + esc(g.title) + "</span></span></a>";
    };

    return '<nav class="g-steps" aria-label="' +
      esc(t("steps.label", "Previous and next guide")) + '">' +
      link(prev, "prev", t("steps.prev", "Previous")) +
      link(next, "next", t("steps.next", "Next")) +
      "</nav>";
  }

  /* ---- related guides --------------------------------------------------- */

  function relatedHTML(g, list, opts) {
    if (!list || !list.length) return "";
    opts = opts || {};
    var t = opts.t || function (k, f) { return f; };
    return '<section class="related" aria-labelledby="related-h">' +
      '<h2 id="related-h">' + esc(t("related.heading", "Read next")) + "</h2>" +
      '<div class="card-grid">' + list.map(function (r) {
        return cardHTML(r, {
          iconHTML: opts.iconFor ? opts.iconFor(r) : "",
          topicLabel: opts.topicLabel
        });
      }).join("") + "</div></section>";
  }

  return {
    esc: esc, img: img, assetPath: assetPath,
    guideUrl: guideUrl, hash: hash, guideHash: guideHash,
    panelMarkup: panelMarkup, cardHTML: cardHTML, relatedHTML: relatedHTML,
    prevNextHTML: prevNextHTML,
    crumbTrail: crumbTrail, crumbHTML: crumbHTML,
    detailHTML: detailHTML, questionsHTML: questionsHTML, referencesHTML: referencesHTML,
    BADGE: BADGE
  };
});
