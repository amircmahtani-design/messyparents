# The social system

The private Instagram side of The Messy Parents Collection: turn a published
guide into a carousel, look at it properly, edit it, approve it — and hold it.

Written 30 Aug 2026, in preview mode. **Nothing can publish.**

---

## The one thing to know

`SOCIAL_PUBLISHING_ENABLED` is not set, so publishing is off.

It fails closed. `scripts/lib/social/config.js` opens the lock only for the
exact string `"true"` — absent, empty, `TRUE`, `1`, `yes` and every other
near-miss are all false, and there is a test that walks the list. Approving a
package writes `APPROVED_HELD` and stops there. There is no scheduler, no retry,
no timeout and no client action that goes further, and there is no Meta
transport in this repository at all.

If you want to prove that to yourself rather than take it on trust:

    npm run verify:social

---

## Using it

Open **`/social/`** on the live site and sign in with the same email and
password as Studio. (Locally: `npm run serve`, then `/social/`.)

    Make a package → Drafts → Needs review → Approved & held
                                          ↘ Rejected

**Make a package.** Search or filter the guide library, tick one, several or
all of them, and press Generate. A guide that already carries a package is
marked; regenerating one is a separate button and it asks first.

**Open a package.** The left half is the slide, drawn at true proportions and
scaled down — 1080×1350 for the carousel, 1080×1920 for the Story. Arrow
through it. Under the preview it tells you whether the words fit inside the
slide, measured live rather than guessed.

The right half is everything you can change: the slide's text, the caption, the
hashtags, the suggested time. **Beside every editable field is the guide's own
wording**, so checking that nothing was invented does not mean opening the site
in another tab.

**Approve** means approved and held. **Reject** asks for an optional reason.
**Return to editing** takes an approved package back.

Editing an approved package clears its approval automatically and returns it to
review — see *Approval* below for why that is not a courtesy.

---

## How a package is made

`scripts/lib/social/compose.js` is a re-renderer, not a writer.

**No AI service is involved and none is needed.** Every sentence on a slide
comes out of a field you already approved in Studio, and the only
transformation applied is *shortening*. Nothing is rephrased. Nothing is
summarised in new words. Nothing is added.

That one constraint is what makes the safety checks mechanical rather than a
matter of judgement: a composer that can only remove words cannot introduce
one, so any word on a slide that is not in the source is a bug with a name.

### The field mapping

| Guide field | Becomes |
|---|---|
| `title` | the cover slide, and the caption's first line |
| `panel.eyebrow` | the cover eyebrow (falls back to topic • age) |
| `panel.quick` | the quick-answer slide, and the caption's answer |
| `panel.normal.items[]` | the "usually normal" slide |
| `panel.helped.items[]` | "what helped us" — **and the only source of first-person-plural wording anywhere** |
| `panel.warn.items[]` | the warning slide, which cannot be removed |
| `panel.dont.items[]` | the "don't" slide, which can |
| `panel.hero` / `panel.heroAlt` | the approved illustration |
| `summary`, `ages`, `topic`, `seo.slug` | supporting metadata |

A guide missing a field simply has no slide for it. Empty sections are never
padded and the carousel length follows the guide — six slides for a full one,
three for a sparse one, never more than Instagram's ten.

### The panel tints are not a new visual language

`assets/css/tokens.css` names them after these exact panels: `--amber-*` is
commented *"what helped us"*, `--red-*` is *"call the doctor if"*,
`--blue-band` is the quick-answer band. So a slide is a 1080-pixel version of a
panel your reader already recognises from the guide page. The templates import
`tokens.css`; they never restate a colour or a typeface, and they use the local
`.woff2` files in `assets/fonts/`, so rendering needs no network.

---

## The content checks

`scripts/lib/social/safety.js`, in three layers.

1. **Banned constructions.** Prescriptive, diagnostic and outcome-promising
   phrasing, by pattern: *you should*, *your baby needs*, *wait X hours*,
   *your baby is fine*, *guaranteed*, dosing language, and so on.

2. **Ungrounded experience.** *we tried*, *worked for us*, *in our experience* —
   permitted only when the guide actually has a `panel.helped` with items in it.
   Decidable from the data, not from judgement.

3. **Vocabulary grounding.** Every content word on a slide must appear either in
   the guide field the slide came from, or in a short fixed list of template
   wording ("Read the full guide"). A word in neither is a word somebody made
   up.

### Why grounding is computed first

