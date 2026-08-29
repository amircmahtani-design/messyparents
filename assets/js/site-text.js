/* ============================================================================
   SITE TEXT — every editable string on the site, in one place.

   This is the single source of truth for Studio's "Text" panels. Each entry is
   a piece of wording that ships in the HTML; Studio shows it in a box, and
   anything you save in Studio overrides it on the live site. Empty a box and
   Save to put the original wording back.

   --------------------------------------------------------------------------
   HOW TO ADD A NEW EDITABLE PIECE OF TEXT LATER
   --------------------------------------------------------------------------
   1. In the .html file, put the text inside an element and tag it:
          <p data-mpc-text="mykey">Some words</p>
   2. Add a matching line to the right page below:
          { key:"mykey", label:"What this is", default:"Some words" }
   That is it — Studio picks it up automatically, on every page that shows it.

   For text that is built by JavaScript rather than sitting in the HTML (a
   results heading, a button that counts things), mark the entry `js:true` and
   have the script read it with MPCStore.t("mykey", "fallback").

   --------------------------------------------------------------------------
   WRITING RULES (the same everywhere)
   --------------------------------------------------------------------------
     • A blank line starts a new paragraph.
     • [label](guides.html) becomes a link.
     • *stars* around words give them the cream highlight used in headlines.
     • {year} becomes the current year. {n} becomes a count, where one is used.
     • Everything else is plain text — no HTML — so nothing typed in Studio can
       break the page.
   ========================================================================== */

