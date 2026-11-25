---
id: HJ-F-YUANYING-PEIFEN
compiled_origin: base
type: formula
name: 每笔原应赔分
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-DIFEN
  - HJ-F-ZHUANGXIAN-BEILV
  - HJ-K-FANXING-HUCHI
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.3 / 2.3.2.10
---

# 每笔原应赔分

- **输入**：底分、胡牌番型倍数、该笔适用的庄闲倍数。
- **公式**：原应赔分 = 底分 × 胡牌番型倍数 × 该笔的庄闲倍数。先按本局实际胡牌番型确定倍数（见 `HJ-K-FANXING-HUCHI`），再逐一判断赢家和各赔付者的身份（见 `HJ-F-ZHUANGXIAN-BEILV`）。
- **不计入**：承包改写、杠分、拖底等后续处理不在此公式内，见对应入账分配卡。
- **例子**：
  - 番型 2 倍、庄闲倍数 8 倍：这笔原应赔 1 × 2 × 8 = 16 分。
  - 闲家 2 倍番型自摸：庄家付 1 × 2 × 8 = 16，两名闲家各付 1 × 2 × 1 = 2。
  - 本期无封顶。
