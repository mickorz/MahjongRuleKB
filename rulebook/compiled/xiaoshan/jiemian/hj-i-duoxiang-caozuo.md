---
id: HJ-I-DUOXIANG-CAOZUO
compiled_origin: base
type: interaction
name: 同一玩家多项操作
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-I-CAOZUO-ANNIU
  - HJ-R-QIPAI-YOUXIANJI
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: "4.7"
---

# 同一玩家多项操作

- **触发**：同一玩家对同一事件有多项可执行操作。
- **控件**：操作按钮横排 + 选组面板。
- **允许**：
  - 可多杠：补牌后重新判定，仍有多组时先显示【杠】，点击后展开最新候选。
  - 可多吃：多组吃的选组面板。
  - 同一玩家可多项操作（如上家打牌，本家同时可吃、碰、胡）：按本次可选操作显示按钮。能胡时整手保持正常亮度。
- **禁止**：无。
- **同次其余操作**：
  - 点某项开始对应操作，有多组合法组合时先展开候选，选定后才提交。
  - 多组选择面板点【取消】，作用范围与共用【过】一致：放弃本次行牌机会中的全部可选操作，包括同次可自摸的【自摸】。
  - 放弃胡或碰后，另一玩家新打出同牌时按新弃牌重新判定资格。
- **反馈文案**：无。

**四项测试样例**：上家为三牢庄家打五万。下家为闲家，持三万、四万、五万×3、一二三条、七八九筒、东风×2。可吃三四五万、碰五万、直杠五万，也可点炮胡。【胡】左侧显示牌面及 8 倍预览。
