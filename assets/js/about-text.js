/* ============================================================================
   Default site copy — the About page sections and the footer.

   This is the same wording that ships inside the .html files. It lives here as
   plain text as well so that Studio can pre-fill its text boxes with what is
   currently on the site, and so that clearing a box in Studio puts the
   original words back rather than leaving a blank.

   (The file is still called about-text.js because that is where it started.
   It now holds the footer wording too.)

   Editing rules for the `body` / `note` fields:
     • A blank line starts a new paragraph.
     • [label](link.html) becomes a link. Everything else is plain text —
       no HTML, so nothing typed in Studio can break the page layout.

   If you change the wording in the .html files, change it here too.
   ========================================================================== */
window.ABOUT_TEXT_DEFAULTS = {

  hero: {
    /* The hero has no heading of its own — it uses the page Title and Subtitle
       fields at the top of the Studio panel. */
    heading: null,
    body:
      "The Messy Parents Collection started at 3am, on a phone, one-handed, while googling a question that had a forty-minute answer when what was needed was a forty-second one.\n\n" +
      "Every parenting resource we found was either a wall of citations or a stranger on a forum shouting in capitals. Neither is much use when you are holding a baby who has been crying for an hour and you cannot remember whether you have eaten today."
  },

  middle: {
    heading: "What we do",
    body:
      "We write short guides on the questions that come up over and over in the first two years: feeding, sleeping, development, health, and the state of the adults in the room. Each one takes about three minutes to read. Each one is written to be understood by someone who has slept for four hours.\n\n" +
      "Where something needs a doctor, we say so plainly and early, with a clear list of what to watch for. We would rather send you to a professional unnecessarily than have you sit at home wondering."
  },

  who: {
    heading: "Who we are",
    body:
      "Ari & Papa — one baby, two very tired adults, one sofa that has seen things. We write what we wish someone had handed us in week two, checked against current guidance from national health services and paediatric bodies, and stripped of everything that made us feel worse."
  },

  notare: {
    heading: "What we are not",
    body:
      "We are not doctors, midwives, health visitors or paediatricians. Nothing here replaces advice from someone who can actually see your baby. If your instinct says something is wrong, act on it — that instinct is genuinely good information, and no one who does this professionally will mind you asking.\n\n" +
      "[Start with the guides](guides.html), or come back at 3am. We will be here. We will be awake."
  }

};

/* The two lines at the very bottom of every page. {year} is replaced with the
   current year automatically, so the copyright line never goes stale. */
window.FOOTER_DEFAULTS = {
  copyright: "© {year} The Messy Parents Collection",
  note: "Written by parents, not doctors. Nothing here replaces advice from your own doctor, midwife or health visitor."
};
