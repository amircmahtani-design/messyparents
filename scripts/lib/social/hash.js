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
function canonicalString(pkg) {
  const p = pkg || {};
  const parts = [];

  parts.push("v1");                                   // format version
  parts.push("guide:" + norm(p.guideSlug));
  parts.push("format:" + norm(p.format));
  parts.push("caption:" + norm(p.caption));
  parts.push("hashtags:" + (Array.isArray(p.hashtags) ? p.hashtags.map(norm).join(",") : ""));
  parts.push("url:" + norm(p.destinationUrl));
  parts.push("when:" + norm(p.scheduledFor));

  const slides = Array.isArray(p.slides) ? p.slides : [];
  parts.push("slides:" + slides.length);
  slides.forEach((s, i) => {
    parts.push(
      `slide${i}:` +
      norm(s && s.kind) + "|" +
      norm(s && s.eyebrow) + "|" +
      norm(s && s.heading) + "|" +
      (Array.isArray(s && s.lines) ? s.lines.map(norm).join("¶") : norm(s && s.body)) + "|" +
      norm(s && s.image)
    );
  });

  const story = (p.story && Array.isArray(p.story.frames)) ? p.story.frames : [];
  parts.push("story:" + story.length);
  story.forEach((f, i) => {
    parts.push(
      `story${i}:` +
      norm(f && f.kind) + "|" +
      norm(f && f.heading) + "|" +
      norm(f && f.body) + "|" +
      norm(f && f.image)
    );
  });

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

module.exports = { contentHash, canonicalString, hashMatches };
