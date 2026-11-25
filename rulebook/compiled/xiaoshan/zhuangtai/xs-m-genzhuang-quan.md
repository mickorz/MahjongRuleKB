---
id: XS-M-GENZHUANG-QUAN
compiled_origin: variant
type: record
name: 跟庄圈
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-RUAN-GEN
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: M-GZ
base_rule_ref: null
change_type: added
compares_to: []
---

# 跟庄圈

- **差异**：新增
- **键**：当前圈已收集的弃牌。每张记座位和实际牌面
- **写入**：按行牌方向，一个座位成功打出一张时追加
- **生效**：未满四张不判定。满四张后按 `XS-R-RUAN-GEN` 判定一次
- **清除**：判定结束即清空。第四张未出前吃、碰、直杠、补杠或暗杠成立时，作废已有记录
- **小局开始**：从庄家第一张实际打出的牌起第一圈
