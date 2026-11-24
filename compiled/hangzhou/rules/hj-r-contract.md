---
id: HJ-R-CONTRACT
compiled_origin: base
type: judgment
name: 三摊承包成立
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-CONTRACT
  - HJ-C-PENG-COUNTS-TAN
  - HJ-N-TAN
  - HJ-R-CHI
  - HJ-R-PIAO
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.2.8
---

# 三摊承包成立

- **触发**：玩家 A 成功吃取玩家 B 的弃牌。
- **条件**：
  - `HJ-C-CONTRACT` 启用（本期启用）。
  - 只有庄家与闲家之间能成立承包关系。
  - 按取牌方向（取牌玩家 → 供牌玩家）累计有效摊数达到 3。A 对 B 的摊数与 B 对 A 的摊数互相独立。
  - 不因 B 正受 A 发起的飘财摸打限制而免计。即使供牌者正受限制，本次吃牌也正常计摊，不延后到第 4 次。
- **否则**：
  - 碰、直杠、加杠、暗杠均不增加摊数（`HJ-C-PENG-COUNTS-TAN` 关闭）。
  - 两名闲家之间按取牌方向最多累计 2 摊，不成立承包。闲家 A 已对闲家 B 累计 2 摊时，B 再打牌，A 不可吃该牌，客户端不显示该牌的【吃】入口。
- **结果**：
  - 第 3 个有效摊立即成立承包关系 A → B。
  - 成立时四端在桌面中央方位盘下方显示金色「三摊落地」。
  - 承包关系的赔付效果见 `HJ-P-CONTRACT`。
  - 下一小局摊数重新累计。
- **验收**：
  - 庄家 A 吃闲家 B 的牌 3 次：A → B 承包成立。
  - 闲家 A 吃闲家 B 的牌 2 次：第 3 次不显示【吃】入口，A 不可吃。
  - B 受 A 的飘财限制被迫打牌、A 吃到：正常计摊。
  - A 碰 B 的牌 3 次：不成立承包。
