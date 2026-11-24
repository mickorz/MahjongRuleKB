---
id: HJ-M-PIAO
compiled_origin: base
type: record
name: 飘财摸打限制记录
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-PIAO
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.2 名词「飘」
---

# 飘财摸打限制记录

- **键**：发起者座位。每名发起者一条，作用于另外三家。
- **写入**：该玩家合法打出财神时，写入一条「发起者 → 另外三家」的限制记录。
- **生效**：被限制的玩家按 `HJ-R-PIAO` 行牌。一名发起者解除后，其他发起者的记录继续生效。
- **清除**：该发起者常规摸牌，或吃、碰、杠成立并接回行牌时，只清除这一名发起者对其他三家的限制。
- **小局开始**：清空全部记录。
