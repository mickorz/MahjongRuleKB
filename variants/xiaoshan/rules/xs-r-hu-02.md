---
id: XS-R-HU-02
origin: variant
type: judgment
name: 补杠（加杠）
change_type: modified
base_rule_ref: HJ-R-GANG-ADD
compares_to: [HJ-R-GANG-ADD]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-R-WALL, XS-R-PIAO]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "R-HU-02"
---

# 补杠（加杠）

- **差异**：修改
- **杭麻**：补杠先等抢杠胡响应。有人胡则不完成加杠、不补牌
- **触发**：本人出牌阶段。
- **条件**：
  - 碰杠区已有本家碰出的刻子。
  - 手中有第 4 张相同牌面的非财神牌。
  - 吃或碰成功的当前回合也允许加杠。
  - 本家未受尚未解除的飘财限制（`XS-R-PIAO`）。
  - 余牌满足 `XS-R-WALL`。
- **否则**：不能加杠。
- **结果**：
  - **无抢杠分支**。直接完成加杠，从手牌移出 1 张补入已有的碰牌组。其他玩家不进入抢杠胡响应。
  - 再按 `XS-R-WALL` 从牌墙尾补 1 张。
- **验收**：
  - 碰过一万后摸到第 4 张一万，出牌阶段：可加杠，其他玩家不出现【胡】。
  - 受飘财限制时：不可加杠。
  - 余 0 张时：不可加杠（`XS-R-WALL`）。
