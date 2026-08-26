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

  if (!empty(featEl) && !empty(oneEl)) return;   // the normal case

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
