/* ============================================================================
   A MINIMAL DOM, FOR RUNNING THE PUBLIC SCRIPTS IN NODE.

   The Playwright audit drives a real browser and is the right tool for
   rendering problems. It needs a browser binary to be downloadable, which is
   not always true in a build sandbox — and "the tests could not run" is the
   worst possible answer for a set of scripts that were rewritten from scratch.

   So this is enough of a DOM to execute mpc-runtime.js, mpc-catalogue.js,
   home.js, guides-search.js and popular.js against the JSON the build actually
   wrote, and assert that filtering and searching return the right guides.

   It is deliberately small and deliberately dumb. It is not a browser and does
   not pretend to be one: it catches "this throws", "this returns the wrong
   guides" and "this asks for a field the index does not carry", which are the
   failure modes that matter for this layer.
   ========================================================================== */

"use strict";

function makeClassList(el) {
  return {
    add(...c) { c.forEach(x => { if (x && !el._classes.includes(x)) el._classes.push(x); }); },
    remove(...c) { el._classes = el._classes.filter(x => !c.includes(x)); },
    contains(c) { return el._classes.includes(c); },
    toggle(c, force) {
      const has = el._classes.includes(c);
      const want = force === undefined ? !has : !!force;
      if (want) this.add(c); else this.remove(c);
      return want;
    }
  };
}

function makeEl(tag, attrs) {
  const el = {
    tagName: String(tag || "div").toUpperCase(),
    _classes: [], _attrs: Object.assign({}, attrs), _listeners: {},
    children: [], parent: null,
    innerHTML: "", textContent: "", hidden: false, value: "",
    style: { setProperty() {}, removeProperty() {} },
    offsetHeight: 60, offsetWidth: 300, scrollHeight: 400, clientWidth: 800,
    getBoundingClientRect: () => ({ height: 60, width: 300 })
  };
  el.classList = makeClassList(el);
  el.dataset = new Proxy({}, {
    get: (_, k) => el._attrs["data-" + String(k).replace(/[A-Z]/g, m => "-" + m.toLowerCase())],
    has: (_, k) => ("data-" + String(k)) in el._attrs
  });
  el.setAttribute = (n, v) => { el._attrs[n] = String(v); };
  el.getAttribute = (n) => (n in el._attrs ? el._attrs[n] : null);
  el.removeAttribute = (n) => { delete el._attrs[n]; };
  el.hasAttribute = (n) => n in el._attrs;
  el.addEventListener = (t, fn) => { (el._listeners[t] = el._listeners[t] || []).push(fn); };
  el.removeEventListener = () => {};
  el.dispatch = (t, ev) => (el._listeners[t] || []).forEach(fn => fn(ev || {}));
  el.appendChild = (c) => { c.parent = el; el.children.push(c); return c; };
  el.querySelector = () => null;
  el.querySelectorAll = () => [];
  el.closest = function (sel) {
    const want = sel.replace(/^\./, "");
    let node = this;
    while (node) {
      if (node._classes.includes(want)) return node;
      node = node.parent;
    }
    return null;
  };
  return el;
}

/* Builds a window with the elements a given page script looks for. */
function makeWindow({ ids = [], selectors = {}, json = {} } = {}) {
  const byId = {};
  for (const id of ids) { byId[id] = makeEl("div"); byId[id]._attrs.id = id; }

  const bySel = {};
  for (const s of Object.keys(selectors)) bySel[s] = selectors[s];

  const doc = {
    readyState: "complete",
    documentElement: makeEl("html"),
    head: makeEl("head"),
    body: makeEl("body"),
    _listeners: {},
    getElementById: (id) => byId[id] || null,
    querySelector: (s) => {
      if (s in bySel) return bySel[s];
      if (s === "body") return doc.body;
      const el = makeEl("div");
      bySel[s] = el;
      return el;
    },
    querySelectorAll: (s) => (s in bySel ? [bySel[s]] : []),
    createElement: (t) => makeEl(t),
    addEventListener: (t, fn) => { (doc._listeners[t] = doc._listeners[t] || []).push(fn); },
    dispatch: (t, ev) => (doc._listeners[t] || []).forEach(fn => fn(ev || {})),
    fonts: { ready: Promise.resolve() }
  };
  doc.body._classes = [];

  const win = {
    document: doc,
    console,
    navigator: { connection: {} },
    location: { search: "", pathname: "/guides.html", href: "http://x/" },
    URLSearchParams,
    Promise, JSON, Math, Date, RegExp, Object, Array, String, Number, Boolean, Error,
    setTimeout, clearTimeout, requestAnimationFrame: (fn) => setTimeout(fn, 0),
    ResizeObserver: null,
    sessionStorage: {
      _d: {}, getItem(k) { return this._d[k] || null; },
      setItem(k, v) { this._d[k] = String(v); }
    },
    requestIdleCallback: (fn) => setTimeout(fn, 0),
    /* Serves the files the build actually wrote. */
    fetch: (url) => {
      const key = String(url).split("?")[0];
      if (key in json) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(json[key]) });
      }
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) });
    },
    byId, bySel, makeEl
  };
  win._listeners = {};
  win.addEventListener = (t, fn) => { (win._listeners[t] = win._listeners[t] || []).push(fn); };
  win.removeEventListener = () => {};
  win.dispatchEvent = () => true;
  win.innerWidth = 390;
  win.innerHeight = 844;
  win.CustomEvent = function (t, o) { return Object.assign({ type: t }, o); };

  win.window = win;
  win.self = win;
  win.top = win;
  win.globalThis = win;
  return win;
}

module.exports = { makeWindow, makeEl };
