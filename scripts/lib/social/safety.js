/* ============================================================================
   SOCIAL — CONTENT SAFETY

   The generator is a re-renderer of approved guide text, not a parenting
   adviser. This file is what makes that a checkable property rather than an
   intention.

   Three independent checks, in increasing order of strength:

   1. BANNED CONSTRUCTIONS — prescriptive, diagnostic or outcome-promising
      phrasing, matched by pattern. Catches the obvious.

   2. UNGROUNDED EXPERIENCE — "we tried", "worked for us", "in our experience"
      and friends, permitted only when the source guide actually has a
      panel.helped with items in it. This is the rule that stops us inventing
      a memory, and it is decidable from the data rather than from judgement.

   3. VOCABULARY GROUNDING — the strong one. Every content word on a slide must
      appear either in the guide field the slide came from, or in a small fixed
      list of template chrome ("Read the full guide"). A word that appears in
      neither is a word somebody made up, and the package is flagged.

   Check 3 is what makes this safe to run unattended. A composer that only ever
   shortens cannot introduce a word; if a word appears anyway, something has
   gone wrong and we want to hear about it before Amir does.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. BANNED CONSTRUCTIONS

   Each entry is [pattern, code, message]. Patterns are deliberately narrow:
   a rule that fires on innocent text gets ignored, and an ignored rule is
   worse than no rule.
   ------------------------------------------------------------------------ */
const BANNED = [
  [/\byou should\b/i,                   "prescriptive",  '"you should" — we share what we did, we do not instruct.'],
  [/\byou must\b/i,                     "prescriptive",  '"you must" — too absolute for a guide written by parents.'],
  [/\byou need to\b/i,                  "prescriptive",  '"you need to" — prescriptive.'],
  [/\byour baby needs\b/i,              "prescriptive",  '"your baby needs" — speaks for a baby we have not met.'],
  [/\b(give|stop giving) your baby\b/i, "prescriptive",  "Instructs a specific action for a specific baby."],
  [/\bwait \d+\s*(hour|hours|day|days|week|weeks)\b/i, "prescriptive", "A specific waiting instruction is medical advice."],
  [/\byour baby (is|will be) fine\b/i,  "reassurance",   "We cannot know that this baby is fine."],
  [/\bnothing to worry about\b/i,       "reassurance",   "Blanket reassurance about someone else's baby."],
  [/\byou (don'?t|do not) need (to see |a )?(a )?(doctor|gp|doctor'?s)\b/i, "escalation", "Never discourage seeing a doctor."],
  [/\bthis means your baby (has|is)\b/i,"diagnosis",     "Diagnoses a baby from a caption."],
  [/\b(guaranteed|guarantee|will definitely|always works)\b/i, "promise", "Promises an outcome."],
  [/\bwill sleep through\b/i,           "promise",       "Promises an outcome."],
  [/\bcures?\b/i,                       "medical",       '"cure" is a medical claim.'],
  [/\bdiagnos(e|is|ed)\b/i,             "medical",       "Diagnostic language."],
  [/\b(dose|dosage|mg|ml per kg)\b/i,   "medical",       "Dosing information does not belong on Instagram."]
];

/* First-person-plural experience claims. Allowed ONLY when the guide has a
   populated panel.helped — see requiresHelpedPanel below. */
const EXPERIENCE = [
  /\bwe tried\b/i, /\bwe did\b/i, /\bworked for us\b/i, /\bwhat worked for us\b/i,
  /\bin our experience\b/i, /\bwe found\b/i, /\bwe learned\b/i, /\bwe went through\b/i,
  /\bfor us,?\b/i, /\bour baby\b/i, /\bhelped us\b/i
];

/* Speaking as one identifiable person. Instagram speaks as the Collection. */
const FIRST_PERSON_SINGULAR = [/\bI (tried|did|found|think|would|remember)\b/, /\bmy baby\b/i, /\bmy daughter\b/i, /\bmy son\b/i];

/* The family's real names. Naming them in a caption asserts something they
   did, so it is only permissible when the source text names them too. */
const NAMED_PEOPLE = [/\bAri\b/, /\bAriadne\b/, /\bMama\b/, /\bPapa\b/];

/* --------------------------------------------------------------------------
   3. VOCABULARY GROUNDING

   Template chrome — the only words the system is allowed to add. This list is
   short on purpose. Adding to it is a content decision, so it lives in source
   where it shows up in a diff.
   ------------------------------------------------------------------------ */
