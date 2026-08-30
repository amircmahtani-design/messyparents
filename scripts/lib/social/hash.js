/* ============================================================================
   SOCIAL — THE APPROVAL HASH

   Approval in this system is not a status field. It is a signature over the
   exact content that was on screen when the button was pressed.

   The server hashes:

     the caption, the hashtags, every slide in order, the story frames,
     the destination URL and the scheduled time

   and stores the digest as `approvedHash`. Anything that later changes one of
   those bytes produces a different digest, and the package is returned to
   review automatically. There is no code path where "approved" survives an
   edit, because "approved" was never a flag — it was a claim about content
   that is no longer true.

   CANONICALISATION MATTERS. Two packages that a human would call identical
   must hash identically, or approvals would break for no reason (key order
   from Firestore is not stable). So the digest is taken over a canonical
   string built field by field in a fixed order, not over JSON.stringify of a
   document.
   ========================================================================== */

const crypto = require("crypto");

/* Normalise one piece of text the way a reader would: trim the ends, collapse
   runs of whitespace, and normalise unicode so a pasted en-dash from one
   editor matches the same character typed in another. */
const norm = (v) => String(v == null ? "" : v).normalize("NFC").replace(/\s+/g, " ").trim();

/* The fields that approval covers, in the order they are hashed. Anything not
   in this list is metadata and may change freely — who last opened the
   package, its dashboard position, a note to self. Anything a follower would
   see IS in this list. */
/* One headline piece, one label, one whatever. The slide shape grew when the
   renderer became a poster renderer — a headline is now a list of coloured
   pieces rather than a string, and a slide carries labels, a band and a CTA.
   Both shapes are serialised here, so a package written by the old composer
   and one written by the new one each hash exactly what a follower would see,
   and neither silently hashes "[object Object]". */
const piece = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return norm(v);
  if (typeof v === "object") {
    /* a headline piece {t, c, em} or a label {label, icon} */
    return [norm(v.t != null ? v.t : v.label), norm(v.c || v.icon), v.em ? "em" : ""]
      .filter(Boolean).join("~");
  }
  return norm(v);
};
const pieces = (list) => (Array.isArray(list) ? list.map(piece).join("¶") : "");

/* How a slide's ARTWORK was made. Part of the signature because the brief is
   explicit that changing the artwork, the references, the manifest version,
   the prompt version or the image model must invalidate approval — an
   approval is a claim about a picture as much as about a sentence. */
function artOf(s) {
  const a = (s && s.art) || {};
  return [
    norm(a.assetPath || a.renderedPath || ""),
    norm(a.assetId || ""),
    norm(a.basePath || ""),
    norm(a.promptVersion || ""),
    norm(a.imageModel || ""),
    norm(a.manifestVersion || ""),
    (Array.isArray(a.referenceIds) ? a.referenceIds.map(norm).join(",") : ""),
    norm(a.contentHash || ""),
    /* The picture's MEANING, not just its bytes: two slides that show
       different things must hash differently even before either has been
       generated, so approving a package commits to what each frame is a
       picture of. */
    norm(a.conceptId || ""),
    norm(a.conceptFingerprint || ""),
    a.width || "", a.height || ""
  ].join("/");
}

function slideLine(s, i, tag) {
  return `${tag}${i}:` +
    norm(s && s.kind) + "|" +
    norm(s && s.family) + "|" +
    norm(s && s.variant) + "|" +
    norm(s && (s.kicker || s.eyebrow)) + "|" +
    norm(s && s.heading) + "|" +
    (Array.isArray(s && s.lines) ? pieces(s.lines) : norm(s && s.body)) + "|" +
    pieces(s && s.items) + "|" +
    norm(s && s.band) + "|" +
    norm(s && s.cta) + "|" +
    (s && s.logo ? "logo" : "") + "|" +
    norm(s && s.concept && s.concept.fingerprint) + "|" +
    (Array.isArray(s && s.cast) ? s.cast.map(norm).join(",") : "") + "|" +
    norm(s && s.image) + "|" +
    artOf(s);
}

/* The fields that approval covers, in the order they are hashed. Anything not
   in this list is metadata and may change freely — who last opened the
   package, its dashboard position, a note to self. Anything a follower would
   see, and everything that decided how the picture was drawn, IS in this list. */
function canonicalString(pkg) {
  const p = pkg || {};
  const parts = [];

  parts.push("v2");                                   // format version
  parts.push("guide:" + norm(p.guideSlug));
  parts.push("format:" + norm(p.format));
  parts.push("caption:" + norm(p.caption));
  parts.push("hashtags:" + (Array.isArray(p.hashtags) ? p.hashtags.map(norm).join(",") : ""));
  parts.push("dest:" + norm(p.destination));
  parts.push("url:" + norm(p.destinationUrl));
  parts.push("fburl:" + norm(p.destinationUrlFacebook));
  parts.push("when:" + norm(p.scheduledFor));

  /* Platform copy. Two captions built from one grounded package, but they are
     what actually gets posted, so they are what is approved. */
  const plats = p.platforms || {};
  ["instagram", "facebook"].forEach(k => {
    const v = plats[k] || {};
    parts.push(`plat:${k}:` + norm(v.caption) + "|" + norm(v.link) +
      "|" + (Array.isArray(v.hashtags) ? v.hashtags.map(norm).join(",") : ""));
  });

  /* The reference set as a whole, so swapping the manifest under a package
     invalidates it even if no individual slide changed. */
  const a = p.artwork || {};
  parts.push("art:" + norm(a.manifestVersion) + "|" + norm(a.promptVersion) +
    "|" + norm(a.imageModel) + "|" + norm(a.engine));

  const slides = Array.isArray(p.slides) ? p.slides : [];
  parts.push("slides:" + slides.length);
  slides.forEach((s, i) => parts.push(slideLine(s, i, "slide")));

  const story = (p.story && Array.isArray(p.story.frames)) ? p.story.frames : [];
  parts.push("story:" + story.length);
  story.forEach((f, i) => parts.push(slideLine(f, i, "story")));

  return parts.join("\n");
}

function contentHash(pkg) {
  return crypto.createHash("sha256").update(canonicalString(pkg), "utf8").digest("hex");
}

/* True when the package still matches the content that was approved. A package
   with no stored hash is never "still approved" — absence is not a match. */
function hashMatches(pkg) {
  if (!pkg || !pkg.approvedHash) return false;
  return contentHash(pkg) === pkg.approvedHash;
}

module.exports = { contentHash, canonicalString, hashMatches, slideLine, artOf };
