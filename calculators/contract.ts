// 三摊承包入账（HJ-P-CHENGBAO-RUZHANG、XS-P-TUODI-KEPEIFEN 之外的部分）
// 承包关系：A 吃了 B 三摊 → 记 A→B（A 是取牌方，B 是供牌方）
export type RulesetId = "hangzhou-friends-4p" | "xiaoshan-friends-4p";

export interface ContractSettlementInput {
  /** 三名对手按常规自摸各自的原应赔分 */
  original_payments: Record<string, number>;
  winner: string;
  /** 承包关系：key 为取牌方，value 为供牌方 */
  contracts?: Array<{ holder: string; provider: string }>;
  /** 点炮 / 抢杠时的放铳者 */
  discarder?: string;
  win_type?: "self_draw" | "discard" | "qiang_gang";
  /** 抢杠原赔付 R（赢家按普通自摸应收的三笔合计） */
  qiang_gang_r?: number;
}

export interface ContractSettlementOutput {
  scores: Record<string, number>;
  /** 实际产生赔付的承包关系说明 */
  applied: string[];
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/**
 * 承包入账（HJ-P-CHENGBAO-RUZHANG）
 * - 自摸：承包方付 S，反承包付 2S，链式叠加
 * - 点炮：只有放铳者付款；放铳者是赢家的承包对方按 1 倍 P，倒承包对方按 2 倍 P
 * - 抢杠：加杠者付 R，赢家参与的每项承包按 R 的 1 倍、倒承包按 2 倍叠加
 */
export function calculateContractSettlement(input: ContractSettlementInput): ContractSettlementOutput {
  const players = [...new Set([input.winner, ...Object.keys(input.original_payments), ...(input.contracts ?? []).flatMap((c) => [c.holder, c.provider]), ...(input.discarder ? [input.discarder] : [])])];
  const scores: Record<string, number> = Object.fromEntries(players.map((p) => [p, 0]));
  const applied: string[] = [];
  const winType = input.win_type ?? "self_draw";
  const s = sum(Object.values(input.original_payments));

  if (winType === "self_draw") {
    // 找出「指向赢家」的承包关系（赢家是取牌方）与「赢家作为供牌方」的反承包
    const outbound = (input.contracts ?? []).filter((c) => c.holder === input.winner);
    const inbound = (input.contracts ?? []).filter((c) => c.provider === input.winner);
    if (outbound.length === 0 && inbound.length === 0) {
      for (const [p, amount] of Object.entries(input.original_payments)) scores[p] = -amount;
      scores[input.winner] = s;
      return { scores, applied };
    }
    // 承包：供牌方付 S
    for (const c of outbound) {
      scores[c.provider] -= s;
      scores[input.winner] += s;
      applied.push(`承包 ${c.holder}→${c.provider} 付 ${s}`);
    }
    // 反承包：取牌方付 2S
    for (const c of inbound) {
      scores[c.holder] -= 2 * s;
      scores[input.winner] += 2 * s;
      applied.push(`反承包 ${c.holder}→${c.provider} 付 ${2 * s}`);
    }
    return { scores, applied };
  }

  // 点炮 / 抢杠：只有放铳者（抢杠为加杠者）付款
  const payer = input.discarder ?? "";
  if (!payer) throw new Error("点炮或抢杠必须提供 discarder");
  const r = winType === "qiang_gang" ? (input.qiang_gang_r ?? s) : (input.original_payments[payer] ?? s);

  if (winType === "discard") {
    // 点炮承包是“整体改写付款额”，不是在原点炮分上再叠加。
    // 只有放铳者与赢家直接相关的承包关系有效；其他玩家不付款。
    let finalAmount = r;
    const relation = (input.contracts ?? []).find((c) => c.provider === payer && c.holder === input.winner)
      ?? (input.contracts ?? []).find((c) => c.holder === payer && c.provider === input.winner);
    if (relation) {
      const reverse = relation.holder === payer;
      finalAmount = reverse ? 2 * r : r;
      applied.push(`${reverse ? "倒承包" : "承包"}点炮改写 ${payer} 付 ${finalAmount}`);
    } else {
      applied.push(`原点炮 ${payer} 付 ${finalAmount}`);
    }
    scores[payer] -= finalAmount;
    scores[input.winner] += finalAmount;
    return { scores, applied };
  }

  // 抢杠胡：保留加杠者原赔付 R，赢家参与的每项承包按 R / 2R 独立叠加。
  scores[payer] -= r;
  scores[input.winner] += r;
  applied.push(`原抢杠赔付 ${payer} 付 ${r}`);
  for (const c of input.contracts ?? []) {
    if (c.holder === input.winner) {
      scores[c.provider] -= r;
      scores[input.winner] += r;
      applied.push(`承包叠加 ${c.provider} 付 ${r}`);
    } else if (c.provider === input.winner) {
      scores[c.holder] -= 2 * r;
      scores[input.winner] += 2 * r;
      applied.push(`反承包叠加 ${c.holder} 付 ${2 * r}`);
    }
  }
  return { scores, applied };
}
