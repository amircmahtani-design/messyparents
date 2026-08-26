/* ============================================================================
   BAKING — moving Studio's editable content out of the browser and into the
   HTML the CDN serves.

   Every public page used to boot the Firebase SDK, open a Firestore
   connection and read the `pages` and `meta` collections before it could show
   the right wording, the right footer, the right hero illustration, the right
   topic pills or the right list of books. All of that is content that changes
   when Amir edits it in Studio — which is to say, rarely, and never while a
   reader is looking at the page.

   So it is applied here instead, once per deploy, from the same Firestore
   data. The reader gets the finished page. There is nothing to fetch and
   nothing to swap in afterwards, which also means no flash and no layout
   shift as text and images arrive late.

   The functions below mirror the ones they replaced in mpc-store.js
   (applyText, applyFooter, applyPage, applyBooks) so what lands in the HTML is
   exactly what the browser used to produce.

   IDEMPOTENCY

   The build rewrites files in the repo checkout. On Netlify that is a fresh
   clone every time, so this is a non-issue there — but it must also be safe to
   run twice locally, and it must be possible to CLEAR an override in Studio
   and get the shipped wording back.

   So whenever a value is replaced, the original is kept in a `data-mpc-default`
   attribute and restored before the next value is applied. An element with no
   override is never touched and never grows the attribute, so the common case
   costs nothing.
   ========================================================================== */

"use strict";

/* Age labels contain an en-dash ("0–1 month"). Same slug the build uses, so a
   pill's href and the generated page agree. */
const ageSlug = (label) =>
  String(label || "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* An attribute value has to survive being read back out again. */
const attrEsc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
  .replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attrUnesc = (s) => String(s == null ? "" : s)
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/* --------------------------------------------------------------------------
   The formatting Studio-authored text is allowed to carry. Ported verbatim
   from mpc-store.js so a string renders identically whether it was applied in
   the browser (as it used to be) or here (as it is now).
   ------------------------------------------------------------------------ */
function inlineHTML(text) {
  return esc(text)
    /* [label](url) -> link. Same-site paths and http(s)/mailto only, so a
       stray "javascript:" can never end up in an href. */
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (whole, label, href) =>
      /^(https?:\/\/|mailto:|\/|[\w.-]+\.html|#)/i.test(href)
        ? `<a href="${href}">${label}</a>`
        : whole)
    /* *stars* -> the cream highlight used behind headline words. */
    .replace(/\*([^*\n]+)\*/g, '<span class="hl">$1</span>');
}

function proseHTML(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)                       // blank line = new paragraph
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => "<p>" + inlineHTML(p).replace(/\n/g, "<br>") + "</p>")
    .join("");
}

/* Matches MPCStore.applyText: a multi-paragraph value becomes real
   paragraphs, a single line is dropped straight in so a heading stays a
   heading. */
function renderValue(v) {
  const s = String(v);
  return /\n\s*\n/.test(s) ? proseHTML(s) : inlineHTML(s.trim());
}

/* --------------------------------------------------------------------------
   A minimal element scanner.

   Some editable elements contain markup of their own — a link inside a band
   subtitle, an <s> inside the hero title — so the closing tag cannot be found
   with a lazy regex. This walks forward counting same-name opens and closes,
   which is enough for the shapes that actually occur in these pages and
   avoids pulling in a parser for six attributes.
   ------------------------------------------------------------------------ */
