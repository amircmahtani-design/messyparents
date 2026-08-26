/* ============================================================================
   HOME PAGE — search, the two filter rows, and the four popular cards.

   Lifted out of an inline <script> in index.html so it can be cached like any
   other asset instead of being re-downloaded inside the HTML on every visit,
   and so it can be deferred rather than parsed before first paint.

   It behaves exactly as it did. What changed underneath is where the data
   comes from: it used to filter the complete bundled catalogue, every article
   body included. Now the cards are already in the HTML, the pills and their
   counts are already in the HTML, and the catalogue index only loads when
   somebody actually reaches for a filter.
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

  var CAP = 4;
  var grid = document.getElementById("grid"),
      title = document.getElementById("resultsTitle"),
      hint = document.getElementById("resultsHint"),
      reset = document.getElementById("resetBtn"),
      more = document.getElementById("seeAll"),
      input = document.getElementById("heroQ");
  var topicRow = document.getElementById("topicRow"),
      ageRow = document.getElementById("ageRow"),
      topicSummary = document.getElementById("topicSummary"),
      ageSummary = document.getElementById("ageSummary");
  if (!grid) return;

  var topic = null, age = null, q = "";

  /* A collapsed row only re-opens when the parent taps its summary line to
     change that choice; picking a value closes it again. */
  var openRow = { topic: false, age: false };

  function describe(n) {
    var bits = [];
    if (q) bits.push("\u201c" + q + "\u201d");
    if (topic) bits.push(C.topicById(topic).label);
    if (age) bits.push(age);
    return n + " guide" + (n === 1 ? "" : "s") + " for " + bits.join(", ");
  }

  var plural = function (n) { return n + " guide" + (n === 1 ? "" : "s"); };

  function fillSummary(btn, icon, label, n) {
    btn.innerHTML = (icon || "") +
      '<span class="rs-label">' + MPC.esc(label) + "</span>" +
      '<span class="rs-count">&middot; ' + plural(n) + "</span>" +
      '<span class="rs-change">' + MPC.esc(t("results.change", "Change")) + "</span>";
  }

  /* Collapse an answered step down to one line, so the guides move up into
     view without anything sliding out from under the finger. The counts are
     the full match totals, not the four that fit in the grid. */
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
    var active = q || topic || age;
    document.querySelector(".rows").classList.toggle("searching", !!q);
    document.body.classList.toggle("filtering-active", !!active);

    /* With no filter and no index yet, the four baked cards are already the
       right four. Nothing to compute and nothing to draw. */
    var list;
    if (active) list = C.search(q, { topic: topic, age: age });
    else list = C.hasIndex()
      ? C.all().filter(function (g) { return g.featured; })
      : null;

    title.textContent = q ? t("results.search", "Closest matches")
      : (active ? t("results.filtered", "Matching guides")
                : t("results.default", "Popular guides"));
    reset.hidden = !active;
    hint.textContent = active ? describe(list.length) : "";

    if (list && list.length > CAP) {
      var pr = new URLSearchParams();
      if (q) pr.set("q", q);
      if (topic) pr.set("topic", topic);
      if (age) pr.set("age", age);
      more.href = "guides.html?" + pr.toString();
      more.textContent = t("results.seeAll", "See all {n} \u2192").replace(/\{n\}/g, list.length);
      more.hidden = false;
    } else { more.hidden = true; }

    if (list) {
      var shown = list.slice(0, CAP);
      /* The build already wrote these exact cards into the HTML. Rebuilding
         them would discard a correct DOM and reflow the page for nothing. */
      if (!MPC.gridAlreadyCorrect(grid, shown)) {
        grid.innerHTML = shown.length
          ? shown.map(C.cardHTML).join("")
          : '<div class="empty"><p><strong>' +
            MPC.esc(t("empty.title", "Nothing matches that yet.")) + "</strong></p>\n         <p>" +
            MPC.inline(t("empty.body", "Try a single word, or [browse all guides](guides.html).")) +
            "</p></div>";
        if (flash) { grid.classList.remove("updated"); void grid.offsetWidth; grid.classList.add("updated"); }
      }
    }
    syncRows();
  }

  /* ---- loading the index ------------------------------------------------
     Kicked off at idle so it is warm before it is wanted, and again on the
     first real interaction in case the reader was faster than the idle
     callback. Either way the page was complete before it started. */
  var warming = false;
  function warm(then) {
    if (!warming) { warming = true; C.loadIndex(); }
    return C.loadIndex().then(then || function () {});
  }
  MPC.idle(function () { warm(); }, 3000);

  document.addEventListener("click", function (e) {
    /* The summary line is itself a .pill, so deal with it before the pills. */
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

  var form = document.getElementById("heroSearch");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    q = input.value.trim();
    warm(function () { return C.loadSearchText().then(function () { render(true); }); });
  });

  if (input) {
    /* The search text file is fetched on the first keystroke. Until it lands,
       queries match on titles alone — instant, already in memory, and enough
       for most of what gets typed. render() runs again when it arrives. */
    input.addEventListener("input", function () {
      q = input.value.trim();
      warm(function () { render(false); });
      if (q && !C.hasSearchText()) C.loadSearchText().then(function () { render(false); });
    });
    input.addEventListener("focus", function () { warm(); }, { once: true });
  }

  if (reset) reset.addEventListener("click", function () {
    topic = age = null; q = "";
    if (input) input.value = "";
    openRow.topic = openRow.age = false;
    document.querySelectorAll(".pill").forEach(function (b) { MPC.pillState(b, false); });
    render(true);
  });
})();
