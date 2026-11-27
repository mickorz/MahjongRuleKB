// 一次性补丁：修复 build-tabbed-snapshot.mjs 里被吞掉的反斜杠
import { readFileSync, writeFileSync } from "node:fs";

const path = "dev-examples/build-tabbed-snapshot.mjs";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const start = s.indexOf("const absolutizeAssets");
const end = s.indexOf("const html = `<!doctype html>");
if (start < 0 || end < 0) throw new Error("锚点未找到");

const block = [
  "const absolutizeAssets = (html) =>",
  '  html.replace(/(src|poster)="([^"]+)"/gi, (match, attr, value) => {',
  '    if (/^(https?:|data:|\\/\\/|\\.\\.?\\/)/i.test(value)) return match;',
  "    return attr + '=\"https://bishuxiezuo.cn/console/' + value.replace(/^\\//, '') + '\"';",
  "  });",
  "",
  "",
].join("\n");

s = s.slice(0, start) + block + s.slice(end);
writeFileSync(path, s, "utf8");
console.log("已修复资源绝对化函数");