function eachElement(html, attrName, visit) {
  const open = new RegExp(`<([a-zA-Z][\\w-]*)\\b([^>]*\\s${attrName}="([^"]*)"[^>]*)>`, "g");
  let out = "", cursor = 0, m;

  while ((m = open.exec(html))) {
    const [full, tag, attrs, key] = m;
    const start = m.index;
    const contentStart = start + full.length;

    /* Find the matching close, allowing nested elements of the same name. */
    const scan = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, "gi");
    scan.lastIndex = contentStart;
    let depth = 1, contentEnd = -1, closeEnd = -1, s;
    while ((s = scan.exec(html))) {
      if (s[0][1] === "/") {
        depth--;
        if (depth === 0) { contentEnd = s.index; closeEnd = s.index + s[0].length; break; }
      } else depth++;
    }
    if (contentEnd === -1) continue;      // unbalanced: leave it alone

    const result = visit({
      tag, attrs, key,
      content: html.slice(contentStart, contentEnd)
    });

    if (result == null) continue;         // nothing to change

    out += html.slice(cursor, start) +
      `<${tag}${result.attrs}>${result.content}</${tag}>`;
    cursor = closeEnd;
    open.lastIndex = closeEnd;
  }
  return out + html.slice(cursor);
}

/* Set or replace one attribute on an already-captured attribute string. */
function setAttr(attrs, name, value) {
  const re = new RegExp(`\\s${name}="[^"]*"`);
  const cleaned = attrs.replace(re, "");
  return value == null ? cleaned : `${cleaned} ${name}="${attrEsc(value)}"`;
}
function getAttr(attrs, name) {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(attrs);
  return m ? attrUnesc(m[1]) : null;
}

/* --------------------------------------------------------------------------
   TEXT — <p data-mpc-text="the.key">
   ------------------------------------------------------------------------ */
function applyText(html, text) {
  text = text || {};

  html = eachElement(html, "data-mpc-text", ({ attrs, key, content }) => {
    /* Restore first, so clearing an override in Studio genuinely resets. */
    const saved = getAttr(attrs, "data-mpc-default");
    const original = saved != null ? saved : content;

    const v = text[key];
    const hasOverride = v != null && String(v).trim() !== "";

    if (!hasOverride) {
      /* Back to what ships in the markup, and drop the bookkeeping. */
      if (saved == null) return null;
      return { attrs: setAttr(attrs, "data-mpc-default", null), content: original };
    }
    return {
      attrs: setAttr(attrs, "data-mpc-default", original),
      content: renderValue(v)
    };
  });

  /* Editable attributes, e.g. data-mpc-attr="placeholder:search.placeholder".
     Plain text only — an attribute cannot take markup. */
  html = html.replace(/<([a-zA-Z][\w-]*)\b([^>]*\sdata-mpc-attr="([^"]*)"[^>]*)>/g,
    (full, tag, attrs, spec) => {
      const [name, key] = String(spec).split(":");
      if (!name || !key) return full;
      const saved = getAttr(attrs, "data-mpc-attr-default");
      const original = saved != null ? saved : (getAttr(attrs, name) || "");
      const v = text[key];
      if (v == null || String(v).trim() === "") {
        if (saved == null) return full;
        let a = setAttr(attrs, "data-mpc-attr-default", null);
        a = setAttr(a, name, original);
        return `<${tag}${a}>`;
      }
      let a = setAttr(attrs, "data-mpc-attr-default", original);
      a = setAttr(a, name, String(v).trim());
      return `<${tag}${a}>`;
    });

  return html;
}

/* --------------------------------------------------------------------------
   FOOTER — the copyright line and the disclaimer under it.

   {year} is deliberately NOT resolved here. A deploy in December would freeze
   the wrong year into every page until the next one, so the token survives
   into the HTML and the three-line inline script on each page fills it in.
   ------------------------------------------------------------------------ */
function applyFooter(html, footer) {
  const cfg = footer || {};
  const map = { "data-foot-copy": "copyright", "data-foot-note": "note" };

  for (const attr of Object.keys(map)) {
    html = eachElement(html, attr, ({ attrs, content }) => {
      const saved = getAttr(attrs, "data-mpc-default");
      const original = saved != null ? saved : content;
      const raw = cfg[map[attr]] == null ? "" : String(cfg[map[attr]]).trim();

      if (!raw) {
        if (saved == null) return null;
        return { attrs: setAttr(attrs, "data-mpc-default", null), content: original };
      }
      /* Keep {year} intact and keep the span the year script writes into. */
      const withYear = raw.replace(/\{year\}/gi, '<span id="year">{year}</span>');
      return {
        attrs: setAttr(attrs, "data-mpc-default", original),
        content: inlineHTML(withYear)
          .replace(/&lt;span id=&quot;year&quot;&gt;/g, '<span id="year">')
          .replace(/&lt;\/span&gt;/g, "</span>")
      };
    });
  }
  return html;
}

