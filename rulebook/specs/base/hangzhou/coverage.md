# 杭州原始 PRD 章节覆盖清单

> 每个原始章节对应哪些规则卡。章节号见 `sources/hangzhou/hangzhou-core-flow.md`。
> 配置项（`HJ-C-*`）在 `config.yaml` / `config.ui.yaml`。

## 本期开发范围 / 默认规则

| 原文位置 | 对应卡 / 配置 |
| --- | --- |
| 固定四人、8 局 | `HJ-C-RENSHU`、`HJ-C-JUSHU` |
| 136 张牌、白板财神 | `HJ-C-PAISHU`、`HJ-C-CAISHEN`、`HJ-R-CAISHEN` |
| 首局随机坐庄、赢家坐庄、流局连庄 | `HJ-R-DINGZHUANG`、`HJ-R-LUNZHUANG` |
| 笃三老庄 | `HJ-R-DUSAN`、`HJ-C-LIANZHUANG-MOSHI`、`HJ-C-ZHUANGJIA-LAOSHU`、`HJ-C-ZHUANGJIA-BEILV`、`HJ-N-ZHUANGJIA-LAOSHU` |
| 庄闲放铳（庄三） | `HJ-R-ZHUANGXIAN-FANGCHONG`、`HJ-C-ZHUANGXIAN-FANGCHONG` |
| 有财必拷响关闭 | `HJ-C-YOUCAI-BI-KAO-XIANG` |
| 十风启用 | `HJ-K-SHIFENG`、`HJ-C-SHIFENG` |
| 三摊承包、碰算摊关闭 | `HJ-R-CHENGBAO`、`HJ-P-CHENGBAO-RUZHANG`、`HJ-C-SANTAN-CHENGBAO`、`HJ-C-PENG-SUAN-TAN`、`HJ-N-TANSHU` |
| 吃碰禁手 | `HJ-R-CHI-JINSHOU`、`HJ-R-PENG-JINSHOU`、`HJ-C-CHI-PENG-JINSHOU` |
| 底分 1、无封顶 | `HJ-C-DIFEN`、`HJ-C-FENGDING` |

## 二、功能详情

### 2.1 游戏规则概述

| 原文位置 | 对应卡 |
| --- | --- |
| 牌数 136 | `HJ-C-PAISHU` |
| 吃碰杠胡概述、操作优先级 | `HJ-R-QIPAI-YOUXIANJI`、`HJ-R-CHI`、`HJ-R-PENG`、`HJ-R-GANG-BUPAI`、`HJ-R-ZIMO`、`HJ-R-FANGCHONG` |

### 2.2 基础名词和概念解释

| 名词 | 对应卡 |
| --- | --- |
| 操作名词（摸/打/吃/碰/杠/胡） | `HJ-T-XINGPAI`、`HJ-R-CHI`、`HJ-R-PENG`、`HJ-R-GANG-BUPAI`、`HJ-R-ZIMO` |
| 对子/顺子/刻子/杠子/面子/副露 | 牌型基础定义，各番型卡引用 |
| 财神 | `HJ-R-CAISHEN` |
| 牢庄 | `HJ-N-ZHUANGJIA-LAOSHU`、`HJ-R-DUSAN` |
| 摊 | `HJ-N-TANSHU`、`HJ-R-CHENGBAO` |
| 承包 / 倒承包 | `HJ-R-CHENGBAO`、`HJ-P-CHENGBAO-RUZHANG` |
| 爆头 | `HJ-K-BAOTOU` |
| 飘 | `HJ-R-PIAOCAI-XIANZHI`、`HJ-M-PIAOCAI-JILU`、`HJ-N-LIANXU-PIAOCAI` |
| 自摸 / 放铳 | `HJ-R-ZIMO`、`HJ-R-FANGCHONG` |
| 庄家 / 闲家 | `HJ-R-DINGZHUANG`、`HJ-F-ZHUANGXIAN-BEILV` |
| 听牌 / 向听数 | `HJ-V-SHOUPAI-TINGPAI`（界面辅助） |
| 流局 | `HJ-T-LIUJU-SHIJI`、`HJ-C-LIUJU-LIUDI-ZHANGSHU` |
| 本家 / 上家 / 下家 / 对家 | 座位定义，`HJ-R-CHI` 引用 |

### 2.3 规则详情

#### 2.3.1 基础操作及规则

| `#####` 小节 | 对应卡 |
| --- | --- |
| 操作优先级 | `HJ-R-QIPAI-YOUXIANJI` |
| 吃 | `HJ-R-CHI` |
| 碰 | `HJ-R-PENG` |
| 杠（逻辑/直杠/加杠/暗杠/杠开/杠爆/杠飘/抢杠胡） | `HJ-R-GANG-BUPAI`、`HJ-R-ZHIGANG`、`HJ-R-JIAGANG`、`HJ-R-ANGANG`、`HJ-K-GANGKAI`、`HJ-K-GANGBAO`、`HJ-K-GANGPIAO`、`HJ-R-QIANGGANG` |
| 自摸 | `HJ-R-ZIMO` |
| 放铳 | `HJ-R-FANGCHONG` |

