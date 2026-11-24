export interface BankerMultiplierInput {
  ruleset_id: "hangzhou-friends-4p" | "xiaoshan-friends-4p";
  winner_is_banker: boolean;
  payer_is_banker: boolean;
  banker_level?: number;
}

export function calculateBankerMultiplier(input: BankerMultiplierInput): number {
  if (!input.winner_is_banker && !input.payer_is_banker) return 1;
  if (input.ruleset_id === "hangzhou-friends-4p") return 8;
  if (!Number.isInteger(input.banker_level) || input.banker_level! < 1) throw new Error("萧山庄家牢数必须是正整数");
  return 2 ** input.banker_level!;
}
