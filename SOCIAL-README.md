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

### The visual system: seven poster families

*Rewritten 30 Aug 2026. The previous renderer drew a cream page with a heading
over a rounded card of bullets, once per slide. It was correct, safe, legible
and completely inert — a website panel enlarged to 1080 pixels. Nobody stops
scrolling for a page.*

A slide now belongs to one of seven **families**, each with an approved poster
reference behind it:

| family | from | poster reference |
|---|---|---|
| `cover-hook` | the guide's title | `posters/cover-hook.jpg` |
| `quick-check` | `panel.quick`, `panel.normal.items` | `posters/quick-check.jpg` |
| `what-helped-us` | `panel.helped.items` **only** | `posters/what-helped-us.jpg` |
| `warning` | `panel.warn.items` | `posters/warning.jpg` |
| `dont` | `panel.dont.items` **only** | `posters/dont.jpg` |
| `save-cta` | the approved CTA library | `posters/save-cta.jpg` |
| `story-reel` | 1080×1920 | `posters/story-reel.jpg` |

`kind` (cover, quick, normal, helped, warn, dont, close) is still what the
guide FIELD was and is what everything downstream keys off. `family` is what
selects the reference and the layout. Two kinds share the `quick-check` family
because they are the same poster with different content in it.

Each family has two or three **layout variants**, chosen deterministically from
the guide's slug so the feed varies without the preview and the export
disagreeing. Amir can override a variant per slide; the override is stored and
hashed.

Every slide is two layers:

    .s-scene   the artwork — either a base generated from the approved
               references, or a composition built from the approved cutouts
               and painted shapes. Never contains a readable word.
    .s-type    every readable word, drawn by templates.js from text that has
               already been through condense.js and safety.js.

That split is why a medical warning can be both illustrated and exact.

**No filter ever touches a letter.** The torn-paper and brush effects are
feTurbulence displacement filters, and a displacement filter applied to an
element containing text displaces the text: an early build rendered "Try a dim,
quiet room" as "TAY A DIM, QUIET ROOM". Every painted chip is two elements — a
filtered background and an unfiltered text node on top of it. If a node has
text in it, it has no filter on it.

**Logo restraint.** `refs.js LOGO_FAMILIES` allows the full logo on the cover
and the closing slide, and nowhere else. `validate.js` makes it an error
anywhere else, including on a Story frame.

The poster palette (deep MPC blue `#215d9c`, orange `#dc5019`, warning red
`#cb4a22`, cream `#f8ebc8`, charcoal `#26282b`) lives on `.mpc-slide` inside
`templates.js`, not in `tokens.css` — `tokens.css` is downloaded by every reader
of the public site and none of these appear there. The three faces still come
from `assets/fonts/`, so rendering needs no network.

---

## Where the guides come from

The build uses `scripts/lib/data.js` `load()`, which reads the repository from
disk. That is right for the build and wrong inside a Netlify function: the
function is bundled into a single file in a Lambda, so `data/guides-bundle.js`,
`assets/js/firebase-config.js` and the JSON fallbacks are simply not there.
Every read fails, every fallback fails after it, and `load()` returns an empty
list with a warning — which looks exactly like an empty dashboard.

So `scripts/lib/social/guides.js` reads Firestore directly through the Admin SDK
the functions already have. It reuses `normaliseGuide()` and `ages.resolve()`
from the existing libraries rather than copying them, so a guide has the same
shape here as on the public site and a switched-off age band is invisible to
Instagram for free.

Only the reading is different. The meaning of a guide is not.

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

## The artwork pipeline

OpenAI helps make the **picture**. It is never trusted with a **word**.

    1  read the approved guide fields                     compose.js
    2  select only the slides the guide supports          compose.js
    3  pick the poster reference for the slide family     refs.js
    4  pick the character sheets and one approved scene   refs.js
    5  send those references to the image model           social-artwork.js
    6  ask for an illustrated base with NO lettering      artprompt.js
    7  check the base for stray lettering, reject if any  artwork.js
    8  store it, package-scoped and deterministic         social-artwork.js
    9  draw the approved wording over it                  templates.js

### The reference library is the input, not documentation

`assets/img/refs/manifest.json` is the source of truth. `scripts/lib/social/
refs.js` is the only thing that reads it, and the **References** tab in
`/social/` renders exactly the list that selection walks — the tab and the
generator call the same `selectFor()`. If the tab shows the warning poster
against the warning family, that poster is what gets attached to the warning
request.

