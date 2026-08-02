# The Messy Parents Collection — Studio & Firebase

The **Studio** (`/studio/`) is your back office: edit each guide's title, the three
columns (heading + bullets) and the quick-answer box, with a live preview — no code.

There are two modes, controlled entirely by `assets/js/firebase-config.js`:

| Mode | When | Login | Save behaviour |
|------|------|-------|----------------|
| **Local preview** | `FIREBASE_CONFIG = null` (default) | none | Downloads an updated `guides.json` (for testing / offline) |
| **Live Firebase** | you paste your config | Firebase Auth | Writes to Firestore |

You can use Local preview right now: run a static server in this folder
(`python3 -m http.server`) and open `http://localhost:8000/studio/`.

---

## Editing page illustrations (Popular / Guides / About)

Pick a page from the **Pages** list at the top of the sidebar to edit its title,
subtitle and illustrations with a live preview.

**About** exposes three illustration slots, each with its own controls:

| Slot | Where it appears | Controls |
|------|------------------|----------|
| **Hero** | beside “About us” + subtitle | Upload/replace, Reset, Crop, Width (Small/Medium/Large), Side (Left/Right), Max-width |
| **Middle** | beside “What we do” | same |
| **Bottom** | beside “Who we are” **or** “What we are not” (your choice via *Place beside*) | same, plus *Place beside* |

Uploading always opens the cropper so you can frame the picture; the thumbnail and
live preview then show **only** the new image (no leftover of the old one). *Reset*
returns a slot to its default artwork. Nothing here needs code.

**Adding another illustrated section later:** the About page is built from reusable
`<section class="about-section">` blocks (see the comment at the top of `about.html`).
Copy one block, give it a new `data-illus` name, then register that name in
`PAGE_SLOTS.about` in `studio/index.html` and in `applyAboutPage()` in
`assets/js/mpc-store.js`. That's the whole wiring.

---

## Going live on Firebase (one-time setup)

**1. Create the project & services** (Firebase console)
- Create a Firebase project.
- **Build → Firestore Database → Create database** (Production mode).
- **Build → Authentication → Get started → Email/Password → Enable.**
- **Authentication → Users → Add user** — create your own admin email + password.

**2. Add your web config**
- Project settings → *General* → *Your apps* → Web app → copy the config object.
- Paste it into `assets/js/firebase-config.js` (uncomment the block, fill the values).
- Put your project id in `.firebaserc` (`YOUR_FIREBASE_PROJECT_ID`).

**3. Seed the guides into Firestore**
- Project settings → *Service accounts* → **Generate new private key**.
- Save it in this folder as `serviceAccount.json` (already git-ignored; never deploy it).
- `npm install`
- `npm run seed`  → loads all 16 guides from `data/guides.json` into the `guides` collection.

**4. Deploy**
- `npm i -g firebase-tools` then `firebase login`.
- `firebase deploy --only firestore:rules`
- `firebase deploy --only hosting`

**5. Use it**
- Open `https://YOUR-SITE/studio/`, sign in with the admin account, edit, Save.

---

## Security

`firestore.rules` makes guides **publicly readable** and **writable only when signed in**.
Since only you have an account, that's enough — but for belt-and-braces you can restrict
writes to your exact email (commented example is in the file). Always use a strong password.

---

## Files in this package

- `studio/index.html` — the Studio admin app (self-contained).
- `assets/js/firebase-config.js` — mode switch / your config.
- `firestore.rules` — access rules.
- `firebase.json`, `.firebaserc` — hosting + project config.
- `seed.js`, `package.json` — one-command Firestore seeding from `data/guides.json`.
- `data/guides.json` — the source-of-truth export of all guides.
- `templates/guides.js.tmpl` — template used to regenerate the static `guides.js` if ever needed.

## The one remaining connection (next step)

Right now the **public** pages (`index`, `guides`, `popular`, `guide`) still read the
bundled `assets/js/guides.js`. To make Studio edits appear on the live site instantly,
those four pages need a small change to read the `guides` collection from Firestore on
load (with `guides.js` kept as an offline fallback). That's the next step — quick, and
it doesn't change any of the visuals.
