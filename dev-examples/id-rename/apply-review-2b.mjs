// 用片段文件按标记拼接（v1.2，2026-11-24）—— 避免模板字符串里的反引号转义问题
import fs from "node:fs";

const f = "dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md";
let s = fs.readFileSync(f, "utf8");
const read = (p) => fs.readFileSync(`dev-examples/id-rename/frag/${p}`, "utf8");
const splice = (startMark, endMark, content) => {
  const i = s.indexOf(startMark);
  const j = s.indexOf(endMark);
  if (i < 0 || j < 0 || j <= i) throw new Error(`边界未匹配：${startMark} / ${endMark}`);
  s = s.slice(0, i) + content + s.slice(j);
};

// 1) 第六节整体替换（从「## 六、」到「## 七、」）
splice("## 六、Document Block（文档块模型）", "## 七、四种编辑行为", read("block.md"));

// 2) 第十一节整体替换（从「## 十一、」到「## 十二、」）
splice("## 十一、实施优先级", "## 十二、数据产物", read("impl.md"));

// 3) 第八节：8.3 → 8.4 新内容 + 8.5 标题
const old83 = "### 8.3 段落与规则卡是多对多";
const i83 = s.indexOf(old83);
if (i83 < 0) throw new Error("8.3 未匹配");
s = s.slice(0, i83) + read("edit84.md") + s.slice(i83 + old83.length);

// 4) Stage 表中三行收紧
const rowFix = [
  [
    "| 0 | 规则集、基座版本、变体版本、生成任务 ID | 锁定版本与范围，记录输入 Hash | `input-manifest.json` |",
    "| 0 | 规则集、基座版本、变体版本、生成任务 ID | 锁定版本与范围；记录可复现字段（基座/变体版本与 `content_hash`、需求覆盖结果版本、文档模板版本、Prompt 版本、模型及版本、生成器版本） | `input-manifest.json` |",
  ],
  [
    "| 2 | 模板 + 有效规则集 | 建游戏流程章节；把卡与配置分配到章节；检查未分配项 | `document-outline.yaml` |",
    "| 2 | **共享文档模板** + 有效规则集 | 用所有变体共用的章节模板（3.1）建章节；按同一 `section_id` 分配卡与配置；检查未分配项。**变体不重组章节** | `document-outline.yaml` |",
  ],
  [
    "| 5 | 上游全部产物 + 需求覆盖结果 | 规则覆盖、需求覆盖、来源追踪、差异正确性、未决项检查 | `validation-report.md` |",
    "| 5 | 上游全部产物 + 需求覆盖结果 | 规则覆盖、需求覆盖（**含每条原子需求是否被正文表达**）、来源追踪、差异正确性、未决项检查、三维标记合法性、`requirement_refs` 缺失清单 | `validation-report.md` |",
  ],
];
for (const [from, to] of rowFix) {
  if (!s.includes(from)) throw new Error(`Stage 行未匹配：${from.slice(0, 20)}`);
  s = s.split(from).join(to);
}

fs.writeFileSync(f, s);
console.log("第六、八、十一节与 Stage 表已按评审更新");
