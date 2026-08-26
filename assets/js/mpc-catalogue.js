/* ============================================================================
   THE PUBLIC CATALOGUE — search and filtering, without the guide bodies.

   Loaded only by the pages that actually browse: home, /guides.html, and the
   topic and age landing pages. A guide page does not load this at all.

   WHAT CHANGED AND WHY

   The browse pages used to filter and search against GUIDES — the complete
   bundled catalogue, full article bodies included, 113KB at 31 guides. At 300
   guides that is well over a megabyte of prose downloaded so a parent can type
   "nap" into a box.

   So the build now writes two generated files instead:

     /data/guide-index.json    metadata only. Everything needed to draw a card
                               and to filter by topic or age. ~130 bytes a
                               guide, so ~65KB at 500 — and it is not needed
                               for first paint either, because the build bakes
                               the cards into the HTML.

     /data/guide-search.json   the text a query is matched against: summary,
                               target keywords and a short body excerpt. Only
                               fetched when somebody actually searches.

   Neither contains a full article body. tests/verify.js fails the build if one
   ever starts to.

   THE THREE-STAGE LOAD

   1. Page arrives. Cards are already in the HTML, filter counts are already
      inline in MPC_FACETS. Nothing is fetched. The page is complete.
   2. At idle, or the moment the reader touches a pill or the search box, the
      index loads. Filtering becomes live.
   3. The first time a character is typed, the search text loads. Until it
      lands, queries match on titles alone — which is instant, already in
      memory, and covers most of what people type. When it arrives the results
      are re-scored automatically.

   So the reader never waits for a network round trip before the page works.
   ========================================================================== */