The voice rules exist to catch text the *system* invented. They must not fire
on your own approved words.

A guide titled *"Why is my baby drinking less milk?"* contains "my baby". That
is a parent's question, quoted verbatim from a field you wrote and published —
not the bot pretending to be a person. Flagging it would train you to ignore the
checker, which is worse than not having one.

So grounding is established first and it decides how the rest is read:

- **fully grounded** — the text is yours. Voice rules are skipped, and
  prescriptive phrasing is a **warning**, worth a second look because a slide
  has no surrounding nuance, but not a blocker on your own published words.
- **not grounded** — a word came from somewhere. Every rule applies at full
  strength and an error stops approval.

There is one more rule, and it has no exceptions: **a guide with a warning panel
must carry it.** Prettiness is not a reason to drop the line that tells someone
to call a doctor.

At the time of writing, all 61 guides in the bundled library compose with zero
errors and two warnings — both of them the word "diagnose" appearing in a
guide's own approved text, correctly downgraded.

---

## Approval

Approval is a **server-side signature over content**, not a status field.

- `firestore.rules` says `allow write: if false` for `social_packages`. The
  browser cannot write one, signed in or not.
- Every change goes through an authenticated Netlify function which verifies a
  Firebase ID token against the admin address — the pattern
  `netlify/functions/publish.js` already established — and writes through the
  Admin SDK.
- `social-approve` recomputes the hash **from the stored document**, never from
  anything the request sent. It covers the caption, the hashtags, every slide in
  order, the story frames, the destination URL and the time.
- The dashboard sends the hash it computed from what was on screen. If the two
  disagree, the package moved under you between opening it and pressing the
  button, and approval is refused rather than granted over something you did not
  read.

**Editing an approved package clears the approval.** Not warns about — clears,
and moves it back to review. The hash would catch a change later anyway, but by
then you would believe you had approved something you had never seen, and the
dashboard would agree with you. Clearing it keeps the screen and the truth in
step.

---

## Files

**New**

    social/index.html                     the dashboard
    social/app.js                         its logic
    social/social.css                     its layout (imports tokens.css)

    scripts/lib/social/config.js          the publishing lock, states, formats
    scripts/lib/social/select.js          which guides are eligible
    scripts/lib/social/compose.js         guide fields → package
    scripts/lib/social/templates.js       slide + story markup (shared)
    scripts/lib/social/safety.js          the content checks
    scripts/lib/social/validate.js        structural validation
    scripts/lib/social/hash.js            the approval hash
    scripts/lib/social/workflow.js        the state machine
    scripts/lib/social/utm.js             UTM tagging
    scripts/lib/social/publisher.js       the disabled Meta adapter
    scripts/lib/social/server.js          auth + Firestore helpers for functions

    scripts/social-render.js              render slides to JPEG, offline

    netlify/functions/social-status.js    dashboard status
    netlify/functions/social-guides.js    the eligible guide list
    netlify/functions/social-generate.js  compose packages
    netlify/functions/social-list.js      packages in one state
    netlify/functions/social-get.js       one package + its source guide
    netlify/functions/social-update.js    edit (and invalidate approval)
    netlify/functions/social-approve.js   approve and hold
    netlify/functions/social-reject.js    reject / return to editing
    netlify/functions/social-publish.js   refuses; dry-run only

    tests/social-publishing-lock.js       the lock, and that nothing calls it
    tests/social-safety.js                the content rules + all 61 guides
    tests/social-approval.js              hash and approval integrity

**Changed**

    scripts/lib/bake.js       the footer Instagram link, inside applyFootLinks()
    scripts/lib/site.js       "/social/" added to PRIVATE_ROUTES
    assets/css/style.css      three lines for the footer icon
    privacy.html              a short, accurate section on the Instagram link
    firestore.rules           social_packages, social_state — server-write only
    storage.rules             a public-read social/ prefix for rendered JPEGs
    package.json              verify:social, social:render
    .gitignore                new — ignores social-preview/

**Not touched.** Anything under `studio/` or `editor/`; `scripts/build.js`;
`assets/js/*`; the seven existing Netlify functions; `_redirects`, `_headers`,
`netlify.toml`, `robots.txt`; any guide document, image or URL.

`robots.txt` is *generated* from `PRIVATE_ROUTES`. Never edit it by hand.

---

## Rendering slides to files

    npm run social:render                    every eligible guide
    node scripts/social-render.js wont-nap   one
    node scripts/social-render.js --limit 5 --png

