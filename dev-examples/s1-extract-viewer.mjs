// 一次性补丁：server/app.ts 改为引用 server/viewer.ts，并删除内联前端
import { readFileSync, writeFileSync } from "node:fs";

const path = "server/app.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const startMarker = "/** 无构建前端：三栏只读视图。故意不引入框架，W3-2 需要交互再换。 */";
const startIdx = s.indexOf(startMarker);
if (startIdx < 0) throw new Error("未找到 viewerHtml 起始标记");

// viewerHtml 是文件末尾的导出函数：截到它的定义结束（`}` 后紧跟文件末尾或只剩空行）
const after = s.slice(startIdx);
const endMatch = /\nexport function viewerHtml\(\): string \{[\s\S]*?\n\}\n?$/.exec(after);
if (!endMatch) throw new Error("未匹配到 viewerHtml 函数体，可能结构已变");

s = s.slice(0, startIdx).trimEnd() + "\n";
s = s.replace(
  'import { SECTION_TITLES } from "../studio/pipeline/render.ts";',
  'import { SECTION_TITLES } from "../studio/pipeline/render.ts";\nimport { viewerHtml } from "./viewer.ts";',
);

// 重新导出，保持既有 `import { viewerHtml } from "../../server/app.ts"` 调用点不变
s += "\nexport { viewerHtml };\n";

writeFileSync(path, s, "utf8");
console.log("server/app.ts 已改为引用 viewer.ts 并删除内联前端");
