# Getting Started

## Prerequisites

- Git 2.30+ (to clone the repository)
- Any Markdown viewer (VS Code, Typora, Obsidian, or GitHub web)
- No runtime dependencies required (docs-only knowledge base)

## Install

```bash
git clone https://github.com/mickorz/MahjongRuleKB.git
cd MahjongRuleKB
```

## Verify

After cloning, the repository root should contain:

- `rulebook/sources/hangzhou/hangzhou-core-flow.md` (base rules, Hangzhou PRD, read-only)
- `rulebook/sources/xiaoshan/xiaoshan-rules.md` (differential derivative example, 47 rule cards, read-only)
- `dev-docs/design/需求分析.md` (analysis and corrected roadmap)

## First Run

The "first run" of a docs knowledge base is reading in order:

1. Read `dev-docs/design/需求分析.md` to understand the KB positioning and the corrected roadmap.
2. Read the Hangzhou doc to learn the base rules (judging, timing, scoring, UI).
3. Read the Xiaoshan doc to learn the differential description method (nine-category taxonomy).

## Next Steps

- Adding a new regional variant (e.g. Tonglu)? See `how-to-guides.md`.
- Planned structured rule configuration? See `configuration.md`.
