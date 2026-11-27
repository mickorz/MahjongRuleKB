// 极简静态服务器：用于预览抓取的页面快照（仅本机）
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";

const root = process.argv[2] ?? "dev-examples/style-capture/bishuxiezuo";
const port = Number(process.argv[3] ?? 4180);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const rel = normalize(url === "/" ? "/offline.html" : url).replace(/^([/\\])+/, "");
  const file = join(root, rel);
  if (!file.startsWith(normalize(root)) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }
  const type = types[extname(file)] ?? "application/octet-stream";
  res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
  res.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => {
  console.log(`快照预览：http://127.0.0.1:${port}/offline.html`);
});
