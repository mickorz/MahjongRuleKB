---
id: HJ-P-ZIMO-RUZHANG
compiled_origin: base
type: settlement
name: 自摸入账
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-F-YUANYING-PEIFEN
  - HJ-F-ZHUANGXIAN-BEILV
  - HJ-P-CHENGBAO-RUZHANG
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.3
---

# 自摸入账

- **入账时点**：服务端确认自摸后，本局结算时一次性入账。
- **分配顺序**：先按 `HJ-F-YUANYING-PEIFEN` 分别算出三名对手各自的原应赔分，再按 `HJ-P-CHENGBAO-RUZHANG` 处理承包改写。
- **一笔怎么分**：三名对手各算一笔原应赔分。庄家自摸时三笔都 × 8；闲家自摸时庄家那笔 × 8，另两个闲家各 × 1。无承包关系时各人支付自己的原应赔分，赢家收取三笔合计。
- **余额用尽**：无封顶，不截断。
- **展示用哪一份数**：局末飘分显示每人本局净得分，小结算四行显示同一份数。
- **例子**：
  - 庄家平胡自摸，无承包：三个闲家各 −8，庄家 +24。
  - 闲家 2 倍番型自摸，无承包：庄家 −16，两闲家各 −2，赢家 +20。
  - 庄家平胡自摸，庄家 A 对闲家 B 已成立承包：B 赔 24，另两家 0，A +24（见 `HJ-P-CHENGBAO-RUZHANG`）。
