# 已归档变更（Archive）

每次变更（Change）通过 Verify 后，其完整包归档到本目录，作为审计留痕入库。

```text
archive/
└── <YYYY-MM-DD>-<change-id>/
    ├── change.json               # 变更事实源（意图、范围、成员 Proposal）
    ├── artifacts/
    │   ├── diff.json
    │   ├── validation-report.json
    │   ├── impact-report.json    # 可选
    │   ├── approval.json
    │   └── verify-report.json
    └── ...（按需保留的评审材料）
```

规则：

1. **只归档已验证的变更**：Verify 未通过不得进入本目录。
2. **归档不再修改事实**：规则、配置与文档的正式写入只由 Transaction 完成；归档只复制材料，不回写任何权威文件。
3. **活动变更不在这里**：进行中的 Change / Proposal / Transaction / 生成中间产物在 `<kb>/.rule-studio/`（运行时数据，不入库）。
4. 归档包必须可追溯到对应 Transaction、Proposal 与最终文档版本。
