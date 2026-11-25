---
id: XS-M-LOUHU
compiled_origin: variant
type: record
name: 漏胡
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-HUPAI-01
  - XS-R-HUPAI-03
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: M-LOU-HU
base_rule_ref: null
change_type: added
compares_to: []
---

# 漏胡

- **差异**：新增
- **键**：座位 + 实际弃牌牌面
- **写入**：对他家弃牌已有合法点炮胡，并且主动点【过】。该次须已满足 `XS-R-HUPAI-01` 和 `XS-R-HUPAI-03`。同一张牌选择【吃】或【碰】不写。本人还未出过牌时也可以写
- **生效**：记录在期间，任一其他座位再打出同牌面，拦截本次点炮胡。其他牌面按当时条件判定。按钮见 `XS-I-LOUHU-ANNIU`
- **清除**：本人常规摸牌完成，或杠后补牌完成，或吃牌、碰牌成立并接回行牌时，清除该座位已写入的全部牌面。吃牌不要求必须是上家，碰牌不要求必须是其他牌面。这与 `XS-M-LOUPENG` 不同
- **小局开始**：清空四家
- **验收**：A 放过 B 的二筒，C 再打二筒 → A 不能点炮。A 碰五万并接回行牌后再遇二筒 → 重新判定
