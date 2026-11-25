---
id: HJ-N-ZHUANGJIA-LAOSHU
origin: base
type: counter
name: 庄家牢数
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-C-ZHUANGJIA-LAOSHU, HJ-C-ZHUANGJIA-BEILV]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.2 名词「牢庄」
---

# 庄家牢数

- **键**：本小局的庄家牢数（连庄档位）。
- **初值**：每小局定庄后为 3（笃三老庄固定）。
- **加一**：无。本期固定三牢，不递增。
- **重置**：每小局按 `HJ-R-DINGZHUANG` / `HJ-R-LUNZHUANG` 重新确定为 3。本小局内不再改变。
- **读取**：`HJ-R-ZHUANGXIAN-FANGCHONG`（庄闲放铳要求三牢）、`HJ-R-QIANGGANG`（抢杠胡要求三牢）、`HJ-F-ZHUANGXIAN-BEILV`（庄闲倍率 = 8）、界面庄标显示「庄×3」。
