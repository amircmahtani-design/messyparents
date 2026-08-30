/* ============================================================================
   HEAD METADATA + STRUCTURED DATA

   Everything that goes between <head> and </head> for a generated page, and
   every scrap of JSON-LD the site emits.

   Two rules govern this file, and they are not negotiable:

     1. Nothing is invented. If a guide has no published date, no datePublished
        property is emitted — not a guessed one, not the build date. If it has
        no reviewer, there is no reviewedBy.
     2. Nothing is marked up that a reader cannot see. BreadcrumbList is only
        emitted when the breadcrumbs are actually rendered. There is no
        FAQPage, because these guides are not a visible list of questions and
        answers (and Google restricted FAQ rich results to health and
        government sites in 2023, which this deliberately is not).
   ========================================================================== */

const S = require("./site");

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* JSON-LD sits inside a <script> block, so the one character that matters is
   "<". Escaping it as \u003C keeps the JSON valid and the HTML unbreakable. */
const jsonLd = (obj) =>
  '<script type="application/ld+json">' +
  JSON.stringify(obj, null, 0).replace(/</g, "\\u003C") +
  "</script>";

/* Drop empty keys so an unpopulated field never reaches the output as null. */
function compact(obj) {
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v == null) continue;
    if (typeof v === "string" && !v.trim()) continue;
    if (Array.isArray(v) && !v.length) continue;
    out[k] = v;
  }
  return out;
}

/* ---- the entity ---------------------------------------------------------
   Repeated identically on every page via @id references, so search engines
   can see that all 31 (and later 300) guides belong to one publisher.
   ------------------------------------------------------------------------ */

const ORG_ID = S.ORIGIN + "/#organization";
const SITE_ID = S.ORIGIN + "/#website";

function organizationSchema() {
  return compact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: S.SITE_NAME,
    url: S.ORIGIN + "/",
    description: S.TAGLINE,
    logo: compact({
      "@type": "ImageObject",
      url: S.absolute(S.LOGO),
      caption: S.SITE_NAME
    }),
    /* The profiles that are this publisher somewhere else. This is what tells
       a search engine that the domain, the Instagram account and the Facebook
       page are one entity rather than three — so the profiles reinforce the
       site instead of competing with it for the same name.

       The list is SOCIAL_PROFILES in site.js, shared with the footer link row,
       because a profile linked in the footer but missing here is exactly the
       drift this is meant to avoid. compact() drops it while the list is
       empty, so the shape is unchanged on a site with no accounts. */
    sameAs: (S.SOCIAL_PROFILES || []).map(p => p.url)
  });
}

function websiteSchema() {
  return compact({
    "@type": "WebSite",
    "@id": SITE_ID,
    url: S.ORIGIN + "/",
    name: S.SITE_NAME,
    description: S.TAGLINE,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: S.ORIGIN + "/guides.html?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  });
}

function graph(nodes) {
  return jsonLd({ "@context": "https://schema.org", "@graph": nodes.filter(Boolean) });
}

/* ---- a guide ------------------------------------------------------------ */

function articleSchema(g, { topicLabel, showBreadcrumbs, crumbs }) {
  const url = S.absolute(g.canonicalOverride || g.url);
  const nodes = [];

  nodes.push(compact({
    "@type": "Article",
    "@id": url + "#article",
    isPartOf: { "@id": SITE_ID },
    mainEntityOfPage: url,
    url,
    /* The question itself is the headline — it is the <h1> a reader sees. */
    headline: g.computed.metaTitle.slice(0, 110),
    description: g.computed.metaDescription,
    /* The quick-answer box, verbatim and visible on the page. This is the
       passage a retrieval system is most likely to lift, so naming it here
       makes the answer easy to find rather than easy to guess at. */
    abstract: g.shortAnswer || undefined,
    image: g.image ? S.absolute(g.image) : S.absolute(S.DEFAULT_SHARE_IMAGE),
    author: {
      "@type": "Person",
      name: S.AUTHOR_NAME,
      url: S.ORIGIN + "/about.html"
    },
    publisher: { "@id": ORG_ID },
    /* Dates appear only when they are real. An unset date is left out. */
    datePublished: g.publishedDate || undefined,
    dateModified: g.updatedDate || undefined,
    inLanguage: "en",
    isAccessibleForFree: true,
    about: topicLabel ? { "@type": "Thing", name: topicLabel } : undefined,
    /* Citations only when genuine outbound references have been added. */
    citation: g.references.length
      ? g.references.map(r => compact({
          "@type": "CreativeWork", name: r.title || r.url, url: r.url,
          publisher: r.publisher ? { "@type": "Organization", name: r.publisher } : undefined
        }))
      : undefined
  }));

  if (showBreadcrumbs && crumbs && crumbs.length) {
    nodes.push({
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumb",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: S.absolute(c.url)
      }))
    });
  }

  return graph(nodes.concat([organizationSchema(), websiteSchema()]));
}

/* ---- a topic or age landing page ---------------------------------------- */

function collectionSchema({ url, name, description, guides }) {
  const abs = S.absolute(url);
  return graph([
    compact({
      "@type": "CollectionPage",
      "@id": abs + "#page",
      url: abs,
      name,
      description,
      isPartOf: { "@id": SITE_ID },
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: guides.length,
        itemListElement: guides.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: g.title,
          url: S.absolute(g.url)
        }))
      }
    }),
    organizationSchema(),
    websiteSchema()
  ]);
}

function homeSchema() {
  return graph([organizationSchema(), websiteSchema()]);
}

/* ---- the <head> block ---------------------------------------------------
   Returns only the SEO-relevant tags. Fonts, icons, manifest and stylesheets
   come from the page template, so they stay in one place.
   ------------------------------------------------------------------------ */

function metaBlock({
  title, description, canonical, image, imageAlt,
  noindex = false, type = "article", schema = "", verification = {}
}) {
  const abs = S.absolute(canonical);
  const robots = noindex
    ? "noindex, follow"
    /* max-snippet:-1 lets Google and Bing quote as much of the answer as they
       judge useful, which is exactly what a citation needs. Without it they
       cap the snippet and the answer gets cut in half. */
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(abs)}">`,
    `<meta name="robots" content="${robots}">`,
    "",
    `<meta property="og:type" content="${esc(type)}">`,
    `<meta property="og:site_name" content="${esc(S.SITE_NAME)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(abs)}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:image" content="${esc(S.absolute(image || S.DEFAULT_SHARE_IMAGE))}">`,
    imageAlt ? `<meta property="og:image:alt" content="${esc(imageAlt)}">` : "",
    "",
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(S.absolute(image || S.DEFAULT_SHARE_IMAGE))}">`
  ];

  /* Search Console / Bing Webmaster verification. Emitted only when a real
     value has been saved in Studio — never a placeholder. */
  if (verification.google) {
    lines.push(`<meta name="google-site-verification" content="${esc(verification.google)}">`);
  }
  if (verification.bing) {
    lines.push(`<meta name="msvalidate.01" content="${esc(verification.bing)}">`);
  }

  if (schema) { lines.push("", schema); }

  return lines.filter(l => l !== "").join("\n");
}

module.exports = {
  metaBlock, articleSchema, collectionSchema, homeSchema,
  organizationSchema, websiteSchema, graph, jsonLd, esc
};