window.SITE_TEXT = {

  /* ---- Shown on every page ------------------------------------------- */
  site: {
    label: "Everywhere",
    intro: "The menu and the small print. These appear on every page of the site.",
    fields: [
      { key:"nav.home",     label:"Menu — Home",      default:"Home" },
      { key:"nav.popular",  label:"Menu — Popular",   default:"Popular" },
      { key:"nav.guides",   label:"Menu — Guides",    default:"Guides" },
      { key:"nav.about",    label:"Menu — About",     default:"About Us" },
      { key:"nav.books",    label:"Menu — Our Books", default:"Our Books" },
      { key:"nav.toggle",   label:"Menu button (phones)", default:"Menu" },
      { key:"skip",         label:"Skip-to-content link", default:"Skip to content",
        help:"Only ever read aloud by screen readers." }
    ]
  },

  /* ---- Home ----------------------------------------------------------- */
  home: {
    label: "Home page",
    fields: [
      { key:"hero.title", label:"Headline", multiline:true,
        default:"*Parenting is messy.* *Finding answers shouldn’t be.*",
        help:"Wrap words in *stars* to give them the cream highlight." },
      { key:"hero.lede", label:"Line under the headline", multiline:true,
        default:"The things you’re googling at 3am, answered in three minutes — by parents who were googling them last week." },
      { key:"search.button", label:"Search button", default:"Search" },
      { key:"search.placeholder", label:"Search box — wide screens", js:true,
        default:"What do you need help with?" },
      { key:"search.placeholderShort", label:"Search box — phones", js:true,
        default:"Search the guides…",
        help:"The long version gets cut off on a narrow screen." },
      { key:"row.topic", label:"Step 1 heading", default:"Browse by topic" },
      { key:"row.age",   label:"Step 2 heading", default:"How old is your little one?" },
      { key:"results.default",  label:"Results heading — nothing selected", js:true, default:"Popular guides" },
      { key:"results.filtered", label:"Results heading — filters on",       js:true, default:"Matching guides" },
      { key:"results.search",   label:"Results heading — searching",        js:true, default:"Closest matches" },
      { key:"results.seeAll", label:"“See all” link", js:true, default:"See all {n} →",
        help:"{n} becomes the number of guides found." },
      { key:"results.clear",  label:"Clear-filters button", default:"Clear filters" },
      { key:"empty.title", label:"No results — heading", js:true, default:"Nothing matches that yet." },
      { key:"empty.body",  label:"No results — line under it", js:true,
        default:"Try a single word, or [browse all guides](guides.html)." },
      { key:"band.line", label:"Blue band", default:"Short answers for long nights." }
    ]
  },

  /* ---- Popular -------------------------------------------------------- */
  popular: {
    label: "Popular page",
    intro: "The page Title and Subtitle are in the boxes at the top of this panel.",
    fields: [
      { key:"search.placeholder", label:"Search box", default:"Try “night waking” or “fever”" },
      { key:"search.button", label:"Search button", default:"Search" },
      { key:"row.mostRead", label:"First row heading",  default:"Most read" },
      { key:"row.byTopic",  label:"Second row heading", default:"One from each topic" },
      { key:"band.line", label:"Blue band — heading", default:"Can't see your question?" },
      { key:"band.sub",  label:"Blue band — line under it", multiline:true,
        default:"There are more where these came from. [Browse all guides](guides.html)." }
    ]
  },

  /* ---- Guides --------------------------------------------------------- */
  guides: {
    label: "Guides page",
    intro: "The page Title and Subtitle are in the boxes at the top of this panel.",
    fields: [
      { key:"search.placeholder", label:"Search box", default:"Try “night waking” or “fever”" },
      { key:"search.button", label:"Search button", default:"Search" },
      { key:"row.topic", label:"Step 1 heading", default:"Browse by topic" },
      { key:"row.age",   label:"Step 2 heading", default:"How old is your little one?" },
      { key:"results.default", label:"Results heading — nothing selected", js:true, default:"Every guide" },
      { key:"results.filtered", label:"Results heading — filters on", js:true, default:"Matching guides" },
      { key:"results.search",   label:"Results heading — searching",  js:true, default:"Closest matches" },
      { key:"results.clear", label:"Clear-filters button", default:"Clear filters" },
      { key:"empty.title", label:"No results — heading", js:true, default:"No guides match that yet." },
      { key:"empty.body",  label:"No results — line under it", js:true,
        default:"Try a single word, or clear the filters and scroll." }
    ]
  },

  /* ---- About ---------------------------------------------------------- */
  /* The four illustrations for this page have their own cards further down
     the Studio panel; these are the words that sit beside them. */
  about: {
    label: "About page",
    intro: "The page Title and Subtitle are in the boxes at the top of this panel. Each section below is one block of the page.",
    fields: [
      { key:"hero.body", label:"Opening paragraphs", multiline:true, rows:7,
        default:
          "The Messy Parents Collection started at 3am, on a phone, one-handed, while googling a question that had a forty-minute answer when what was needed was a forty-second one.\n\n" +
          "Every parenting resource we found was either a wall of citations or a stranger on a forum shouting in capitals. Neither is much use when you are holding a baby who has been crying for an hour and you cannot remember whether you have eaten today." },

      { key:"middle.heading", label:"Second section — heading", default:"What we do" },
      { key:"middle.body", label:"Second section — paragraphs", multiline:true, rows:7,
        default:
          "We write short guides on the questions that come up over and over in the first two years: feeding, sleeping, development, health, and the state of the adults in the room. Each one takes about three minutes to read. Each one is written to be understood by someone who has slept for four hours.\n\n" +
          "Where something needs a doctor, we say so plainly and early, with a clear list of what to watch for. We would rather send you to a professional unnecessarily than have you sit at home wondering." },

      { key:"who.heading", label:"Third section — heading", default:"Who we are" },
      { key:"who.body", label:"Third section — paragraphs", multiline:true, rows:5,
        default:
          "Ari & Papa — one baby, two very tired adults, one sofa that has seen things. We write what we wish someone had handed us in week two, checked against current guidance from national health services and paediatric bodies, and stripped of everything that made us feel worse." },

      { key:"notare.heading", label:"Fourth section — heading", default:"What we are not" },
      { key:"notare.body", label:"Fourth section — paragraphs", multiline:true, rows:7,
        default:
          "We are not doctors, midwives, health visitors or paediatricians. Nothing here replaces advice from someone who can actually see your baby. If your instinct says something is wrong, act on it — that instinct is genuinely good information, and no one who does this professionally will mind you asking.\n\n" +
          "[Start with the guides](guides.html), or come back at 3am. We will be here. We will be awake." }
    ]
  },

  /* ---- Our Books ------------------------------------------------------ */
  /* The book covers and summaries are managed under Site → Our Books. */
  books: {
    label: "Our Books page",
    intro: "The books themselves (covers, summaries, status) are under Site → Our Books.",
    fields: [
      { key:"page.title", label:"Page heading", default:"Our books" },
      { key:"page.intro", label:"Line under the heading", multiline:true,
        default:"The guides, gathered up and made properly readable — for the nights when you would rather hold paper than a phone." },
      { key:"band.line", label:"Blue band — heading", default:"Read the guides first." },
      { key:"band.sub",  label:"Blue band — line under it", multiline:true,
        default:"Everything in the books starts life here, free, at three minutes a piece. [Browse all guides](guides.html)." }
    ]
  },

  /* ---- How these guides happen ---------------------------------------------
     The editorial page. It is linked from the footer of every page, and it is
     what a reader — or a search engine working out whether the site is worth
     trusting — checks before deciding. Worth keeping current, which means
     being editable. */
  editorial: {
    label: "How these guides happen",
    intro: "Where the questions come from, what they are checked against, and what you are careful to say you are not.",
    fields: [
      { key:"page.title", label:"Page heading", default:"How these guides happen" },
      { key:"page.intro", label:"Line under the heading", multiline:true, rows:8,
        default:"Where the questions come from, what we check them against, and what we are not qualified to tell you." },
      { key:"editorial.questions.h", label:"Section — The questions are real ones", default:"The questions are real ones" },
      { key:"editorial.questions.body", label:"The questions are real ones — the words", multiline:true, rows:8,
        default:"Every guide on this site started as something we actually asked, usually at an unreasonable hour, usually badly. We keep a note of the original wording and the date it was asked. Some of those questions were, in hindsight, quite silly — we have kept those in too, because at 2am they did not feel silly, and somebody else is going to ask the same thing tonight.\n\nWe do not invent questions to fill gaps, and we do not split one question into five pages to cover more search terms. One real question, one guide." },
      { key:"editorial.write.h", label:"Section — How a guide gets written", default:"How a guide gets written" },
      { key:"editorial.write.body", label:"How a guide gets written — the words", multiline:true, rows:8,
        default:"Each guide is written to be read by someone who has slept for four hours and is holding a baby. That means the answer comes first, in plain words, before any explanation. Then what is usually going on, then what we actually tried, then when to stop reading and call someone.\n\nThe “what helped us” parts are exactly that: what helped us. They are not recommendations and they are not evidence. Your baby is a different baby." },
      { key:"editorial.check.h", label:"Section — What we check against", default:"What we check against" },
      { key:"editorial.check.body", label:"What we check against — the words", multiline:true, rows:8,
        default:"Anything that touches safety — sleep position, fevers, breathing, feeding volumes, red flags — is checked against current guidance from national health services and paediatric bodies before it goes up. Where a guide leans on a specific piece of guidance, we link to it on the guide itself rather than asking you to take our word for it.\n\nWhere guidance differs between countries, we say so instead of picking the one that makes the guide tidier." },
      { key:"editorial.not.h", label:"Section — What we are not", default:"What we are not" },
      { key:"editorial.not.body", label:"What we are not — the words", multiline:true, rows:8,
        default:"We are not doctors, midwives, health visitors, paediatricians, nurses or lactation consultants. Nobody here holds a medical qualification of any kind, and nothing on this site has been reviewed by someone who does. We will not pretend otherwise to look more authoritative, and you should be suspicious of any parenting site that does.\n\nNothing here replaces advice from someone who can actually see your baby. If your instinct says something is wrong, act on it — that instinct is genuinely good information, and no one who does this professionally will mind you asking.\n\nIf something is an emergency, do not read a website. Call your local emergency number." },
      { key:"editorial.updates.h", label:"Section — Updates and corrections", default:"Updates and corrections" },
      { key:"editorial.updates.body", label:"Updates and corrections — the words", multiline:true, rows:8,
        default:"Guidance changes, and we get things wrong. When a guide is changed in a way that alters its meaning, the updated date on the guide changes with it. Small fixes — a typo, a clearer sentence — do not reset anything.\n\nIf you think something here is wrong, out of date, or dangerous, please tell us and we will look at it properly. Corrections to anything safety-related get made the same day or the guide comes down until we have sorted it out." },
      { key:"editorial.ai.h", label:"Section — On being quoted", default:"On being quoted" },
      { key:"editorial.ai.body", label:"On being quoted — the words", multiline:true, rows:8,
        default:"These guides are public and free, and we are glad when search engines or AI assistants surface them — that is a parent finding an answer, which is the entire point. We would ask two things: quote the safety sections accurately, and keep the link, so that anyone who wants the full context and the caveats can find them." }
    ]
  },

  /* ---- Page-not-found -------------------------------------------------- */
  notfound: {
    label: "“Page not found”",
    intro: "What someone sees if they follow a broken link.",
    fields: [
      { key:"page.title", label:"Heading", default:"That page has wandered off" },
      { key:"page.body", label:"Line under the heading", multiline:true,
        default:"Much like everyone’s sleep schedule. Try the [guides](guides.html), or head [home](index.html)." }
    ]
  },

  /* ---- The guide template --------------------------------------------- */
  /* These appear on EVERY guide, old and new — the words around your content,
     not the content itself. Each guide's own words are in the guide editor. */
  guide: {
    label: "Guide layout",
    intro: "The fixed wording that appears on every guide, new ones included. Each guide's own content is edited under Guides on the left.",
    fields: [
      { key:"quick.label", label:"Blue box — label before the answer", js:true, default:"The quick answer:" },
      /* The fold under the guide, and the two arrows either side of it. All
         written by the renderer rather than sitting in the markup, so they are
         marked js:true and read with t("the.key", "fallback"). */
      { key:"detail.heading", label:"Fuller answer — the bar you tap to open it", js:true,
        default:"Want the fuller answer?" },
      { key:"related.heading", label:"Heading above the suggested guides", js:true,
        default:"Read next" },
      { key:"steps.prev", label:"Previous-guide arrow — what a screen reader says", js:true,
        default:"Previous" },
      { key:"steps.next", label:"Next-guide arrow — what a screen reader says", js:true,
        default:"Next" },
      { key:"steps.label", label:"The two arrows — what a screen reader calls the pair", js:true,
        default:"Previous and next guide" },
      { key:"note.line1", label:"Notepad badge — first line",  js:true, default:"BY ARI" },
      { key:"note.line2", label:"Notepad badge — second line", js:true, default:"& PAPA" },
      { key:"note.image", type:"image", label:"Notepad badge picture",
        preview:"../assets/img/note-badge-default.png",
        help:"Replaces the drawn notepad on the left of the blue box. Leave empty to keep the drawn one (which uses the two lines above). A transparent PNG works best." },
      { key:"band.image", type:"image", label:"Blue box picture",
        preview:"../assets/img/couple.webp",
        help:"The picture that pops up out of the blue box on every guide. A guide with its own picture set still wins. Transparent PNG, roughly 4:3." }
    ]
  }
};

/* The two lines at the very bottom of every page. Kept separate because they
   have their own Studio panel (Site → Footer). */
window.FOOTER_DEFAULTS = {
  copyright: "© {year} The Messy Parents Collection",
  note: "Written by parents, not doctors. Nothing here replaces advice from your own doctor, midwife or health visitor."
};
