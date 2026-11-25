---
id: HJ-K-PINGHU
compiled_origin: base
type: lookup
name: 平胡
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 1 项
---

# 平胡

- **取档键**：胡牌结构。四组完整面子加一组对子。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 平胡 | 1 倍 | 4 组完整面子 + 1 组对子。吃、碰、直杠、加杠、暗杠形成的完整面子均参与，每组杠计 1 个面子。财神可参与组成面子或对子 |

- **表里没有的档**：无。
- **多档同时**：先验证牌型，再验证该次自摸、点炮胡或抢杠胡资格。与其他番型同时成立时按 `XS-K-FANXING` 互斥与优先级处理。例：自摸后一万到七万各两张，同时满足平胡 1 倍和清七对 4 倍，按清七对结算。
