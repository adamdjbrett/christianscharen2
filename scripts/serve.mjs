import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, sep } from "node:path";
import { gzipSync } from "node:zlib";

const root = join(process.cwd(), "_site");
const types = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".xml": "application/xml; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2"
};

const server = createServer(async (request, response) => {
  try {
    if (!/^(GET|HEAD)$/.test(request.method)) throw 405;
    const relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "") || "index.html";
    let file = join(root, relative);
    if (file !== root && !file.startsWith(root + sep)) throw 403;
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    let body = await readFile(file);
    const type = types[extname(file)] || "application/octet-stream";
    const compressed = request.headers["accept-encoding"]?.includes("gzip") && /^(text|application\/(json|xml|javascript)|image\/svg)/.test(type);
    if (compressed) body = gzipSync(body);
    response.writeHead(200, {
      "Cache-Control": /\.(html|css|js)$/.test(file) ? "no-cache" : "public, max-age=31536000, immutable",
      "Content-Length": body.length,
      "Content-Type": type,
      "Vary": "Accept-Encoding",
      ...(compressed && { "Content-Encoding": "gzip" })
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (status) {
    const code = Number.isInteger(status) ? status : status?.code === "ENOENT" ? 404 : 500;
    response.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" }).end(`${code}\n`);
  }
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error("Port 8080 is already in use. Stop the existing server and retry.");
    process.exitCode = 1;
    return;
  }
  throw error;
});
server.listen(8080, () => console.log("Server at http://localhost:8080/"));
