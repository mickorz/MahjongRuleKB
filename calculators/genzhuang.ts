export interface GenZhuangInput { dice: [number, number]; first_player: string; other_players: string[] }
export function calculateGenZhuangPayment(input: GenZhuangInput): Record<string, number> {
  const sum = input.dice[0] + input.dice[1];
  if (!input.dice.every((n) => Number.isInteger(n) && n >= 1 && n <= 6)) throw new Error("骰子必须在 1 到 6 之间");
  const amount = sum * 3;
  return Object.fromEntries([[input.first_player, -amount], ...input.other_players.map((id) => [id, sum])]);
}
