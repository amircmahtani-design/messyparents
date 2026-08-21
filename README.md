# Messy Parents — Illustration Generator v2 (brand-safe)

Drop-in patch for your existing `messyparents-main` repo. Rebuilds the AI illustration feature as a **four-stage pipeline with automatic QA and required human approval**, using GPT Image 2 with fresh reference injection on every call.

## Why this replaces the old approach

- **No session chaining.** Every generation sends the full canonical references again. Long chains drift; fresh baseline every time doesn't.
- **Automated visual QA.** After every generation the vision model compares the result against your character sheets and returns `accept | retry`. Two auto-retries with corrective prompts before it ever reaches you.
- **Pixel-level transparency verification** — not just the AI's word for it.
- **Nothing goes live without your explicit Approve click.** Failed attempts show the QA verdict so you can see the drift and reject it.

## What's in this zip

```
netlify/functions/
  generate-illustration-background.js   ← full rewrite (replace your existing file)

assets/img/refs/
  manifest.json                         ← replace
  papa.png                              ← replace (definitive character reference)
  mama.png                              ← replace
  ari.png                               ← replace
  brand-reference-board.png             ← new
  approved-milk-refusal.png             ← new
  approved-family-writing.png           ← new
  approved-popular-guides.png           ← new
  approved-not-doctors.png              ← new

studio/
  PATCH-INSTRUCTIONS.md                 ← two copy-paste edits to studio/index.html
  illustration-ui.html                  ← HTML block
  illustration-ui.js                    ← JS block
```

Your existing legacy references (`family-messy-sofa-close.png`, etc.) stay put — the new pipeline just doesn't use them. Safe to delete later if you want.

## Install (GitHub web UI, no terminal needed)

1. In your repo, replace `netlify/functions/generate-illustration-background.js` with the one in this zip.
2. Upload all the new files in `assets/img/refs/` (the manifest, the three character PNGs, the brand board, and the four `approved-*.png` scenes). Overwrite where names match.
3. Follow the two edits in `studio/PATCH-INSTRUCTIONS.md` to update `studio/index.html`.
4. In Netlify → Site settings → Environment variables, add:
   - `OPENAI_IMAGE_MODEL` = `gpt-image-2`
   - (Keep `OPENAI_API_KEY`, `OPENAI_MODEL`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_STORAGE_BUCKET` as they are.)
5. Add the `guides-pending/` rule to `storage.rules` (see PATCH-INSTRUCTIONS step 3) and deploy Firebase rules.
6. Push. Netlify will redeploy. Open Studio, pick a guide, hit **Generate illustration**.

## What to expect

- Planning takes ~10 sec, generation ~30–60 sec, QA ~10 sec. With retries, worst case ~3 min.
- The pending image appears in Studio with the QA verdict beside it and the scene brief in an editable JSON textarea.
- **Approve** attaches the image URL to the guide (still need to hit Save on the guide itself).
- **Regenerate** re-runs with the same brief (useful if a good idea rendered slightly wrong).
- **Edit brief & regenerate** lets you tweak the brief JSON (e.g. remove a character, change an expression) and re-run.
- **Reject** discards silently. The pending PNG stays in `guides-pending/` in Storage — you can prune it later.

## Cost note

Each attempt is roughly: 1 planner call + 1 image generation + 1 QA call. On a clean pass that's ~$0.05–0.10 total. Retries multiply this. Set a budget alert in your OpenAI dashboard.

## Notes on the hard rules

The server prompt bakes in absolute constraints (Papa never has glasses, no text, no new characters, no wooden spoon unless requested, magenta background only). The QA step actively looks for violations of these and forces a retry. If you find a violation that keeps slipping through, add it to `HARD_RULES` in the Netlify function — the array is at the top of the file, easy to edit.

## Test recipe

Try guide **"Why is my baby drinking less milk?"** — the expected concept per the spec is Ari cheerfully turning away or pushing away a bottle while the parent(s) look mildly puzzled, NOT frightened. If you get frightened parents or a distressed baby, the QA should catch it and retry. If a bad one still slips through to the Awaiting Approval stage, Reject and Regenerate — the brief itself might need editing.
