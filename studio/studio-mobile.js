/* ============================================================================
   MPC Studio — mobile responsive layer (self-installing)
   ----------------------------------------------------------------------------
   Drop-in file. Does everything by itself when loaded:
     • Injects the mobile CSS (drawer, safe areas, 16px input fonts, etc.)
     • Injects the hamburger button into the top bar
     • Injects the drawer backdrop element
     • Wires up open/close/toggle/auto-close behaviour
     • Updates the viewport meta to enable iOS safe-area insets
   Only runs when it detects the Studio markup, so it's safe to load site-wide.
   ========================================================================== */
(function(){
  // Only run on the studio page (detect the .top + .side structure)
  function isStudioPage() {
    return !!(document.querySelector(".top .logo") && document.querySelector("aside.side"));
  }

  const MOBILE_CSS = `
/* Hamburger — hidden on desktop, shown on mobile */
#sideToggle{display:none;background:transparent;border:1px solid var(--line,#e3e6ea);border-radius:9px;padding:0;cursor:pointer;font-size:18px;line-height:1;color:var(--ink,#1f2733);width:40px;height:40px;align-items:center;justify-content:center}
#sideToggle:hover{border-color:#c9ced6}
#sideBackdrop{display:none;position:fixed;inset:0;background:rgba(20,25,33,.45);z-index:40}
body.side-open #sideBackdrop{display:block}
body.side-open{overflow:hidden}

@media (max-width: 900px) {
  .top{flex-wrap:wrap;gap:8px;padding:10px 12px;position:sticky;top:0;z-index:30}
  .top .logo{font-size:15px}
  .top .spacer{display:none}
  .top .who{display:none}
  .badge{font-size:11px;padding:2px 7px}
  .top .btn{padding:7px 10px;font-size:12.5px;min-height:36px}
  #sideToggle{display:inline-flex;order:-1}

  .app{grid-template-columns:1fr;height:auto;min-height:calc(100vh - 60px)}
  .side{position:fixed;top:0;left:0;bottom:0;width:min(84vw,320px);background:var(--panel,#fff);
        border-right:1px solid var(--line,#e3e6ea);box-shadow:4px 0 24px rgba(20,25,33,.15);
        transform:translateX(-105%);transition:transform .22s ease-out;z-index:50;
        padding-top:env(safe-area-inset-top)}
  body.side-open .side{transform:translateX(0)}

  .gitem{padding:12px 14px;font-size:15px}
  .side .search input{padding:12px 14px;font-size:16px}

  .layout3{grid-template-columns:1fr}
  .preview{display:none}
  .work{padding:14px 14px calc(80px + env(safe-area-inset-bottom))}
  .editor{max-width:100%}

  .field{margin-bottom:14px}
  .field label{font-size:13.5px;margin-bottom:5px}
  .field input,.field textarea,.field select{font-size:16px !important;padding:12px 14px;border-radius:10px}
  .field textarea{min-height:100px}

  .meta-row{flex-direction:column;align-items:stretch;gap:12px}
  .meta-row .field{min-width:0;max-width:100%;flex:1 1 auto}

  .col-card{padding:12px 12px 2px}
  .pageimg-row{flex-direction:column;gap:12px}
  .pageimg-thumb{width:100%;height:auto;max-height:200px;object-fit:contain}

  .slot-controls{gap:10px}
  .slot-controls label,.slot-maxw{min-width:45%}

  .actions{position:sticky;bottom:0;background:var(--bg,#f4f5f7);
           padding:12px 0 calc(12px + env(safe-area-inset-bottom));
           margin-top:8px;flex-wrap:wrap;gap:8px}
  .actions .btn{min-height:44px;padding:10px 16px;font-size:14px}
  .actions .btn.danger{margin-left:0}
  .actions .msg{flex-basis:100%}

  .login{margin:24px 14px;padding:22px;max-width:none}
  .login input{font-size:16px;padding:13px 14px}

  .cropcard{width:96%;padding:16px}
  .crophead h2{font-size:16px}

  #charBtn{display:none !important}
  #genPreviewWrap{grid-template-columns:1fr !important}
  #genQAPre{max-height:200px}
}

@media (max-width: 420px) {
  .top{padding:8px 10px;gap:6px}
  .top .logo{font-size:14px}
  .top .btn{font-size:12px;padding:6px 8px}
  #seedBtn{display:none}
  .work{padding:12px 12px calc(80px + env(safe-area-inset-bottom))}
  .col-card{padding:10px 10px 2px}
  .actions .btn{font-size:13.5px;padding:10px 12px}
}
`;

  function inject() {
    if (!isStudioPage()) return;
    if (document.getElementById("mpc-mobile-injected")) return; // guard against double-load

    // 1) Update the viewport meta so iOS safe-area insets work
    let vp = document.querySelector('meta[name="viewport"]');
    if (vp && !/viewport-fit/.test(vp.getAttribute("content") || "")) {
      vp.setAttribute("content", vp.getAttribute("content") + ", viewport-fit=cover");
    }

    // 2) Inject the mobile CSS
    const style = document.createElement("style");
    style.id = "mpc-mobile-injected";
    style.textContent = MOBILE_CSS;
    document.head.appendChild(style);

    // 3) Inject the drawer backdrop
    if (!document.getElementById("sideBackdrop")) {
      const bd = document.createElement("div");
      bd.id = "sideBackdrop";
      document.body.insertBefore(bd, document.body.firstChild);
    }

    // 4) Inject the hamburger button into the top bar
    const top = document.querySelector(".top");
    if (top && !document.getElementById("sideToggle")) {
      const btn = document.createElement("button");
      btn.id = "sideToggle";
      btn.type = "button";
      btn.setAttribute("aria-label", "Open menu");
      btn.textContent = "☰";
      top.insertBefore(btn, top.firstChild);
    }

    // 5) Wire up the toggle behaviour
    const toggle   = document.getElementById("sideToggle");
    const backdrop = document.getElementById("sideBackdrop");
    const side     = document.querySelector("aside.side");

    const open   = () => document.body.classList.add("side-open");
    const close  = () => document.body.classList.remove("side-open");
    const toggleFn = () => document.body.classList.toggle("side-open");

    if (toggle)   toggle.addEventListener("click", toggleFn);
    if (backdrop) backdrop.addEventListener("click", close);

    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    // Auto-close when the user picks a guide or page
    if (side) {
      side.addEventListener("click", e => {
        const btn = e.target.closest(".gitem, #addGuideBtn");
        if (btn && window.matchMedia("(max-width: 900px)").matches) {
          setTimeout(close, 60);
        }
      });
    }

    // If viewport widens past mobile, clear drawer state
    try {
      window.matchMedia("(min-width: 901px)").addEventListener("change", ev => {
        if (ev.matches) close();
      });
    } catch (_) { /* older Safari */ }
  }

  // Studio uses Firebase auth — the .top exists on load but .side might render
  // after login. Try immediately, then retry a few times.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
  // Retries handle the case where studio DOM appears after auth
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    inject();
    if (document.getElementById("mpc-mobile-injected") || tries > 20) clearInterval(iv);
  }, 300);
})();
