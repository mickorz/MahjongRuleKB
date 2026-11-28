// 抓取 Google Fonts 到本地：生成 server/fonts/*.woff2 与 server/fonts/fonts.css
// 用法：node dev-examples/fetch-fonts.mjs
// 说明：CJK 字族按 unicode-range 切成上百个分片，总量约 11MB，故不入库（.gitignore），
//       server 检测到本地文件就用本地，否则回退 CDN。
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// 只取实际用到的字重：正文 400、强调 600；Newsreader 的 italic 用于 rv-k 等斜体标签
const CSS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600" +
  "&family=Noto+Serif+SC:wght@400;600" +
  "&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap";

const outDir = join(process.cwd(), "server", "fonts");
const cssFile = join(outDir, "fonts.css");

const res = await fetch(CSS_URL, { headers: { "user-agent": UA } });
if (!res.ok) throw new Error(`拉取 Google Fonts CSS 失败：${res.status}`);
const css = await res.text();

const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) ?? [])];
if (urls.length === 0) throw new Error("CSS 里没有找到字体地址");

mkdirSync(outDir, { recursive: true });
console.log(`分片数 ${urls.length}，开始下载 → ${outDir}`);

// 文件名取 URL 末段（Google 的哈希名，天然唯一）
const localName = (u) => u.split("/").pop();
let done = 0;
const concurrency = 12;
const queue = [...urls];
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    for (;;) {
      const u = queue.shift();
      if (!u) return;
      const r = await fetch(u, { headers: { "user-agent": UA } });
      if (!r.ok) throw new Error(`下载失败 ${u}：${r.status}`);
      writeFileSync(join(outDir, localName(u)), Buffer.from(await r.arrayBuffer()));
      done += 1;
      if (done % 40 === 0) console.log(`  ${done}/${urls.length}`);
    }
  }),
);

// 把 remote URL 换成本地绝对路径；保留 unicode-range 与 font-family 原样
let local = css;
for (const u of urls) local = local.replaceAll(u, `/fonts/${localName(u)}`);
writeFileSync(cssFile, local);

const bytes = urls.reduce((n, u) => n + (existsSync(join(outDir, localName(u))) ? 1 : 0), 0);
console.log(`完成：${bytes} 个 woff2 + fonts.css`);
console.log("下一步：启动 server 后页面会自动用 /fonts.css（不再请求 Google）");
