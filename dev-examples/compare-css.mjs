// 源码级对比：我们 viewer.ts 的 CSS 与参考站 console.css / all.css 的同名组件
import { readFileSync } from "node:fs";

const ours = readFileSync("server/viewer.ts", "utf8");
const css = ours.slice(ours.indexOf("<style>"), ours.indexOf("</style>"));

function block(sel) {
  const i = css.indexOf(sel + " {");
  if (i < 0) return "(未找到)";
  const j = css.indexOf("}", i);
  return css.slice(i, j + 1).replace(/\s+/g, " ").trim();
}

const pairs = [
  [".doc-col", ".cr-vol-doc", "max-width:1200px;margin:0 auto;width:100%;padding:30px 40px 56px"],
  [".cfgcard", ".cr-cfgcard", "border:1px solid;radius:9px;padding:14px 16px;column;gap:12px"],
  [".cc-row", ".cc-row", "flex;align-items:center;gap:11px;font-size:12.5px;min-height:26px"],
  [".seg", ".c-titled-text-body", "padding:12px 14px;border-left:3px gold-soft;radius:6;13px/1.8"],
  ["h1", ".cr-vol-nm", "font-size:34px;600;line-height:1.1"],
  [".toc-row", ".cr-itemrow", "padding:11px 12px;radius:7;opacity:.5;gap:10px"],
  [".toc-nm", ".cr-itemnm", "600;13.5px"],
  [".vseg button", ".c-tab", "13px;padding:7px 14px;radius:5"],
  [".group-label", ".c-label", "11px;.08em;uppercase;latin;600;mb:12px"],
  [".c-content-action", ".c-content-action", "min-height:30px;padding:4px 10px;radius:5;11.5px sans"],
  [".c-revpop", ".c-revpop", "width:348;padding:15px 16px 16px;radius:8;gold-soft"],
];

for (const [o, ref, expect] of pairs) {
  console.log(`${o}  →  ${ref}\n   ours : ${block(o)}\n   参考 : ${expect}\n`);
}
