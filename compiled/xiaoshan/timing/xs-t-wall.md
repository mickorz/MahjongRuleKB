---
id: XS-T-WALL
compiled_origin: variant
type: timing
name: 最后一张到流局
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-WALL
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: T-WALL
base_rule_ref: HJ-T-WALL
change_type: modified
compares_to:
  - HJ-T-WALL
---

# 最后一张到流局

- **差异**：修改
- **杭麻**：剩 21 张时允许摸最后 1 张到 20，处理完后在下一次应摸牌时流局。剩 21 张禁杠。留底 20 张
- **起点**：常规摸牌或杠后补牌取走最后一张（可摸牌数变为 0）。
- **步骤**：
  1. 先处理本人自摸。
  2. 未胡则完成出牌。
  3. 按 `XS-T-GZ` 判断跟庄（若这是本圈第四张）。
  4. 裁决该弃牌的吃、碰等合法响应。
  5. 吃或碰成立时，由取得行牌权的玩家完成出牌及后续弃牌响应（此时无牌可摸，出牌后同样判流局）。
- **中断**：取走最后一张本身不流局。若有人胡牌，按胡牌流程结算。
- **结束**：下一次需要常规摸牌，且可摸牌数为 0，才流局。无留底。

**与杭州的差异**：杭州留底 20 张，剩 21 时禁杠；萧山用完全部牌，余 1 时仍可杠补走，余 0 才无杠选项。
