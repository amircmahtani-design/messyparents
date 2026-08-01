/* ============================================================
   MESSY PARENTS COLLECTION — renderer
   Reads window.MPC (data/content.js) and builds the page.
   No build step, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  var D = window.MPC;
  if (!D) { console.error('content.js did not load'); return; }

  var ICONS = { feeding: '🍼', sleeping: '🌙', development: '🧸', health: '🩺' };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function paras(s) {
    return String(s || '').split(/\n{2,}/).filter(Boolean)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function el(id) { return document.getElementById(id); }
  function has(entry) {
    if (!entry) return false;
    return !!(entry.headline || entry.summary ||
      (entry.blocks && entry.blocks.length) ||
      (entry.redFlags && entry.redFlags.length) ||
      (entry.atAGlance && entry.atAGlance.length));
  }
  function tabById(id) {
    for (var i = 0; i < D.tabs.length; i++) if (D.tabs[i].id === id) return D.tabs[i];
    return null;
  }

  // ---------- header ----------
  function renderHeader() {
    var current = document.body.getAttribute('data-tab') || '';
    var nav = el('site-nav');
    if (nav) {
      nav.innerHTML = D.tabs.map(function (t) {
        return '<a href="' + t.file + '"' + (t.id === current ? ' aria-current="page"' : '') +
          '>' + esc(t.label) + '</a>';
      }).join('');
    }
    var mb = el('menu-btn');
    if (mb && nav) mb.addEventListener('click', function () { nav.classList.toggle('open'); });
  }

  // ---------- blocks ----------
  function renderBlock(b) {
    switch (b.type) {
      case 'text':
        return '<div class="card">' + (b.heading ? '<h3>' + esc(b.heading) + '</h3>' : '') +
          paras(b.body) + '</div>';

      case 'list':
        return '<div class="card">' + (b.heading ? '<h3>' + esc(b.heading) + '</h3>' : '') +
          '<ul>' + (b.items || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
          '</ul></div>';

      case 'steps':
        return '<div class="card">' + (b.heading ? '<h3>' + esc(b.heading) + '</h3>' : '') +
          '<ol>' + (b.items || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
          '</ol></div>';

      case 'checklist':
        return '<div class="card">' + (b.heading ? '<h3>' + esc(b.heading) + '</h3>' : '') +
          '<ul class="check">' + (b.items || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
          '</ul></div>';

      case 'callout':
        var v = b.variant === 'warn' ? 'warn' : b.variant === 'note' ? 'note' : 'tip';
        return '<div class="callout ' + v + '">' +
          (b.heading ? '<h4>' + esc(b.heading) + '</h4>' : '') + paras(b.body) + '</div>';

      case 'quote':
        return '<div class="card"><blockquote>' + paras(b.body) +
          (b.attribution ? '<cite>' + esc(b.attribution) + '</cite>' : '') + '</blockquote></div>';

      case 'image':
        return '<figure><img src="' + esc(b.src) + '" alt="' + esc(b.alt || b.caption || '') + '">' +
          (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';

      default:
        return '';
    }
  }

  function renderPeriod(tab, period, entry) {
    var out = '<section class="period" id="' + esc(period.id) + '">';
    out += '<div class="period-head">' +
      '<span class="period-badge">' + esc(period.label) + '</span>' +
      '<span class="period-stage">' + esc(period.stage) + '</span>' +
      '</div>';

    if (!has(entry)) {
      out += '<h2>' + esc(period.label) + '</h2>' +
        '<div class="todo"><strong>Nothing here yet</strong>' +
        'Add your writing for <b>' + esc(tab.label) + ' → ' + esc(period.label) + '</b> in ' +
        '<code>data/content.js</code> under <code>content.' + esc(tab.id) + '.' + esc(period.id) + '</code>.' +
        '</div></section>';
      return out;
    }

    out += '<h2>' + esc(entry.headline || period.label) + '</h2>';
    if (entry.summary) out += '<p class="summary">' + esc(entry.summary) + '</p>';

    if (entry.atAGlance && entry.atAGlance.length) {
      out += '<dl class="glance">' + entry.atAGlance.map(function (g) {
        return '<div><dt>' + esc(g.label) + '</dt><dd>' + esc(g.value) + '</dd></div>';
      }).join('') + '</dl>';
    }

    (entry.blocks || []).forEach(function (b) { out += renderBlock(b); });

    if (entry.redFlags && entry.redFlags.length) {
      out += '<div class="redflags"><h3>When to get help</h3><ul>' +
        entry.redFlags.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') +
        '</ul></div>';
    }

    return out + '</section>';
  }

  // ---------- tab page ----------
  function renderTabPage() {
    var tabId = document.body.getAttribute('data-tab');
    var tab = tabById(tabId);
    var main = el('tab-content');
    if (!tab || !main) return;

    var store = (D.content && D.content[tabId]) || {};

    // page head
    var head = el('page-head');
    if (head) {
      head.innerHTML =
        '<div class="eyebrow">Messy Parents Collection</div>' +
        '<h1>' + esc(tab.label) + '</h1>' +
        '<p class="lede">' + esc(tab.intro) + '</p>';
    }

    // sections
    main.innerHTML = D.periods.map(function (p) {
      return renderPeriod(tab, p, store[p.id]);
    }).join('');

    // rail
    var rail = el('rail');
    if (rail) {
      var groups = [];
      D.periods.forEach(function (p) {
        var g = groups[groups.length - 1];
        if (!g || g.year !== p.year) { g = { year: p.year, items: [] }; groups.push(g); }
        g.items.push(p);
      });

      rail.innerHTML =
        '<div class="rail-select"><label class="rail-title" for="rail-jump">Jump to age</label>' +
        '<select id="rail-jump">' + D.periods.map(function (p) {
          return '<option value="' + esc(p.id) + '">' + esc(p.label) +
            (has(store[p.id]) ? '' : ' — empty') + '</option>';
        }).join('') + '</select></div>' +
        '<div class="rail-groups">' + groups.map(function (g) {
          return '<div class="rail-group"><p class="rail-title">' + esc(g.year) + '</p><ul>' +
            g.items.map(function (p) {
              return '<li><a href="#' + esc(p.id) + '" data-p="' + esc(p.id) + '"' +
                (has(store[p.id]) ? ' class="has-content"' : '') + '>' +
                '<span class="rail-dot"></span>' + esc(p.label) + '</a></li>';
            }).join('') + '</ul></div>';
        }).join('') + '</div>';

      var jump = el('rail-jump');
      if (jump) jump.addEventListener('change', function () {
        var t = document.getElementById(this.value);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });

      spy(rail);
    }
  }

  // ---------- scrollspy ----------
  function spy(rail) {
    var links = {};
    Array.prototype.forEach.call(rail.querySelectorAll('a[data-p]'), function (a) {
      links[a.getAttribute('data-p')] = a;
    });
    var sections = document.querySelectorAll('.period');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var first = null;
      Array.prototype.forEach.call(sections, function (s) { if (!first && visible[s.id]) first = s.id; });
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === first); });
      if (first) {
        var jump = el('rail-jump');
        if (jump && jump.value !== first) jump.value = first;
      }
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

    Array.prototype.forEach.call(sections, function (s) { io.observe(s); });
  }

  // ---------- home page ----------
  function renderHome() {
    var grid = el('tab-grid');
    if (!grid) return;
    grid.innerHTML = D.tabs.map(function (t) {
      var store = (D.content && D.content[t.id]) || {};
      var done = D.periods.filter(function (p) { return has(store[p.id]); }).length;
      return '<a class="tab-card" href="' + t.file + '">' +
        '<span class="ico">' + (ICONS[t.id] || '📖') + '</span>' +
        '<h3>' + esc(t.label) + '</h3>' +
        '<p>' + esc(t.tagline) + '</p>' +
        '<span class="go">' + done + ' of ' + D.periods.length + ' age sections ready →</span>' +
        '</a>';
    }).join('');
  }

  // ---------- search ----------
  function buildIndex() {
    var idx = [];
    D.tabs.forEach(function (t) {
      var store = (D.content && D.content[t.id]) || {};
      D.periods.forEach(function (p) {
        var e = store[p.id];
        if (!has(e)) return;
        var text = [e.headline, e.summary];
        (e.atAGlance || []).forEach(function (g) { text.push(g.label, g.value); });
        (e.blocks || []).forEach(function (b) {
          text.push(b.heading, b.body, b.caption, b.attribution);
          (b.items || []).forEach(function (i) { text.push(i); });
        });
        (e.redFlags || []).forEach(function (f) { text.push(f); });
        var body = text.filter(Boolean).join(' · ');
        idx.push({
          tab: t.label, url: t.file + '#' + p.id, period: p.label,
          title: e.headline || p.label, body: body, hay: (body + ' ' + t.label + ' ' + p.label).toLowerCase()
        });
      });
    });
    return idx;
  }

  function initSearch() {
    var overlay = el('search-overlay');
    var input = el('search-input');
    var results = el('search-results');
    var btn = el('search-btn');
    if (!overlay || !input || !results) return;

    var idx = buildIndex();
    var sel = -1, items = [];

    function open() {
      overlay.classList.add('open');
      input.value = ''; sel = -1;
      draw('');
      input.focus();
    }
    function close() { overlay.classList.remove('open'); }

    function snippet(rec, q) {
      var i = rec.body.toLowerCase().indexOf(q);
      if (i < 0) return rec.body.slice(0, 130) + (rec.body.length > 130 ? '…' : '');
      var s = Math.max(0, i - 45);
      return (s > 0 ? '…' : '') + rec.body.slice(s, s + 145) + '…';
    }

    function draw(q) {
      q = q.trim().toLowerCase();
      if (!q) {
        items = [];
        results.innerHTML = '<div class="search-empty">Search every section — try “latch”, “nap”, “teething”.</div>';
        return;
      }
      items = idx.filter(function (r) { return r.hay.indexOf(q) > -1; }).slice(0, 25);
      if (!items.length) {
        results.innerHTML = '<div class="search-empty">Nothing found for “' + esc(q) + '”.</div>';
        return;
      }
      results.innerHTML = items.map(function (r, n) {
        return '<a href="' + esc(r.url) + '" data-n="' + n + '">' +
          '<div class="sr-top">' + esc(r.tab) + ' · ' + esc(r.period) + '</div>' +
          '<div class="sr-title">' + esc(r.title) + '</div>' +
          '<div class="sr-snip">' + esc(snippet(r, q)) + '</div></a>';
      }).join('');
      sel = -1;
    }

    function move(d) {
      if (!items.length) return;
      sel = (sel + d + items.length) % items.length;
      Array.prototype.forEach.call(results.querySelectorAll('a'), function (a, n) {
        a.classList.toggle('sel', n === sel);
        if (n === sel) a.scrollIntoView({ block: 'nearest' });
      });
    }

    if (btn) btn.addEventListener('click', open);
    input.addEventListener('input', function () { draw(this.value); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); return; }
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); open(); return;
      }
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      if (e.key === 'Enter' && sel > -1 && items[sel]) { window.location.href = items[sel].url; }
    });
  }

  // ---------- year ----------
  function stampYear() {
    var y = el('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  renderHeader();
  renderHome();
  renderTabPage();
  initSearch();
  stampYear();
})();
