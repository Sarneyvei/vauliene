// Resolução de batalha espacial — módulo puro, usado no servidor
// (autoritativo) e reutilizável na interface para animar o relatório.

import { SHIP_MAP } from "./config";

export type ShipCounts = Record<string, number>;

export type BattleRound = {
  round: number;
  attackerDamage: number;
  defenderDamage: number;
  attackerHp: number;
  defenderHp: number;
};

export type BattleResult = {
  victory: boolean;
  rounds: BattleRound[];
  attackerLosses: ShipCounts;
  defenderLosses: ShipCounts;
  survivors: ShipCounts;
  attackerPower: number;
  defenderPower: number;
};

function power(ships: ShipCounts) {
  let atk = 0;
  let hp = 0;
  let def = 0;
  for (const [key, qty] of Object.entries(ships)) {
    const s = SHIP_MAP[key];
    if (!s || qty <= 0) continue;
    atk += s.attack * qty;
    def += s.defense * qty;
    hp += s.hp * qty;
  }
  return { atk, def, hp };
}

function distributeLosses(ships: ShipCounts, lossRatio: number): ShipCounts {
  const losses: ShipCounts = {};
  for (const [key, qty] of Object.entries(ships)) {
    if (qty <= 0) continue;
    losses[key] = Math.min(qty, Math.round(qty * lossRatio));
  }
  return losses;
}

export function simulateBattle(
  attacker: ShipCounts,
  defender: ShipCounts,
  bonus: { attack?: number; defense?: number } = {},
): BattleResult {
  const a = power(attacker);
  const d = power(defender);
  const attackBonus = 1 + (bonus.attack ?? 0);
  const defenseBonus = 1 + (bonus.defense ?? 0);

  const attackerAtk = a.atk * attackBonus;
  const defenderAtk = d.atk;
  const attackerEffHp = a.hp + a.def * defenseBonus * 0.6;
  const defenderEffHp = d.hp + d.def * 0.6;

  let aHp = attackerEffHp;
  let dHp = defenderEffHp;
  const rounds: BattleRound[] = [];

  for (let i = 1; i <= 6 && aHp > 0 && dHp > 0; i++) {
    const aDmg = attackerAtk * (0.85 + 0.3 * ((i * 37) % 10) / 10);
    const dDmg = defenderAtk * (0.85 + 0.3 * ((i * 53) % 10) / 10);
    dHp -= aDmg;
    aHp -= dDmg;
    rounds.push({
      round: i,
      attackerDamage: Math.round(aDmg),
      defenderDamage: Math.round(dDmg),
      attackerHp: Math.max(0, Math.round(aHp)),
      defenderHp: Math.max(0, Math.round(dHp)),
    });
  }

  const victory = dHp <= 0 && aHp > 0;
  const attackerLossRatio = attackerEffHp > 0 ? 1 - Math.max(0, aHp) / attackerEffHp : 1;
  const defenderLossRatio = defenderEffHp > 0 ? 1 - Math.max(0, dHp) / defenderEffHp : 1;

  const attackerLosses = distributeLosses(attacker, Math.min(1, Math.max(0, attackerLossRatio)));
  const defenderLosses = distributeLosses(defender, Math.min(1, Math.max(0, defenderLossRatio)));

  const survivors: ShipCounts = {};
  for (const [key, qty] of Object.entries(attacker)) {
    survivors[key] = Math.max(0, qty - (attackerLosses[key] ?? 0));
  }

  return {
    victory,
    rounds,
    attackerLosses,
    defenderLosses,
    survivors,
    attackerPower: Math.round(attackerAtk),
    defenderPower: Math.round(defenderAtk),
  };
}

export function totalShips(ships: ShipCounts) {
  return Object.values(ships).reduce((sum, q) => sum + (q || 0), 0);
}
