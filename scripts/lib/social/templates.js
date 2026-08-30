/* ============================================================================
   SOCIAL — SLIDE AND STORY TEMPLATES

   One renderer, two consumers:

     • the /social/ dashboard, which scales the markup down for preview
     • scripts/social-render.js, which screenshots it at full size to JPEG

   Both use THIS file, so what Amir approves on screen is what the renderer
   would produce. A preview drawn by different code from the export is a
   preview of nothing.

   VISUAL SYSTEM. Nothing here invents a colour or a typeface. Every value is
   a custom property from assets/css/tokens.css, and the panel tints are used
   for exactly the panels they are named after in that file:

     --blue-band  the quick answer            (tokens.css: "the quick-answer band")
     --amber-*    what helped us              (tokens.css: "what helped us")
     --red-*      when to check in            (tokens.css: "call the doctor if")
     --cream      the page ground

   So a slide is a 1080-pixel-wide version of a panel the reader already knows
   from the guide page.

   Runs in Node and in the browser: CommonJS when there is a module, a global
   otherwise.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MPCSocialTemplates = api;
})(typeof self !== "undefined" ? self : this, function () {

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  /* Instagram draws its own furniture over a Story — the profile row at the
     top, the reply box at the bottom. These are the margins that keep our
     words clear of it. The carousel has no overlay, but 90px of air stops the
     type touching the edge of a phone screen. */
  const SAFE = {
    carousel: { top: 96,  right: 90,  bottom: 96,  left: 90 },
    story:    { top: 250, right: 90,  bottom: 260, left: 90 }
  };

  /* --------------------------------------------------------------------------
     THE STYLESHEET

     Written once, shared by preview and export. It assumes tokens.css is
     already loaded on the page — it never restates a colour.
     ------------------------------------------------------------------------ */
  function css() {
    return `
.mpc-slide{
  position:relative; overflow:hidden;
  width:1080px; height:1350px; flex:0 0 auto;
  background:var(--cream); color:var(--ink);
  font-family:var(--body);
  display:flex; flex-direction:column;
  padding:${SAFE.carousel.top}px ${SAFE.carousel.right}px ${SAFE.carousel.bottom}px ${SAFE.carousel.left}px;
  box-sizing:border-box;
}
.mpc-slide.is-story{ width:1080px; height:1920px;
  padding:${SAFE.story.top}px ${SAFE.story.right}px ${SAFE.story.bottom}px ${SAFE.story.left}px; }

.mpc-slide .s-eyebrow{
  font-family:var(--body); font-weight:700; font-size:34px; letter-spacing:.10em;
  text-transform:uppercase; color:var(--ink-50); margin:0 0 28px;
}
.mpc-slide .s-title{
  font-family:var(--hand); font-weight:400; -webkit-text-stroke:var(--stroke-title) currentColor;
  font-size:104px; line-height:1.06; margin:0; color:var(--ink-hand); text-wrap:balance;
}
.mpc-slide .s-title.is-small{ font-size:78px; }
.mpc-slide .s-title.is-tiny{ font-size:62px; }

.mpc-slide .s-panel{
  border:4px solid var(--rule-hand); border-radius:var(--radius);
  background:var(--cream-soft); padding:52px 56px; margin:0;
}
.mpc-slide .s-panel h3{
  font-family:var(--hand); font-weight:400; -webkit-text-stroke:.5px currentColor;
  font-size:64px; line-height:1.1; margin:0 0 34px; color:var(--ink-hand);
}
.mpc-slide .s-panel ul{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:30px; }
.mpc-slide .s-panel li{
  font-size:42px; line-height:1.34; color:var(--ink-hand-soft);
  padding-left:52px; position:relative;
}
.mpc-slide .s-panel li::before{
  content:""; position:absolute; left:6px; top:20px;
  width:20px; height:20px; border-radius:50%; background:var(--dot,var(--blue-ink));
}
.mpc-slide .s-panel.is-quick{ background:var(--blue-band); border-color:var(--blue-band-line); }
.mpc-slide .s-panel.is-helped{ background:var(--amber-fill); border-color:var(--amber-line); --dot:var(--amber-ink); }
.mpc-slide .s-panel.is-helped h3{ color:var(--amber-ink); }
.mpc-slide .s-panel.is-warn{ background:var(--red-fill); border-color:var(--red-line); --dot:var(--red-ink); }
.mpc-slide .s-panel.is-warn h3{ color:var(--red-ink); }
.mpc-slide .s-panel.is-dont{ background:var(--tape-fill); border-color:var(--tape-line); --dot:var(--tape-ink); }
.mpc-slide .s-panel.is-dont h3{ color:var(--tape-ink); }

.mpc-slide .s-quicktext{ font-size:52px; line-height:1.35; color:var(--ink-hand); margin:0; }

.mpc-slide .s-art{ flex:1 1 auto; display:flex; align-items:center; justify-content:center;
  min-height:0; margin:44px 0 0; }
.mpc-slide .s-art img{ max-width:100%; max-height:100%; object-fit:contain; }
.mpc-slide .s-art .s-art-empty{
  width:100%; height:100%; border:4px dashed var(--rule-hand); border-radius:var(--radius);
  display:flex; align-items:center; justify-content:center; text-align:center;
  color:var(--ink-50); font-size:34px; padding:40px; box-sizing:border-box;
}
.mpc-slide .s-body{ flex:1 1 auto; display:flex; flex-direction:column; justify-content:center; min-height:0; }
.mpc-slide .s-foot{
  flex:0 0 auto; margin-top:44px; display:flex; align-items:baseline; justify-content:space-between;
  gap:24px; font-size:32px; color:var(--ink-50); font-weight:700; letter-spacing:.04em;
}
.mpc-slide .s-foot .s-brand{ font-family:var(--hand); -webkit-text-stroke:.4px currentColor;
  font-size:40px; letter-spacing:0; color:var(--blue-ink); font-weight:400; }
.mpc-slide .s-more{ font-size:30px; color:var(--ink-50); margin:24px 0 0; }

.mpc-slide.is-close .s-body{ align-items:center; text-align:center; }
.mpc-slide.is-close .s-title{ color:var(--blue-ink); }
.mpc-slide.is-close .s-close-q{ font-size:44px; line-height:1.35; color:var(--ink-hand-soft);
  margin:36px 0 0; max-width:80%; }
.mpc-slide.is-close .s-close-cta{ font-family:var(--body); font-weight:800; font-size:38px;
  letter-spacing:.06em; text-transform:uppercase; color:var(--orange-ink); margin:40px 0 0; }
`;
  }

  /* --------------------------------------------------------------------------
     ONE SLIDE
     ------------------------------------------------------------------------ */
  const titleClass = (text) => {
    const n = String(text || "").length;
    return n > 62 ? " is-tiny" : n > 38 ? " is-small" : "";
  };

  const art = (slide) => slide.image
    ? `<div class="s-art"><img src="${esc(slide.image)}" alt="${esc(slide.imageAlt || "")}"></div>`
    : `<div class="s-art"><div class="s-art-empty">Approved guide illustration goes here.<br>None is attached to this guide yet.</div></div>`;

  const foot = (right) =>
    `<div class="s-foot"><span class="s-brand">The Messy Parents Collection</span>` +
    `<span>${esc(right || "")}</span></div>`;

  const panelClass = { quick: "is-quick", normal: "", helped: "is-helped", warn: "is-warn", dont: "is-dont" };

  function slideHTML(slide, ctx) {
    const c = ctx || {};
    const idx = c.index != null ? `${c.index + 1}/${c.total}` : "";

    if (slide.kind === "cover") {
      return `<div class="mpc-slide is-cover">
  <p class="s-eyebrow">${esc(slide.eyebrow)}</p>
  <h2 class="s-title${titleClass(slide.heading)}">${esc(slide.heading)}</h2>
  ${art(slide)}
  ${foot("Swipe →")}
</div>`;
    }

    if (slide.kind === "quick") {
      return `<div class="mpc-slide is-quick">
  <p class="s-eyebrow">${esc(slide.eyebrow || "Quick answer")}</p>
  <div class="s-body">
    <div class="s-panel is-quick"><p class="s-quicktext">${esc((slide.lines || [])[0] || "")}</p></div>
  </div>
  ${foot(idx)}
</div>`;
    }

    if (slide.kind === "close") {
      const lines = slide.lines || [];
      return `<div class="mpc-slide is-close">
  <div class="s-body">
    <h2 class="s-title${titleClass(slide.heading)}">${esc(slide.heading)}</h2>
    <p class="s-close-q">${esc(lines[0] || "")}</p>
    <p class="s-close-cta">${esc(lines[1] || "")}</p>
  </div>
  ${foot("themessyparentscollection.com")}
</div>`;
    }

    const more = slide.truncatedItems
      ? `<p class="s-more">+ ${slide.truncatedItems} more in the full guide</p>` : "";
    return `<div class="mpc-slide is-${esc(slide.kind)}">
  ${slide.eyebrow ? `<p class="s-eyebrow">${esc(slide.eyebrow)}</p>` : ""}
  <div class="s-body">
    <div class="s-panel ${panelClass[slide.kind] || ""}">
      ${slide.heading ? `<h3>${esc(slide.heading)}</h3>` : ""}
      <ul>${(slide.lines || []).map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    </div>
    ${more}
  </div>
  ${foot(idx)}
</div>`;
  }

  /* --------------------------------------------------------------------------
     ONE STORY FRAME — 1080×1920, everything inside the safe area
     ------------------------------------------------------------------------ */
  function storyHTML(frame) {
    const tone = frame.kind === "warn" ? "is-warn" : frame.kind === "cta" ? "is-quick" : "";
    return `<div class="mpc-slide is-story is-${esc(frame.kind)}">
  <p class="s-eyebrow">The Messy Parents Collection</p>
  <h2 class="s-title${titleClass(frame.heading)}">${esc(frame.heading)}</h2>
  <div class="s-body">
    ${frame.body ? `<div class="s-panel ${tone}"><p class="s-quicktext">${esc(frame.body)}</p></div>` : ""}
  </div>
  ${frame.image ? art(frame) : ""}
  ${foot(frame.kind === "cta" ? "Link in bio" : "")}
</div>`;
  }

  /* A complete standalone document.

     `tokensCss` INLINES assets/css/tokens.css. That is not an optimisation, it
     is the only thing that works in the export renderer: Playwright's
     setContent() gives the page an about:blank URL, so a <link> to
     /assets/css/tokens.css cannot resolve — the page would render with no
     custom properties at all, which looks like plain white text on white and
     is easy to miss until the slides are already exported.

     `cssHref` remains for the browser, where a root-absolute link does
     resolve. Pass one or the other, never both.  */
  function documentHTML(innerHTML, { cssHref, tokensCss, title = "slide" } = {}) {
    const tokens = tokensCss
      ? `<style>${tokensCss}</style>`
      : `<link rel="stylesheet" href="${esc(cssHref || "/assets/css/tokens.css")}">`;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
${tokens}
<style>html,body{margin:0;padding:0;background:#fff}${css()}</style>
</head><body>${innerHTML}</body></html>`;
  }

  return { css, slideHTML, storyHTML, documentHTML, SAFE, esc };
});
