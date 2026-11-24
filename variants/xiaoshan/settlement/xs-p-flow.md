---
id: XS-P-FLOW
origin: variant
type: settlement
name: 局中与局末入账
change_type: added
compares_to: []
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-F-GZ, XS-F-HU, XS-T-GZ]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "P-FLOW"
---

# 局中与局末入账

- **差异**：新增
- **杭麻**：胡牌分在局末入账。无局中跟庄入账
- **入账时点**：跟庄在 `XS-T-GZ` 第 3 步全额入账，并刷新四家桌面累计分。胡牌分和杠分在本局结算时全额入账。流局的胡牌结算为 0
- **分配顺序**：无拆分。先发生的跟庄先入账
- **一笔怎么分**：跟庄按 `XS-F-GZ`。胡牌按 `XS-F-HU`
- **余额用尽**：局中不截断。累计分可以低于 −200
- **展示用哪一份数**：局末刷新桌面累计分时，只加减本次胡牌结算分。跟庄分已经在局中加减过
- **例子**：A 局前 −190。跟庄 −24 后，桌面累计分为 −214。自摸结算 +20 后，桌面累计分为 −194。小结算本局净得分为 −4
