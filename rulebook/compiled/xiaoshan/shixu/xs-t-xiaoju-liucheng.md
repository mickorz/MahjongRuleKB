---
id: XS-T-XIAOJU-LIUCHENG
compiled_origin: variant
type: timing
name: 一小局流程
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-DINGZHUANG
  - XS-R-ZHUANGJIA-02
  - XS-T-DINGLAO-ZHISAI
  - XS-R-MOPAI-GANGBU
  - XS-R-HUPAI-01
  - XS-T-ZUIHOU-LIUJU
  - XS-P-JUZHONG-JUMO
  - HJ-A-JUMO-PIAOFEN
  - XS-V-XIAO-JIESUAN
  - XS-R-TUODI
  - XS-T-JIESUAN-HUAMIAN
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: T-ROUND
base_rule_ref: HJ-T-XIAOJU-LIUCHENG
change_type: modified
compares_to:
  - HJ-T-XIAOJU-LIUCHENG
---

# 一小局流程

- **差异**：修改
- **杭麻**：无加庄、无跟庄、无拖底。打满 8 局结束
- **起点**：本小局开始。首局由房主在四人准备后点【开始游戏】；后续小局四人准备后自动开始。
- **步骤**：
  1. 首局播放「对局开始」动画（仅首局）。后续小局直接进入掷骰。
  2. 定庄。首局走 `HJ-R-DINGZHUANG`（随机），后续走 `XS-R-ZHUANGJIA-02`（连庄 / 换庄）。确定庄家和掷骰前牢数。
  3. `XS-T-DINGLAO-ZHISAI` 定牢之后才掷骰。掷骰展示后按 `XS-R-ZHUANGJIA-04` 定格本局实际牢数。庄标显示实际牢数，加庄时播 `XS-A-JIAZHUANG`。
  4. 发牌、行牌。发牌沿用杭麻（`HJ-T-FAIPAI`：136 → 83）。行牌中每张弃牌按 `XS-T-GENZHUANG-XIAN` 先判跟庄再开放响应。
  5. 自摸、`XS-R-HUPAI-01` 点炮或 `XS-T-ZUIHOU-LIUJU` 流局。流局判定改为「可摸牌数为 0 时」而非「留底 20 张」。
  6. `XS-P-JUZHONG-JUMO` 完成入账。跟庄分已在局中入账，此处只加胡牌分和杠分。
  7. `HJ-A-JUMO-PIAOFEN` 局末飘分、`XS-V-XIAO-JIESUAN` 小结算。
  8. `XS-R-TUODI` 判断拖底。命中则按 `XS-T-JIESUAN-HUAMIAN` 进入大结算。
- **中断**：无局中提前结束。跟庄或胡牌使累计分低于 −200 时，本小局打完再判拖底。
- **结束**：拖底则进入大结算。未拖底且未满 8 局则回到步骤 1。满 8 局结束本场。
