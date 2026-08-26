# Fix: 2 steps, about 3 minutes

Your fonts are not missing. They are in a folder called README.md.

    assets/fonts/README.md/baloo-2-v23-latin-600.woff2   <- where they are
    assets/fonts/baloo-2-v23-latin-600.woff2             <- where they need to be

That is my fault. When GitHub showed "fonts/README.md" in the file list I told
you it was GitHub collapsing a folder with one item in it. It was not. It was a
real folder named README.md, and the eight fonts went inside it. My "create a
file called fonts/README.md" instruction is what produced it.

Second thing: the code in your repo is from the earlier zip, so it asks for
baloo2-600.woff2 rather than baloo-2-v23-latin-600.woff2. The nine files here
fix that half.

## Step 1 — put the fonts one level up

Open this (it points the uploader at the right folder):

    https://github.com/amircmahtani-design/messyparents/upload/main/assets/fonts

Drag in the same eight .woff2 files from your Downloads. Do NOT rename them.
Commit.

Then check this URL loads instead of 404ing:

    https://themessyparentscollection.com/assets/fonts/nunito-v32-latin-regular.woff2

Once that works, the old folder can go: open
assets/fonts/README.md, delete the files inside it, and the folder disappears
with them. Nothing references it. This is tidying, not urgent.

## Step 2 — upload these 9 files

    index.html      guides.html     popular.html    about.html
    books.html      editorial.html  404.html        guide.html
    assets/css/tokens.css

These point at the real filenames. Nothing else changes.

## Then

Site should look normal again. If it does, run PageSpeed and send it over.

## Also worth deleting whenever

CRITICAL-CSS-README.md and PAGESPEED-FIX-README.md ended up at the root of the
repo. They are my notes, not site files. Harmless, just clutter.
