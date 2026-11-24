---
id: HJ-R-ZIMO
compiled_origin: base
type: judgment
name: 自摸
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-K-PINGHU
  - HJ-K-SHIFENG
  - HJ-K-QIDUI
  - HJ-C-YOUCAI-BI-KAO-XIANG
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.1.5
---

# 自摸

- **触发**：本人通过常规摸牌、杠后补牌、或庄家起手第 14 张取得胡牌所需的牌，且在本次出牌前。
- **条件**：
  - 满足本局合法牌型之一：常规胡牌结构（4 组完整面子 + 1 组对子）、七对、爆头结构、或十风独立条件。
  - 已完成的副露和暗杠计入面子，每组杠计 1 组。
  - 本期 `HJ-C-YOUCAI-BI-KAO-XIANG` 关闭：持有财神时仍按本期合法牌型判定，不强制爆头。
  - 庄家起手第 14 张视为本次胡入牌。发牌理牌完成、庄家进入首轮行牌时若已满足，立即显示【自摸】。以其余 13 张为摸牌前结构判定爆头或七客。
  - 十风作为独立自摸条件，满足 `HJ-K-SHIFENG` 的资格和字牌张数时，常规摸牌后可直接自摸，无需验证常规手牌结构。
- **否则**：不能自摸。
- **结果**：
  - 按实际成立的番型查表结算（见 `HJ-K-STACK` 的互斥与优先级）。
  - 杠后补牌自摸、杠后飘财再自摸、先飘财再开杠自摸，统一按 `HJ-K-GANGKAI`、`HJ-K-GANGPIAO`、`HJ-K-PIAOGANG` 的相应分支定番。
- **验收**：
  - 4 组面子 + 1 对子，摸第 14 张成牌：可自摸，平胡。
  - 手持 1 张财神 + 4 组面子，摸任意牌配对：可自摸，爆头。
  - 手持财神但已组成 4 面子 + 1 对子：可自摸，平胡（本期不强制爆头）。
  - 庄家起手 14 张即成牌：立即显示【自摸】，按对应番型结算。
