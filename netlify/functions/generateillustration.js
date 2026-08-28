/* Retired endpoint — superseded by generate-illustration.js

   This filename has no hyphens, which is how it came to exist: it is an old
   copy of the pipeline that was never wired to anything. Netlify turns every
   file in this folder into a live endpoint, so leaving the old code here meant
   an out-of-date copy of the generator was publicly reachable.

   Replaced with this stub rather than removed, so nothing has to be deleted.
   It is safe to leave in place indefinitely. */

exports.handler = async () => ({
  statusCode: 410,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    error: "This endpoint is retired. Use /.netlify/functions/generate-illustration instead."
  })
});
