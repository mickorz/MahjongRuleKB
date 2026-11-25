---
id: HJ-V-FANGWEIPAN
compiled_origin: base
type: static-ui
name: 方位盘与倒计时
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-T-XIAOJU-LIUCHENG
  - HJ-T-XINGPAI
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 3.2.1
---

# 方位盘与倒计时

- **出现条件**：进入开局过场后显示方位盘底座。分配风位后四侧显示风位字。
- **位置**：桌面中央。
- **文案格式**：
  - 风位：每小局庄家为东，从庄家起逆时针依次为东、南、西、北。每个玩家界面以自己为下、上家为左、对家为上、下家为右。
  - 操作指示：当前可操作玩家对应边循环闪烁高亮。底边红、左边绿、顶边蓝、右边黄，按当前屏幕位置分配。每个视角同一时刻最多高亮一边。
  - 弃牌响应：本家有响应按钮时临时亮底边红色。无按钮的视角仍亮原出牌者对应边。
  - 倒计时：中央两位数字显示剩余秒数。出牌阶段和响应阶段分别 10 秒。普通数字蓝青色，03、02、01、00 为黄色。归零后保持 00 继续等待。
- **不出现**：房间准备阶段沿用准备界面，不显示方位盘。
- **保持到**：小局结束。收到小局结束结果时结束倒计时及方向高亮。
