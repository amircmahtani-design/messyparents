/* ============================================================================
   THE SEO AUDIT

   Two outputs from one pass:

     - Build-log warnings, so a broken slug or a dangling related-guide link
       shows up in the Netlify deploy log the moment it is introduced.
     - /seo-audit.html, a private page listing every guide against every field
       the later content pass will need to fill in.

   Deliberately advisory. Editorial fields being empty is the expected state
   right now — the brief says build the machine first and optimise the content
   afterwards — so an unwritten meta description is a "to do", not an error.
   Only things that are actually broken (a duplicate URL, a link to a guide
   that does not exist) are errors, and even those do not fail the deploy.
   ========================================================================== */

const S = require("./site");

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function runAudit({ guides, topics, ages, topicPages, agePages, settings, source }) {
  const errors = [];
  const warnings = [];
  const todos = [];

  const err  = (id, message) => errors.push({ id, message });
  const warn = (id, message) => warnings.push({ id, message });
  const todo = (id, field, message) => todos.push({ id, field, message });

  /* ---- uniqueness ------------------------------------------------------ */

  const bySlug = new Map();
  const byId = new Map();
  guides.forEach(g => {
    if (byId.has(g.id)) err(g.id, `Duplicate guide id "${g.id}" — one of them will silently overwrite the other.`);
    byId.set(g.id, g);

    if (!/^[a-z0-9][a-z0-9-]*$/.test(g.slug)) {
      err(g.id, `Slug "${g.slug}" is not URL-safe (lowercase letters, digits and hyphens only).`);
    }
    if (bySlug.has(g.slug)) {
      err(g.id, `Slug "${g.slug}" is used by both "${bySlug.get(g.slug).title}" and "${g.title}" — they would share one URL.`);
    }
    bySlug.set(g.slug, g);
  });

  /* Guides, topics and ages live in separate URL namespaces, so a collision is
     impossible by design — but a slug that duplicates a *previous* slug of
     another guide would create a redirect fighting a real page. */
  const previous = new Map();
  guides.forEach(g => g.previousSlugs.forEach(p => {
    if (bySlug.has(p)) {
      err(g.id, `"${g.title}" lists "${p}" as an old slug, but that is the live URL of "${bySlug.get(p).title}". The redirect would shadow a real guide.`);
    }
    if (previous.has(p)) warn(g.id, `Old slug "${p}" is claimed by two guides.`);
    previous.set(p, g);
  }));

  /* ---- integrity -------------------------------------------------------- */

  const topicIds = new Set(topics.map(t => t.id));
  const ageSet = new Set(ages);
  const linkedTo = new Set();

  guides.forEach(g => {
    if (!g.title) err(g.id, "No title — the page would have an empty <h1> and <title>.");
    if (!g.topic || !topicIds.has(g.topic)) {
      err(g.id, `Topic "${g.topic}" does not exist, so this guide has no category page and no breadcrumb.`);
    }
    if (!g.ages.length) warn(g.id, "No age range set — it will not appear on any age landing page.");
    g.ages.forEach(a => {
      if (!ageSet.has(a)) warn(g.id, `Age "${a}" is not one of the site's age bands, so no landing page exists for it.`);
    });

    g.related.forEach(rid => {
      if (!byId.has(rid)) err(g.id, `Related guide "${rid}" does not exist — a dead internal link.`);
      else linkedTo.add(rid);
    });
    if (g.related.includes(g.id)) warn(g.id, "Lists itself as a related guide.");

    if (!g.shortAnswer) {
      err(g.id, "No quick answer and no summary — there is nothing for a search engine to lift as the answer.");
    }

    /* ---- editorial to-dos: expected to be empty today ------------------ */

    if (!g.metaDescription) {
      todo(g.id, "metaDescription", `Falling back to the quick answer (${g.computed.metaDescription.length} chars).`);
    } else if (g.computed.metaDescription.length < 70) {
      warn(g.id, `Meta description is only ${g.computed.metaDescription.length} characters — short enough that Google will probably rewrite it.`);
    }

    if (g.computed.metaTitle.length > 60) {
      warn(g.id, `Title is ${g.computed.metaTitle.length} characters and will be truncated in results.`);
    }

    if (!g.seoTitle) todo(g.id, "seoTitle", "Using the question itself, which is usually right.");
    if (!g.publishedDate) todo(g.id, "publishedDate", "No date set, so datePublished is omitted from the schema rather than invented.");
    if (!g.updatedDate) todo(g.id, "updatedDate", "No date set; the sitemap falls back to the Firestore update time.");
    if (!g.image) todo(g.id, "image", "No illustration — social shares use the site default.");
    else if (!g.imageAlt) todo(g.id, "imageAlt", "Illustration has no alt text of its own; the guide title is used.");
    if (!g.keywords.length) todo(g.id, "keywords", "No target queries recorded yet.");

    /* The single biggest content signal on this site right now. */
    const shown = (g.showDetail === undefined ? settings.sections.detail : g.showDetail);
    if (g.computed.bodyWords > 100 && !shown) {
      todo(g.id, "showDetail",
        `${g.computed.bodyWords} words of original prose exist but are not displayed, so the indexable page is only ~${g.computed.panelWords} words.`);
    }
  });

  /* ---- orphans ---------------------------------------------------------- */

  guides.forEach(g => {
    if (g.noindex) return;
    /* Every guide is reachable from /guides.html and from its topic and age
       landing pages, so a true orphan is impossible. This flags the weaker
       case: a guide nothing else links to contextually. */
    if (!linkedTo.has(g.id)) {
      warn(g.id, "No other guide links to this one — it is reachable only from the index pages.");
    }
  });

  /* ---- site level ------------------------------------------------------- */

  if (!settings.verification.google) {
    warnings.push({ id: "site", message: "No Google Search Console verification token saved yet (Studio → Site → Search & AI)." });
  }
  if (!settings.verification.bing) {
    warnings.push({ id: "site", message: "No Bing Webmaster verification token saved yet (Studio → Site → Search & AI)." });
  }
  if (source !== "firestore") {
    warnings.push({ id: "site", message: `Built from the ${source} copy rather than live Firestore — generated pages may be behind what Studio shows.` });
  }

  return { guides, topics, topicPages, agePages, settings, source, errors, warnings, todos };
}

