/* Wrong folder — the working copy is netlify/functions/generate-illustration-background.js

   This is server-side code that was placed in assets/js/ by mistake. Nothing
   loads it: it is not referenced by any page, and it could not run in a browser
   anyway (it needs firebase-admin and the OpenAI key, which only exist on the
   server). It contains no secrets — it reads them from environment variables —
   so it is harmless, just dead weight in a public folder.

   Replaced with this note rather than removed, so nothing has to be deleted. */
