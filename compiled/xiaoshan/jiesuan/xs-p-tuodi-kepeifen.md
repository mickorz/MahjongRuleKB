---
id: XS-P-TUODI-KEPEIFEN
compiled_origin: variant
type: settlement
name: 拖底后的可赔分
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-TUODI
  - XS-C-TUODI-EDU
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: P-CAP
base_rule_ref: null
change_type: added
compares_to: []
---

# 拖底后的可赔分

- **差异**：新增
- **入账时点**：只在 `XS-R-TUODI` 命中后的大结算里改写。局中和局末仍按 `XS-P-JUZHONG-JUMO` 全额入账
- **分配顺序**：同一玩家本小局有多笔扣分时，按发生顺序从早到晚。每笔分配额 = min(该笔原应付, 剩余可赔)，然后扣减余额
- **一笔怎么分**：只有一名赢家时，这笔分配额全给该赢家。一笔跟庄由三家收时，分配额先除以 3 向下取整，三家各得该整数。余下 1 或 2 分，从扣分座位起按逆时针，遇到的收分玩家依次 +1
- **余额用尽**：后续各笔分配 0。该玩家最终净分 = −200
- **展示用哪一份数**：局末飘分和小结算用分配前的实际分。大结算用分配后的实赔和最终净分
- **例子**：

| 局前 | 发生顺序 | 可赔 | 分配 | 最终净分 |
| --- | --- | --- | --- | --- |
| −190 | 只跟庄，向 B、C、D 各应付 8。局末仍 −214 | 10 | 逆时针先遇 B：B 4，C 3，D 3 | −200 |
| −190 | 先跟庄应付 24，再点炮应付 30。局末正常入账 −244 | 10 | 10 分先给跟庄，分法同上。点炮赢家收 0 | −200 |
| — | 点炮原应付 30，分配后这笔实赔为 0 | — | 局末桌面仍是 −30 / +30。小结算仍计入 30。大结算这笔按 0 | — |
