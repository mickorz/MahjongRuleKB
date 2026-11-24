---
id: XS-M-LOU-PENG
compiled_origin: variant
type: record
name: 漏碰
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: M-LOU-PENG
base_rule_ref: null
change_type: added
compares_to: []
---

# 漏碰

- **差异**：新增
- **键**：座位 + 实际弃牌牌面
- **写入**：该座位当时能碰，并且主动点【过】。更高优先级先成立、本人没有拿到可执行的碰机会时，不写。本人尚未第一次摸牌时也可以写。点【过】以外的选择不写
- **生效**：记录在期间，任一其他座位再打出同牌面，本人不能碰。不同牌面按当时条件判定。按钮见 `XS-I-LOU-PENG`
- **清除**：下列任一发生时，清除该座位已写入的全部牌面，不是只清当前这一张：本人常规摸牌完成；杠后补牌完成；吃上家弃牌成立并接回行牌；碰其他牌面成立并接回行牌。清除后同牌面重新判定
- **小局开始**：清空四家
- **验收**：A 放过二筒后碰五万 → 整座清除，再遇二筒重新判定。A 首摸前放过二筒，首摸前再遇 → 不能碰。首摸后再遇 → 重新判定
