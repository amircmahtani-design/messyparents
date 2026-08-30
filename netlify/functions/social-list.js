/* ============================================================================
   SOCIAL — LIST PACKAGES IN ONE STATE

   GET ?status=DRAFT|NEEDS_REVIEW|APPROVED_HELD|REJECTED|PUBLISHED

   Read-only, authenticated. PUBLISHED is a valid query and will always come
   back empty in this phase, because nothing can write it.
   ========================================================================== */

const { guard, json, listPackages } = require("../../scripts/lib/social/server");
const CFG = require("../../scripts/lib/social/config");

const SUMMARY = ["id", "guideSlug", "guideTitle", "guidePath", "topic", "status", "isTest",
  "scheduledFor", "approvedAt", "approvedBy", "rejectedReason", "validation", "updatedAt"];

exports.handler = guard("GET", async ({ db, event }) => {
  const status = (event.queryStringParameters || {}).status;
  if (status && !Object.values(CFG.STATES).includes(status)) {
    return json(400, { error: `unknown status "${status}"` });
  }

  const all = await listPackages(db);
  const rows = all
    .filter(p => !status || p.status === status)
    .map(p => {
      const out = { slides: (p.slides || []).map(s => ({ kind: s.kind })) };
      SUMMARY.forEach(k => { if (p[k] !== undefined) out[k] = p[k]; });
      return out;
    });

  return json(200, { status: status || "all", packages: rows });
});
