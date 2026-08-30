/* ============================================================================
   SOCIAL — GENERATE PACKAGES

   POST { slugs: ["…"], all?: bool, replace?: bool, isTest?: bool }

   Composes a package for each requested guide and writes it as a DRAFT. The
   composition itself is scripts/lib/social/compose.js, which only ever shortens
   approved guide text — no model, no API key, no network call.

   DUPLICATES. One live package per guide. A second request for a guide that
   already has a DRAFT, NEEDS_REVIEW or APPROVED_HELD package is refused unless
   `replace` is set, and the response names the package that is in the way. A
   REJECTED package never blocks: rejecting something is how you ask for
   another go at it.

   Regenerating with `replace` on an APPROVED_HELD package is allowed, and it
   deliberately DROPS the approval — the new content was never approved, so it
   comes back as a DRAFT with the hash cleared.
   ========================================================================== */

const { guard, json, col, listPackages, stamp } = require("../../scripts/lib/social/server");
const D = require("../../scripts/lib/data");
const Sel = require("../../scripts/lib/social/select");
const C = require("../../scripts/lib/social/compose");
const V = require("../../scripts/lib/social/validate");
const Safety = require("../../scripts/lib/social/safety");
const CFG = require("../../scripts/lib/social/config");

exports.handler = guard("POST", async ({ db, body, user }) => {
  const loaded = await D.load();
  const eligible = Sel.eligibleGuides(loaded);
  const existing = await listPackages(db);

  let wanted;
  if (body.all) wanted = Sel.spreadTopics(eligible);
  else {
    const slugs = [].concat(body.slugs || []).filter(Boolean);
    if (!slugs.length) return json(400, { error: "Nothing selected." });
    wanted = slugs.map(s => eligible.find(g => g.slug === s)).filter(Boolean);
    const missing = slugs.filter(s => !eligible.some(g => g.slug === s));
    if (missing.length && !wanted.length) {
      return json(400, { error: `Not eligible: ${missing.join(", ")}` });
    }
  }

  const created = [], skipped = [];
  const batch = db.batch();
  const now = Date.now();

  wanted.forEach((guide, i) => {
    const blocker = Sel.blockingPackageFor(guide.slug, existing);
    if (blocker && !body.replace) {
      skipped.push({ slug: guide.slug, reason: `already has a ${blocker.status} package`, packageId: blocker.id });
      return;
    }

    const pkg = C.composePackage(guide, { topics: loaded.topics, now, slotOffset: i, isTest: !!body.isTest });
    pkg.validation = V.validatePackage(pkg).concat(Safety.lintPackage(pkg, guide));
    pkg.guideDataSource = loaded.source;
    pkg.createdAt = new Date().toISOString();
    pkg.createdBy = user.email || null;

    /* Reusing the blocked package's id keeps one document per guide rather
       than accumulating history nobody asked for. Regeneration clears the
       approval outright: the new words were never approved. */
    const ref = blocker ? col(db).doc(blocker.id) : col(db).doc();
    batch.set(ref, stamp(Object.assign({}, pkg, {
      status: CFG.STATES.DRAFT,
      approvedHash: null, approvedAt: null, approvedBy: null,
      regeneratedFrom: blocker ? blocker.status : null
    }), user));

    created.push({ id: ref.id, slug: guide.slug, title: guide.title,
      slides: pkg.slides.length,
      errors: pkg.validation.filter(f => f.level === "error").length });
  });

  if (created.length) await batch.commit();

  return json(200, { created, skipped, guideSource: loaded.source });
});
