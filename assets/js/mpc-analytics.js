/* ============================================================================
   ANALYTICS AND CONSENT.  Full notes in ANALYTICS-README.md.

   Fetched by mpc-runtime.js on `load`, only when the build wrote MPC_GA. Never
   reaches Studio or the Editor: neither loads the runtime.

   Order matters legally: consent "default" (all denied) is queued FIRST, then
   gtag.js is requested, and "update" to granted happens on Accept and never
   before — so no _ga cookie exists while the answer is denied.

   Budget: 3.5KB gzipped, enforced in tests/verify.js.
   ========================================================================== */
(function () {
  "use strict";

  var ID = window.MPC_GA;
  if (!ID || !/^G-[A-Z0-9]+$/i.test(ID)) return;

  var KEY = "mpc.consent";   /* "granted" | "denied" */
  var loaded = false, styled = false;

  /* Safari private mode throws rather than returning null; analytics must never
     be the reason a page script dies. */
  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* nothing to do */ }
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    security_storage: "granted",   /* not optional; sets nothing here */
    wait_for_update: 500
  });

  /* MPC_PAGE comes from the build on generated guide pages; elsewhere GA4's
     page_title and page_location carry it. MPC_NOT_FOUND is set by guide.js on
     a /guides/* miss: Netlify serves those 200, so without it a dead URL counts
     as a guide someone read. */
  function params() {
    var p = { allow_google_signals: false };
    var g = window.MPC_PAGE;
    if (window.MPC_NOT_FOUND) { p.page_type = "not_found"; return p; }
    if (g) {
      p.page_type = "guide";
      if (g.slug) p.guide_slug = g.slug;
      if (g.topic) p.guide_topic = g.topic;
      if (g.age) p.guide_age = g.age;
    }
    return p;
  }

  function loadTag() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", ID, params());
  }

  /* Withdrawal must remove what is already there: an update stops the cookies
     being read but does not delete them. Both host forms, since _ga is set on
     the registrable domain. */
  function clearCookies() {
    var hosts = ["", location.hostname, "." + location.hostname.replace(/^www\./, "")];
    document.cookie.split(";").map(function (c) {
      return c.split("=")[0].trim();
    }).filter(function (n) { return n.indexOf("_ga") === 0; })
      .forEach(function (n) {
        hosts.forEach(function (h) {
          document.cookie = n + "=; Max-Age=0; path=/" + (h ? "; domain=" + h : "");
        });
      });
  }

  function grant() {
    save("granted");
    gtag("consent", "update", { analytics_storage: "granted" });
    loadTag();
  }

  function deny() {
    save("denied");
    gtag("consent", "update", { analytics_storage: "denied" });
    clearCookies();
  }

  /* GA4 reconstructs guide A -> B -> C from page views by itself, so no event
     is needed for the sequence. This records only WHICH control was used. One
     delegated listener; no markup touched. */
  function trackLinks() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      if (a.hostname && a.hostname !== location.hostname) return;
      if (!/^\/guides\//.test(a.getAttribute("href") || "")) return;
      gtag("event", "guide_link_click", {
        link_type: a.closest(".g-steps") ? (a.rel === "prev" ? "prev" : "next")
          : a.closest(".gpage-related") ? "related"
          : a.closest(".card-grid") ? "card" : "other",
        link_url: a.getAttribute("href")
      });
    }, true);
  }

  /* Fixed and appended last: displaces nothing, no layout shift. Injected here
     rather than added to style.css, which the build inlines into every page's
     head — this is not first-paint content. All existing tokens. */
  var CSS =
    '.mpc-cc{position:fixed;left:12px;right:12px;bottom:12px;z-index:60;' +
    'max-width:660px;margin:0 auto;background:var(--cream-soft);' +
    'border:1px solid var(--line-soft);' +
    'border-radius:var(--radius);box-shadow:0 6px 24px rgba(33,29,24,.16);' +
    'padding:14px 16px;font-family:var(--body);font-size:.94rem;' +
    'color:var(--ink);display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
    '.mpc-cc p{margin:0;flex:1 1 260px;line-height:1.45;' +
    'color:var(--ink-70)}' +
    '.mpc-cc a{color:var(--blue)}' +
    '.mpc-cc-btns{display:flex;gap:8px;flex:none}' +
    '.mpc-cc button{font-family:inherit;font-size:.92rem;font-weight:700;' +
    'padding:8px 16px;border-radius:999px;cursor:pointer;' +
    'border:1px solid var(--blue)}' +
    '.mpc-cc .yes{background:var(--blue);color:#fff}' +
    '.mpc-cc .no{background:transparent;color:var(--blue)}' +
    '@media (max-width:520px){.mpc-cc-btns{width:100%}' +
    '.mpc-cc button{flex:1}}';

  function banner() {
    var old = document.querySelector(".mpc-cc");
    if (old) old.remove();
    if (!styled) {
      styled = true;
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    var el = document.createElement("div");
    el.className = "mpc-cc";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookies");
    el.innerHTML =
      "<p>We use Google Analytics to see which guides people find useful. " +
      'Nothing runs unless you say yes. <a href="/privacy.html">How this works</a>.</p>' +
      '<div class="mpc-cc-btns"><button type="button" class="no">Decline</button>' +
      '<button type="button" class="yes">Accept</button></div>';

    el.querySelector(".yes").addEventListener("click", function () { grant(); el.remove(); });
    el.querySelector(".no").addEventListener("click", function () { deny(); el.remove(); });
    document.body.appendChild(el);
  }

  /* The permanent way back, beside the baked Privacy link. Added here, not in
     the HTML, so it can never be a dead link. */
  function footerLink() {
    var links = document.querySelector(".foot-links");
    if (!links || links.querySelector("[data-mpc-consent]")) return;
    var a = document.createElement("a");
    a.href = "#";
    a.setAttribute("data-mpc-consent", "");
    a.textContent = "Cookie settings";
    a.addEventListener("click", function (e) { e.preventDefault(); banner(); });
    links.appendChild(a);
  }

  /* Granted: update, then load. Undecided: load with storage still denied, so
     the ping is cookieless, and ask. Denied: gtag.js is never requested. */
  var choice = read();
  if (choice !== "denied") {
    if (choice === "granted") gtag("consent", "update", { analytics_storage: "granted" });
    loadTag();
    trackLinks();
    if (choice !== "granted") banner();
  }

  footerLink();
})();
