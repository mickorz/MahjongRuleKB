---
id: XS-R-HUPAI-01
origin: variant
type: judgment
name: 庄闲放铳
change_type: modified
base_rule_ref: HJ-R-ZHUANGXIAN-FANGCHONG
compares_to: [HJ-R-ZHUANGXIAN-FANGCHONG]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-R-ZHUANGJIA-04, XS-R-HUPAI-03]
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: "R-HU-01"
---

# 庄闲放铳

- **差异**：修改
- **杭麻**：当局固定三牢，庄闲之间可以点炮
- **触发**：有玩家打出弃牌
- **条件**：
  - `XS-R-ZHUANGJIA-04` 定格的本局实际牢数 ≥ 3（杭州固定三牢，萧山二牢起，二牢局不开放点炮）。
  - 出牌者与胡牌者一方是庄家、另一方为闲家。
  - 弃牌不是财神。牌型及其他胡牌条件均满足。
  - 给出按钮前还要过 `XS-R-HUPAI-03`（有财 2 番起胡）。
- **否则**：不提供点炮胡。实际牢数为 2 时庄闲之间也不能点炮。
- **结果**：庄家出牌时，符合条件的闲家可胡。闲家出牌时，只有庄家可胡。多人可胡时沿用杭麻裁决（`HJ-R-QIPAI-YOUXIANJI`，逆时针就近，最多一人）。
- **验收**：实际牢数为 2 → 不能点炮。实际牢数 ≥ 3 且闲家打出 → 只有庄家可点炮
