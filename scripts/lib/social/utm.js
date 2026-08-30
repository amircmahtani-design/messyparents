/* ============================================================================
   SOCIAL — UTM TAGGING

   Four parameters, no more. GA4 reads all four without configuration, and a
   fifth would only be another thing to get wrong.

     utm_source=instagram
     utm_medium=social
     utm_campaign=ig_YYYY_MM        the month, so month-over-month is trivial
     utm_content=<format>_<slug>    which post, and which format, in one field

   Combining format and slug into utm_content is what keeps this to four while
   still answering "which post" and "which format" separately — GA4 will split
   on the underscore in an exploration, and the format is always the first
   token because slugs never start with one of the format names.
   ========================================================================== */

const { ORIGIN } = require("../site");

const FORMATS = ["carousel", "single", "story", "reel"];

/* ig_2026_09, or fb_2026_09. Padded, so it sorts.

   The prefix follows the SOURCE rather than being hardcoded: once Facebook
   became a first-class destination, `ig_` on a Facebook link would have put
   both platforms in one campaign and made "which platform" unanswerable in
   GA4 without splitting on utm_source everywhere. */
function campaignFor(date, source) {
  const d = date instanceof Date ? date : new Date(date || Date.now());
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const prefix = source === "facebook" ? "fb" : "ig";
  return `${prefix}_${y}_${m}`;
}

/* Build the tagged destination URL for one package.

   `path` is the guide's own url ("/guides/<slug>/"), which already comes from
   site.js guideUrl() — so if the URL shape ever changes, this follows it
   rather than restating it. */
const SOURCES = ["instagram", "facebook"];

function taggedUrl({ path, format, slug, date, source }) {
  if (!path) throw new Error("taggedUrl: path is required");
  if (!FORMATS.includes(format)) {
    throw new Error(`taggedUrl: unknown format "${format}" (expected one of ${FORMATS.join(", ")})`);
  }
  const src = source || "instagram";
  if (!SOURCES.includes(src)) {
    throw new Error(`taggedUrl: unknown source "${src}" (expected one of ${SOURCES.join(", ")})`);
  }
  const url = new URL(path, ORIGIN + "/");
  url.searchParams.set("utm_source", src);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", campaignFor(date, src));
  url.searchParams.set("utm_content", `${format}_${slug}`);
  return url.toString();
}

/* Read the parameters back off a URL. Used by the tests and by the dashboard,
   so "what will this link actually report" is answerable without squinting. */
function readTags(href) {
  try {
    const u = new URL(href);
    const out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(k => {
      const v = u.searchParams.get(k);
      if (v != null) out[k] = v;
    });
    return out;
  } catch (e) { return {}; }
}

module.exports = { taggedUrl, campaignFor, readTags, FORMATS, SOURCES };
