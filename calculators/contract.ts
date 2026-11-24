export interface ContractSettlementInput {
  original_payments: Record<string, number>;
  winner: string;
  contract_payer?: string;
  reverse_payer?: string;
  chain?: Array<{ payer: string; multiplier: 1 | 2 }>;
}

export function calculateContractSettlement(input: ContractSettlementInput): Record<string, number> {
  const total = Object.values(input.original_payments).reduce((a, b) => a + b, 0);
  const result: Record<string, number> = Object.fromEntries(Object.keys(input.original_payments).map((id) => [id, 0]));
  result[input.winner] = total;
  if (input.chain?.length) {
    result[input.winner] = total * (1 + input.chain.reduce((sum, x) => sum + x.multiplier, 0));
    for (const item of input.chain) result[item.payer] = -total * item.multiplier;
  } else if (input.contract_payer) {
    result[input.contract_payer] = -total;
  } else if (input.reverse_payer) {
    result[input.reverse_payer] = -total * 2;
  } else {
    for (const [id, amount] of Object.entries(input.original_payments)) result[id] = -amount;
  }
  return result;
}
