export interface CapPayment { payer: string; recipients: string[]; amount: number }
export interface CapDistributionInput { starting_net: number; floor: number; payments: CapPayment[] }
export interface CapDistributionOutput { allocations: Array<{ payer: string; recipient: string; amount: number }>; final_net: number }

export function calculateCapDistribution(input: CapDistributionInput): CapDistributionOutput {
  let remaining = Math.max(0, input.starting_net - input.floor);
  const allocations: CapDistributionOutput["allocations"] = [];
  for (const payment of input.payments) {
    if (remaining <= 0) break;
    const available = Math.min(payment.amount, remaining);
    const n = payment.recipients.length;
    const base = Math.floor(available / n);
    let remainder = available - base * n;
    for (const recipient of payment.recipients) {
      const amount = base + (remainder-- > 0 ? 1 : 0);
      allocations.push({ payer: payment.payer, recipient, amount });
    }
    remaining -= available;
  }
  return { allocations, final_net: input.starting_net - (Math.max(0, input.starting_net - input.floor) - remaining) };
}