#### 2.3.2 玩法规则

| `#####` 小节 | 对应卡 / 配置 |
| --- | --- |
| 局数 | `HJ-C-JUSHU`、`HJ-T-XIAOJU-LIUCHENG` |
| 人数 | `HJ-C-RENSHU` |
| 定庄 | `HJ-R-DINGZHUANG` |
| 轮庄 | `HJ-R-LUNZHUANG` |
| 财神 | `HJ-R-CAISHEN`、`HJ-C-CAISHEN` |
| 笃三老庄 | `HJ-R-DUSAN` |
| 庄闲放铳（庄3） | `HJ-R-ZHUANGXIAN-FANGCHONG` |
| 三摊承包 | `HJ-R-CHENGBAO`、`HJ-P-CHENGBAO-RUZHANG`、`HJ-N-TANSHU` |
| 吃碰禁手 | `HJ-R-CHI-JINSHOU`、`HJ-R-PENG-JINSHOU` |
| 底分 | `HJ-F-YUANYING-PEIFEN`、`HJ-C-DIFEN` |

#### 2.3.3 算分规则

| 表行 | 对应卡 |
| --- | --- |
| 每笔原应赔分 | `HJ-F-YUANYING-PEIFEN`、`HJ-F-ZHUANGXIAN-BEILV` |
| 自摸 | `HJ-P-ZIMO-RUZHANG` |
| 点炮胡、抢杠胡 | `HJ-P-DIANPAO-RUZHANG`、`HJ-P-QIANGGANG-RUZHANG` |
| 三摊承包、倒承包 | `HJ-P-CHENGBAO-RUZHANG` |
| 链式承包 | `HJ-P-CHENGBAO-RUZHANG` |
| 黄庄与记账 | `HJ-P-HUANGZHUANG` |

#### 2.3.4 胡牌番型

| 番型 | 对应卡 |
| --- | --- |
| 番型分类 | `HJ-K-FANXING-HUCHI` |
| 十风 | `HJ-K-SHIFENG` |
| 番型互斥与优先级 | `HJ-K-FANXING-HUCHI` |
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
| 方位信息 | `HJ-V-FANGWEIPAN` |
| 玩法信息 | `HJ-V-YUPAI-CAISHEN` |
| 玩家头像信息 | `HJ-V-TOUXIANG-QU` |
| 牌河信息 | `HJ-V-PAIHE` |
| 手牌信息（含 3.2.5.1 手牌交互说明） | `HJ-V-SHOUPAI-TINGPAI` |

3.2.1 对局前布局（菜单、房间号、准备信息）：属房间系统非规则，不入卡。

## 四、局内流程

| 节 | 对应卡 |
| --- | --- |
| 4.1 对局开始 | `HJ-A-DUIJU-KAISHI`、`HJ-T-XIAOJU-LIUCHENG` |
| 4.2 定庄 | `HJ-R-DINGZHUANG`、`HJ-V-TOUXIANG-QU`（庄标） |
| 4.3 定财神 | `HJ-V-YUPAI-CAISHEN` |
| 4.4 发牌 | `HJ-T-FAIPAI`、`HJ-C-FAIPAI-JIEZOU` |
| 4.5 行牌操作（摸牌/补牌/提牌/出牌） | `HJ-T-XINGPAI`、`HJ-I-CHUPAI` |
| 4.6 吃碰杠胡操作 | `HJ-I-CAOZUO-ANNIU` |
| 4.7 多操作状态 | `HJ-I-DUOXIANG-CAOZUO` |
| 4.8 对局内通用提示 | `HJ-A-SANTAN-LUODI`、`HJ-I-CHUPAI`（点"过"才能出牌） |

## 五、结算流程

| 节 | 对应卡 |
| --- | --- |
| 5.1 流程明细 | `HJ-T-XIAOJU-JIESUAN`、`HJ-A-HUPAI-ZIXIAO`、`HJ-A-JUMO-PIAOFEN` |
| 5.2 长按查看桌面 | `HJ-I-CHANGAN-CHAKAN` |

## 六、结算界面

| 节 | 对应卡 |
| --- | --- |
| 6.1.1 触发逻辑 | `HJ-T-XIAOJU-JIESUAN`、`HJ-V-XIAO-JIESUAN` |
| 6.1.2 UI 交互以及说明（1-12 项） | `HJ-V-XIAO-JIESUAN`（第 10、12 项本期无此功能） |

## 七、辅助功能

7.1 菜单退出、7.2 同步与异常处理：房间系统与网络层，不入规则卡。解散与胡牌冲突的裁决在 `HJ-T-XIAOJU-LIUCHENG` 中断项提及。

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
