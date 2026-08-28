/* Wrong folder — the working copy is netlify/functions/publish.js

   Server-side code placed in assets/js/ by mistake. Nothing loads it, and it
   holds no secrets: the build hook lives in the NETLIFY_BUILD_HOOK environment
   variable, which is never sent to a browser.

   Replaced with this note rather than removed, so nothing has to be deleted. */
