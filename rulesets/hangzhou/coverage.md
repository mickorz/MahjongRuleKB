# 杭州原始 PRD 章节覆盖清单

> 每个原始章节对应哪些规则卡。章节号见 `sources/hangzhou/hangzhou-core-flow.md`。
> 配置项（`HJ-C-*`）在 `config.yaml` / `config.ui.yaml`。

## 本期开发范围 / 默认规则

| 原文位置 | 对应卡 / 配置 |
| --- | --- |
| 固定四人、8 局 | `HJ-C-PLAYER-COUNT`、`HJ-C-ROUND-COUNT` |
| 136 张牌、白板财神 | `HJ-C-TILE-COUNT`、`HJ-C-JOKER`、`HJ-R-CAISHEN` |
| 首局随机坐庄、赢家坐庄、流局连庄 | `HJ-R-DINGZHUANG`、`HJ-R-LUNZHUANG` |
| 笃三老庄 | `HJ-R-DUSAN`、`HJ-C-BANKER-MODE`、`HJ-C-BANKER-LEVEL`、`HJ-C-BANKER-MULTIPLIER`、`HJ-N-BANK` |
| 庄闲放铳（庄三） | `HJ-R-ZHUANGXIAN`、`HJ-C-DISCARD-HU` |
| 有财必拷响关闭 | `HJ-C-YOUCAI-BI-KAO-XIANG` |
| 十风启用 | `HJ-K-SHIFENG`、`HJ-C-SHI-FENG` |
| 三摊承包、碰算摊关闭 | `HJ-R-CONTRACT`、`HJ-P-CONTRACT`、`HJ-C-CONTRACT`、`HJ-C-PENG-COUNTS-TAN`、`HJ-N-TAN` |
| 吃碰禁手 | `HJ-R-CHI-JINSHOU`、`HJ-R-PENG-JINSHOU`、`HJ-C-CHI-PENG-JINSHOU` |
| 底分 1、无封顶 | `HJ-C-BASE-SCORE`、`HJ-C-SCORE-CAP` |

## 二、功能详情

### 2.1 游戏规则概述

| 原文位置 | 对应卡 |
| --- | --- |
| 牌数 136 | `HJ-C-TILE-COUNT` |
| 吃碰杠胡概述、操作优先级 | `HJ-R-PRIORITY`、`HJ-R-CHI`、`HJ-R-PENG`、`HJ-R-GANG-LOGIC`、`HJ-R-ZIMO`、`HJ-R-FANGCHONG` |

### 2.2 基础名词和概念解释

| 名词 | 对应卡 |
| --- | --- |
| 操作名词（摸/打/吃/碰/杠/胡） | `HJ-T-PLAY`、`HJ-R-CHI`、`HJ-R-PENG`、`HJ-R-GANG-LOGIC`、`HJ-R-ZIMO` |
| 对子/顺子/刻子/杠子/面子/副露 | 牌型基础定义，各番型卡引用 |
| 财神 | `HJ-R-CAISHEN` |
| 牢庄 | `HJ-N-BANK`、`HJ-R-DUSAN` |
| 摊 | `HJ-N-TAN`、`HJ-R-CONTRACT` |
| 承包 / 倒承包 | `HJ-R-CONTRACT`、`HJ-P-CONTRACT` |
| 爆头 | `HJ-K-BAOTOU` |
| 飘 | `HJ-R-PIAO`、`HJ-M-PIAO`、`HJ-N-PIAO` |
| 自摸 / 放铳 | `HJ-R-ZIMO`、`HJ-R-FANGCHONG` |
| 庄家 / 闲家 | `HJ-R-DINGZHUANG`、`HJ-F-BANK` |
| 听牌 / 向听数 | `HJ-V-HAND`（界面辅助） |
| 流局 | `HJ-T-WALL`、`HJ-C-WALL-KEEP` |
| 本家 / 上家 / 下家 / 对家 | 座位定义，`HJ-R-CHI` 引用 |

### 2.3 规则详情

#### 2.3.1 基础操作及规则

| `#####` 小节 | 对应卡 |
| --- | --- |
| 操作优先级 | `HJ-R-PRIORITY` |
| 吃 | `HJ-R-CHI` |
| 碰 | `HJ-R-PENG` |
| 杠（逻辑/直杠/加杠/暗杠/杠开/杠爆/杠飘/抢杠胡） | `HJ-R-GANG-LOGIC`、`HJ-R-GANG-DIRECT`、`HJ-R-GANG-ADD`、`HJ-R-GANG-HIDDEN`、`HJ-K-GANGKAI`、`HJ-K-GANGBAO`、`HJ-K-GANGPIAO`、`HJ-R-GANG-QIANG` |
| 自摸 | `HJ-R-ZIMO` |
| 放铳 | `HJ-R-FANGCHONG` |

#### 2.3.2 玩法规则

