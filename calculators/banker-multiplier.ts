// 庄闲倍率与基础算分（HJ-F-BANK、HJ-F-ORIGINAL、XS-F-BANK、XS-F-HU）
export type RulesetId = "hangzhou-friends-4p" | "xiaoshan-friends-4p";

export interface BankerMultiplierInput {
  ruleset_id: RulesetId;
  winner_is_banker: boolean;
  payer_is_banker: boolean;
  /** 萧山必填：本局实际牢数，倍率 = 2^牢数 */
  banker_level?: number;
}

/** 单笔庄闲倍率：庄闲之间按倍率，闲闲之间为 1（HJ-F-BANK、XS-F-BANK） */
export function calculateBankerMultiplier(input: BankerMultiplierInput): number {
  if (!input.winner_is_banker && !input.payer_is_banker) return 1;
  // 杭州笃三老庄：庄家倍率固定 8
  if (input.ruleset_id === "hangzhou-friends-4p") return 8;
  // 萧山：庄闲倍率 = 2^本局实际牢数
  if (!Number.isInteger(input.banker_level) || (input.banker_level ?? -1) < 0) {
    throw new Error("萧山庄闲倍率需要非负整数 banker_level");
  }
  return 2 ** input.banker_level!;
}

export interface SettleInput {
  ruleset_id: RulesetId;
  winner_is_banker: boolean;
  win_type: "self_draw" | "discard";
  fan_multiplier: number;
  banker_level?: number;
  base_score?: number;
}

export interface SettleOutput {
  /** 赢家本局净得分 */
  winner_score: number;
  /** 三名对手本局净得分，按座位顺序 */
  other_scores: number[];
}

/**
 * 无承包时的基础结算（HJ-P-ZIMO、HJ-P-DIANPAO、XS-F-HU）
 * 自摸：三笔原应赔分各自按庄闲倍率计算，赢家收合计
 * 点炮：只有放铳者付一笔
 */
export function calculateBaseSettlement(input: SettleInput): SettleOutput {
  const base = input.base_score ?? 1;
  const fan = input.fan_multiplier;
  const bankerMult = calculateBankerMultiplier({
    ruleset_id: input.ruleset_id,
    winner_is_banker: input.winner_is_banker,
    payer_is_banker: true,
    banker_level: input.banker_level,
  });
  const singleLedger = base * fan;
  const relationMult = (payerIsBanker: boolean) =>
    calculateBankerMultiplier({
      ruleset_id: input.ruleset_id,
      winner_is_banker: input.winner_is_banker,
      payer_is_banker: payerIsBanker,
      banker_level: input.banker_level,
    });

  if (input.win_type === "discard") {
    // 庄闲之间点炮：放铳者一笔 = 底分 × 番型 × 庄闲倍率
    const p = singleLedger * relationMult(!input.winner_is_banker);
    return { winner_score: p, other_scores: [-p, 0, 0] };
  }

  // 自摸：三个对手各一笔
  const payments = input.winner_is_banker
    ? [singleLedger * relationMult(false), singleLedger * relationMult(false), singleLedger * relationMult(false)]
    : [singleLedger * relationMult(true), singleLedger * relationMult(false), singleLedger * relationMult(false)];
  return { winner_score: payments.reduce((a, b) => a + b, 0), other_scores: payments.map((p) => -p) };
}
