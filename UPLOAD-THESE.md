# Upload these — round 3

Drop the contents of this folder over your checkout, keeping the folder
structure. Verified: applied to a clean copy of the original repository,
`npm run check` gives **697 passed, 0 failed**.

49 files. 14 are the poster reference images; they are unchanged since round 1
and included so this folder applies on its own.

---

## What is in this round

### 1. Deleting rejected packages

**The button existed but only inside an opened package.** The Rejected tab is a
list of things you have already decided about, and making somebody open each
one to clear it is why the list never got cleared.

`Delete permanently…` is now on **every rejected row**, beside `Open`. The row
also shows the slug and the rejection reason so you know what you are deleting
without opening it.

The safety is unchanged and server-side: the endpoint refuses anything whose
status is not exactly `REJECTED`, you have to type the guide's slug to confirm,
and only files under `social/<packageId>/` are removed — the guide, its
illustration and every shared reference asset are untouched.

### 2. Knowing whether the OpenAI API is really working

**New: a `Test the connection` button**, in the References tab and again in
Status. Three checks, cheapest first, stopping at the first failure:

1. is `OPENAI_API_KEY` set at all — no request;
2. does it authenticate, and can this account reach the orchestrator — one tiny
   text request, about 16 output tokens;
3. is the image model actually available to this account — one models listing.

It never generates an image, so the whole check costs a fraction of a cent, and
it never returns or logs the key.

The third check is the one that matters in practice: a key can authenticate
perfectly while the organisation has not been verified for image generation.
Without this you only discover that halfway through generating a package, as a
confusing refusal. Here it says so, lists the image models the account *can*
use, and tells you what to do next.

It also checks the reference files are deployed — a working key is no use if
`assets/img/refs/posters/` did not ship.

**New file:** `netlify/functions/social-engine-test.js`
**Changed:** `scripts/lib/social/openai.js` gains `testConnection()`;
`social/app.js` gains the button and the result panel.

---

## Important: what you are looking at now is the old build

The dashboard in your screenshot has these tabs:

    Make a package · Drafts · Needs review · Approved & held · Rejected · Published · Status

There is no **References** tab, which round 1 added. So the deployed site is
still running the pre-existing code: `social-delete.js`, `social-artwork.js`
and `social-references.js` are not on it, which is exactly why you cannot
delete a rejected package and why there is nothing anywhere telling you about
OpenAI.

Once this folder is uploaded and Netlify redeploys you should see:

* a **References** tab between Published and Status;
* `Delete permanently…` on each rejected row;
* `Test the connection` in References and in Status;
* an artwork state bar (`QUEUED` / `GENERATING` / `READY` / `FAILED`) with a
  `Generate artwork` button on every opened package.

If the References tab is not there after a deploy, the deploy did not pick the
files up — check the Netlify build log before anything else.

---

## Verifying from the command line instead

    node scripts/social-proof.js drinking-less-milk --report

prints the artwork state of every frame with no API calls and no spend.

    OPENAI_API_KEY=…  node scripts/social-proof.js drinking-less-milk

runs the real thing — same `artwork.generate()` and same transport as the live
dashboard — writes the six 1080×1350 files, the three 1080×1920 files, both
captions and `artwork-report.json`, and prints the artwork-state table with the
OpenAI request count. A frame that fails prints `FAILED` or `REJECTED` with the
reason; it never silently shows the fallback.

`SOCIAL_PUBLISHING_ENABLED` stays unset. Publishing remains impossible.
