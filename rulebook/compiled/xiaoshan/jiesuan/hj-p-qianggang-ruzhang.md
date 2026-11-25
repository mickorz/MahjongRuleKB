---
id: HJ-P-QIANGGANG-RUZHANG
compiled_origin: base
type: settlement
name: 抢杠胡入账
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-F-HUPAI-GANGFEN
  - XS-F-ZHUANGXIAN-BEILV
  - HJ-P-CHENGBAO-RUZHANG
  - HJ-R-QIANGGANG
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.3 / 2.3.1.4
---

# 抢杠胡入账

- **入账时点**：服务端确认抢杠胡后，本局结算时一次性入账。
- **分配顺序**：先算原抢杠赔付 R，再叠加承包。
- **一笔怎么分**：抢杠胡先由加杠者支付原抢杠赔付 R。R = 赢家按普通自摸原应收的三笔合计：
  - 庄家抢杠：R = 底分 × 番型倍数 × 8 × 3。平胡时 R = 24。
  - 闲家抢杠：R = 底分 × 番型倍数 × (8 + 1 + 1)。平胡时 R = 10。
  - 赢家参与的各项庄闲承包、倒承包另以同一个 R 为基数，分别按 R、2 × R 叠加。
  - 加杠者若也是该关系的付款方，支付原抢杠赔付 + 该项承包赔付。其他实际付款方按对应关系支付。
- **余额用尽**：无封顶，不截断。
- **展示用哪一份数**：赢家行显示「抢杠胡」，加杠者行显示「点炮」。
- **例子**：
  - 庄家平胡抢闲家的杠，无承包：庄家 +24，加杠闲家 −24。
  - 闲家平胡抢庄家的杠，无承包：闲家 +10，加杠庄家 −10。
  - 庄家平胡抢杠，加杠闲家同时是庄家的倒承包方（闲家吃过庄家 3 次）：加杠闲家付 24 + 24 × 2 = 72。
