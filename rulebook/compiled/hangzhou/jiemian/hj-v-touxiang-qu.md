---
id: HJ-V-TOUXIANG-QU
compiled_origin: base
type: static-ui
name: 玩家头像区
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-N-ZHUANGJIA-LAOSHU
  - HJ-P-HUANGZHUANG
  - HJ-C-UI-JIFEN-WANWEI
  - HJ-C-UI-NICHENG-ZISHU
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 3.2.3
---

# 玩家头像区

- **出现条件**：开局后常驻。
- **位置**：本家头像在桌面左下方。其他三家按相对座位显示在左侧、上方、右侧。
- **文案格式**：
  - 头像下方依次显示当前积分、昵称。本期头像不可点击。
  - **庄家标签**：当前庄家头像角上蓝底白字「庄×N」。三牢显示「庄×3」。头像在画面右侧时标签镜像到左上角。
  - **房主标记**：房主头像下角橙色「房」字。与庄标各用各的角位。
  - **积分**：五位以内显示完整整数，达到六位换算成「万」保留 3 位小数。负分保留负号。
  - **昵称**：中文每字 2 个显示字符，英文数字符号各 1 个。超过 10 个从末尾截断加「..」。
  - **操作状态**：当前操作者头像外沿播放金色流光。
  - **离线状态**：离线玩家头像上显示深色覆盖层、白色断链图标、黄色「分:秒」离线时长。
  - 本期无托管，不显示「托管中」。
- **不出现**：等待阶段显示准备信息而非头像区。
- **保持到**：本场结束。