/* ---------------------------------------------------------------------------
   The audit page.

   Written to /seo-audit.html. It is disallowed in robots.txt, carries
   noindex, and is linked from nowhere — but it is a static file on a public
   host, so it deliberately contains no secrets, only facts about public pages.
   ------------------------------------------------------------------------ */

function writeAuditPage(ROOT, audit, { write }) {
  const { guides, errors, warnings, todos, source, buildProblems } = audit;

  const todosByGuide = new Map();
  todos.forEach(t => {
    if (!todosByGuide.has(t.id)) todosByGuide.set(t.id, []);
    todosByGuide.get(t.id).push(t);
  });
  const issuesByGuide = new Map();
  [...errors.map(e => ({ ...e, kind: "error" })), ...warnings.map(w => ({ ...w, kind: "warn" }))]
    .forEach(i => {
      if (!issuesByGuide.has(i.id)) issuesByGuide.set(i.id, []);
      issuesByGuide.get(i.id).push(i);
    });

  const yes = (b) => b ? '<span class="y">yes</span>' : '<span class="n">no</span>';

  const rows = guides.map(g => {
    const on = (v, d) => (v === undefined || v === null) ? d : !!v;
    const showDetail = on(g.showDetail, audit.settings.sections.detail);
    const iss = issuesByGuide.get(g.id) || [];
    const td = todosByGuide.get(g.id) || [];
    return `<tr class="${iss.some(i => i.kind === "error") ? "row-err" : ""}">
      <td><a href="${esc(g.url)}">${esc(g.title)}</a><br><code>${esc(g.slug)}</code></td>
      <td>${yes(!g.noindex)}</td>
      <td>${esc(g.computed.metaTitle)}<br><small>${g.computed.metaTitle.length} chars ${g.seoTitle ? "(written)" : "(from the question)"}</small></td>
      <td>${esc(g.computed.metaDescription)}<br><small>${g.computed.metaDescription.length} chars ${g.metaDescription ? "(written)" : "(from the quick answer)"}</small></td>
      <td>${esc(g.topic)}<br><small>${esc(g.subcategory || "—")}</small></td>
      <td>${esc(g.ages.join(", ") || "—")}</td>
      <td>${yes(!!g.shortAnswer)}</td>
      <td>${g.computed.panelWords} shown<br><small>${g.computed.bodyWords} hidden${showDetail ? "" : " ⚠"}</small></td>
      <td>${g.related.length}</td>
      <td>${g.image ? yes(!!g.imageAlt) : "<small>no image</small>"}</td>
      <td><small>${esc(g.publishedDate || "—")}<br>${esc(g.updatedDate || g.firestoreUpdateTime.slice(0, 10) || "—")}</small></td>
      <td>${yes(!g.noindex && !g.canonicalOverride)}</td>
      <td>${iss.length ? iss.map(i => `<span class="${i.kind}">${esc(i.message)}</span>`).join("<br>") : ""}
          ${td.length ? `<details><summary>${td.length} to do</summary>${td.map(x => `<div><code>${esc(x.field)}</code> ${esc(x.message)}</div>`).join("")}</details>` : ""}</td>
    </tr>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>SEO audit — ${esc(S.SITE_NAME)}</title>
<style>
  body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:24px;background:#faf7f0;color:#211d18}
  h1{font-size:22px;margin:0 0 4px}
  .meta{color:#6b6255;margin:0 0 20px}
  .cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}
  .card{background:#fff;border:1px solid #e3dccd;border-radius:10px;padding:12px 16px;min-width:120px}
  .card b{display:block;font-size:24px}
  table{border-collapse:collapse;width:100%;background:#fff;font-size:12.5px}
  th,td{border:1px solid #e3dccd;padding:7px 9px;vertical-align:top;text-align:left}
  th{background:#f1ead9;position:sticky;top:0;font-size:12px}
  small{color:#7a7061}
  code{background:#f2ede1;padding:1px 4px;border-radius:3px;font-size:11.5px}
  .y{color:#3f7a2f;font-weight:600}.n{color:#9B2C1F;font-weight:600}
  .error{color:#9B2C1F;display:block}.warn{color:#a8620f;display:block}
  .row-err{background:#fdf4f2}
  details summary{cursor:pointer;color:#3f6fa3}
  .banner{background:#fff4d6;border:1px solid #e6cf94;border-radius:10px;padding:12px 16px;margin-bottom:18px}
</style>
</head>
<body>
<h1>SEO audit</h1>
<p class="meta">${guides.length} guides · data source: <code>${esc(source)}</code> · generated ${new Date().toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>

${buildProblems && buildProblems.length ? `<div class="banner"><strong>Build notes</strong><ul>${buildProblems.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}

<div class="cards">
  <div class="card"><b>${guides.length}</b>guides</div>
  <div class="card"><b>${guides.filter(g => !g.noindex).length}</b>indexable</div>
  <div class="card"><b>${errors.length}</b>errors</div>
  <div class="card"><b>${warnings.length}</b>warnings</div>
  <div class="card"><b>${todos.length}</b>fields to write</div>
</div>

${errors.length ? `<div class="banner"><strong>Errors — these break something</strong><ul>${errors.map(e => `<li><code>${esc(e.id)}</code> ${esc(e.message)}</li>`).join("")}</ul></div>` : ""}

<table>
<thead><tr>
  <th>Guide / URL</th><th>Index?</th><th>Title</th><th>Meta description</th>
  <th>Category</th><th>Ages</th><th>Short answer</th><th>Words</th>
  <th>Related</th><th>Image alt</th><th>Published / updated</th><th>In sitemap</th><th>Notes</th>
</tr></thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>
`;

  write("seo-audit.html", html);

  /* A machine-readable copy for anything that wants to diff builds. */
  write("test-results/seo-audit.json", JSON.stringify({
    generated: new Date().toISOString(),
    source,
    counts: {
      guides: guides.length,
      indexable: guides.filter(g => !g.noindex).length,
      errors: errors.length, warnings: warnings.length, todos: todos.length
    },
    errors, warnings, todos,
    guides: guides.map(g => ({
      id: g.id, slug: g.slug, url: g.url, title: g.title,
      metaTitle: g.computed.metaTitle, metaDescription: g.computed.metaDescription,
      topic: g.topic, ages: g.ages, related: g.related.length,
      shownWords: g.computed.panelWords, hiddenWords: g.computed.bodyWords,
      noindex: g.noindex, publishedDate: g.publishedDate, updatedDate: g.updatedDate
    }))
  }, null, 2));
}

module.exports = { runAudit, writeAuditPage };
