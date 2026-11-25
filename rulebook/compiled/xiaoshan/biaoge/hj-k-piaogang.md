---
id: HJ-K-PIAOGANG
compiled_origin: base
type: lookup
name: 飘杠
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-N-LIANXU-PIAOCAI
  - XS-K-LIANGANG
  - HJ-K-GANGPIAO
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 34 项 / 2.3.4.2 番型互斥
---

# 飘杠

- **取档键**：这段新连杠次数（行）× 开杠前的连续飘财次数（列）。
- **表**：查 `HJ-K-GANGPIAO` 的同档倍数表（8–256 倍）。

| 连续杠数 | 飘 1 次 | 飘 2 次 | 飘 3 次 |
| --- | --- | --- | --- |
| 1 杠 | 8 倍 | 16 倍 | 32 倍 |
| 2 杠 | 16 倍 | 32 倍 | 64 倍 |
| 3 杠 | 32 倍 | 64 倍 | 128 倍 |
| 4 杠 | 64 倍 | 128 倍 | 256 倍 |

- **表里没有的档**：无。
- **多档同时**：
  - 本人先打出 1 张或连续多张财神，在最后一次打出财神后的下一次摸牌回合内开杠，完成 1 杠或连续多杠后，用最后一次补牌爆头自摸，判定为飘杠。
  - 最后一次补牌仅满足普通自摸时，按杠上开花或对应的连杠档（`XS-K-LIANGANG`）。
  - 例：先飘 1 次、连杠 2 次后补牌爆头，为 16 倍。先飘 2 次、连杠 3 次后补牌爆头，为 64 倍。
  - 例：杠 1 次，飘 1 次，下一次摸牌再杠 1 次后补牌爆头，为 8 倍。旧杠记录清除，按已飘的 1 次和新杠的 1 次定档。
