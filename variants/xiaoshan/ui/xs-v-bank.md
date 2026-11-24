---
id: XS-V-BANK
origin: variant
type: static-ui
name: 庄家牢数标签
change_type: modified
base_rule_ref: HJ-V-AVATAR
compares_to: [HJ-V-AVATAR]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-N-BANK, XS-R-BANK-04, XS-A-BANK]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "V-BANK"
---

# 庄家牢数标签

- **挂**：`XS-N-BANK`
- **差异**：修改
- **杭麻**：每小局固定显示「庄×3」
- **出现条件**：本小局庄家和掷骰前牢数已确定，掷骰动画开始时。
- **位置**：当前庄家头像角上。蓝底白字。庄家头像位于画面右侧时标签贴左上角，其余贴右上角。各端按相对座位定位同一名庄家。
- **文案格式**：「庄×N」，N 为本局当前牢数。掷骰前显示掷骰前牢数（新庄「庄×2」）。`XS-R-BANK-04` 定格后改为本局实际牢数，与 `XS-A-BANK`「加庄」字效同步更新。
- **不出现**：无。
- **保持到**：本小局结束。掷骰、定财神、发牌、行牌期间持续显示。换庄时切换至新庄家头像，连庄时在同一头像旁更新样式。

**头像区其余部分**（头像、积分、昵称、房主标记、操作流光、离线状态）沿用 `HJ-V-AVATAR`。
