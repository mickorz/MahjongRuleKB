// 修订清单升 v3：并入第 4 轮评审（H 节 + 修正 A-5/B-2/B-3/B-5/B-6 + 编号表 + 自检）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-需求全文生成v1.3修订清单.md";
let s = fs.readFileSync(f, "utf8");
const frag = (p) => fs.readFileSync(`dev-examples/id-rename/frag/${p}`, "utf8");
const rep = (from, to) => {
  if (!s.includes(from)) throw new Error(`未匹配：${from.slice(0, 60)}`);
  s = s.split(from).join(to);
};

// 1) 修订记录加 v3
rep(
  "| v2 | 2026-11-24 | 按第 3 轮评审修订：",
  "| v3 | 2026-11-24 | 并入第 4 轮评审（见「## H」节）：B-6 重写为复用主文档 `baseRevision` + Proposal/Transaction 状态机分层（新增 I-50、AD-39、AC-54）；H-3 定 `document.json` 为唯一事实源、`identity-map.json` 降为可重建索引；H-4 目录结构统一（B-4 三项限制废止，`changes.json` 明确 P1 才生成）；H-5 片段四类引用全部必填可空；H-6 扩 AC-47 四场景并修正 A-5 措辞与 B-3 条数 |\n| v2 | 2026-11-24 | 按第 3 轮评审修订：",
);
remove_unused();

function remove_unused() {}

// 2) A-5 措辞修正
rep(
  "五种展示标签仅为 UI 表现，不是底层数据模型",
  "**五类来源关系主标签 + 两类状态徽标**仅为 UI 表现，不是底层数据模型",
);

// 3) B-2 四类必填可空
rep(
  "④ 新增 **FR-51**：片段级四类引用为必填（可为空数组，但字段必须存在）",
  "④ 新增 **FR-51**：**每个 segment 的四类引用字段全部必填、值可为空数组**；块级四类引用由片段聚合得到，不手填",
);
rep(
  "| 验收 | 示例中每个 segment 都有四类引用字段；`grep -n \"聚合\"` 出现在四类引用的说明里 |",
  "| 验收 | 示例中**两个 segment 都**具备四类引用字段；`grep -n \"聚合\"` 出现在块级引用的说明里 |",
);

// 4) B-3 第⑧条改主从 + 验收条数
rep(
  "⑧ `identity-map.json` 与 `document.json` 同版本号，两者不一致时以 `document.json` 为准并重建映射。",
  "⑧ **`document.json` 为唯一事实源**：完整身份映射与 `segment_lineage` 历史一并存在其中；`identity-map.json` 只是由它生成的可重建索引，不一致时重建、不进入人工恢复。",
);
rep("| 验收 | 6.8 五条齐全；", "| 验收 | 6.8 **八条**齐全；");

// 5) B-5 五文件表补 identity-map + changes.json P1
rep(
  "| `provenance.json` | 派生索引 | 可，由 `document.json` 重建 |",
  "| `identity-map.json` | 派生索引（身份映射与 lineage 历史的事实源在 `document.json`） | 可，由 `document.json` 重建 |\n| `provenance.json` | 派生索引 | 可，由 `document.json` 重建 |",
);
rep(
  "| `changes.json` | 派生差异索引 | 可，由 `document.json` 的 `diff_status` + 差异片段重建 |",
  "| `changes.json` | 派生差异索引 | 可，由 `document.json` 的 `diff_status` + 差异片段重建；**P1 才生成**（P0-A 不做差异引擎） |",
);
rep(
  "| 改成 | ① 明确五个文件角色（下表）；",
  "| 改成 | ① 明确六个文件角色（下表），**本项取代 B-4 的三项目录限制**；",
);

// 6) B-6 整节替换为 v3 版
const b6Start = s.indexOf("### B-6 文档提案数据契约");
if (b6Start < 0) throw new Error("B-6 未匹配");
const b6End = s.indexOf("---\n\n## C. 验收与数据模型");
if (b6End < 0) throw new Error("B-6 结束边界未匹配");
s = s.slice(0, b6Start) + frag("b6v3.md").trimEnd() + "\n\n" + s.slice(b6End);

// 7) H 节插到 G 自检之前
const gStart = s.indexOf("## G. 改完自检清单");
if (gStart < 0) throw new Error("G 未匹配");
s = s.slice(0, gStart) + frag("h-section.md").trimEnd() + "\n\n" + s.slice(gStart);

fs.writeFileSync(f, s);
console.log("v3 第一批完成（H 节 + A-5/B-2/B-3/B-5/B-6）");
