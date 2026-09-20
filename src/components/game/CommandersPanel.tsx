import { Progress } from "@/components/ui/progress";
import * as C from "@/game/config";
import { formatNumber } from "@/hooks/useGame";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const ATTRS = [
  { key: "attack", label: "Ataque" },
  { key: "defense", label: "Defesa" },
  { key: "command", label: "Comando" },
  { key: "engineering", label: "Engenharia" },
  { key: "exploration", label: "Exploração" },
] as const;

/** Ficha dos comandantes: atributos, habilidade e frota associada. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CommandersPanel({ state }: { state: any }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(state.commanders as Row[]).map((c) => {
        const def = C.COMMANDERS.find((d) => d.key === c.key);
        const accent = def?.accent ?? "#7ad7ff";
        const fleet = (state.fleets as Row[]).find((f) => f.commander_id === c.id);
        const nextXp = C.xpForNextLevel(c.level);
        return (
          <article key={c.id} className="panel flex flex-col p-5">
            <div
              className="grid-floor mb-4 flex h-28 items-center justify-center rounded border"
              style={{ borderColor: `${accent}55`, background: `radial-gradient(circle at 50% 120%, ${accent}33, transparent 70%)` }}
            >
              <span className="font-display text-3xl tracking-[0.25em]" style={{ color: accent }}>
                {c.name.replace(/^Comandante\s+/i, "").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <h3 className="font-display text-sm uppercase tracking-[0.15em]" style={{ color: accent }}>
              {c.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Nível {c.level} · {formatNumber(c.xp)}/{formatNumber(nextXp)} XP
            </p>
            <Progress className="mt-2 h-1.5" value={Math.min(100, (c.xp / Math.max(1, nextXp)) * 100)} />

            <div className="mt-4 space-y-1.5">
              {ATTRS.map((a) => (
                <div key={a.key} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 text-muted-foreground">{a.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full"
                      style={{ width: `${Math.min(100, (c[a.key] / 40) * 100)}%`, background: accent }}
                    />
                  </div>
                  <span className="w-6 text-right">{c[a.key]}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex-1 rounded border border-border/60 p-3">
              <p className="font-display text-[10px] uppercase tracking-widest text-primary">
                {c.skill_name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.skill_description}</p>
            </div>

            <p className="mt-3 text-xs">
              Frota:{" "}
              {fleet ? (
                <span className="text-primary">{fleet.name}</span>
              ) : (
                <span className="text-muted-foreground">sem frota associada</span>
              )}
            </p>
          </article>
        );
      })}
    </div>
  );
}
