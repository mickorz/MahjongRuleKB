---
id: HJ-P-DIANPAO-RUZHANG
compiled_origin: base
type: settlement
name: 点炮胡入账
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-F-HUPAI-GANGFEN
  - XS-F-ZHUANGXIAN-BEILV
  - HJ-P-CHENGBAO-RUZHANG
  - HJ-R-FANGCHONG
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.3
---

# 点炮胡入账

- **入账时点**：服务端确认点炮胡后，本局结算时一次性入账。
- **分配顺序**：先算原点炮分 P，再判断承包改写。
- **一笔怎么分**：点炮胡只由放铳者支付一笔原点炮分 P = 底分 × 番型倍数 × 庄闲倍数。另两家这笔胡牌分得失为 0。
  - 仅当该放铳者本人是赢家的承包或倒承包对方时，分别以 P 或 2 × P 整体改写该笔，不再叠加原 P。
  - 其他玩家与赢家的承包关系不参与。未命中则保留 P。
- **余额用尽**：无封顶，不截断。
- **展示用哪一份数**：小结算放铳者行显示「点炮」，赢家行显示「点炮胡」。
- **例子**：
  - 1 倍平胡庄闲点炮：赢家 +8，放铳者 −8，另两家 0。
  - 放铳者是赢家的承包方（放铳者曾吃赢家 3 次，赢家 → 放铳者承包成立）：赢家 +8，放铳者 −8（1 倍 P，和原点炮分相同）。
  - 放铳者是赢家的倒承包方（赢家曾吃放铳者 3 次，放铳者 → 赢家承包成立）：赢家 +16，放铳者 −16（2 倍 P）。