| `#####` 小节 | 对应卡 / 配置 |
| --- | --- |
| 局数 | `HJ-C-ROUND-COUNT`、`HJ-T-ROUND` |
| 人数 | `HJ-C-PLAYER-COUNT` |
| 定庄 | `HJ-R-DINGZHUANG` |
| 轮庄 | `HJ-R-LUNZHUANG` |
| 财神 | `HJ-R-CAISHEN`、`HJ-C-JOKER` |
| 笃三老庄 | `HJ-R-DUSAN` |
| 庄闲放铳（庄3） | `HJ-R-ZHUANGXIAN` |
| 三摊承包 | `HJ-R-CONTRACT`、`HJ-P-CONTRACT`、`HJ-N-TAN` |
| 吃碰禁手 | `HJ-R-CHI-JINSHOU`、`HJ-R-PENG-JINSHOU` |
| 底分 | `HJ-F-ORIGINAL`、`HJ-C-BASE-SCORE` |

#### 2.3.3 算分规则

| 表行 | 对应卡 |
| --- | --- |
| 每笔原应赔分 | `HJ-F-ORIGINAL`、`HJ-F-BANK` |
| 自摸 | `HJ-P-ZIMO` |
| 点炮胡、抢杠胡 | `HJ-P-DIANPAO`、`HJ-P-QIANG` |
| 三摊承包、倒承包 | `HJ-P-CONTRACT` |
| 链式承包 | `HJ-P-CONTRACT` |
| 黄庄与记账 | `HJ-P-HUANGZHUANG` |

#### 2.3.4 胡牌番型

| 番型 | 对应卡 |
| --- | --- |
| 番型分类 | `HJ-K-STACK` |
| 十风 | `HJ-K-SHIFENG` |
| 番型互斥与优先级 | `HJ-K-STACK` |
| 1 平胡 | `HJ-K-PINGHU` |
| 2 爆头 | `HJ-K-BAOTOU` |
| 3-5 财飘 / 双财飘 / 三财飘 | `HJ-K-CAIPIAO` |
| 6-9 杠上开花 ~ 四连杠 | `HJ-K-GANGKAI` |
| 10-13 七对 ~ 三豪华七对 | `HJ-K-QIDUI` |
| 14-17 清七对 ~ 三豪华清七对 | `HJ-K-QINGQIDUI` |
| 18-21 杠爆 | `HJ-K-GANGBAO` |
| 22-33 杠飘 | `HJ-K-GANGPIAO` |
| 34 飘杠 | `HJ-K-PIAOGANG` |
| 35-50 七客及飘财各档 | `HJ-K-QIKE` |

## 三、对局流程

### 3.2 局中信息

| `####` 小节 | 对应卡 |
| --- | --- |
| 方位信息 | `HJ-V-DIRECTION` |
| 玩法信息 | `HJ-V-GAMEINFO` |
| 玩家头像信息 | `HJ-V-AVATAR` |
| 牌河信息 | `HJ-V-RIVER` |
| 手牌信息（含 3.2.5.1 手牌交互说明） | `HJ-V-HAND` |

3.2.1 对局前布局（菜单、房间号、准备信息）：属房间系统非规则，不入卡。

## 四、局内流程

| 节 | 对应卡 |
| --- | --- |
| 4.1 对局开始 | `HJ-A-OPENING`、`HJ-T-ROUND` |
| 4.2 定庄 | `HJ-R-DINGZHUANG`、`HJ-V-AVATAR`（庄标） |
| 4.3 定财神 | `HJ-V-GAMEINFO` |
| 4.4 发牌 | `HJ-T-DEAL`、`HJ-C-DEAL-BATCH` |
| 4.5 行牌操作（摸牌/补牌/提牌/出牌） | `HJ-T-PLAY`、`HJ-I-DISCARD` |
| 4.6 吃碰杠胡操作 | `HJ-I-RESPOND` |
| 4.7 多操作状态 | `HJ-I-MULTI` |
| 4.8 对局内通用提示 | `HJ-A-SANTAN`、`HJ-I-DISCARD`（点"过"才能出牌） |

## 五、结算流程

| 节 | 对应卡 |
| --- | --- |
| 5.1 流程明细 | `HJ-T-SETTLE`、`HJ-A-WIN`、`HJ-A-FLOAT` |
| 5.2 长按查看桌面 | `HJ-I-LONGPRESS` |

## 六、结算界面

| 节 | 对应卡 |
| --- | --- |
| 6.1.1 触发逻辑 | `HJ-T-SETTLE`、`HJ-V-RESULT` |
| 6.1.2 UI 交互以及说明（1-12 项） | `HJ-V-RESULT`（第 10、12 项本期无此功能） |

## 七、辅助功能

7.1 菜单退出、7.2 同步与异常处理：房间系统与网络层，不入规则卡。解散与胡牌冲突的裁决在 `HJ-T-ROUND` 中断项提及。

## 附录

附录 A 后续版本配置、附录 B 录屏素材：本期不生效，不入卡。

## 统计

| 类型 | 卡数 |
| --- | --- |
| 判定 R | 19 |
| 时序 T | 5 |
| 计数 N | 3 |
| 记录 M | 1 |
| 公式 F | 2 |
| 查表 K | 12 |
| 入账 P | 5 |
| 静态 V | 6 |
| 交互 I | 4 |
| 动效 A | 4 |
| **合计** | **61** |
| 配置 C（config.yaml + config.ui.yaml） | 25 |