Writes into `social-preview/`, which is git-ignored working space. JPEG always,
because JPEG is the only image format Instagram's publishing API accepts. PNG
only with `--png`, only as a lossless copy to look at, and never in a publish
path.

It also measures overflow in a real browser and exits non-zero if any slide's
words do not fit.

Needs `npm install` first — Playwright is already a devDependency.

---

## Connecting Meta later

Do this in order, and stop at any step that does not work rather than
improvising around it.

1. **Create the accounts.** An Instagram *Business* account (not Creator) for
   `@themessyparentscollection`, a Facebook Page for the same brand, and both
   inside a Meta Business Portfolio. Meta's content-publishing documentation
   describes professional accounts *"connected to a Page"* — treat the Page as
   required.
2. **Check Page Publishing Authorization.** An account "connected to a Page that
   requires PPA cannot be published to until PPA has been completed." Find this
   out now, not on your first publish.
3. **Create a Meta developer app**, add the Instagram product, and add your own
   account as a tester so it works under Standard Access. Publishing to your own
   account does not need App Review.
4. **Verify the details this repository assumes** against Meta's own docs before
   relying on them: the long-lived token lifetime and its refresh conditions,
   and the current permission names. Where a doc disagrees with this file, the
   doc wins.
5. **Set the environment variables** in Netlify — never in the repository:
   `IG_ACCESS_TOKEN`, `IG_USER_ID`. Leave `SOCIAL_PUBLISHING_ENABLED` alone for
   now.
6. **Write the renderer's upload step**: render each slide to JPEG and put it in
   Firebase Storage under `social/`, which is publicly readable because Meta
   fetches the image itself and cannot sign in. Store the URL on each slide as
   `renderedUrl`.
7. **Implement `callGraph` in `scripts/lib/social/publisher.js`** against
   `POST /{ig-user-id}/media` then `/media_publish`. Keep
   `assertPublishingAllowed()` as the first line of `publish()`, and add a test
   that it still runs first.
8. **Add a token refresh** — the long-lived token expires in about 60 days, and
   a dashboard banner is not enough. Refresh weekly so there are six or seven
   attempts across its life, and send an email on failure: if the token has
   expired, the reason you are not opening `/social/` is that nothing is
   arriving in it.
9. **Only then** set `SOCIAL_PUBLISHING_ENABLED=true`, and expect the banner at
   the top of `/social/` to change colour.

Publishing an approved package will still require a deliberate action. Approval
gives permission for exact content; it is not an instruction to send.

---

## Adding animation later

Not built, not configured, no provider chosen, no dependency added. The
placeholder in the dashboard is inert.

The intended flow:

    approved static illustration
      → animation request
      → generated motion preview
      → manual review
      → approve / reject
      → held Reel asset

**Format.** 1080×1920, 9:16, the same frame as a Story.

**The reference is the approved illustration.** Not a prompt, not a
regeneration — the picture that was already signed off. An animation must
preserve exactly: the characters, their faces, their clothes, the colours and
the illustration style.

**Wanted motion is subtle.** Blinking, breathing, a small hand or head
movement, a swaying toy or mobile, steam off a cup, gentle camera drift.

**Rejected outright:** extra or missing limbs and fingers, a face that changes
between frames, a character swapped for a different one, distorted anatomy,
altered clothing, invented objects, or any major change to the scene.

**Every animation is reviewed by a person.** Same rule as everything else here:
generated, held, approved, and only then usable.

Keep the provider behind an adapter with the same shape as
`scripts/lib/social/publisher.js`, so choosing one later is one file.

---

## Environment variables

Preview mode needs **none**. The dashboard's server functions reuse what the
existing functions already use:

| Variable | Used by | Needed now? |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | all functions, already set | yes, already set |
| `FIREBASE_STORAGE_BUCKET` | all functions, already set | yes, already set |
| `SOCIAL_ADMIN_EMAIL` | optional override of the admin address | no |
| `SOCIAL_PUBLISHING_ENABLED` | the lock | **no — leave it unset** |
| `IG_ACCESS_TOKEN`, `IG_USER_ID` | the future publisher | no |

Nothing here goes in the repository, in client JavaScript, in HTML, in
Firestore, in local storage or in a generated file.

---

## Running the tests

    npm run verify          everything, including the social suites
    npm run verify:social   just the three social suites

`npm run verify` calls the build's own checks first; those expect
`npm run build` to have run, and on a fresh checkout they report the missing
build output rather than a real failure.
