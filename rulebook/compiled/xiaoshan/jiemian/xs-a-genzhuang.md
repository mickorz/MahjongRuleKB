---
id: XS-A-GENZHUANG
compiled_origin: variant
type: animation
name: 跟庄
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-T-GENZHUANG-XIAN
  - XS-F-GENZHUANG-PEIFU
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: A-GZ
base_rule_ref: null
change_type: added
compares_to: []
---

# 跟庄

- **挂**：`XS-T-GENZHUANG-XIAN`、`XS-F-GENZHUANG-PEIFU`
- **差异**：新增
- **起播**：`XS-R-RUAN-GEN` 成立
- **位置**：各端牌桌。分数落在四家头像
- **画面**：「跟庄」，重掷两颗骰子，再飘这笔跟庄分
- **顺序**：先播「跟庄」和重掷，再按点数一次性飘分，并刷新四家头像分数
- **结束**：原文未写字和骰子的停留时长，也未写四家飘分是同时还是只飘首出者
- **播完进入**：`XS-T-GENZHUANG-XIAN` 第 4 步，开放原第四张弃牌的响应
