// 跟庄赔付（XS-R-RUAN-GEN、XS-F-GENZHUANG-PEIFU）
// 规则：跟庄成立后重掷两颗骰子，S = d1 + d2；该圈首出者 −3S，其余三家各 +S
export interface GenZhuangInput {
  /** 跟庄成立后重掷的两颗骰子 */
  dice: [number, number];
  /** 该圈首出者座位 */
  first_player: string;
  /** 其余三家座位 */
  other_players: string[];
}

export function calculateGenZhuangPayment(input: GenZhuangInput): Record<string, number> {
  const [d1, d2] = input.dice;
  if (![d1, d2].every((n) => Number.isInteger(n) && n >= 1 && n <= 6)) throw new Error("骰子点数必须在 1 到 6 之间");
  if (input.other_players.length !== 3) throw new Error("四人局跟庄需要其余三家座位");
  const s = d1 + d2;
  return {
    [input.first_player]: -3 * s,
    ...Object.fromEntries(input.other_players.map((p) => [p, s])),
  };
}

// 跟庄成立判定（XS-R-RUAN-GEN）：第 1-3 张实际牌面相同，第 4 张相同或为本局实际财神
export interface GenZhuangCheckInput {
  /** 四张弃牌的实际牌面，按行牌方向 */
  tiles: string[];
  /** 本局实际财神牌面 */
  joker: string;
}

export function isGenZhuangEstablished(input: GenZhuangCheckInput): boolean {
  if (input.tiles.length !== 4) throw new Error("跟庄判定需要四张弃牌");
  const [a, b, c, d] = input.tiles;
  return a === b && a === c && (d === a || d === input.joker);
}
