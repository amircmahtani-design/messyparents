/* ============================================================================
   SITE CONSTANTS — one source of truth for everything the SEO build needs to
   know about the site as an entity.

   Nothing else in scripts/ hard-codes the domain, the publisher name or the
   URL shapes. Change it here and the sitemap, the canonicals, the structured
   data, robots.txt, llms.txt and the Open Graph tags all follow.
   ========================================================================== */

/* The canonical origin. No trailing slash. If the site ever moves domain this
   is the only line that changes. */
const ORIGIN = "https://themessyparentscollection.com";

/* The publisher/entity name. Used verbatim in Organization schema, in the
   <title> suffix, in og:site_name and in llms.txt, so search engines can tie
   every guide to the same publisher. Do not introduce variants. */
const SITE_NAME = "The Messy Parents Collection";

/* Who writes the guides. This is what the About page says in its own words
   ("Ari & Papa — one baby, two very tired adults"), so it is a real, visible
   attribution rather than an invented byline. */
const AUTHOR_NAME = "Ari & Papa";

const TAGLINE =
  "The things you're googling at 3am, answered in three minutes — by parents " +
  "who were googling them last week.";

/* Used for og:image when a guide has no illustration of its own. */
const DEFAULT_SHARE_IMAGE = "/assets/img/family.webp";
const LOGO = "/assets/img/logo.png";

/* --------------------------------------------------------------------------
   URL SHAPES

   Guides:     /guides/<slug>/
   Topics:     /topics/<topic-id>/
   Ages:       /ages/<age-slug>/

   Topics and ages deliberately live in their OWN namespaces rather than under
   /guides/. If category pages were /guides/sleep/ then a guide could never be
   called "sleep" without colliding with its own category, and the collision
   would only show up as a mysteriously missing page months later. Separate
   prefixes make collisions impossible by construction.
   ------------------------------------------------------------------------ */
const guideUrl  = (slug) => `/guides/${slug}/`;
const topicUrl  = (id)   => `/topics/${id}/`;
const ageUrl    = (slug) => `/ages/${slug}/`;

const absolute = (path) => {
  if (!path) return ORIGIN + "/";
  if (/^https?:\/\//i.test(path)) return path;
  return ORIGIN + (path.startsWith("/") ? path : "/" + path);
};

/* Age labels contain an en-dash ("0–1 month"). Slugify to ASCII so the URL is
   typeable, linkable and survives copy/paste out of a chat message. */
const ageSlug = (label) =>
  String(label || "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")   // – — ‒ etc
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* The pages that exist as hand-written .html files. Listed here so the sitemap
   and the audit both know about them without guessing from the filesystem
   (which would sweep up Studio, the Editor and any stray test page). */
const STATIC_PAGES = [
  { path: "/",              file: "index.html",    changefreq: "weekly",  priority: "1.0" },
  { path: "/guides.html",   file: "guides.html",   changefreq: "weekly",  priority: "0.9" },
  { path: "/popular.html",  file: "popular.html",  changefreq: "weekly",  priority: "0.7" },
  { path: "/about.html",    file: "about.html",    changefreq: "monthly", priority: "0.6" },
  { path: "/books.html",    file: "books.html",    changefreq: "monthly", priority: "0.5" },
  { path: "/editorial.html",file: "editorial.html",changefreq: "yearly",  priority: "0.4" }
];

/* Routes that must never be indexed or listed. Everything here ends up in
   robots.txt and is excluded from the sitemap and llms.txt.

   Note what is NOT here: /.netlify/images. Every Studio-uploaded illustration
   is served through that path by Netlify's image CDN, so blocking the whole
   /.netlify/ prefix would make every guide illustration uncrawlable and hand
   Googlebot a page it cannot fully render. Only the functions are closed. */
const PRIVATE_ROUTES = [
  "/studio/", "/editor/", "/seo-audit.html", "/.netlify/functions/"
];

module.exports = {
  ORIGIN, SITE_NAME, AUTHOR_NAME, TAGLINE,
  DEFAULT_SHARE_IMAGE, LOGO,
  guideUrl, topicUrl, ageUrl, absolute, ageSlug,
  STATIC_PAGES, PRIVATE_ROUTES
};