/* --------------------------------------------------------------------------
   HERO ILLUSTRATION

   This one is worth more than it looks. The <img> used to ship with NO src at
   all — only a data-default — because the real choice lived in Firestore and
   painting the default first would have caused a visible swap. The cost was
   that the page's largest image could not be discovered by the browser's
   preload scanner, could not start downloading until Firebase had booted,
   connected and answered, and was the LCP element on three of the five public
   pages.

   Writing the resolved src here makes it discoverable in the initial HTML,
   which is the single biggest LCP change in this work. `ready` goes on too,
   since the CSS keeps the image transparent until that class appears.
   ------------------------------------------------------------------------ */
const REMOTE_IMG = /^https:\/\/firebasestorage\.googleapis\.com\//;

function applyHero(html, pageCfg, img) {
  return html.replace(/<img\b([^>]*\bid="pageHeroImg"[^>]*)>/g, (full, attrs) => {
    const shipped = getAttr(attrs, "data-default") || "";
    const chosen = (pageCfg && pageCfg.image) || shipped || "";
    if (!chosen) return full;

    let a = setAttr(attrs, "src", img(chosen, 1100));
    a = setAttr(a, "data-src-original", chosen);

    /* ---- responsive sources ----------------------------------------------
       index.html and popular.html ship a srcset of pre-sized copies of the
       DEFAULT illustration, so a phone downloads an 800px picture instead of
       the full-size one. That list is only correct while the default is what
       is actually being shown.

       The moment Studio points this slot at a different picture, the shipped
       list describes the wrong image entirely — and srcset wins over src, so
       the page would quietly keep serving the old illustration and the upload
       would appear to have done nothing. So whenever the chosen image is not
       the shipped default, the shipped list is thrown away and rebuilt:
       through Netlify's image CDN for a Studio upload (it resizes on demand,
       which is what MPC.img already does for the single src), and dropped
       entirely for anything else, leaving src on its own as it was before.

       Nothing is touched in the common case — no override, shipped default,
       list left exactly as the HTML wrote it. */
    if (chosen !== shipped) {
      if (REMOTE_IMG.test(chosen)) {
        a = setAttr(a, "srcset",
          [560, 800, 1100].map(w => `${img(chosen, w)} ${w}w`).join(", "));
      } else {
        a = setAttr(a, "srcset", null);
        a = setAttr(a, "sizes", null);
      }
    }
    /* Below the header but at the top of the page: this is the LCP candidate
       on the browse pages, so it must not be lazy. */
    a = setAttr(a, "loading", "eager");
    a = setAttr(a, "fetchpriority", "high");
    a = setAttr(a, "decoding", "async");

    const cls = getAttr(a, "class") || "";
    if (!/\bready\b/.test(cls)) a = setAttr(a, "class", (cls + " ready").trim());
    return `<img${a}>`;
  });
}

/* --------------------------------------------------------------------------
   ABOUT PAGE — four illustration slots, each with its own size and side.
   Mirrors applyAboutPage()/applyAboutArt() in mpc-store.js.
   ------------------------------------------------------------------------ */
const ABOUT_DEFAULTS = {
  hero: "/assets/img/papa.webp",
  middle: "/assets/img/mama.webp",
  who: "/assets/img/family.webp",
  notare: "/assets/img/couple.webp"
};

