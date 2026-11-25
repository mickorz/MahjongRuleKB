---
id: XS-R-RUAN-GEN
compiled_origin: variant
type: judgment
name: 软跟是否成立
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-M-GENZHUANG-QUAN
  - XS-F-GENZHUANG-PEIFU
  - XS-T-GENZHUANG-XIAN
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: R-GZ
base_rule_ref: null
change_type: added
compares_to: []
---

# 软跟是否成立

- **差异**：新增
- **杭麻**：无跟庄
- **触发**：`XS-M-GENZHUANG-QUAN` 收满四个不同座位、按行牌方向各成功打出的一张牌。第一个圈从庄家首张实际打出的牌开始
- **条件**：第 2、3 张的实际牌面等于第 1 张。第 4 张牌面相同，或第 4 张是本局实际财神。前三张只比实际牌面，不用财神做替身
- **否则**：不成立，不赔付
- **结果**：四张打齐只判断这一次。成立或不成立都结束本圈。下一张实际弃牌另起一圈，旧牌不参与下一次比较。同一小局可多次成立。赔付见 `XS-F-GENZHUANG-PEIFU`，顺序见 `XS-T-GENZHUANG-XIAN`
- **验收**：

| 第 1–3 张 | 第 4 张 | 结果 |
| --- | --- | --- |
| 都是二筒 | 二筒或本局财神 | 成立 |
| 第 2 或第 3 张不同 | 任意 | 不成立 |
| A 打牌，B 的牌被 D 碰 | — | 本圈作废。下一圈从 D 碰后打出的牌起算 |
