---
id: HJ-R-GANG-ADD
origin: base
type: judgment
name: 加杠
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-R-GANG-LOGIC, HJ-R-GANG-QIANG, HJ-R-PIAO]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.1.4"
---

# 加杠（补杠）

- **触发**：本人出牌阶段。
- **条件**：
  - 碰杠区已有本家碰出的刻子。
  - 手中有第 4 张相同牌面的非财神牌。
  - 吃或碰成功的当前回合也允许加杠。
  - 本家未受尚未解除的飘财限制。
  - 余牌满足 `HJ-R-GANG-LOGIC`。
- **否则**：不能加杠。
- **结果**：
  - 先处理其他玩家的抢杠胡响应（见 `HJ-R-GANG-QIANG`）。
  - 有人抢杠胡时：不完成加杠，也不补牌。
  - 无人胡牌后：完成加杠，从手牌移出 1 张补入已有的碰牌组，再按 `HJ-R-GANG-LOGIC` 补牌。
- **验收**：
  - 碰过一万后摸到第 4 张一万，出牌阶段：可加杠。
  - 加杠时三牢局内庄闲之间有人可用这张一万胡牌：先等抢杠响应，无人胡才完成加杠。
  - 受飘财限制时：不可加杠。
