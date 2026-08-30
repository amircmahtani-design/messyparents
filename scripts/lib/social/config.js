/* ============================================================================
   SOCIAL — CONFIGURATION AND THE PUBLISHING LOCK

   This file is the single place that decides whether anything may be published
   to Instagram. Everything else asks it; nothing else reads the environment
   variable directly, so there is exactly one line of code that can ever answer
   "yes" and it is in this file.

   THE LOCK FAILS CLOSED.

   `publishingEnabled()` returns true only when SOCIAL_PUBLISHING_ENABLED is
   the exact string "true". Absent, empty, "1", "yes", "TRUE ", undefined, a
   typo, a variable someone deleted — all of them are false. That is
   deliberate: the safe state has to be the one you get by accident.

   Read the test that guards this: tests/social-publishing-lock.js walks every
   value that has ever looked like a boolean and asserts that only one of them
   opens the door.
   ========================================================================== */

/* --------------------------------------------------------------------------
   THE LOCK
   ------------------------------------------------------------------------ */

/* The only truthy value. Not a list, not a regex, not a coercion. */
const ENABLED_VALUE = "true";

function publishingEnabled(env) {
  const e = env || (typeof process !== "undefined" ? process.env : {}) || {};
  return e.SOCIAL_PUBLISHING_ENABLED === ENABLED_VALUE;
}

/* Whether Meta credentials exist at all. Separate from the lock on purpose:
   during this phase BOTH are false, and a future phase will turn them on one
   at a time. Publishing needs both, and asks for both. */
function metaConfigured(env) {
  const e = env || (typeof process !== "undefined" ? process.env : {}) || {};
  return Boolean(
    e.IG_ACCESS_TOKEN && e.IG_USER_ID &&
    String(e.IG_ACCESS_TOKEN).trim() && String(e.IG_USER_ID).trim()
  );
}

/* Why publishing is unavailable, in words a human can act on. Returns an empty
   array when publishing is genuinely available. */
function lockReasons(env) {
  const reasons = [];
  if (!publishingEnabled(env)) {
    reasons.push("SOCIAL_PUBLISHING_ENABLED is not \"true\" — the publishing lock is closed.");
  }
  if (!metaConfigured(env)) {
    reasons.push("No Meta credentials are configured (IG_ACCESS_TOKEN / IG_USER_ID).");
  }
  return reasons;
}

/* Throws unless publishing is both unlocked AND configured. Every code path
   that could reach Meta calls this first. It is not advisory: there is no
   variant that logs a warning and continues. */
function assertPublishingAllowed(env) {
  const reasons = lockReasons(env);
  if (reasons.length) {
    const err = new Error("PUBLISHING_DISABLED: " + reasons.join(" "));
    err.code = "PUBLISHING_DISABLED";
    err.reasons = reasons;
    throw err;
  }
}

/* --------------------------------------------------------------------------
   PACKAGE STATES

   One-way, and there is no state that means "will publish by itself".

   DRAFT ........... generated, not yet looked at
   NEEDS_REVIEW .... presented for a decision
   APPROVED_HELD ... approved, hashed, and going nowhere
   REJECTED ........ declined, with an optional reason

   PUBLISHED exists so the dashboard has a place to put things later. Nothing
   in this phase can write it, and tests assert that.
   ------------------------------------------------------------------------ */
const STATES = {
  DRAFT: "DRAFT",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  APPROVED_HELD: "APPROVED_HELD",
  REJECTED: "REJECTED",
  PUBLISHED: "PUBLISHED"
};

/* The states a browser is allowed to ask the server to move a package into.
   APPROVED_HELD is absent deliberately — approval is not a status update, it
   is its own endpoint that computes a hash. PUBLISHED is absent because
   nothing may reach it in this phase. */
const CLIENT_REQUESTABLE_STATES = [STATES.DRAFT, STATES.NEEDS_REVIEW, STATES.REJECTED];

/* --------------------------------------------------------------------------
   COLLECTIONS AND PREFIXES
   ------------------------------------------------------------------------ */
const COLLECTION = "social_packages";
const STATE_DOC = "social_state/dashboard";
const STORAGE_PREFIX = "social/";

/* --------------------------------------------------------------------------
   FORMATS

   Meta accepts JPEG and nothing else for images, and requires the file to sit
   at a publicly reachable URL. Those two facts drive the whole renderer, so
   they live here rather than being remembered in three places.
   ------------------------------------------------------------------------ */
const FORMATS = {
  carousel: { width: 1080, height: 1350, ratio: "4:5",  label: "Carousel" },
  story:    { width: 1080, height: 1920, ratio: "9:16", label: "Story" },
  reel:     { width: 1080, height: 1920, ratio: "9:16", label: "Reel (future)" }
};

/* Meta's limit. A carousel may not exceed this many items. */
const MAX_SLIDES = 10;

/* The publishable image format. PNG is permitted as a local review export
   only — see scripts/social-render.js — and never enters a publish payload. */
const PUBLISH_IMAGE_FORMAT = "jpeg";

/* --------------------------------------------------------------------------
   THE ACCOUNT
   ------------------------------------------------------------------------ */
const INSTAGRAM_HANDLE = "themessyparentscollection";
const INSTAGRAM_URL = "https://www.instagram.com/themessyparentscollection/";

module.exports = {
  publishingEnabled, metaConfigured, lockReasons, assertPublishingAllowed,
  STATES, CLIENT_REQUESTABLE_STATES,
  COLLECTION, STATE_DOC, STORAGE_PREFIX,
  FORMATS, MAX_SLIDES, PUBLISH_IMAGE_FORMAT,
  INSTAGRAM_HANDLE, INSTAGRAM_URL,
  ENABLED_VALUE
};
