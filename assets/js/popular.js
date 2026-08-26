/* ============================================================================
   POPULAR PAGE

   Both grids are written into the HTML by the Netlify build, so in the normal
   case this page is complete on arrival and this script has nothing to do.

   It used to load the whole catalogue anyway, rebuild both lists in JavaScript
   and compare hashes to discover that the HTML was already correct — which it
   almost always was. That is a lot of network and main-thread work to conclude
   that nothing needed doing.

   Now it only steps in when a grid is genuinely empty, which means the build
   did not run (a failed deploy, or a preview served straight from the repo).
   In that case the index is fetched and the cards are drawn from it. Deferred
   to idle either way, because a page that has its cards does not need this at
   all.
   ========================================================================== */
(function () {
  "use strict";

  var MPC = window.MPC;
  if (!MPC || !MPC.catalogue) return;
  var C = MPC.catalogue;

  var featEl = document.getElementById("featured");
  var oneEl = document.getElementById("byTopic");

  var empty = function (el) {
    return el && !el.querySelector(".card");
  };


  /* ---- live search --------------------------------------------------------
     The box used to submit to guides.html?q=. Typing did nothing until you
     pressed Search, which is not what a search box looks like it does.

     Now it matches as you type, in place. The form still has its action, so
     pressing Enter with JavaScript disabled goes where it always did. */
  var input = document.getElementById("popQ");
  var wrap = document.getElementById("popResultsWrap");
  var results = document.getElementById("popResults");
  var countEl = document.getElementById("popCount");
  var resetEl = document.getElementById("popReset");
  var T = window.MPC_T || {};
  var t = function (k, f) {
    var v = T[k];
    return (v == null || String(v).trim() === "") ? f : v;
  };

  if (input && wrap && results) {
    var sections = [];
    [featEl, oneEl].forEach(function (el) {
      var sec = el && el.closest ? el.closest("section") : null;
      if (sec) sections.push(sec);
    });

    var warmed = false;
    var warm = function (then) {
      if (!warmed) { warmed = true; C.loadIndex(); }
      return C.loadIndex().then(then || function () {});
    };

    var draw = function () {
      var q = input.value.trim();
      var on = !!q;
      wrap.hidden = !on;
      sections.forEach(function (sec) { sec.hidden = on; });
      if (!on) return;

      var list = C.search(q, {});
      countEl.textContent = list.length + " guide" + (list.length === 1 ? "" : "s");
      results.innerHTML = list.length
        ? list.map(C.cardHTML).join("")
        : '<div class="empty"><p><strong>' +
          MPC.esc(t("empty.title", "No guides match that yet.")) + "</strong></p><p>" +
          MPC.inline(t("empty.body", "Try a single word, or clear the filters and scroll.")) +
          "</p></div>";
    };

    input.addEventListener("focus", function () { warm(); }, { once: true });
    input.addEventListener("input", function () {
      warm(function () { draw(); });
      /* The search text arrives on the first keystroke; until it does, titles
         are matched, which is already in memory and covers most queries. */
      if (input.value.trim() && !C.hasSearchText()) C.loadSearchText().then(draw);
    });
    var form = document.getElementById("popSearch");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      warm(function () { return C.loadSearchText().then(draw); });
    });
    if (resetEl) resetEl.addEventListener("click", function (e) {
      e.preventDefault(); input.value = ""; draw(); input.focus();
    });
  }

  if (!empty(featEl) && !empty(oneEl)) return;   // the grids are fine

  MPC.idle(function () {
    C.loadIndex().then(function (list) {
      if (!list.length) return;

      if (empty(featEl)) {
        var feat = list.filter(function (g) { return g.featured; });
        featEl.innerHTML = feat.map(C.cardHTML).join("");
      }

      if (empty(oneEl)) {
        var seen = {};
        list.filter(function (g) { return g.featured; })
          .forEach(function (g) { seen[g.id] = true; });
        var one = C.topics.map(function (tp) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].topic === tp.id && !seen[list[i].id]) return list[i];
          }
          return null;
        }).filter(Boolean);
        oneEl.innerHTML = one.map(C.cardHTML).join("");
      }
    });
  }, 3000);
})();
