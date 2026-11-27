// 一次性补丁：工作台响应加 no-store，避免浏览器缓存旧 HTML/API
import { readFileSync, writeFileSync } from "node:fs";

const path = "server/app.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldJson = `const json = (res: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
  res.end(body);
};`;

const newJson = `/** 本地开发工具：一律不缓存，避免改了 HTML/API 却看到旧页面 */
const NO_STORE = { "cache-control": "no-store, must-revalidate" } as const;

const json = (res: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    ...NO_STORE,
  });
  res.end(body);
};`;

if (!s.includes(oldJson)) throw new Error("json 辅助函数未匹配");
s = s.replace(oldJson, newJson);

const oldText = `const text = (res: ServerResponse, status: number, body: string, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, { "content-type": contentType, "content-length": Buffer.byteLength(body) });
  res.end(body);
};`;

const newText = `const text = (res: ServerResponse, status: number, body: string, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, {
    "content-type": contentType,
    "content-length": Buffer.byteLength(body),
    ...NO_STORE,
  });
  res.end(body);
};`;

if (!s.includes(oldText)) throw new Error("text 辅助函数未匹配");
s = s.replace(oldText, newText);

writeFileSync(path, s, "utf8");
console.log("已加 no-store 缓存头");
