---
id: HJ-T-FAIPAI
origin: base
type: timing
name: 发牌
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-C-FAIPAI-JIEZOU, HJ-C-PAISHU, HJ-R-DINGZHUANG]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: "4.4"
---

# 发牌

- **起点**：掷骰展示后开始发牌。庄标和白板指示牌持续显示。
- **步骤**：
  1. 四人牌组 136 张。以庄家为起点，按逆时针依次从牌序头部给每人同时发 4 张，重复 3 轮，每人先得 12 张。
  2. 再从庄家起按同一顺序给每人发 1 张，四家各有 13 张。
  3. 最后从同一牌序给庄家再发 1 张。发完庄家 14 张，三名闲家各 13 张，共发 53 张，牌墙余 83 张。
  4. 理牌。仅本家手牌播放倒下、理牌、立起；其他三家保持牌背。庄家独立位刷新为服务端单独下发的第 14 张。
  5. 骰盘区域切换为庄家出牌倒计时。庄家可开始操作。
- **中断**：无。
- **结束**：理牌完成，庄家进入首轮行牌。若庄家独立位第 14 张满足 `HJ-R-ZIMO`，立即显示【自摸】【过】。

**余牌数显示**：发牌前显示 136。首批牌背入场时一次更新为 83，发牌翻牌和理牌期间保持 83。
