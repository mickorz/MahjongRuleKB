---
id: XS-V-RESULT
origin: variant
type: static-ui
name: 小结算界面
change_type: modified
base_rule_ref: HJ-V-RESULT
compares_to: [HJ-V-RESULT]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-F-NET, XS-K-STACK, XS-F-GZ, XS-T-CAP]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "V-RESULT"
---

# 小结算界面

- **挂**：`XS-F-NET`、`XS-K-STACK`、`XS-F-GZ`
- **差异**：修改
- **杭麻**：小结算界面沿用。番型按最终一档显示，无跟庄标签
- **出现条件**：每小局结束，进入小结算。拖底命中时仍先显示小结算（用拖底调整前的实际分），再进大结算（`XS-T-CAP`）。
- **位置**：覆盖在终局牌桌上。跟庄标签在赔付者得分右侧，按本局当过首出赔付者的次数。
- **文案格式**：
  - **标题、四行排列、座位标签、庄徽**：沿用 `HJ-V-RESULT`。庄徽显示本局实际牢数（「庄×N」）。
  - **本局净得分**：用拖底调整前的实际分（`XS-F-NET`），含跟庄和杠分。
  - **跟庄标签**：跟庄 1 次写「跟庄」，2 次及以上写「跟庄×N」，N 为该玩家本局当首出赔付者的实际次数。标签在该玩家得分右侧。
  - **番型文字**（按 `XS-K-STACK`）：
    - 无独立番型时，并列实际参加乘算的番型，例「清一色，豪杠爆」。
    - 豪杠飘、豪飘杠各写一个组合名，并写倍率和组成项，例「豪杠飘×128（三连豪杠，双财飘）」「豪飘杠×128（双财飘，三连豪杠）」。
    - 有独立番型时，只显示 `XS-K-STACK` 选出的那一项。
  - **胡牌方式、胡牌标识、财神牌、主按钮**：沿用 `HJ-V-RESULT`。
- **不出现**：跟庄次数为 0 时，不显示跟庄标签。
- **保持到**：离开小结算。
