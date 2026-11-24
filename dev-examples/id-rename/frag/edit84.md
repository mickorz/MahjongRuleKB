### 8.4 三个修改通道统一走提案与版本校验

三个通道（规则 / 表达 / 结构）都必须**人工确认**，AI 不得直接写文件（I-35）：

| 通道 | 目标 | 提案形态 | 冲突校验 |
| --- | --- | --- | --- |
| 规则 | 规则卡 / 配置 | 复用主需求文档 10.2 的提案结构（`before`、`path`、Hash） | 复核目标文件 Hash（既有机制） |
| 表达 | `editorial-overrides.yaml` | 文档提案 `DOC-P-###` | 复核 `based_on_document_version` |
| 结构 | 章节映射层 | 文档提案 `DOC-P-###` | 复核 `based_on_document_version` |

**版本冲突必须拒绝应用**：用户打开 V3 发起修改，AI 生成提案期间文档已到 V4 —— 应用前校验

```text
proposal.based_on_document_version == current.document_version
```

不一致时拒绝，并提示重新审核或重新生成提案（I-36）。事务纪律复刻主需求文档 10.3：先取写入锁、再校验版本与 Hash、写入前逐文件复查。

### 8.5 段落与规则卡是多对多（原 8.3）