Every image request attaches, in this order:

    1  the poster reference for the family        composition
    2  the Mama / Papa / Ari character sheets     identity
    3  one semantically relevant approved scene   finish
    4  the brand reference board                  palette and texture

A family with no active poster **throws `MISSING_REFERENCE` naming the file**.
It never falls back to another poster, because a silent substitution is exactly
how the generic cream cards came back the first time.

The manifest keeps its old flat `characters` / `brand` / `approvedScenes` keys
untouched: the guide illustration generator reads those, and social is a second
consumer of the file rather than a replacement for the first.

### The cache key excludes the copy

A generated base contains no words, so a headline edit cannot change what the
right picture is — and re-charging for an image because somebody fixed a comma
makes people stop fixing commas. `artKey()` hashes the guide, the family, the
variant, the cast, the art note, the reference ids, the manifest version, the
prompt version, the image model, the output size and an `artSeed`.

`artSeed` is the deliberate escape hatch: **Regenerate this frame's artwork**
increments it, so the key changes and one new image is made while the copy is
untouched. Reopening a package with matching keys makes no API call at all, and
`tests/social-artwork.js` asserts the transport is never touched on a cache hit.

### Stray lettering is rejected, not displayed

The model is told at length not to draw words. It mostly obeys. Every base is
asked about before it is stored, by the same model, with a yes/no schema; a
base that reports lettering is rejected, **nothing is written to the bucket**,
the slide keeps its composed fallback and the dashboard says why. An
unparseable answer counts as "possibly has text": a false positive costs one
retry, a false negative costs a published typo.

### When no image engine is configured

Without `OPENAI_API_KEY` the pipeline is inert and every slide renders through
the **composed fallback** — the same approved cutouts, the same painted shapes,
the same deterministic wording, built entirely in `templates.js`. It is the
floor, not a placeholder: `npm run social:render` produces complete, exact,
on-brand 1080×1350 and 1080×1920 output with no network access at all. Setting
the key raises the ceiling; it is not what makes the system work.

### Generation states

`QUEUED → GENERATING → READY | FAILED`, shown on the package with the error in
full and a manual **Retry**. There is deliberately no automatic retry: a loop
that re-requests a failed image on a timer is a loop that spends money while
nobody is watching. Composing a package leaves it `QUEUED` and costs nothing —
which is what stops "Generate all" turning into sixty-one image bills.

### Where the media lives

`social/<packageId>/<kind>-<n>-<16 hex of the content key>.png` in Firebase
Storage. Package-scoped so deletion can remove exactly its own media; the key
in the filename is what makes the path unguessable, which is what lets an
`<img>` on the dashboard load it without a token exchange. `storage.rules`
gives the prefix `allow read: if true; allow write: if false` — only the Admin
SDK inside `social-artwork.js` can write there. No base64 image is ever stored
in Firestore.

Recorded on every frame: rendered asset path, dimensions, slide family,
reference ids, manifest version, prompt version, image model, generation
timestamp and the content key. All of it is in the approval hash.

---

## Deleting a rejected package

The Rejected tab used to be eternal. **Delete permanently** is the way out, and
it is deliberately narrow — the policy is `scripts/lib/social/deletion.js`, so
it is testable without a Firebase project:

* available only when the status is exactly `REJECTED`;
* the caller has to type the guide's slug, and the confirmation names the guide;
* it runs in an authenticated Netlify function through the Admin SDK — the
  browser never gets Firestore delete permission;
* it removes the package document and the files under `social/<packageId>/`,
  and **nothing else**. The prefix is derived from the package id rather than
  read from the document, so a hand-edited `assetPath` pointing at
  `guides/hero.png` cannot be used to delete a guide illustration;
* anything else returns a non-success response with a code and the status it
  actually has.

`tests/social-delete.js` exercises the allowed case and every refused one.

---

## Instagram and Facebook

One grounded package, two destinations, chosen per package
(`instagram` / `facebook` / `both`). The difference between them is real and it
is only two things:

* **Instagram** — a caption cannot carry a clickable link, so the copy points
  at the bio link. Hashtags belong here.
* **Facebook** — a post can, so the tagged guide URL is in the copy
  (`utm_source=facebook`, `utm_campaign=fb_YYYY_MM`) and hashtags drop to two.

