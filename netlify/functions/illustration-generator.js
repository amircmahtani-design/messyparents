/* Not a function — this file's real home is studio/illustration-generator.js

   A copy of the Studio browser UI was placed in this folder by mistake. Netlify
   builds everything here as a serverless function, so browser code sitting in
   this directory becomes a broken endpoint and can fail the build, since it has
   no handler to export.

   The working copy lives at studio/illustration-generator.js and is loaded by
   studio/index.html. Replaced with this stub rather than removed, so nothing
   has to be deleted. Safe to leave in place. */

exports.handler = async () => ({
  statusCode: 410,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ error: "Not an endpoint. This file belongs in studio/." })
});