const CHROME_WORDS = new Set(`
  read the full guide on our site link in bio the messy parents collection
  short answers for long nights swipe more at themessyparentscollection com
  written by parents not doctors usually normal what helped us call your
  doctor if quick answer here is what we know about this one three minute
  read guides guide

  save this later next 3am long night before need send other parent keep
  tap full bio dont don't
`.trim().split(/\s+/));

/* Words too common to be evidence of anything. Excluded from the grounding
   check so it tests substance rather than grammar. */
const STOPWORDS = new Set(`
  a an and are as at be been but by can could did do does for from had has
  have he her him his how i if in into is it its me my no nor not of off on
  once one or our out over own she so some such than that the their them then
  there these they this those to too up us was we were what when where which
  while who why will with you your yours it's don't doesn't isn't aren't
  won't can't didn't you're they're we're i'm
`.trim().split(/\s+/));

const words = (s) => String(s || "")
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[‘’]/g, "'")
  .replace(/[^a-z0-9' ]+/g, " ")
  .split(/\s+/)
  .filter(Boolean);

const contentWords = (s) => words(s).filter(w => !STOPWORDS.has(w) && w.length > 2);

/* Singular/plural and simple inflection tolerance, so "naps" grounds against
   "nap". Deliberately crude — it only ever makes the check more permissive,
   and the check's job is to catch invented words, not invented endings. */
function stemSet(list) {
  const out = new Set();
  list.forEach(w => {
    out.add(w);
    out.add(w.replace(/(ies)$/, "y"));
    out.add(w.replace(/(es|s)$/, ""));
    out.add(w.replace(/(ing|ed)$/, ""));
    out.add(w.replace(/(ing)$/, "e"));
  });
  return out;
}

/* --------------------------------------------------------------------------
   THE CHECKS
   ------------------------------------------------------------------------ */

function finding(level, code, message, detail) {
  return detail ? { level, code, message, detail } : { level, code, message };
}

/* Does the guide contain an approved personal-experience field? */
function hasHelpedPanel(guide) {
  const items = guide && guide.panel && guide.panel.helped && guide.panel.helped.items;
  return Array.isArray(items) && items.filter(s => String(s || "").trim()).length > 0;
}

/* Check one piece of generated text against one guide.

   `sources` is the guide text this piece was derived from — the specific panel
   items, not the whole guide. Grounding against the whole guide would pass a
   caption that welded two unrelated sections together.

   ---------------------------------------------------------------------------
   WHY GROUNDING IS COMPUTED FIRST

   The voice rules exist to catch text the SYSTEM invented. They must not fire
   on Amir's own approved words. A guide titled "Why is my baby drinking less
   milk?" contains "my baby" — that is a parent's question, quoted verbatim
   from a field he wrote and published, not the bot pretending to be a person.
   Flagging it would train him to ignore the checker, which is worse than not
   having one.

   So: grounding is established first, and it decides how the rest is read.

     fully grounded ....... every content word comes from the source field, so
                            the text IS Amir's. Voice rules are skipped, and
                            prescriptive phrasing is a WARNING — worth a look
                            because a slide has no surrounding nuance, but not
                            a blocker on his own published words.

     not grounded ......... a word appeared from somewhere. Every rule applies
                            at full strength, and prescriptive phrasing, an
                            invented experience or an invented person is an
                            ERROR that stops approval.
   ------------------------------------------------------------------------ */
function lintText(text, { guide, sources = [], label = "text" } = {}) {
  const out = [];
  const t = String(text || "");
  if (!t.trim()) return out;

  const sourceText = [].concat(sources || []).join(" ");

  /* ---- grounding, first ---- */
  const allowed = stemSet(contentWords(sourceText).concat(Array.from(CHROME_WORDS)));
  const unknown = [];
  contentWords(t).forEach(w => {
    if (allowed.has(w)) return;
    if (allowed.has(w.replace(/(es|s)$/, ""))) return;
    if (allowed.has(w.replace(/(ing|ed)$/, ""))) return;
    if (/^\d+$/.test(w)) return;
    unknown.push(w);
  });
  const grounded = unknown.length === 0;

  if (!grounded) {
    out.push(finding("warn", "ungrounded-vocabulary",
      "Contains words that appear neither in the source guide field nor in the fixed template wording.",
      `${label}: ${Array.from(new Set(unknown)).slice(0, 8).join(", ")}`));
  }

  /* ---- prescriptive / medical / promise ---- */
  BANNED.forEach(([re, code, message]) => {
    const m = t.match(re);
    if (m) {
      out.push(finding(grounded ? "warn" : "error", code,
        grounded ? message + " (This wording is the guide's own — worth re-reading out of context.)" : message,
        `${label}: “${m[0]}”`));
    }
  });

  /* ---- voice rules: only meaningful for text the system produced ---- */
  if (!grounded) {
    FIRST_PERSON_SINGULAR.forEach(re => {
      const m = t.match(re);
      if (m) out.push(finding("error", "first-person-singular",
        "Speaks as one person. Instagram speaks as The Messy Parents Collection.", `${label}: “${m[0]}”`));
    });

    const helped = hasHelpedPanel(guide);
    EXPERIENCE.forEach(re => {
      const m = t.match(re);
      if (m && !helped) {
        out.push(finding("error", "ungrounded-experience",
          "Claims a personal experience, but this guide has no “What helped us” panel to ground it in.",
          `${label}: “${m[0]}”`));
      }
    });

    const named = NAMED_PEOPLE.filter(re => re.test(t) && !re.test(sourceText));
    if (named.length) {
      out.push(finding("error", "invented-person",
        "Names a member of the family doing something the source guide does not say they did.", label));
    }
  }

  return out;
}

/* EVERY WORD A FOLLOWER WOULD SEE ON ONE SLIDE.

   The slide shape grew when the renderer became a poster renderer: a headline
   is a list of coloured pieces, and a slide also carries a kicker, short
   labels, a painted band and a CTA. All of them are visible, so all of them
   are checked.

   Both shapes are handled. The old shape — eyebrow, heading, lines as plain
   strings — still appears in fixtures and in packages written before the
   change, and a checker that quietly produced "[object Object]" for the new
   shape would have reported a grounding failure on the word "object" while
   checking nothing at all. */
function visibleText(s) {
  if (!s) return [];
  const out = [];
  const push = (v) => { if (v) out.push(String(v)); };

  push(s.eyebrow);                    /* legacy */
  push(s.kicker);
  push(s.heading);                    /* legacy */
  (s.lines || []).forEach(l => push(typeof l === "string" ? l : (l && l.t)));
  (s.items || []).forEach(i => push(typeof i === "string" ? i : (i && i.label)));
  push(s.band);
  push(s.cta);
  push(s.body);                       /* legacy story frame */
  return out;
}

/* Check a whole composed package. Every slide is checked against its OWN
   source, which is why compose.js records `sourceRefs` per slide. */
function lintPackage(pkg, guide) {
  const out = [];
  (pkg.slides || []).forEach((s, i) => {
    const src = (s.sourceText || []);
    const label = `slide ${i + 1} (${s.family || s.kind})`;
    visibleText(s).forEach(piece => {
      out.push(...lintText(piece, { guide, sources: src, label }));
    });
  });

  ((pkg.story && pkg.story.frames) || []).forEach((f, i) => {
    const label = `story frame ${i + 1}`;
    visibleText(f).forEach(piece => {
      out.push(...lintText(piece, { guide, sources: f.sourceText || [], label }));
    });
  });

  out.push(...lintText(pkg.caption, {
    guide,
    sources: pkg.captionSourceText || [],
    label: "caption"
  }));

  /* A guide that HAS a warning panel must not lose it. Prettiness is not a
     reason to drop the line that tells someone to call a doctor. */
  const warnItems = (guide && guide.panel && guide.panel.warn && guide.panel.warn.items) || [];
  if (warnItems.filter(Boolean).length) {
    const carried = (pkg.slides || []).some(s => s.kind === "warn") ||
                    ((pkg.story && pkg.story.frames) || []).some(f => f.kind === "warn");
    if (!carried) {
      out.push(finding("error", "dropped-warning",
        "This guide has a “when to check in” panel and the package does not carry it."));
    }
  }

  return out;
}

const errorsOnly = (findings) => findings.filter(f => f.level === "error");

module.exports = {
  lintText, lintPackage, hasHelpedPanel, errorsOnly, visibleText,
  BANNED, EXPERIENCE, CHROME_WORDS, contentWords
};
