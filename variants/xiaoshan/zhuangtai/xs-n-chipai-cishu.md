---
id: XS-N-CHIPAI-CISHU
origin: variant
type: counter
name: 吃牌次数
change_type: added
compares_to: []
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-R-CHI-JINSHOU]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "N-CHI"
---

# 吃牌次数

- **差异**：修改
- **杭麻**：不累计次数，吃一次就禁
- **键**：座位 + 同一上家
- **初值**：每小局从 0 起
- **加一**：该上家的弃牌被本人吃牌裁决成立时 +1。用加 1 后的次数判定本次出牌
- **重置**：下一小局回到 0。单次禁打的解除不减少这个次数，解除画面见 `XS-I-CHI-JINSHOU`
- **读取**：`XS-R-CHI-JINSHOU`
