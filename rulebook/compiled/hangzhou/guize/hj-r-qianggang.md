---
id: HJ-R-QIANGGANG
compiled_origin: base
type: judgment
name: 抢杠胡
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-JIAGANG
  - HJ-C-QIANGGANGHU
  - HJ-C-ZHUANGXIAN-FANGCHONG
  - HJ-R-FANGCHONG
  - HJ-P-QIANGGANG-RUZHANG
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.1.4
---

# 抢杠胡

- **触发**：其他玩家宣告加杠。
- **条件**：
  - `HJ-C-QIANGGANGHU` 启用（本期启用）。
  - 本期为三牢局。只有三牢局内的庄家与闲家之间可以抢杠胡。
  - 被加杠的第 4 张牌能使响应者合法胡牌（牌型满足且胡牌资格有效）。
- **否则**：不提供抢杠胡响应，加杠直接完成。
- **结果**：
  - 多人可胡时按已确认的逆时针就近顺序处理，只允许一人胡。
  - 原赔付由被抢杠的加杠者支付，金额为胡牌者按普通自摸原应向三家收取的合计 R。底分 1、三牢、平胡时，庄家抢杠原赔付为 24 分，闲家抢杠原赔付为 10 分。
  - 胡牌者参与的庄闲承包、倒承包按 `HJ-P-CHENGBAO-RUZHANG` 另行叠加，原抢杠赔付不被替换。
  - 加杠者同时承担承包或倒承包时，两笔均须支付。
  - 加杠不完成，不补牌。
- **验收**：
  - 三牢局，闲家加杠一万，庄家听一万：庄家可抢杠胡，原赔付 10 分。
  - 三牢局，庄家加杠一万，闲家听一万：闲家可抢杠胡，原赔付 24 分。
  - 二人局或非三牢局（本期不出现）：不可抢杠胡。
  - 加杠的牌不能让任何庄闲一方成牌：加杠直接完成。
