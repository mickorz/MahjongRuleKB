---
id: HJ-I-CHANGAN-CHAKAN
compiled_origin: base
type: interaction
name: 长按查看牌桌
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-UI-CHANGAN-YUZHI
  - HJ-T-XIAOJU-JIESUAN
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 5.2 / 6.1.2 第 11 项
---

# 长按查看牌桌

- **触发**：小结算打开后，在可长按区域（底部栏扣除中央主按钮后的区域）连续按住 500 毫秒。
- **控件**：小结算底部栏 + 右侧手指图标 +「长按查看牌桌」文字。
- **允许**：按住期间仅本端暂时收起小结算和遮罩，按本家视角查看四家终局手牌、副露、牌河、财神指示牌和余牌数。预览只读。
- **禁止**：达到 500 毫秒前松手、滑出可按区域或触发取消则本次长按结束，保持小结算。
- **同次其余操作**：中央主按钮按自身逻辑响应点击，不受长按影响。
- **反馈文案**：无。预览打开后松手、滑出或取消均恢复同一张小结算页。
