// 修订清单 v2 第二批：B-5 / B-6 / C-4 / D-5 / E 编号 / G 自检（2026-11-24）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-需求全文生成v1.3修订清单.md";
let s = fs.readFileSync(f, "utf8");
const rep = (from, to) => {
  if (!s.includes(from)) throw new Error(`未匹配：${from.slice(0, 50)}`);
  s = s.split(from).join(to);
};

// ── B-5 / B-6 插到 B-4 之后（C 组之前）──
rep(
  "---\n\n## C. 验收与数据模型（P0，共 3 项）",
  `### B-5 目录角色与五文件主从

| 项 | 内容 |
| --- | --- |
| 位置 | 五、产物目录；十二、数据产物表；六、6.3；十五（扩展 AD-36） |
| 问题 | B-4 只说 \`documents/<variant>/\` 保留三项，但 v1.2 目录里还有 \`需求全文.md\`、\`provenance.json\`、\`changes.json\`；不能一边只说三项、一边要求维护派生文件 |
| 改成 | ① 明确五个文件角色（下表）；② **派生文件保留在 \`documents/<variant>/\`**（可重建、便于查看），\`.rule-studio/workflow/<taskId>/\` 只放 Stage 中间产物（effective-ruleset、outline、sections、validation-report）；③ 扩展 **AD-36** 为「五文件角色与主从」，写明「`editorial-overrides.yaml` 是人工表达修改的**权威输入**，不是派生数据，不得被重建覆盖」 |
| 验收 | 十二表五文件各自标注角色；\`grep -n "权威输入"\` 命中；\`grep -n "workflow/<taskId>"\` 命中且不包含 \`需求全文.md\` |

| 文件 | 角色 | 可否重建 |
| --- | --- | --- |
| \`document.json\` | **生成内容与结构的事实源** | 否（只能由 Stage 3-4 或提案流程写） |
| \`editorial-overrides.yaml\` | **人工表达修改的事实源（权威输入）** | 否（人工产物，禁止被重建覆盖） |
| \`provenance.json\` | 派生索引 | 可，由 \`document.json\` 重建 |
| \`changes.json\` | 派生差异索引 | 可，由 \`document.json\` 的 \`diff_status\` + 差异片段重建 |
| \`需求全文.md\` | 渲染产物 | 可，由 \`document.json\` + override 渲染 |

### B-6 文档提案数据契约

| 项 | 内容 |
| --- | --- |
| 位置 | 五（产物目录）；十二；十五（新增 AD-38）；十四（新增 FR-58）；十六（新增 AC-53）；主需求文档 10.2 同步 |
| 问题 | B-4 只规定「统一到 \`.rule-studio/proposals/\`，新增 \`type: document\`」。主文档 10.2 的提案结构服务于规则卡 / 配置 / manifest，文档提案的字段与校验没定义，实际会变成两套实现 |
| 改成 | 定义文档提案契约（下列字段），并明确**双校验**：既校验 \`basedOnDocumentVersion\`，也校验目标文件 Hash；复用既有提案状态机（\`preparing/prepared/writing/committed/rolled_back/recovery_failed\`）、审计与事务回滚 |
| 验收 | 契约字段齐全；AC-53 通过；主文档 10.2 出现文档提案小节 |

文档提案结构（示意，字段名以主文档 10.2 的既有风格为准，snake_case 与 camelCase 择一并全篇统一）：

```json
{
  "id": "DOC-P-001",
  "type": "document",
  "rulesetId": "xiaoshan-friends-4p",
  "targetVariant": "xiaoshan",
  "basedOnDocumentVersion": 3,
  "basedOnDocumentHash": "sha256:…",
  "target": {
    "blockId": "DOC-XS-000123",
    "segmentId": "SEG-000456",
    "file": "documents/xiaoshan/editorial-overrides.yaml"
  },
  "op": "append | replace-text | hide | move-block | edit-outline",
  "before": { "text": "…", "sha256": "…" },
  "after": { "text": "…", "sha256": "…" },
  "status": "prepared"
}
```

| 必填字段 | 作用 | 校验 |
| --- | --- | --- |
| \`type: document\` | 与规则提案区分 | 提案加载时校验 |
| \`targetVariant\` | 目标变体 | 必须存在于规则集注册表 |
| \`basedOnDocumentVersion\` | 文档版本基线 | 应用前与当前 `document_version` 比对（I-36） |
| \`basedOnDocumentHash\` | 文档基线 Hash | 应用前重算比对 |
| \`target.blockId\` / \`target.segmentId\` | 精确定位 | 块/片段必须存在 |
| \`target.file\` | 落盘目标 | 必须在白名单内（I-44） |
| \`before\` / \`after\` | 修改前后内容与各自 sha256 | 写入前逐文件复查 |

---

## C. 验收与数据模型（P0，共 4 项）`,
);