The artwork, the slide text and the warning are shared, because a warning worth
showing on one platform is worth showing on the other. Both captions are
derived from the shared caption by `compose.js platformCopy()`, rebuilt inside
`workflow.js applyEdit()` *before* the hashes are compared, and both are in the
approval hash.

Destination controls previews and future held targets only. **No Meta call is
made and none can be.**

---

## Files

**New**

    social/index.html                     the dashboard
    social/app.js                         its logic
    social/social.css                     its layout (imports tokens.css)

    scripts/lib/social/config.js          the publishing lock, states, formats
    scripts/lib/social/guides.js          reads guides from Firestore (server)
    scripts/lib/social/select.js          which guides are eligible
    scripts/lib/social/compose.js         guide fields → package
    scripts/lib/social/condense.js        shorten a sentence to a phrase
    scripts/lib/social/refs.js            the reference manifest, and selection
    scripts/lib/social/artprompt.js       the versioned image-prompt builder
    scripts/lib/social/artwork.js         cache key, plan, stray-text gate
    scripts/lib/social/deletion.js        the deletion policy
    scripts/lib/social/templates.js       the poster renderer (shared)
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
    netlify/functions/social-artwork.js   the ONLY place that reaches OpenAI
    netlify/functions/social-references.js  the reference library, read-only
    netlify/functions/social-delete.js    rejected-only permanent deletion

    assets/img/refs/posters/*.jpg         the seven approved poster references
    assets/img/refs/posters/thumbs/*.jpg  their dashboard thumbnails

    tests/social-publishing-lock.js       the lock, and that nothing calls it
    tests/social-safety.js                the content rules + all 61 guides
    tests/social-approval.js              hash and approval integrity
    tests/social-references.js            the manifest, selection, key safety
    tests/social-artwork.js               the pipeline, with a fake transport
    tests/social-delete.js                deletion, and everything it refuses
    tests/social-output.js                1080×1350 / 1080×1920, safe areas

**Changed**

    scripts/lib/bake.js       the footer Instagram link, inside applyFootLinks()
    scripts/lib/site.js       "/social/" added to PRIVATE_ROUTES
    assets/css/style.css      three lines for the footer icon
    privacy.html              a short, accurate section on the Instagram link
    firestore.rules           social_packages, social_state — server-write only
    storage.rules             a public-read social/ prefix for rendered JPEGs
    package.json              verify:social, social:render, social:proof
    .gitignore                new — ignores social-preview/
    assets/img/refs/manifest.json  a `library` of reference objects (the old
                                   flat keys are untouched — see below)
    tests/verify.js           a pre-existing stale font-filename list

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
| `OPENAI_API_KEY` | `social-artwork.js`, already set for the illustration generator | optional — without it every slide renders through the composed fallback |
| `OPENAI_IMAGE_MODEL` | the image model, defaults to `gpt-image-1` | no |
| `OPENAI_MODEL` | the orchestrator, defaults to `gpt-4o` | no |
| `OPENAI_IMAGE_QUALITY` | defaults to `medium` | no |
| `URL` / `DEPLOY_PRIME_URL` | Netlify sets these; used to build absolute reference URLs | set by Netlify |
| `SOCIAL_ADMIN_EMAIL` | optional override of the admin address | no |
| `SOCIAL_PUBLISHING_ENABLED` | the lock | **no — leave it unset** |
| `IG_ACCESS_TOKEN`, `IG_USER_ID` | the future publisher | no |

Names only. Nothing here goes in the repository, in client JavaScript, in HTML,
in Firestore, in local storage or in a generated file.

`OPENAI_API_KEY` is read in exactly one social file —
`netlify/functions/social-artwork.js` — and used in exactly two places there: a
presence check and an `Authorization` header. `social-references.js` and
`social-status.js` report only `Boolean(process.env.OPENAI_API_KEY)`, never the
value. `tests/social-references.js` asserts all of that, and that no script any
page loads mentions it.

---

## Running the tests

    npm run check           build + everything
    npm run verify          everything, including the social suites
    npm run verify:social   just the seven social suites
    npm run social:proof    render drinking-less-milk at full size, JPEG + PNG

`npm run verify` calls the build's own checks first; those expect
`npm run build` to have run, and on a fresh checkout they report the missing
build output rather than a real failure.