function applyAbout(html, pageCfg, img) {
  const pg = pageCfg || {};

  const heroCfg = Object.assign({}, pg.hero);
  if (!heroCfg.image && pg.image) heroCfg.image = pg.image;

  /* "Who we are" and "What we are not" each have their own slot now; fall back
     to the old single "bottom" slot for previously-saved data. */
  const legacy = pg.bottom, legacyTarget = (legacy && legacy.target) || "who";
  const slots = {
    hero: heroCfg,
    middle: pg.middle,
    who: pg.who || (legacyTarget === "who" ? legacy : null),
    notare: pg.notare || (legacyTarget === "notare" ? legacy : null)
  };

  for (const name of Object.keys(slots)) {
    const c = slots[name] || {};
    const src = c.image || ABOUT_DEFAULTS[name];

    html = html.replace(
      new RegExp(`<section\\b([^>]*\\bdata-illus="${name}"[^>]*)>`, "g"),
      (full, attrs) => {
        let cls = (getAttr(attrs, "class") || "")
          .replace(/\b(has-art|art-small|art-medium|art-large)\b/g, "")
          .replace(/\s+/g, " ").trim();
        if (src) cls += " has-art";
        cls += " art-" + (c.width || "medium");
        let a = setAttr(attrs, "class", cls.trim());
        if (c.align === "left" || c.align === "right") a = setAttr(a, "data-pos", c.align);
        return `<section${a}>`;
      });

    if (!src) continue;

    /* The matching <img> inside that section. */
    const secRe = new RegExp(`(<section\\b[^>]*\\bdata-illus="${name}"[^>]*>)([\\s\\S]*?)</section>`);
    html = html.replace(secRe, (full, open, inner) => {
      const patched = inner.replace(/<img\b([^>]*\bdata-illus-img\b[^>]*)>/, (im, attrs) => {
        let a = setAttr(attrs, "src", img(src, 1100));
        a = setAttr(a, "data-src-original", src);
        a = setAttr(a, "decoding", "async");
        /* Only the hero slot is above the fold. */
        a = setAttr(a, "loading", name === "hero" ? "eager" : "lazy");
        if (name === "hero") a = setAttr(a, "fetchpriority", "high");
        const cls = getAttr(a, "class") || "";
        if (!/\bready\b/.test(cls)) a = setAttr(a, "class", (cls + " ready").trim());
        const mw = parseInt(c.maxw, 10);
        const style = (getAttr(a, "style") || "").replace(/--art-max:[^;]*;?/, "");
        a = setAttr(a, "style", mw > 0 ? (style + "--art-max:" + mw + "px").trim() : (style || null));
        return `<img${a}>`;
      });
      return open + patched + "</section>";
    });
  }
  return html;
}

/* --------------------------------------------------------------------------
   BOOKS — mirrors bookCardHTML()/applyBooks() in mpc-store.js.
   ------------------------------------------------------------------------ */
const BOOK_DEFAULTS = [
  { title: "Ari & Papa: The First Hundred Nights",
    summary: "The newborn stretch, told honestly. Feeding at 4am, the day-night confusion, the shift system that saves marriages, and the visitors who mean well. Short chapters, because you will be reading it one-handed.",
    status: "Out now" },
  { title: "Ari & Papa: Everyone Says It Gets Easier",
    summary: "Four to twelve months. Solids, the sleep changes nobody warned you about, rolling and crawling and the arrival of opinions. Includes the complete list of things we blamed on teething.",
    status: "Coming soon" },
  { title: "The Messy Parents Handbook",
    summary: "Every guide on this site, in order, with the red-flag lists on their own pages so you can find them fast. Designed to live next to the changing table and get covered in something.",
    status: "In progress" }
];

function bookCardHTML(b, img) {
  b = b || {};
  const title = esc(b.title || "Untitled");
  const summary = esc(b.summary || "");
  const status = b.status
    ? `<span class="status ${/out/i.test(b.status) ? "status--out" : ""}">${esc(b.status)}</span>`
    : "";
  const cover = b.cover
    ? `<img src="${esc(img(b.cover, 600))}" alt="${title} cover" loading="lazy" decoding="async" width="600" height="900">`
    : `<div class="book-cover-empty" aria-hidden="true"><span>${title}</span></div>`;
  return '<article class="book-card">' +
    `<div class="book-cover">${cover}</div>` +
    `<div class="book-body">${status}<h3>${title}</h3>` +
    (summary ? `<p class="book-summary">${summary}</p>` : "") +
    "</div></article>";
}

