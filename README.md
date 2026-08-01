# The Messy Parents Collection

Static site. No build step, no dependencies, no terminal needed.

## Upload to GitHub

1. New repo → **Add file → Upload files**
2. Drag in *everything* in this folder, keeping the `assets` folder structure intact.
3. Commit.

## Publish

**GitHub Pages:** Settings → Pages → Source: `main`, folder `/ (root)`.

**Netlify:** New site from Git → pick the repo → build command: *(leave empty)*, publish directory: `/`.

## Files

| File | What it is |
|---|---|
| `index.html` | Home. Topic + age pills filter the guide list live. |
| `guides.html` | Browse all, with search. Accepts `?topic=`, `?age=`, `?q=` |
| `guide.html` | Reads one guide via `?id=` |
| `about.html`, `books.html`, `404.html` | Static pages |
| `popular.html` | Most-read guides, plus one per topic |
| `assets/js/guides.js` | **All the content lives here**, plus the search ranking |
| `assets/css/style.css` | All styling |
| `assets/img/` | Logo, family illustration, papa (backgrounds removed) |

## Adding a guide

Open `assets/js/guides.js`, copy any block inside `GUIDES = [ ... ]`, change the fields:

```js
{
  id:"unique-url-slug",        // becomes guide.html?id=unique-url-slug
  topic:"feeding",             // feeding | sleeping | development | health | sanity
  icon:"bottle",               // bottle | moon | blocks | cross | heart | baby
  featured:true,               // true = shows in "Popular guides" on the home page
  title:"...",
  ages:["4–6 months"],         // must match the strings in AGES exactly
  read:3,
  summary:"One line under the title.",
  body:`<p>HTML goes here.</p>`,
  callout:{title:"Call your doctor if", items:["...","..."]},   // or null
  related:["some-other-id"]
}
```

That's it — the home page, browse page, search and related-links all pick it up automatically.

## Notes

- Fonts load from Google Fonts (Gaegu, Patrick Hand, Nunito). If you'd rather self-host, drop the files in `assets/fonts/` and swap the `<link>` in each page.
- Every health guide carries a red-flag box and a footer line making clear this isn't medical advice. Worth keeping if you add more.

## How the home page filter works

Steps 1 and 2 (topic and age pills) and the search box all feed the same
results list in step 3. Search is ranked, not just filtered: a word in a
guide's title scores far higher than the same word buried in the body, and
guides matching more of the typed words rank above ones matching fewer — so
results sharpen as you type. Simple stemming means "naps" still finds "nap".

The home page shows the top 4 and links to the full list; the Guides page
shows everything. To change that cap, edit `CAP` at the top of the inline
script in `index.html`.
