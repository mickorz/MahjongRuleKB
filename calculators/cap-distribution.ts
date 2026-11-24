// 拖底后的可赔分分配（XS-P-TUODI-KEPEIFEN）
// 规则：
// - 可赔分 = max(0, 局前累计净分 + 200)，下限 floor 一般为 -200
// - 同一玩家本小局多笔扣分按发生顺序，每笔分配额 = min(该笔原应付, 剩余可赔)，然后扣减余额
// - 只有一名赢家时分配额全给该赢家
// - 一笔由三家收时，分配额先除以 3 向下取整，三家各得该整数；余下 1 或 2 分从扣分座位起按逆时针依次 +1
// - 余额用尽后后续各笔分配 0，该玩家最终净分 = floor

export interface CapPayment {
  /** 扣分玩家 */
  payer: string;
  /** 收分玩家，按从扣分座位起逆时针顺序 */
  recipients: string[];
  /** 该笔原应付总额 */
  amount: number;
}

export interface CapDistributionInput {
  /** 局前累计净分（含局中跟庄已入账部分） */
  starting_net: number;
  /** 拖底下限，默认 -200 */
  floor?: number;
  /** 本小局该玩家的各笔扣分，按发生顺序 */
  payments: CapPayment[];
}

export interface CapDistributionOutput {
  allocations: Array<{ payer: string; recipient: string; amount: number }>;
  /** 实际支付合计 */
  total_allocated: number;
  /** 分配后最终净分：触发拖底时等于 floor，未触发时为实际净分 */
  final_net: number;
  /** 分配前的实际净分（= 局前净分 − 各笔原应付合计；小结算和局末飘分用这份） */
  actual_net: number;
  /** 是否触发拖底 */
  triggered: boolean;
}

export function calculateCapDistribution(input: CapDistributionInput): CapDistributionOutput {
  const floor = input.floor ?? -200;
  // 可赔分 = max(0, 局前累计净分 − floor)，例：局前 −190 时为 10
  const cap = Math.max(0, input.starting_net - floor);
  let remaining = cap;
  const allocations: CapDistributionOutput["allocations"] = [];
  let totalAllocated = 0;

  for (const payment of input.payments) {
    if (remaining <= 0) break;
    const distributable = Math.min(payment.amount, remaining);
    if (distributable <= 0) continue;
    const n = payment.recipients.length;
    if (n === 1) {
      allocations.push({ payer: payment.payer, recipient: payment.recipients[0], amount: distributable });
    } else {
      const base = Math.floor(distributable / n);
      let remainder = distributable - base * n;
      for (const recipient of payment.recipients) {
        const amount = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        if (amount > 0) allocations.push({ payer: payment.payer, recipient, amount });
      }
    }
    remaining -= distributable;
    totalAllocated += distributable;
  }

  // 实际净分 = 局前净分 − 本小局各笔原应付合计（全额入账，局中不截断）
  const actualNet = input.starting_net - input.payments.reduce((sum, p) => sum + p.amount, 0);
  const triggered = actualNet <= floor;
  return {
    allocations,
    total_allocated: totalAllocated,
    final_net: triggered ? floor : actualNet,
    actual_net: actualNet,
    triggered,
  };
}
