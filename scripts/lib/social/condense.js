/* ============================================================================
   SOCIAL — CONDENSING A SENTENCE TO A PHRASE

   Instagram reads a slide in about a second. A guide sentence is written to be
   read at leisure on a page with the rest of its paragraph around it:

     "A temporary dip is often distraction, teething or a cold; wet nappies,
      energy and the pattern across the day matter more than one feed."

   On a slide that has to become:

     "Distraction, teething or a cold"

   BY DELETION ONLY. That is the constraint the whole safety model rests on —
   safety.js can check grounding mechanically precisely because the composer
   can only remove words, never introduce one. Everything in this file is a
   cut: choose a span, drop a lead-in, drop a tail. Nothing is rewritten.

   The one thing that is not a deletion is capitalising the first letter, which
   changes a character rather than a word. safety.js folds case before it
   compares, so this is invisible to it.

   HOW IT CHOOSES

     1. Split the sentence into clauses at ; : — and , and at the joining words
        that start a new thought (and, but, so, because, while, though).
     2. Score each clause by how much of it is content rather than grammar, and
        take the densest one that fits.
     3. Strip a lead-in of the shape "<something> is/are (often|usually) …",
        which is where a guide sentence puts its scaffolding.
     4. If it still does not fit, fall back to a plain truncation.

   If none of that produces something short enough, the caller gets the best
   available and validate.js will say the slide is too long. Failing loudly is
   the right answer; paraphrasing is not available.
   ========================================================================== */

const FILLER = new Set(`
  a an the this that these those it its is are was were be been being am
  of to in on at by for with from as and or but so if then than there here
  you your yours they them their we our us i my me he she his her
  can could may might will would shall should must do does did done
  very quite often usually normally typically generally really just also too
  more most much many some any every each other another one two both either
  neither not no nor only own same such about into over under again further
  once during before after above below between through
`.trim().split(/\s+/));

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean);
const contentCount = (s) => words(s)
  .filter(w => !FILLER.has(w.toLowerCase().replace(/[^a-z']/g, ""))).length;

/* Split into clauses. The separators are kept out of the pieces, which is the
   deletion — a semicolon is not a word. */
function clauses(text) {
  return String(text || "")
    .split(/\s*[;:—–]\s*|\s+(?:and|but|so|because|while|though|although|which|when|once|until|unless|that means)\s+|(?<=[.!?])\s+/i)
    .map(s => s.replace(/^[\s,]+|[\s,.;:]+$/g, ""))
    .filter(Boolean);
}

/* Lead-ins a guide sentence uses to set up its answer. Each pattern keeps
   group 1 and drops everything before it. Narrow on purpose: a pattern that
   fires on the wrong sentence produces a fragment, and a fragment on a slide
   is worse than a long line. */
const LEAD_INS = [
  /^.{0,44}?\b(?:is|are|was|were|can be|may be|tends to be|tend to be)\b\s+(?:often|usually|normally|typically|generally|nearly always|almost always|commonly|mostly|probably|frequently)\s+(.+)$/i,
  /^(?:it|this|that|these|those)\s+(?:is|was|are|were|may be|can be|might be|could be)\s+(?:often|usually|normally|typically|generally|commonly|mostly|probably)?\s*(.+)$/i,
  /^(?:usually|often|normally|typically|generally|commonly|mostly|probably),?\s+(.+)$/i,
  /^(?:there\s+(?:is|are))\s+(.+)$/i
];

function stripLeadIn(text) {
  for (const re of LEAD_INS) {
    const m = String(text).match(re);
    if (m && m[1]) {
      const rest = m[1].trim();
      /* Only accept it if what is left still says something. */
      if (contentCount(rest) >= 2) return rest;
    }
  }
  return text;
}

/* Trailing scaffolding: a comparison or qualification tacked on the end. */
function stripTail(text, maxWords) {
  let out = text;
  const cut = /^(.*?)[,]\s+(?:rather than|instead of|more than|not just|not only|as long as|provided|unless|if)\b.*$/i.exec(out);
  if (cut && contentCount(cut[1]) >= 2 && words(cut[1]).length <= maxWords) out = cut[1];
  return out;
}

const capitalise = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const tidy = (s) => String(s || "").replace(/\s+/g, " ").replace(/^[\s,;:.]+|[\s,;:]+$/g, "").replace(/[.]$/, "");

/* --------------------------------------------------------------------------
   condense(text, maxWords)

   Returns the shortest faithful span it can find, or the best it managed.
   ------------------------------------------------------------------------ */
function condense(text, maxWords = 7) {
  const source = tidy(text);
  if (!source) return "";
  if (words(source).length <= maxWords) return capitalise(source);

  const parts = clauses(source).map(tidy).filter(Boolean);
  const ok = (p) => p && words(p).length <= maxWords && contentCount(p) >= 2;

  /* 1 — the OPENING clause, which is where a guide sentence puts its answer.
         Whole first, then with its lead-in removed. Preferring the first
         clause rather than the densest is what stops "wet nappies, energy"
         being chosen over "distraction, teething or a cold". */
  const first = parts[0];
  if (ok(first)) return capitalise(first);
  const firstStripped = tidy(stripTail(stripLeadIn(first || ""), maxWords));
  if (ok(firstStripped)) return capitalise(firstStripped);

  /* 2 — failing that, the densest clause that fits, stripped or not. */
  const candidates = []
    .concat(parts.map(p => ({ p, order: 0 })))
    .concat(parts.map(p => ({ p: tidy(stripTail(stripLeadIn(p), maxWords)), order: 1 })))
    .filter(x => ok(x.p))
    .map(x => Object.assign(x, { n: words(x.p).length, c: contentCount(x.p) }))
    .sort((a, b) => b.c - a.c || a.n - b.n || a.order - b.order);
  if (candidates.length) return capitalise(candidates[0].p);

  /* 3 — the whole sentence, lead-in removed, if that is now enough. */
  const whole = tidy(stripTail(stripLeadIn(source), maxWords));
  if (words(whole).length <= maxWords && contentCount(whole) >= 2) return capitalise(whole);

  /* 4 — give up, and give back the original UNTOUCHED.

     Not a truncation. A bullet ending in an ellipsis looks like a bug, and on
     a warning line it would drop the condition that makes the warning mean
     anything — "You are so exhausted that driving feels unsafe" must not
     become "A real reason to ask for help". The template shrinks its type for
     a long line instead, which is the honest way to lose the argument. */
  return capitalise(source);
}

module.exports = { condense, clauses, stripLeadIn, contentCount };
