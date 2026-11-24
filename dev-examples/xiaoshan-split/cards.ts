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
  { id: "R-BANK-02", name: "连庄与换庄", changeType: "modified", base: "HJ-R-LUNZHUANG", dependsOn: ["XS-R-BANK-03", "XS-N-BANK"] },
  { id: "R-BANK-03", name: "新庄起手二牢", changeType: "modified", base: "HJ-R-DUSAN", dependsOn: ["XS-R-BANK-02"] },
  { id: "R-BANK-04", name: "掷骰加庄", changeType: "added", dependsOn: ["XS-N-BANK", "XS-F-BANK"] },
  { id: "R-WALL", name: "摸牌与杠补", changeType: "modified", base: "HJ-R-GANG-LOGIC", dependsOn: ["XS-T-WALL"] },
  { id: "R-PIAO", name: "飘财下能做的操作", changeType: "modified", base: "HJ-R-PIAO", dependsOn: ["XS-M-PIAO"] },
  { id: "R-CHI", name: "吃禁手", changeType: "modified", base: "HJ-R-CHI-JINSHOU", dependsOn: ["XS-N-CHI"] },
  { id: "R-GZ", name: "软跟是否成立", changeType: "added", dependsOn: ["XS-M-GZ", "XS-F-GZ", "XS-T-GZ"] },
  { id: "R-HU-01", name: "庄闲放铳", changeType: "modified", base: "HJ-R-ZHUANGXIAN", dependsOn: ["XS-R-BANK-04", "XS-R-HU-03"] },
  { id: "R-HU-02", name: "补杠不抢", changeType: "modified", base: "HJ-R-GANG-ADD", dependsOn: ["XS-R-WALL"] },
  { id: "R-HU-03", name: "有财 2 番起胡", changeType: "added", dependsOn: ["XS-C-YOUCAI-2FAN"] },
  { id: "R-HU-04", name: "点炮番型的胡入来源", changeType: "inherited", base: "HJ-R-FANGCHONG" },
  { id: "R-CAP", name: "拖底触发", changeType: "added", dependsOn: ["XS-P-CAP", "XS-C-CAP-LIMIT"] },

  // ===== 1.3 时序 T（5 张）=====
  { id: "T-ROUND", name: "一小局", changeType: "modified", base: "HJ-T-ROUND", dependsOn: ["XS-R-BANK-01", "XS-T-BANK", "XS-T-WALL", "XS-P-FLOW", "XS-R-CAP"] },
  { id: "T-BANK", name: "定牢之后才掷骰", changeType: "added", dependsOn: ["XS-R-BANK-04"] },
  { id: "T-WALL", name: "最后一张到流局", changeType: "modified", base: "HJ-T-WALL", dependsOn: ["XS-R-WALL"] },
  { id: "T-GZ", name: "跟庄先于弃牌响应", changeType: "added", dependsOn: ["XS-R-GZ", "XS-A-GZ", "XS-F-GZ"] },
  { id: "T-CAP", name: "结算画面顺序", changeType: "added", dependsOn: ["XS-R-CAP", "XS-P-CAP"] },

  // ===== 2.1 计数 N（2 张）=====
  { id: "N-BANK", name: "牢数", changeType: "modified", base: "HJ-N-BANK", dependsOn: ["XS-R-BANK-04"] },
  { id: "N-CHI", name: "吃牌次数", changeType: "added", dependsOn: ["XS-R-CHI"] },

  // ===== 2.2 记录 M（4 张）=====
  { id: "M-PIAO", name: "飘财限制", changeType: "modified", base: "HJ-M-PIAO" },
  { id: "M-LOU-PENG", name: "漏碰", changeType: "added" },
  { id: "M-LOU-HU", name: "漏胡", changeType: "added", dependsOn: ["XS-R-HU-01", "XS-R-HU-03"] },
  { id: "M-GZ", name: "跟庄圈", changeType: "added", dependsOn: ["XS-R-GZ"] },

  // ===== 3.1 公式 F（4 张）=====
  { id: "F-BANK", name: "庄闲倍率", changeType: "modified", base: "HJ-F-BANK", dependsOn: ["XS-N-BANK"] },
  { id: "F-GZ", name: "跟庄赔付", changeType: "added" },
  { id: "F-HU", name: "胡牌分与杠分", changeType: "modified", base: "HJ-F-ORIGINAL", dependsOn: ["XS-F-BANK"] },
  { id: "F-NET", name: "本局净得分", changeType: "added", dependsOn: ["XS-F-GZ", "XS-F-HU"] },

  // ===== 3.2 查表 K（3 张）=====
  { id: "K-FAN", name: "番型", changeType: "modified", base: "HJ-K-STACK", status: "unresolved", releaseBlocker: true, dependsOn: ["XS-K-GANG"] },
  { id: "K-GANG", name: "连杠", changeType: "modified", base: "HJ-K-GANGKAI", status: "unresolved", releaseBlocker: true, dependsOn: ["XS-K-FAN"] },
  // K-STACK 原文标「修改」，但杭州 HJ-K-STACK 已被 XS-K-FAN 整卡替换；萧山 K-STACK 定义的是叠加与名称选择规则，作为新增卡
  { id: "K-STACK", name: "叠加与名称", changeType: "added", dependsOn: ["XS-K-FAN", "XS-K-GANG"] },

  // ===== 3.3 入账 P（2 张）=====
  { id: "P-FLOW", name: "局中与局末入账", changeType: "added", dependsOn: ["XS-F-GZ", "XS-F-HU", "XS-T-GZ"] },
  { id: "P-CAP", name: "拖底后的可赔分", changeType: "added", dependsOn: ["XS-R-CAP", "XS-C-CAP-LIMIT"] },

  // ===== 4.1 静态 V（5 张）=====
  { id: "V-ROOM", name: "拖底额度", changeType: "added", dependsOn: ["XS-C-CAP-LIMIT"] },
  { id: "V-BANK", name: "庄家牢数", changeType: "modified", base: "HJ-V-AVATAR", dependsOn: ["XS-N-BANK"] },
  { id: "V-PIAO", name: "受限牌的压暗", changeType: "added", dependsOn: ["XS-R-PIAO"] },
  { id: "V-RESULT", name: "小结算文字", changeType: "modified", base: "HJ-V-RESULT", dependsOn: ["XS-F-NET", "XS-K-STACK", "XS-F-GZ"] },
  { id: "V-CAP", name: "大结算实赔", changeType: "added", dependsOn: ["XS-P-CAP"] },

  // ===== 4.2 交互 I（5 张）=====
  { id: "I-PIAO", name: "受限时能打哪张", changeType: "added", dependsOn: ["XS-R-PIAO", "XS-V-PIAO"] },
  { id: "I-CHI", name: "吃禁手手牌", changeType: "inherited", base: "HJ-I-DISCARD" },
  { id: "I-LOU-PENG", name: "漏碰按钮", changeType: "added", dependsOn: ["XS-M-LOU-PENG"] },
  { id: "I-LOU-HU", name: "漏胡按钮", changeType: "added", dependsOn: ["XS-M-LOU-HU"] },
  { id: "I-HU", name: "有财起胡按钮", changeType: "added", dependsOn: ["XS-R-HU-03"] },

  // ===== 4.3 动效 A（4 张）=====
  { id: "A-BANK", name: "加庄", changeType: "added", dependsOn: ["XS-R-BANK-04"] },
  { id: "A-GZ", name: "跟庄", changeType: "added", dependsOn: ["XS-T-GZ", "XS-F-GZ"] },
  { id: "A-HU", name: "胡牌番型字", changeType: "modified", base: "HJ-A-WIN", dependsOn: ["XS-K-STACK"] },
  { id: "A-FLOAT", name: "局末飘分", changeType: "modified", base: "HJ-A-WIN", dependsOn: ["XS-F-HU", "XS-T-CAP"] },
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
