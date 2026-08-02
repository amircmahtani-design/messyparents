/* Tiny static file server for the audit. Serves the project root so Playwright
   can load every page exactly as it ships. No dependencies. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.AUDIT_PORT ? Number(process.env.AUDIT_PORT) : 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf"
};

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
  if (pathname === "/") pathname = "/index.html";
  // prevent path traversal
  const filePath = path.join(ROOT, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
  if (!filePath.startsWith(ROOT)) { res.statusCode = 403; return res.end("forbidden"); }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader("content-type", "text/html; charset=utf-8");
      return res.end("<h1>404</h1>");
    }
    res.setHeader("content-type", MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    res.end(data);
  });
});

server.listen(PORT, () => console.log("Audit server on http://localhost:" + PORT));
