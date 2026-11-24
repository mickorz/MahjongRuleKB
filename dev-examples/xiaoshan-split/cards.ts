// 萧山 47 张卡映射表：原 ID → { 类型, 杭州 base_rule_ref, 中文名, 依赖, 槽位 }
// inherited / modified 必须有 base；added 不能有 base
// 槽位用于 validator 的目录归类（按 ID 前缀自动判断，这里只记补充信息）

export interface CardMeta {
  id: string; // 原 ID，如 R-BANK-01
  name: string; // 中文名（取原文标题）
  changeType: "inherited" | "modified" | "added";
  base?: string; // 杭州 ID
  dependsOn?: string[]; // 萧山卡之间的依赖（XS- 前缀）
  status?: "confirmed" | "inferred" | "unresolved" | "disputed";
  releaseBlocker?: boolean;
}

export const xiaoshanCards: CardMeta[] = [
  // ===== 1.2 判定 R（13 张）=====
  { id: "R-BANK-01", name: "首局庄家", changeType: "inherited", base: "HJ-R-DINGZHUANG" },
  { id: "R-BANK-02", name: "连庄与换庄", changeType: "modified", base: "HJ-R-LUNZHUANG", dependsOn: ["XS-R-ZHUANGJIA-03", "XS-N-LAOSHU"] },
  { id: "R-BANK-03", name: "新庄起手二牢", changeType: "modified", base: "HJ-R-DUSAN", dependsOn: ["XS-R-ZHUANGJIA-02"] },
  { id: "R-BANK-04", name: "掷骰加庄", changeType: "added", dependsOn: ["XS-N-LAOSHU", "XS-F-ZHUANGXIAN-BEILV"] },
  { id: "R-WALL", name: "摸牌与杠补", changeType: "modified", base: "HJ-R-GANG-BUPAI", dependsOn: ["XS-T-ZUIHOU-LIUJU"] },
  { id: "R-PIAO", name: "飘财下能做的操作", changeType: "modified", base: "HJ-R-PIAOCAI-XIANZHI", dependsOn: ["XS-M-PIAOCAI"] },
  { id: "R-CHI", name: "吃禁手", changeType: "modified", base: "HJ-R-CHI-JINSHOU", dependsOn: ["XS-N-CHIPAI-CISHU"] },
  { id: "R-GZ", name: "软跟是否成立", changeType: "added", dependsOn: ["XS-M-GENZHUANG-QUAN", "XS-F-GENZHUANG-PEIFU", "XS-T-GENZHUANG-XIAN"] },
  { id: "R-HU-01", name: "庄闲放铳", changeType: "modified", base: "HJ-R-ZHUANGXIAN-FANGCHONG", dependsOn: ["XS-R-ZHUANGJIA-04", "XS-R-HUPAI-03"] },
  { id: "R-HU-02", name: "补杠不抢", changeType: "modified", base: "HJ-R-JIAGANG", dependsOn: ["XS-R-MOPAI-GANGBU"] },
  { id: "R-HU-03", name: "有财 2 番起胡", changeType: "added", dependsOn: ["XS-C-YOUCAI-2FAN"] },
  { id: "R-HU-04", name: "点炮番型的胡入来源", changeType: "inherited", base: "HJ-R-FANGCHONG" },
  { id: "R-CAP", name: "拖底触发", changeType: "added", dependsOn: ["XS-P-TUODI-KEPEIFEN", "XS-C-TUODI-EDU"] },

  // ===== 1.3 时序 T（5 张）=====
  { id: "T-ROUND", name: "一小局", changeType: "modified", base: "HJ-T-XIAOJU-LIUCHENG", dependsOn: ["XS-R-ZHUANGJIA-01", "XS-T-DINGLAO-ZHISAI", "XS-T-ZUIHOU-LIUJU", "XS-P-JUZHONG-JUMO", "XS-R-TUODI"] },
  { id: "T-BANK", name: "定牢之后才掷骰", changeType: "added", dependsOn: ["XS-R-ZHUANGJIA-04"] },
  { id: "T-WALL", name: "最后一张到流局", changeType: "modified", base: "HJ-T-LIUJU-SHIJI", dependsOn: ["XS-R-MOPAI-GANGBU"] },
  { id: "T-GZ", name: "跟庄先于弃牌响应", changeType: "added", dependsOn: ["XS-R-RUAN-GEN", "XS-A-GENZHUANG", "XS-F-GENZHUANG-PEIFU"] },
  { id: "T-CAP", name: "结算画面顺序", changeType: "added", dependsOn: ["XS-R-TUODI", "XS-P-TUODI-KEPEIFEN"] },

  // ===== 2.1 计数 N（2 张）=====
  { id: "N-BANK", name: "牢数", changeType: "modified", base: "HJ-N-ZHUANGJIA-LAOSHU", dependsOn: ["XS-R-ZHUANGJIA-04"] },
  { id: "N-CHI", name: "吃牌次数", changeType: "added", dependsOn: ["XS-R-CHI-JINSHOU"] },

  // ===== 2.2 记录 M（4 张）=====
  { id: "M-PIAO", name: "飘财限制", changeType: "modified", base: "HJ-M-PIAOCAI-JILU" },
  { id: "M-LOU-PENG", name: "漏碰", changeType: "added" },
  { id: "M-LOU-HU", name: "漏胡", changeType: "added", dependsOn: ["XS-R-HUPAI-01", "XS-R-HUPAI-03"] },
  { id: "M-GZ", name: "跟庄圈", changeType: "added", dependsOn: ["XS-R-RUAN-GEN"] },

  // ===== 3.1 公式 F（4 张）=====
  { id: "F-BANK", name: "庄闲倍率", changeType: "modified", base: "HJ-F-ZHUANGXIAN-BEILV", dependsOn: ["XS-N-LAOSHU"] },
  { id: "F-GZ", name: "跟庄赔付", changeType: "added" },
  { id: "F-HU", name: "胡牌分与杠分", changeType: "modified", base: "HJ-F-YUANYING-PEIFEN", dependsOn: ["XS-F-ZHUANGXIAN-BEILV"] },
  { id: "F-NET", name: "本局净得分", changeType: "added", dependsOn: ["XS-F-GENZHUANG-PEIFU", "XS-F-HUPAI-GANGFEN"] },

  // ===== 3.2 查表 K（3 张）=====
  { id: "K-FAN", name: "番型", changeType: "modified", base: "HJ-K-FANXING-HUCHI", status: "unresolved", releaseBlocker: true, dependsOn: ["XS-K-LIANGANG"] },
  { id: "K-GANG", name: "连杠", changeType: "modified", base: "HJ-K-GANGKAI", status: "unresolved", releaseBlocker: true, dependsOn: ["XS-K-FANXING"] },
  // K-STACK 原文标「修改」，但杭州 HJ-K-FANXING-HUCHI 已被 XS-K-FANXING 整卡替换；萧山 K-STACK 定义的是叠加与名称选择规则，作为新增卡
  { id: "K-STACK", name: "叠加与名称", changeType: "added", dependsOn: ["XS-K-FANXING", "XS-K-LIANGANG"] },

  // ===== 3.3 入账 P（2 张）=====
  { id: "P-FLOW", name: "局中与局末入账", changeType: "added", dependsOn: ["XS-F-GENZHUANG-PEIFU", "XS-F-HUPAI-GANGFEN", "XS-T-GENZHUANG-XIAN"] },
  { id: "P-CAP", name: "拖底后的可赔分", changeType: "added", dependsOn: ["XS-R-TUODI", "XS-C-TUODI-EDU"] },

  // ===== 4.1 静态 V（5 张）=====
  { id: "V-ROOM", name: "拖底额度", changeType: "added", dependsOn: ["XS-C-TUODI-EDU"] },
  { id: "V-BANK", name: "庄家牢数", changeType: "modified", base: "HJ-V-TOUXIANG-QU", dependsOn: ["XS-N-LAOSHU"] },
  { id: "V-PIAO", name: "受限牌的压暗", changeType: "added", dependsOn: ["XS-R-PIAOCAI-XIANZHI"] },
  { id: "V-RESULT", name: "小结算文字", changeType: "modified", base: "HJ-V-XIAO-JIESUAN", dependsOn: ["XS-F-BENJU-JINGDE", "XS-K-DIEJIA-MINGCHENG", "XS-F-GENZHUANG-PEIFU"] },
  { id: "V-CAP", name: "大结算实赔", changeType: "added", dependsOn: ["XS-P-TUODI-KEPEIFEN"] },

  // ===== 4.2 交互 I（5 张）=====
  { id: "I-PIAO", name: "受限时能打哪张", changeType: "added", dependsOn: ["XS-R-PIAOCAI-XIANZHI", "XS-V-PIAOCAI-YANGAN"] },
  { id: "I-CHI", name: "吃禁手手牌", changeType: "inherited", base: "HJ-I-CHUPAI" },
  { id: "I-LOU-PENG", name: "漏碰按钮", changeType: "added", dependsOn: ["XS-M-LOUPENG"] },
  { id: "I-LOU-HU", name: "漏胡按钮", changeType: "added", dependsOn: ["XS-M-LOUHU"] },
  { id: "I-HU", name: "有财起胡按钮", changeType: "added", dependsOn: ["XS-R-HUPAI-03"] },

  // ===== 4.3 动效 A（4 张）=====
  { id: "A-BANK", name: "加庄", changeType: "added", dependsOn: ["XS-R-ZHUANGJIA-04"] },
  { id: "A-GZ", name: "跟庄", changeType: "added", dependsOn: ["XS-T-GENZHUANG-XIAN", "XS-F-GENZHUANG-PEIFU"] },
  { id: "A-HU", name: "胡牌番型字", changeType: "modified", base: "HJ-A-HUPAI-ZIXIAO", dependsOn: ["XS-K-DIEJIA-MINGCHENG"] },
  { id: "A-FLOAT", name: "局末飘分", changeType: "modified", base: "HJ-A-HUPAI-ZIXIAO", dependsOn: ["XS-F-HUPAI-GANGFEN", "XS-T-JIESUAN-HUAMIAN"] },
];

/** 目录映射：ID 前缀段 → 目录 */
export const dirByPrefix: Record<string, string> = {
  R: "rules",
  T: "timing",
  N: "state",
  M: "state",
  F: "formulas",
  K: "tables",
  P: "settlement",
  V: "ui",
  I: "ui",
  A: "ui",
};

/** type 映射 */
export const typeByPrefix: Record<string, string> = {
  R: "judgment",
  T: "timing",
  N: "counter",
  M: "record",
  F: "formula",
  K: "lookup",
  P: "settlement",
  V: "static-ui",
  I: "interaction",
  A: "animation",
};
