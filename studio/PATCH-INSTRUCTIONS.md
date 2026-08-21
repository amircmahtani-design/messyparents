# Studio patch — adding the illustration generator UI

Two edits to `studio/index.html`. Copy-paste jobs, no logic to think about.

---

## Edit 1 — Replace the `#genWrap` block

**Find** (around line 287):

```html
<div class="field" id="genWrap">
  <label>Hero image <span class="hint">— upload a picture from your computer (PNG with transparency works best)</span></label>
  <input id="f_upload" type="file" accept="image/*" style="font-family:inherit;font-size:14px">
  <div style="margin-top:8px"><span id="genMsg" class="hint"></span></div>
</div>
```

**Replace with** the contents of `illustration-ui.html` (below).

---

## Edit 2 — Replace the old `generateIllustration()` function

**Find** the whole `async function generateIllustration()` block (around line 576–615) and **replace it with** the contents of `illustration-ui.js` (below).

The `STYLE_BIBLE`, `CHARACTER_BIBLE`, `buildPrompt()`, `uploadHero()` and `cutoutBackground()` functions above it can stay or be deleted — the new pipeline doesn't use them (the server does all that work now). Safe to leave them there.

---

## Edit 3 — Firestore rules (one-line addition)

The pipeline writes pending images to `guides-pending/` in Firebase Storage while awaiting approval. Add read access to that path in `storage.rules`:

```
match /guides-pending/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

Deploy the rules from the Firebase console after editing.

---

## Edit 4 — Environment variables

In Netlify → Site settings → Environment variables, confirm/add:

- `OPENAI_API_KEY` (already exists)
- `OPENAI_IMAGE_MODEL` = `gpt-image-2` (new — pinning to the newer model)
- `OPENAI_MODEL` = `gpt-4o` (already exists as your orchestrator)
- `FIREBASE_SERVICE_ACCOUNT` (already exists)
- `FIREBASE_STORAGE_BUCKET` (already exists)

That's it.