// ── C-4 插到 C-3 之后（D 组之前）──
rep(
  "---\n\n## D. 设计补充（P1，共 4 项）",
  `### C-4 六态与全文落点建立映射，并拆分两个指标

| 项 | 内容 |
| --- | --- |
| 位置 | 十六 AC-24；十四（新增 FR-57）；六（新增 I-48）；十六（新增 AC-52） |
| 问题 | C-2 只写「正文 / 待裁决 / 明确排除 / 未决项」，会让**部分覆盖与提取缺失仅凭「有记录」就通过完整性验收** |
| 改成 | ① AC-24 改为按六态给落点（下表）；② 明确**两个指标分开统计**：\`requirement_landed\`（有落点）与 \`requirement_complete\`（已完整覆盖），验收要求前者 100%，后者如实报告差异数；③ 新增 **I-48**：不得用「登记到待处理清单」代替覆盖；④ 新增 **FR-57**：覆盖报告分别输出两个指标；⑤ 新增 **AC-52**：报告里部分覆盖 / 提取缺失的数量与上游覆盖结果一致，不能被计入「已完整覆盖」 |
| 验收 | AC-24 出现六态逐项落点；\`grep -n "requirement_complete"\` 命中；报告中两个指标并列 |

| 覆盖状态 | 全文落点 | 是否计入「已完整覆盖」 |
| --- | --- | --- |
| 已覆盖 | 正文规则表达 | 是 |
| 部分覆盖 | 正文 + 缺失细节记录 + 补齐任务 | 否 |
| 提取缺失 | 补齐任务（不得假装已有规则） | 否 |
| 原文缺失 | 未决项 | 否 |
| 原文冲突 | 待裁决清单 | 否 |
| 明确排除 | 明确排除清单 + 依据 | 否（但有落点） |

---

## D. 设计补充（P1，共 5 项）`,
);

// ── D-4 行补 P0-A 的 diff_status 口径 + 新增 D-5 ──
rep(
  "| D-4 | 十一、实施优先级 | P0-A 行补「本期**不验证**变体差异：`lineage` 只有 `base`，差异引擎与 `changes.json` 内容留到 P1」；P1 行补「正式验证继承 / 修改 / 新增与文字级差异」 | P0-A 与 P1 的验证范围互不重叠，P0-A 明确排除差异 |",
  [
    "| D-4 | 十一、实施优先级 | P0-A 行补「本期**不验证**变体差异：`lineage` 只有 `base`，`diff_status` 取 **`not_applicable`**（不允许为 `candidate`），差异引擎与 `changes.json` 内容留到 P1」；P1 行补「正式验证继承 / 修改 / 新增与文字级差异」 | P0-A 与 P1 的验证范围互不重叠，P0-A 明确排除差异 |",
    "| D-5 | 十六 AC-48；六 6.4 字段表 | `diff_status` 取值增加 **`not_applicable`**（基座文档缺省值）；AC-48 改为「P0-A 产物中 `lineage` 全为 `base`，且 `diff_status` 全为 `not_applicable`」 | `grep -n \"not_applicable\"` 在 6.4 与 AC-48 均命中；`diff_status` 不得为 `candidate` |",
  ].join("\n"),
);

fs.writeFileSync(f, s);
console.log("B-5 / B-6 / C-4 / D-5 已补齐（v2 第二批）");
