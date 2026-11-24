# 快速开始

## 前提条件

- Git 2.30 及以上（克隆仓库）
- 任意 Markdown 阅读器（VS Code、Typora、Obsidian 或 GitHub 网页）
- 无需安装任何运行时依赖（纯文档知识库）

## 安装

```bash
git clone https://github.com/mickorz/MahjongRuleKB.git
cd MahjongRuleKB
```

## 验证

克隆完成后，仓库根目录应能看到：

- `sources/hangzhou/hangzhou-core-flow.md`（基础规则，杭州原始 PRD，只读）
- `sources/xiaoshan/xiaoshan-rules.md`（差异化派生示例，47 张规则卡，只读）
- `dev-docs/design/需求分析.md`（需求分析与修正路线）

## 第一次运行

知识库的「第一次使用」就是按顺序阅读：

1. 先读 `dev-docs/design/需求分析.md`，理解知识库定位与修正后的执行路线。
2. 再读杭州麻将文档，掌握基础规则（判定、时序、算分、界面）。
3. 最后读萧山麻将文档，理解「只记差异」的结构化描述方法（九类分类法）。

## 下一步

- 想新增一个地方玩法（如桐庐麻将）？见 `zh-CN/how-to-guides.md`。
- 想了解未来结构化配置规划？见 `zh-CN/configuration.md`。
