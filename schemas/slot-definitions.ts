// 11 种规则类型各自的必填槽位名
// 来源：sources/xiaoshan/xiaoshan-rules.md 开头的槽位表
// 差异卡（modified / added）用 slotDefinitions；基础卡用 baseSlotDefinitions（去掉「差异」「杭麻」）

import type { RuleType } from "./rule.ts";

/** 差异卡必填槽位 */
export const slotDefinitions: Record<RuleType, string[]> = {
  judgment: ["差异", "杭麻", "触发", "条件", "否则", "结果", "验收"],
  timing: ["差异", "杭麻", "起点", "步骤", "中断", "结束"],
  counter: ["差异", "杭麻", "键", "初值", "加一", "重置", "读取"],
  record: ["差异", "键", "写入", "生效", "清除", "小局开始"],
  formula: ["差异", "杭麻", "输入", "公式", "不计入", "例子"],
  lookup: ["差异", "杭麻", "取档键", "表", "表里没有的档", "多档同时"],
  settlement: ["差异", "入账时点", "分配顺序", "一笔怎么分", "余额用尽", "展示用哪一份数", "例子"],
  "static-ui": ["挂", "差异", "出现条件", "位置", "文案格式", "不出现", "保持到"],
  interaction: ["挂", "差异", "触发", "控件", "允许", "禁止", "同次其余操作", "反馈文案"],
  animation: ["挂", "差异", "起播", "位置", "画面", "顺序", "结束", "播完进入"],
};

/** 基础卡必填槽位：去掉「差异」「杭麻」「挂」——这三项是差异卡特有的对照信息 */
export const baseSlotDefinitions: Record<RuleType, string[]> = {
  judgment: ["触发", "条件", "否则", "结果", "验收"],
  timing: ["起点", "步骤", "中断", "结束"],
  counter: ["键", "初值", "加一", "重置", "读取"],
  record: ["键", "写入", "生效", "清除", "小局开始"],
  formula: ["输入", "公式", "不计入", "例子"],
  lookup: ["取档键", "表", "表里没有的档", "多档同时"],
  settlement: ["入账时点", "分配顺序", "一笔怎么分", "余额用尽", "展示用哪一份数", "例子"],
  "static-ui": ["出现条件", "位置", "文案格式", "不出现", "保持到"],
  interaction: ["触发", "控件", "允许", "禁止", "同次其余操作", "反馈文案"],
  animation: ["起播", "位置", "画面", "顺序", "结束", "播完进入"],
};

/** 按卡类型取对应槽位列表 */
export function requiredSlotsFor(
  origin: "base" | "variant",
  changeType: "inherited" | "modified" | "added" | undefined,
  type: RuleType,
): string[] {
  if (origin === "base") return baseSlotDefinitions[type];
  if (changeType === "inherited") return []; // 不要求填写正文槽位
  return slotDefinitions[type];
}
