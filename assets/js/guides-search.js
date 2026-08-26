/* ============================================================================
   ALL GUIDES — and the topic and age landing pages, which are this same page
   with a filter pre-applied by the build.

   Lifted out of an inline <script> in guides.html for the same reasons as
   home.js: cacheable, deferrable, and no longer sitting between the HTML and
   first paint.

   THE IMPORTANT PART

   Every card on this page is written into the HTML by the build, in the exact
   order this script would produce, with a hash of that list stamped on the
   grid. So on arrival the page is finished. This script's first job is to
   recognise that and do nothing.

   It only needs data when the reader filters or searches, and then it needs
   metadata, not articles. At 500 guides the index is around 65KB before
   compression and the search text around 225KB, fetched separately and only
   on a keystroke — against 1.8MB of bundled article bodies before, on every
   page, whether anyone searched or not.
   ========================================================================== */
(function () {
  "use strict";

  var MPC = window.MPC;
  if (!MPC || !MPC.catalogue) return;
  var C = MPC.catalogue;
  var T = window.MPC_T || {};
  var t = function (k, f) {
    var v = T[k];
    return (v == null || String(v).trim() === "") ? f : v;
  };

  var params = new URLSearchParams(location.search);
  /* Topic and age landing pages (/topics/sleeping/, /ages/0-1-month/) have no
     query string, so their filter arrives as MPC_PREFILTER from the build. */
  var pre = window.MPC_PREFILTER || {};
  var topic = params.get("topic") || pre.topic || null,
      age = params.get("age") || pre.age || null,
      q = params.get("q") || "";

  var grid = document.getElementById("grid"),
      title = document.getElementById("resultsTitle"),
      count = document.getElementById("resultsCount"),
      reset = document.getElementById("resetBtn"),
      input = document.getElementById("q");
  var topicRow = document.getElementById("topicRow"),
      ageRow = document.getElementById("ageRow"),
      topicSummary = document.getElementById("topicSummary"),
      ageSummary = document.getElementById("ageSummary");
  if (!grid) return;

  if (input) input.value = q;

  var openRow = { topic: false, age: false };

  var plural = function (n) { return n + " guide" + (n === 1 ? "" : "s"); };

  function fillSummary(btn, icon, label, n) {
    btn.innerHTML = (icon || "") +
      '<span class="rs-label">' + MPC.esc(label) + "</span>" +
      '<span class="rs-count">&middot; ' + plural(n) + "</span>" +
      '<span class="rs-change">' + MPC.esc(t("results.change", "Change")) + "</span>";
  }

  function syncRows() {
    var showTopic = !topic || openRow.topic;
    if (topic) {
      var tp = C.topicById(topic);
      fillSummary(topicSummary, C.icons[topic] || "", tp.label, C.count(q, { topic: topic }));
    }
    topicRow.classList.toggle("is-collapsed", !showTopic);
    topicSummary.setAttribute("aria-expanded", String(showTopic));

    var showAge = !age || openRow.age;
    if (age) fillSummary(ageSummary, "", age, C.count(q, { topic: topic, age: age }));
    ageRow.classList.toggle("is-collapsed", !showAge);
    ageSummary.setAttribute("aria-expanded", String(showAge));
  }

  function render(flash) {
    var active = topic || age || q;
    document.querySelector(".rows").classList.toggle("searching", !!q);
    document.body.classList.toggle("searching-active", !!q);
    document.body.classList.toggle("filtering-active", !!(topic || age));

    title.textContent = q ? t("results.search", "Closest matches")
      : (active ? t("results.filtered", "Matching guides")
                : t("results.default", "Every guide"));
    if (reset) reset.hidden = !active;

    /* Without the index there is nothing to recompute — and nothing that
       needs recomputing, because the served HTML is already this list. */
    if (!C.hasIndex()) {
      if (count) count.textContent = plural(C.count(q, { topic: topic, age: age }));
      syncRows();
      return;
    }

    var list = active ? C.search(q, { topic: topic, age: age }) : C.all();
    if (count) count.textContent = plural(list.length);

    /* The build already wrote these exact cards into the HTML. */
    if (!MPC.gridAlreadyCorrect(grid, list)) {
      grid.innerHTML = list.length
        ? list.map(C.cardHTML).join("")
        : '<div class="empty"><p><strong>' +
          MPC.esc(t("empty.title", "No guides match that yet.")) + "</strong></p>\n         <p>" +
          MPC.inline(t("empty.body", "Try a single word, or clear the filters and scroll.")) +
          "</p></div>";
      if (flash !== false) {
        grid.classList.remove("updated"); void grid.offsetWidth; grid.classList.add("updated");
      }
    }
    syncRows();
  }

  var warming = false;
  function warm(then) {
    if (!warming) { warming = true; C.loadIndex(); }
    return C.loadIndex().then(then || function () {});
  }

  /* Draw the counts from the inline facets straight away, then warm the index
     in the background. If the reader arrived with ?q= in the URL the search
     text is needed immediately, so that one is not deferred. */
  syncRows();
  if (q) warm(function () { return C.loadSearchText().then(function () { render(false); }); });
  else MPC.idle(function () { warm(); }, 3000);

  document.addEventListener("click", function (e) {
    var sum = e.target.closest(".row-summary");
    if (sum) { openRow[sum.dataset.row] = true; syncRows(); return; }

    /* The pills are real links now, so a crawler can follow them and the
       twelve landing pages are reachable without a second row of them baked at
       the bottom of the page. Intercept the click and filter in place; if this
       script ever fails to run, the click falls through to the topic page. */
    var btn = e.target.closest(".pill");
    if (!btn) return;
    if (btn.tagName === "A") e.preventDefault();
    if (btn.dataset.topic) { topic = (topic === btn.dataset.topic) ? null : btn.dataset.topic; openRow.topic = false; }
    if (btn.dataset.age) { age = (age === btn.dataset.age) ? null : btn.dataset.age; openRow.age = false; }
    document.querySelectorAll("[data-topic]").forEach(function (b) {
      MPC.pillState(b, b.dataset.topic === topic);
    });
    document.querySelectorAll("[data-age]").forEach(function (b) {
      MPC.pillState(b, b.dataset.age === age);
    });
    warm(function () { render(true); });
  });

  var form = document.getElementById("searchForm");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    q = input.value.trim();
    warm(function () { return C.loadSearchText().then(function () { render(true); }); });
  });

  if (input) {
    input.addEventListener("input", function () {
      q = input.value.trim();
      warm(function () { render(true); });
      if (q && !C.hasSearchText()) C.loadSearchText().then(function () { render(false); });
    });
    input.addEventListener("focus", function () { warm(); }, { once: true });
  }

  if (reset) reset.addEventListener("click", function () {
    topic = age = null; q = "";
    if (input) input.value = "";
    openRow.topic = openRow.age = false;
    document.querySelectorAll(".pill").forEach(function (b) { MPC.pillState(b, false); });
    warm(function () { render(true); });
  });
})();
