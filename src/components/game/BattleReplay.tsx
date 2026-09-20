import { useEffect, useMemo, useState } from "react";

import { simulateBattle, totalShips, type ShipCounts } from "@/game/battle";
import { SHIP_MAP } from "@/game/config";
import { formatNumber } from "@/hooks/useGame";

type Props = {
  targetName: string;
  victory: boolean;
  shipsSent: ShipCounts;
  shipsLost: ShipCounts;
  enemyShips: ShipCounts;
  loot: { metal?: number; crystal?: number; gas?: number };
  xp: number;
};

/** Reproduz o combate rodada a rodada a partir dos dados salvos no servidor. */
export default function BattleReplay({
  targetName,
  victory,
  shipsSent,
  shipsLost,
  enemyShips,
  loot,
  xp,
}: Props) {
  const result = useMemo(
    () => (totalShips(enemyShips) > 0 ? simulateBattle(shipsSent, enemyShips) : null),
    [shipsSent, enemyShips],
  );
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!result) return;
    setVisible(0);
    const id = setInterval(() => {
      setVisible((v) => (v >= result.rounds.length ? v : v + 1));
    }, 550);
    return () => clearInterval(id);
  }, [result]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm uppercase tracking-[0.2em]">{targetName}</h3>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-widest ${
            victory ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
          }`}
        >
          {victory ? "Vitória" : "Derrota"}
        </span>
      </header>

      {result ? (
        <div className="space-y-2">
          {result.rounds.slice(0, visible).map((r) => (
            <div key={r.round} className="rounded border border-border/60 bg-background/40 p-2 text-xs">
              <div className="mb-1 flex justify-between font-display uppercase tracking-widest text-muted-foreground">
                <span>Rodada {r.round}</span>
                <span>
                  −{formatNumber(r.attackerDamage)} inimigo / −{formatNumber(r.defenderDamage)} aliado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, (r.attackerHp / (result.rounds[0]?.attackerHp || 1)) * 100)}%` }}
                  />
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full bg-destructive transition-all duration-500"
                    style={{ width: `${Math.min(100, (r.defenderHp / (result.rounds[0]?.defenderHp || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Missão de exploração — nenhuma resistência encontrada no destino.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-border/60 p-2">
          <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Enviadas</p>
          {Object.entries(shipsSent).map(([k, q]) => (
            <p key={k} className="text-xs">
              {SHIP_MAP[k]?.name ?? k}: {q}
            </p>
          ))}
        </div>
        <div className="rounded border border-border/60 p-2">
          <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Perdas</p>
          {totalShips(shipsLost) === 0 ? (
            <p className="text-xs text-success">Nenhuma</p>
          ) : (
            Object.entries(shipsLost).map(([k, q]) => (
              <p key={k} className="text-xs text-destructive">
                {SHIP_MAP[k]?.name ?? k}: {q}
              </p>
            ))
          )}
        </div>
        <div className="rounded border border-border/60 p-2">
          <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Espólio</p>
          <p className="text-xs">Metal: {formatNumber(loot.metal ?? 0)}</p>
          <p className="text-xs">Cristal: {formatNumber(loot.crystal ?? 0)}</p>
          <p className="text-xs">Gás: {formatNumber(loot.gas ?? 0)}</p>
          <p className="text-xs text-primary">XP: {xp}</p>
        </div>
      </div>
    </div>
  );
}
