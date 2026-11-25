## H. 第 4 轮评审补充（P0，共 6 项）

> 评审原文第 4 轮要点已逐条核对仓库实测，处理方式如下。按用户要求不再新开评审文档，本节即处理记录。
> 核对依据：主文档 10.2 的 Proposal 状态枚举与 `baseRevision`、10.3 的 Transaction 状态机。

### H-1 Proposal 与 Transaction 状态机必须分层（新，独立项）

| 项 | 内容 |
| --- | --- |
| 问题 | v2 的 B-6 写「复用既有提案状态机（`preparing` / `prepared` / `writing` / …）」，把 Proposal 与 Transaction 混成一套 |
| 实测 | 主文档 10.2：Proposal `status` 为 `draft` / `ready` / `approved` / `applied` / `rejected` / `stale` / `failed`；10.3：Transaction 为 `preparing` / `prepared` / `writing` / `committed` / `rolled_back` / `recovery_failed`，且事务结果回写提案状态（`committed` → `applied`、回滚 → `failed`） |
| 改成 | 新增 **I-50**：文档提案的 `status` 只能取 Proposal 枚举，事务状态只存事务日志，不得写进提案；新增 **AD-39**：文档提案与规则提案共用 Proposal 状态机，应用时进入 Transaction 并回写结果；新增 **AC-54**：提案 `status` 取值受 Schema 约束，不出现 `preparing` / `writing` 等事务状态 |
| 落点 | B-6 已按此重写（见该节「两层状态机」表） |

### H-2 目标文件 Hash 校验改用 `baseRevision.files[]`

| 项 | 内容 |
| --- | --- |
| 问题 | v2 只有 `basedOnDocumentHash`（文档基线 Hash）与 `before.sha256`（修改前内容 Hash），都不是「目标文件当前 Hash」，双校验实际落不实 |
| 改成 | B-6 改为复用主文档 10.2 的 **`baseRevision`**：`{ documentVersion, files: [{ path, sha256 }] }`，多文件逐个记录、应用前逐个校验、任一不匹配即拒绝；AC-53 分别测试「版本冲突」与「文件 Hash 冲突」两种用例 |
| 落点 | B-6 结构示例与字段表 |

### H-3 `identity-map.json` 的权威性矛盾：定主从

| 项 | 内容 |
| --- | --- |
| 问题 | v2 的 B-3 同时说「持久化身份映射」「与 `document.json` 同版本」「不一致时以 `document.json` 为准并重建」—— 若历史 merge/split 关系只在 identity-map 里，按 document.json 重建必然丢历史 |
| 决策 | **采纳方案 B**：`document.json` 为唯一事实源，**完整身份映射与 `segment_lineage` 历史一并存在 `document.json` 中**；`identity-map.json` 只是由它生成的**可重建索引**（与 `provenance.json` 同级），不一致时以 `document.json` 为准重建，不进入人工恢复流程 |
| 理由 | 与 AD-31（`document.json` 唯一事实源）一致；避免出现第二套需要事务同步的权威状态 |
| 落点 | B-3 第 ③ ⑧ 条改写；B-5 五文件表补 `identity-map.json`（标「派生索引」） |

### H-4 目录结构统一（三套口径合并）

| 项 | 内容 |
| --- | --- |
| 问题 | B-4 说三项、B-5 说五项、B-3 又加 `identity-map.json`，三套口径并存 |
| 改成 | **以 B-5 为准，B-4 的三项限制废止**。最终目录：`document.json`、`editorial-overrides.yaml`、`identity-map.json`（派生索引）、`provenance.json`（派生）、`需求全文.md`（渲染产物）、`history/`。**`changes.json` 明确为 P1 才生成**（P0-A 不做差异引擎，不得同时要求完整差异索引） |
| 验收 | `grep -n "document.json、editorial-overrides.yaml、history"`（三项限制）应为 0；`grep -n "changes.json"` 在 P0-A 语境只出现「P1 才生成」 |

### H-5 片段级四类引用：全部必填，可为空数组

| 项 | 内容 |
| --- | --- |
| 问题 | v2 的 B-2 只要求「给第二个片段补 `source_evidence_refs`」，但验收要求「每个 segment 都有四类引用字段」，示例本身不满足 |
| 改成 | 明确每个 `segment` 的 `requirement_refs` / `rule_refs` / `config_refs` / `source_evidence_refs` **字段必填，值可为空数组**；块级四类引用由片段聚合得到（不手填） |
| 验收 | AC-50 改为「`document.json` 中每个 segment 四类字段均存在（允许 `[]`），块级聚合值与片段并集一致」 |

### H-6 补齐 ID 生命周期验收场景 + 三处小修

| 项 | 内容 |
| --- | --- |
| AC-47 | 扩为四场景：① 普通重生成，原 `block_id` / `segment_id` 与人工修改保持对应；② 一片段拆成多个，报告记录 **split** 关系；③ 多个片段合并，报告记录 **merge** 关系；④ 无法确定身份对应，**不迁移 override**，进入失效待处理 |
| A-5 措辞 | 「五种展示标签」→ **「五类来源关系主标签 + 两类状态徽标」**（`lineage` 五类；`decision_status` 与 `diff_status` 为叠加徽标） |
| B-3 验收 | 「6.8 五条齐全」→ **「6.8 八条齐全」**（与 B-3 的八条规则一致） |

---
