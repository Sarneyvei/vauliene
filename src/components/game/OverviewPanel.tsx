import * as C from "@/game/config";
import { formatDuration, formatNumber } from "@/hooks/useGame";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  now: number;
};

/** Resumo do império: comandante, recursos, produção e tudo em andamento. */
export default function OverviewPanel({ state, now }: Props) {
  const works = (state.buildings as Row[]).filter((b) => b.upgrade_finishes_at);
  const queue = state.shipQueue as Row[];
  const travelling = (state.fleets as Row[]).filter((f) => f.status !== "idle");
  const nextMission = C.MISSIONS.map((def) => ({
    def,
    row: (state.missions as Row[]).find((m) => m.mission_key === def.key),
  })).find((m) => !m.row?.claimed);
  const hangarTotal = (state.hangar as Row[]).reduce((s, h) => s + h.quantity, 0);
  const lastBattle = (state.battles as Row[])[0];
  const nextXp = C.xpForNextLevel(state.profile.level);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <article className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Comando</h3>
        <p className="mt-3 text-lg">{state.profile.commander_name}</p>
        <p className="text-xs text-muted-foreground">
          Nível {state.profile.level} · {formatNumber(state.profile.xp)}/{formatNumber(nextXp)} XP
        </p>
        <div className="mt-3 space-y-1 text-xs">
          <p>Planeta: {state.planet.name}</p>
          <p>Naves no hangar: {hangarTotal}</p>
          <p>Frotas: {(state.fleets as Row[]).length}</p>
          <p>Comandantes: {(state.commanders as Row[]).length}</p>
        </div>
      </article>

      <article className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Economia</h3>
        <div className="mt-3 space-y-1.5 text-xs">
          {C.RESOURCES.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-2">
              <span style={{ color: r.color }}>{r.label}</span>
              <span>
                {formatNumber(Number(state.planet[r.key]))}
                {r.key === "energy"
                  ? ` · ${state.production.energy >= 0 ? "+" : ""}${formatNumber(state.production.energy)} líq.`
                  : ` · +${formatNumber(state.production[r.key])}/h`}
              </span>
            </div>
          ))}
          <p className="pt-2 text-muted-foreground">
            Capacidade: {formatNumber(state.capacity)} por recurso
          </p>
          <p className="text-muted-foreground">
            Energia: {formatNumber(state.production.energyOut)}/h gerada ·{" "}
            {formatNumber(state.production.energyUse)}/h consumida
          </p>
        </div>
      </article>

      <article className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Em andamento</h3>
        <div className="mt-3 space-y-2 text-xs">
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">Obras</p>
            {works.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma obra ativa.</p>
            ) : (
              works.map((b) => (
                <p key={b.id}>
                  {C.BUILDING_MAP[b.type]?.name} → Nv {b.level + 1} em{" "}
                  {formatDuration(Date.parse(b.upgrade_finishes_at) - now)}
                </p>
              ))
            )}
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
              Estaleiro
            </p>
            {queue.length === 0 ? (
              <p className="text-muted-foreground">Estaleiro livre.</p>
            ) : (
              queue.map((q) => (
                <p key={q.id}>
                  {q.quantity}× {C.SHIP_MAP[q.ship_type]?.name ?? q.ship_type} em{" "}
                  {formatDuration(Date.parse(q.finishes_at) - now)}
                </p>
              ))
            )}
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">Frotas</p>
            {travelling.length === 0 ? (
              <p className="text-muted-foreground">Todas as frotas na base.</p>
            ) : (
              travelling.map((f) => (
                <p key={f.id}>
                  {f.name} — {f.status === "traveling" ? "em rota" : "retornando"}
                  {f.arrives_at ? ` · ${formatDuration(Date.parse(f.arrives_at) - now)}` : ""}
                </p>
              ))
            )}
          </div>
        </div>
      </article>

      <article className="panel p-5 lg:col-span-2">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Próximo objetivo</h3>
        {nextMission ? (
          <div className="mt-3 text-xs">
            <p className="font-display uppercase tracking-widest">{nextMission.def.name}</p>
            <p className="mt-1 text-muted-foreground">{nextMission.def.description}</p>
            <p className="mt-2">
              Progresso: {nextMission.row?.progress ?? 0}/{nextMission.def.goal}
              {nextMission.row?.completed ? " · recompensa disponível na aba Missões" : ""}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-success">
            Todas as missões da Fase 1 concluídas. Continue expandindo a colônia.
          </p>
        )}
      </article>

      <article className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Último relatório</h3>
        {lastBattle ? (
          <div className="mt-3 text-xs">
            <p className="font-display uppercase tracking-widest">{lastBattle.target_name}</p>
            <p className={lastBattle.victory ? "text-success" : "text-destructive"}>
              {lastBattle.victory ? "Vitória" : "Derrota"} · {lastBattle.xp_gained} XP
            </p>
            <p className="mt-1 text-muted-foreground">
              {new Date(lastBattle.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Nenhuma operação registrada ainda.</p>
        )}
      </article>
    </div>
  );
}