function applyBooks(html, books, img) {
  const items = (Array.isArray(books) && books.length) ? books : BOOK_DEFAULTS;
  const markup = items.map((b) => bookCardHTML(b, img)).join("");
  return html.replace(
    /(<div class="book-grid" id="bookGrid"[^>]*>)(?:<!--MPC:BOOKS:START-->[\s\S]*?<!--MPC:BOOKS:END-->)?/,
    (m, open) => `${open}<!--MPC:BOOKS:START-->${markup}<!--MPC:BOOKS:END-->`);
}

/* --------------------------------------------------------------------------
   FILTER PILLS

   Built in the browser from TOPICS and AGES, which meant guides.js had to be
   on the page for a row of five buttons to appear. Baked now, so the filter
   row is complete on arrival and the catalogue script is free to load late.
   ------------------------------------------------------------------------ */
function applyPills(html, topics, ages, selected) {
  selected = selected || {};

  /* ONE set of pills, and they are real links.

     They used to be <button>s, and crawlers do not click buttons — so the
     twelve topic and age landing pages had nothing pointing at them and a
     second row of plain links had to be baked at the bottom of the page purely
     to make them reachable. Two rows of the same thing, one of them there for
     a machine.

     As <a href> the pill is the link. The page script intercepts the click and
     filters in place exactly as before, so the behaviour a reader gets is
     unchanged — but a crawler follows it, and if the JavaScript ever fails the
     click still lands on a working topic page instead of doing nothing.

     STATE: data-on for the styling, aria-current for the announcement.

     These used to carry aria-pressed. That was correct while they were
     buttons — but aria-pressed is only allowed on a button, and the moment
     they became links it turned into invalid ARIA on every pill on every
     browse and landing page. Lighthouse fails the whole page for it
     (aria-allowed-attr), and a screen reader is entitled to ignore it, so the
     state it was there to announce was not reliably announced either.

     data-on carries the visual state (the CSS matches on it), and
     aria-current="true" — which IS allowed on a link — announces the pill the
     reader is currently filtered to. aria-current is written only when the
     filter is on; an absent attribute is how "not current" is expressed. */
  const state = (on) => ` data-on="${on}"` + (on ? ' aria-current="true"' : "");

  const topicPills = topics.map((t) =>
    `<a class="pill" href="/topics/${esc(t.id)}/" data-topic="${esc(t.id)}"` +
    `${state(t.id === selected.topic)}>` +
    `${t.iconHTML || ""}<span>${esc(t.label)}</span></a>`).join("");

  const agePills = ages.map((a) =>
    `<a class="pill pill--age" href="/ages/${esc(ageSlug(a))}/" data-age="${esc(a)}"` +
    `${state(a === selected.age)}>${esc(a)}</a>`).join("");

  const bake = (id) => new RegExp(
    `(<div[^>]*\\bid="${id}"[^>]*>)(?:<!--MPC:PILLS:START-->[\\s\\S]*?<!--MPC:PILLS:END-->)?`);

  html = html.replace(bake("topicPills"),
    (m, open) => `${open}<!--MPC:PILLS:START-->${topicPills}<!--MPC:PILLS:END-->`);
  html = html.replace(bake("agePills"),
    (m, open) => `${open}<!--MPC:PILLS:START-->${agePills}<!--MPC:PILLS:END-->`);
  return html;
}

module.exports = {
  applyText, applyFooter, applyHero, applyAbout, applyBooks, applyPills,
  inlineHTML, proseHTML, esc,
  ABOUT_DEFAULTS, BOOK_DEFAULTS
};