(function () {
  "use strict";

  var MPC = window.MPC = window.MPC || {};

  /* Facets are written inline into the page by the build: the topic list, the
     age list and the counts behind each. Tiny (a few hundred bytes) and
     present before this script runs, so pills and counts never pop in. */
  var F = window.MPC_FACETS || { topics: [], ages: [], counts: { topic: {}, age: {} }, total: 0 };

  var TOPICS = F.topics || [];
  var AGES = F.ages || [];

  function topicById(id) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i];
    return TOPICS[0] || { id: id, label: id, icon: "" };
  }

  /* ---- card markup ------------------------------------------------------
     Byte-for-byte identical to cardHTML() in guide-render.js, which is what
     the build uses to bake the cards into the HTML. If these two ever drift,
     the baked-hash handshake fails and every grid silently rebuilds and
     reorders itself on every visit. tests/verify.js asserts they match. */
  function cardHTML(g) {
    var icon = (g && g.topic && F.icons && F.icons[g.topic]) || "";
    var label = topicById(g.topic).label || "";
    return '<a class="card" href="' + ("/guides/" + ((g && (g.slug || g.id)) || "") + "/") + '">\n' +
      '    <div class="card-icon" aria-hidden="true">' + icon + "</div>\n" +
      '    <div class="card-text">\n' +
      "      <h3>" + (g.title || "") + "</h3>\n" +
      '      <p class="card-meta"><span class="topic">' + label +
      '</span><span class="dot">\u2022</span><span>' + (g.read || 3) +
      " min read</span></p>\n" +
      "    </div>\n  </a>";
  }

  /* ---- loading ---------------------------------------------------------- */

  var index = null, indexPromise = null;
  var searchText = null, searchPromise = null;

  function getJSON(url) {
    return fetch(url, { credentials: "omit" }).then(function (r) {
      if (!r.ok) throw new Error(url + ": HTTP " + r.status);
      return r.json();
    });
  }

  /* The index. Resolves immediately if it is already in memory. On failure it
     resolves to an empty list rather than rejecting: the baked cards are still
     on the page and still correct, so a failed fetch costs live filtering, not
     the page. */
  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = getJSON("/data/guide-index.json")
      .then(function (j) { index = (j && j.guides) || []; return index; })
      .catch(function (e) {
        console.warn("[MPC] guide index unavailable — filtering disabled.", e);
        index = [];
        return index;
      });
    return indexPromise;
  }

  /* The search text, fetched on first keystroke and merged onto the index in
     place, so every reference already held stays valid. */
  function loadSearchText() {
    if (searchPromise) return searchPromise;
    searchPromise = loadIndex().then(function () {
      return getJSON("/data/guide-search.json");
    }).then(function (j) {
      searchText = (j && j.text) || {};
      for (var i = 0; i < index.length; i++) {
        var extra = searchText[index[i].id];
        if (extra) {
          index[i].summary = extra.s || "";
          index[i].keywords = extra.k || "";
          index[i].text = extra.t || "";
        }
      }
      return index;
    }).catch(function (e) {
      console.warn("[MPC] search text unavailable — matching on titles only.", e);
      searchText = {};
      return index;
    });
    return searchPromise;
  }

  /* ---- ranking ----------------------------------------------------------
     Unchanged from the version that shipped in guides.js, except that `body`
     is now the generated excerpt rather than the full article. Whole-word
     title hits still beat partial ones, and a guide matching more of the typed
     words still ranks higher, so results sharpen as you keep typing rather
     than just shrinking. */
  function escRe(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /* "naps" should still find "nap"; "feeding" should still find "feed" */
  function stems(t) {
    var out = [t];
    if (t.length > 4 && /(ies)$/.test(t)) out.push(t.slice(0, -3) + "y");
    if (t.length > 4 && /(es|ed)$/.test(t)) out.push(t.slice(0, -2));
    if (t.length > 3 && /s$/.test(t)) out.push(t.slice(0, -1));
    if (t.length > 5 && /ing$/.test(t)) out.push(t.slice(0, -3));
    return out;
  }

  function termScore(term, title, summary, topic, body) {
    var word = new RegExp("\\b" + escRe(term) + "\\b");
    var pre = new RegExp("\\b" + escRe(term));
    var s = 0;
    if (word.test(title)) s += 20;
    else if (pre.test(title)) s += 10;
    else if (title.indexOf(term) !== -1) s += 4;

    if (word.test(summary)) s += 7;
    else if (summary.indexOf(term) !== -1) s += 3;

    if (topic.indexOf(term) !== -1) s += 4;

    if (word.test(body)) s += 2;
    else if (body.indexOf(term) !== -1) s += 1;
    return s;
  }

  /* Lowercased haystacks are cached on the record the first time a guide is
     scored, so a long typing session does not re-lowercase the whole
     catalogue on every keystroke. Invalidated when the search text merges in. */
  function haystack(g) {
    if (g.__h && g.__hv === (g.text || "")) return g.__h;
    g.__hv = g.text || "";
    g.__h = {
      title: String(g.title || "").toLowerCase(),
      summary: String(g.summary || "").toLowerCase(),
      topic: String(topicById(g.topic).label || "").toLowerCase(),
      body: (String(g.keywords || "") + " " + String(g.text || "")).toLowerCase()
    };
    return g.__h;
  }

  function score(g, query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return 1;
    var h = haystack(g);
    var total = 0, matched = 0;
    for (var i = 0; i < terms.length; i++) {
      var best = 0, variants = stems(terms[i]);
      for (var j = 0; j < variants.length; j++) {
        best = Math.max(best, termScore(variants[j], h.title, h.summary, h.topic, h.body));
      }
      if (best > 0) { matched++; total += best; }
    }
    if (!matched) return 0;
    return total * Math.pow(matched / terms.length, 2);
  }

  /* Synchronous. Returns whatever is in memory right now — which is the whole
     point: the caller never awaits a fetch mid-keystroke. */
  function search(query, opts) {
    opts = opts || {};
    var topic = opts.topic || null, age = opts.age || null;
    var list = index || [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var g = list[i];
      if (topic && g.topic !== topic) continue;
      if (age && (g.ages || []).indexOf(age) === -1) continue;
      var s = score(g, query || "");
      if (s > 0) out.push({ g: g, s: s });
    }
    out.sort(function (a, b) { return b.s - a.s || a.g.title.localeCompare(b.g.title); });
    return out.map(function (x) { return x.g; });
  }

  /* Counts without building the result array. Used by the collapsed filter
     rows, which only ever want a number. When the index has not loaded yet and
     there is no query, the build's inline facet counts answer it exactly. */
  function count(query, opts) {
    opts = opts || {};
    if (!index && !query) {
      if (opts.topic && !opts.age) return (F.counts.topic || {})[opts.topic] || 0;
      if (opts.age && !opts.topic) return (F.counts.age || {})[opts.age] || 0;
      if (!opts.topic && !opts.age) return F.total || 0;
    }
    return search(query, opts).length;
  }

  MPC.catalogue = {
    topics: TOPICS,
    ages: AGES,
    icons: F.icons || {},
    total: F.total || 0,
    topicById: topicById,
    cardHTML: cardHTML,
    search: search,
    count: count,
    /* Is the full catalogue in memory yet? Pages use this to decide whether a
       result list can be trusted enough to replace the baked cards. */
    hasIndex: function () { return !!index; },
    hasSearchText: function () { return !!searchText; },
    loadIndex: loadIndex,
    loadSearchText: loadSearchText,
    all: function () { return (index || []).slice(); }
  };
})();
