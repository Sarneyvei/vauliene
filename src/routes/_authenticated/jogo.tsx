import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import BattleReplay from "@/components/game/BattleReplay";
import { Galaxy3D, Planet3D } from "@/components/game/Scene3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as C from "@/game/config";
import {
  formatDuration,
  formatNumber,
  useBuildShips,
  useClaimMission,
  useCreateFleet,
  useCreateProfile,
  useDisbandFleet,
  useGameState,
  useNow,
  useRecallFleet,
  useSendFleet,
  useUpdateSettings,
  useUpgradeBuilding,
} from "@/hooks/useGame";
import { supabase } from "@/integrations/supabase/client";
import type { GameStateReady } from "@/lib/game.functions";

export const Route = createFileRoute("/_authenticated/jogo")({
  head: () => ({
    meta: [
      { title: "Centro de Comando — Galaxy Online IV" },
      {
        name: "description",
        content: "Gerencie recursos, estruturas, estaleiro, frotas e batalhas da sua colônia espacial.",
      },
      { property: "og:title", content: "Centro de Comando — Galaxy Online IV" },
      { property: "og:description", content: "Gerencie sua colônia, frotas e batalhas." },
    ],
  }),
  component: GamePage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function GamePage() {
  const { data, isLoading, error } = useGameState();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="animate-go4-pulse font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Sincronizando com o comando
        </span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="panel max-w-md p-6 text-center">
          <h1 className="font-display text-sm uppercase tracking-widest">Falha de comunicação</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!data?.initialized) return <Onboarding />;
  return <CommandCenter state={data} />;
}

function Onboarding() {
  const create = useCreateProfile();
  const [commanderName, setCommanderName] = useState("");
  const [planetName, setPlanetName] = useState("Nova Terra");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel-glow w-full max-w-lg p-7">
        <p className="font-display text-[10px] uppercase tracking-[0.4em] text-primary">Registro de comando</p>
        <h1 className="holo-title mt-3 text-2xl">Funde sua colônia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você receberá um sistema estelar com um planeta natal, dois mundos neutros e uma base inimiga.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ commanderName, planetName });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="cmd">Nome do comandante</Label>
            <Input
              id="cmd"
              required
              minLength={3}
              maxLength={20}
              value={commanderName}
              onChange={(e) => setCommanderName(e.target.value)}
              placeholder="Ex.: Sarney"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pl">Nome do planeta natal</Label>
            <Input
              id="pl"
              required
              minLength={3}
              maxLength={20}
              value={planetName}
              onChange={(e) => setPlanetName(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full font-display tracking-widest" disabled={create.isPending}>
            {create.isPending ? "Fundando..." : "Iniciar colônia"}
          </Button>
        </form>
      </div>
    </main>
  );
}

function CommandCenter({ state }: { state: GameStateReady }) {
  const navigate = useNavigate();
  const now = useNow();
  const quality = (state.profile.graphics_quality ?? "medium") as "low" | "medium" | "high";
  const levels = useMemo(() => {
    const map: Record<string, number> = {};
    for (const def of C.BUILDINGS) map[def.key] = 0;
    for (const b of state.buildings as Row[]) map[b.type] = b.level;
    return map;
  }, [state.buildings]);
  const structures = Object.values(levels).reduce((a, b) => a + b, 0);
  const nextXp = C.xpForNextLevel(state.profile.level);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-4">
      <header className="panel mb-4 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-primary">
            Galaxy Online IV
          </p>
          <h1 className="text-xl">{state.profile.commander_name}</h1>
          <p className="text-xs text-muted-foreground">
            Nível {state.profile.level} · {formatNumber(state.profile.xp)}/{formatNumber(nextXp)} XP
          </p>
          <Progress
            className="mt-2 h-1.5 w-40"
            value={Math.min(100, (state.profile.xp / Math.max(1, nextXp)) * 100)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {C.RESOURCES.map((r) => (
            <div key={r.key} className="rounded border border-border/60 px-3 py-2">
              <p className="font-display text-[10px] uppercase tracking-widest" style={{ color: r.color }}>
                {r.label}
              </p>
              <p className="text-sm">{formatNumber(Number(state.planet[r.key]))}</p>
              <p className="text-[10px] text-muted-foreground">
                {r.key === "energy"
                  ? `${state.production.energy >= 0 ? "+" : ""}${formatNumber(state.production.energy)} líq.`
                  : `+${formatNumber(state.production[r.key])}/h`}
              </p>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
        >
          Sair
        </Button>
      </header>

      {state.production.efficiency < 1 && (
        <p className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
          Energia insuficiente: produção reduzida em 50%. Aumente a Usina de Energia.
        </p>
      )}

      <Tabs defaultValue="planeta">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="planeta">Planeta</TabsTrigger>
          <TabsTrigger value="construcoes">Construções</TabsTrigger>
          <TabsTrigger value="estaleiro">Estaleiro</TabsTrigger>
          <TabsTrigger value="frotas">Frotas</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="batalhas">Batalhas</TabsTrigger>
          <TabsTrigger value="missoes">Missões</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="planeta" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="panel h-[360px] overflow-hidden sm:h-[460px]">
              <Planet3D name={state.planet.name} structures={structures} quality={quality} />
            </div>
            <div className="panel space-y-3 p-5">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">
                {state.planet.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Capacidade de armazenamento: {formatNumber(state.capacity)} por recurso.
              </p>
              <div className="space-y-1 text-xs">
                <p>Energia gerada: {formatNumber(state.production.energyOut)}/h</p>
                <p>Energia consumida: {formatNumber(state.production.energyUse)}/h</p>
                <p>Estruturas (níveis somados): {structures}</p>
                <p>Naves no hangar: {(state.hangar as Row[]).reduce((s, h) => s + h.quantity, 0)}</p>
                <p>Frotas ativas: {(state.fleets as Row[]).length}</p>
              </div>
              <div className="pt-2">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                  Obras em andamento
                </p>
                {(state.buildings as Row[]).filter((b) => b.upgrade_finishes_at).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma obra ativa.</p>
                ) : (
                  (state.buildings as Row[])
                    .filter((b) => b.upgrade_finishes_at)
                    .map((b) => (
                      <p key={b.id} className="text-xs">
                        {C.BUILDING_MAP[b.type]?.name} → nível {b.level + 1} em{" "}
                        {formatDuration(Date.parse(b.upgrade_finishes_at) - now)}
                      </p>
                    ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="construcoes" className="mt-4">
          <BuildingsPanel state={state} now={now} />
        </TabsContent>

        <TabsContent value="estaleiro" className="mt-4">
          <ShipyardPanel state={state} now={now} levels={levels} />
        </TabsContent>

        <TabsContent value="frotas" className="mt-4">
          <FleetsPanel state={state} now={now} />
        </TabsContent>

        <TabsContent value="mapa" className="mt-4">
          <MapPanel state={state} quality={quality} />
        </TabsContent>

        <TabsContent value="batalhas" className="mt-4">
          <div className="space-y-4">
            {(state.battles as Row[]).length === 0 && (
              <p className="panel p-5 text-sm text-muted-foreground">
                Nenhum relatório de combate ainda. Envie uma frota pelo mapa.
              </p>
            )}
            {(state.battles as Row[]).map((b) => (
              <div key={b.id} className="panel p-5">
                <BattleReplay
                  targetName={b.target_name}
                  victory={b.victory}
                  shipsSent={b.ships_sent ?? {}}
                  shipsLost={b.ships_lost ?? {}}
                  enemyShips={b.enemy_ships ?? {}}
                  loot={b.loot ?? {}}
                  xp={b.xp_gained}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="missoes" className="mt-4">
          <MissionsPanel state={state} />
        </TabsContent>

        <TabsContent value="ajustes" className="mt-4">
          <SettingsPanel state={state} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

type StateProp = { state: any; now?: number };

function BuildingsPanel({ state, now }: { state: any; now: number }) {
  const upgrade = useUpgradeBuilding();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {C.BUILDINGS.map((def) => {
        const row = (state.buildings as Row[]).find((b) => b.type === def.key);
        const level = row?.level ?? 0;
        const busy = Boolean(row?.upgrade_finishes_at);
        const cost = C.buildingCost(def, level + 1);
        const seconds = C.buildingSeconds(def, level + 1);
        const affordable =
          Number(state.planet.metal) >= cost.metal &&
          Number(state.planet.crystal) >= cost.crystal &&
          Number(state.planet.gas) >= cost.gas;
        return (
          <article key={def.key} className="panel flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-sm uppercase tracking-[0.15em] text-primary">{def.name}</h3>
              <span className="rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                Nv {level}
              </span>
            </div>
            <p className="mt-2 flex-1 text-xs text-muted-foreground">{def.description}</p>
            {def.produces && (
              <p className="mt-2 text-xs text-success">
                Produz {def.produces.perHour}/h de {def.produces.resource} por nível
              </p>
            )}
            {def.energyUse && <p className="text-xs text-warning">Consome {def.energyUse} energia/nível</p>}
            <div className="mt-3 space-y-1 text-xs">
              <p>
                Custo: {formatNumber(cost.metal)} metal · {formatNumber(cost.crystal)} cristal ·{" "}
                {formatNumber(cost.gas)} gás
              </p>
              <p className="text-muted-foreground">Tempo: {formatDuration(seconds * 1000)}</p>
            </div>
            {busy ? (
              <Button className="mt-4" disabled variant="secondary">
                Em obras · {formatDuration(Date.parse(row!.upgrade_finishes_at) - now)}
              </Button>
            ) : (
              <Button
                className="mt-4 font-display tracking-widest"
                disabled={!affordable || level >= def.maxLevel || upgrade.isPending}
                onClick={() => upgrade.mutate({ buildingKey: def.key })}
              >
                {level >= def.maxLevel ? "Nível máximo" : level === 0 ? "Construir" : "Melhorar"}
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ShipyardPanel({ state, now, levels }: { state: any; now: number; levels: Record<string, number> }) {
  const build = useBuildShips();
  const [qty, setQty] = useState<Record<string, number>>({});
  const shipyardLevel = levels["shipyard"] ?? 0;

  return (
    <div className="space-y-4">
      {shipyardLevel < 1 && (
        <p className="panel p-4 text-sm text-warning">
          Construa o Estaleiro na aba Construções para produzir naves.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {C.SHIPS.map((def) => {
          const inHangar = (state.hangar as Row[]).find((h) => h.ship_type === def.key)?.quantity ?? 0;
          const amount = qty[def.key] ?? 1;
          const cost = {
            metal: def.cost.metal * amount,
            crystal: def.cost.crystal * amount,
            gas: def.cost.gas * amount,
          };
          const affordable =
            Number(state.planet.metal) >= cost.metal &&
            Number(state.planet.crystal) >= cost.crystal &&
            Number(state.planet.gas) >= cost.gas;
          return (
            <article key={def.key} className="panel flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-sm uppercase tracking-[0.15em] text-primary">{def.name}</h3>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Hangar: {inHangar}
                </span>
              </div>
              <p className="mt-2 flex-1 text-xs text-muted-foreground">{def.description}</p>
              <p className="mt-2 text-xs">
                Ataque {def.attack} · Defesa {def.defense} · Casco {def.hp} · Carga {def.capacity}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatNumber(cost.metal)} metal · {formatNumber(cost.crystal)} cristal ·{" "}
                {formatNumber(cost.gas)} gás · {formatDuration(C.shipSeconds(def.key, shipyardLevel) * amount * 1000)}
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={amount}
                  onChange={(e) =>
                    setQty({ ...qty, [def.key]: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })
                  }
                  className="w-20"
                />
                <Button
                  className="flex-1 font-display tracking-widest"
                  disabled={shipyardLevel < 1 || !affordable || build.isPending}
                  onClick={() => build.mutate({ shipType: def.key, quantity: amount })}
                >
                  Construir
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Fila de produção</h3>
        {(state.shipQueue as Row[]).length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Estaleiro livre.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs">
            {(state.shipQueue as Row[]).map((q) => (
              <li key={q.id}>
                {q.quantity}× {C.SHIP_MAP[q.ship_type]?.name ?? q.ship_type} — pronto em{" "}
                {formatDuration(Date.parse(q.finishes_at) - now)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FleetsPanel({ state, now }: { state: any; now: number }) {
  const createFleet = useCreateFleet();
  const disband = useDisbandFleet();
  const recall = useRecallFleet();
  const [name, setName] = useState("Esquadrão Alfa");
  const [commanderId, setCommanderId] = useState<string>(state.commanders[0]?.id ?? "");
  const [ships, setShips] = useState<Record<string, number>>({});
  const totalShips = Object.values(ships).reduce((sum, q) => sum + (q || 0), 0);


  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <div className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Formar frota</h3>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fname">Nome</Label>
            <Input id="fname" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Comandante</Label>
            <div className="grid gap-2">
              {(state.commanders as Row[]).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCommanderId(c.id)}
                  className={`rounded border p-3 text-left text-xs transition-colors ${
                    commanderId === c.id ? "border-primary bg-primary/10" : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <p className="font-display uppercase tracking-widest">
                    {c.name} · Nv {c.level}
                  </p>
                  <p className="text-muted-foreground">
                    {c.skill_name} — {c.skill_description}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    ATQ {c.attack} · DEF {c.defense} · EXP {c.exploration}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Naves do hangar</Label>
            {C.SHIPS.map((def) => {
              const available = (state.hangar as Row[]).find((h) => h.ship_type === def.key)?.quantity ?? 0;
              return (
                <div key={def.key} className="flex items-center gap-2 text-xs">
                  <span className="w-24">{def.name}</span>
                  <span className="text-muted-foreground">({available})</span>
                  <Input
                    type="number"
                    min={0}
                    max={available}
                    value={ships[def.key] ?? 0}
                    onChange={(e) =>
                      setShips({
                        ...ships,
                        [def.key]: Math.max(0, Math.min(available, Number(e.target.value) || 0)),
                      })
                    }
                    className="h-8 w-20"
                  />
                </div>
              );
            })}
          </div>
          {totalShips === 0 && (
            <p className="text-xs text-muted-foreground">
              Escolha a quantidade de pelo menos uma nave para formar a frota.
            </p>
          )}
          <Button
            className="w-full font-display tracking-widest"
            disabled={!commanderId || totalShips === 0 || createFleet.isPending}
            onClick={() => createFleet.mutate({ name, commanderId, ships })}
          >
            Criar frota
          </Button>

        </div>
      </div>

      <div className="space-y-3">
        {(state.fleets as Row[]).length === 0 && (
          <p className="panel p-5 text-sm text-muted-foreground">Nenhuma frota formada.</p>
        )}
        {(state.fleets as Row[]).map((f) => {
          const ships = (state.fleetShips as Row[]).filter((s) => s.fleet_id === f.id);
          const commander = (state.commanders as Row[]).find((c) => c.id === f.commander_id);
          const target = (state.bodies as Row[]).find((b) => b.id === f.target_body_id);
          return (
            <div key={f.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-sm uppercase tracking-[0.15em]">{f.name}</h4>
                <span className="rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                  {f.status === "idle" ? "Na base" : f.status === "traveling" ? "Em rota" : "Retornando"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {commander ? commander.name : "Sem comandante"}
                {target ? ` → ${target.name}` : ""}
              </p>
              <p className="mt-2 text-xs">
                {ships.length
                  ? ships.map((s) => `${s.quantity}× ${C.SHIP_MAP[s.ship_type]?.name ?? s.ship_type}`).join(" · ")
                  : "Sem naves"}
              </p>
              {f.arrives_at && (
                <p className="mt-1 text-xs text-primary">
                  Chega em {formatDuration(Date.parse(f.arrives_at) - now)}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                {f.status === "idle" ? (
                  <Button size="sm" variant="outline" onClick={() => disband.mutate({ fleetId: f.id })}>
                    Desfazer
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => recall.mutate({ fleetId: f.id })}>
                    Recolher
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapPanel({ state, quality }: { state: any; quality: "low" | "medium" | "high" }) {
  const send = useSendFleet();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fleetId, setFleetId] = useState<string>("");
  const body = (state.bodies as Row[]).find((b) => b.id === selectedId);
  const idleFleets = (state.fleets as Row[]).filter((f) => f.status === "idle");

  const counts: Record<string, number> = {};
  const chosen = idleFleets.find((f) => f.id === fleetId);
  if (chosen) {
    for (const s of (state.fleetShips as Row[]).filter((s) => s.fleet_id === chosen.id)) {
      counts[s.ship_type] = s.quantity;
    }
  }
  const travel =
    body && chosen ? C.travelSeconds(Number(body.distance), counts) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="panel h-[380px] overflow-hidden sm:h-[520px]">
        <Galaxy3D
          bodies={state.bodies as any}
          selectedId={selectedId}
          onSelect={setSelectedId}
          quality={quality}
        />
      </div>
      <div className="panel space-y-3 p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Ordem de viagem</h3>
        {!body ? (
          <p className="text-xs text-muted-foreground">Clique em um corpo do mapa para selecionar o destino.</p>
        ) : (
          <div className="space-y-1 text-xs">
            <p className="font-display uppercase tracking-widest">{body.name}</p>
            <p className="text-muted-foreground">
              Tipo:{" "}
              {body.owner_type === "player" ? "Seu planeta" : body.owner_type === "enemy" ? "Hostil" : "Neutro"} ·
              Distância {body.distance}
            </p>
            {body.owner_type === "enemy" && (
              <p className="text-destructive">
                Defesas:{" "}
                {Object.entries(body.defense ?? {})
                  .map(([k, q]) => `${q}× ${C.SHIP_MAP[k]?.name ?? k}`)
                  .join(" · ") || "nenhuma"}
              </p>
            )}
            <p className="text-success">
              Espólio estimado: {formatNumber(body.loot?.metal ?? 0)} metal ·{" "}
              {formatNumber(body.loot?.crystal ?? 0)} cristal · {formatNumber(body.loot?.gas ?? 0)} gás
              {body.cleared ? " (já saqueado)" : ""}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Frota</Label>
          {idleFleets.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma frota disponível na base.</p>
          ) : (
            idleFleets.map((f) => (
              <button
                key={f.id}
                onClick={() => setFleetId(f.id)}
                className={`w-full rounded border p-2 text-left text-xs transition-colors ${
                  fleetId === f.id ? "border-primary bg-primary/10" : "border-border/60 hover:bg-muted/40"
                }`}
              >
                {f.name}
              </button>
            ))
          )}
        </div>

        {travel !== null && (
          <p className="text-xs text-primary">Tempo de viagem: {formatDuration(travel * 1000)}</p>
        )}

        <Button
          className="w-full font-display tracking-widest"
          disabled={!body || !fleetId || body?.owner_type === "player" || send.isPending}
          onClick={() => body && send.mutate({ fleetId, bodyId: body.id })}
        >
          Enviar frota
        </Button>
      </div>
    </div>
  );
}

function MissionsPanel({ state }: { state: any }) {
  const claim = useClaimMission();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {C.MISSIONS.map((def) => {
        const row = (state.missions as Row[]).find((m) => m.mission_key === def.key);
        const progress = row?.progress ?? 0;
        return (
          <article key={def.key} className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm uppercase tracking-[0.15em] text-primary">{def.name}</h3>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {progress}/{def.goal}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{def.description}</p>
            <Progress className="mt-3 h-1.5" value={(progress / def.goal) * 100} />
            <p className="mt-3 text-xs">
              Recompensa: {formatNumber(def.reward.metal)} metal · {formatNumber(def.reward.crystal)} cristal ·{" "}
              {formatNumber(def.reward.gas)} gás · {def.reward.xp} XP
            </p>
            <Button
              className="mt-3 w-full"
              variant={row?.claimed ? "secondary" : "default"}
              disabled={!row?.completed || row?.claimed || claim.isPending}
              onClick={() => claim.mutate({ missionKey: def.key })}
            >
              {row?.claimed ? "Recebida" : row?.completed ? "Receber recompensa" : "Em andamento"}
            </Button>
          </article>
        );
      })}
    </div>
  );
}

function SettingsPanel({ state }: { state: any }) {
  const update = useUpdateSettings();
  const [planetName, setPlanetName] = useState(state.planet.name);
  const quality = state.profile.graphics_quality ?? "medium";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Qualidade gráfica</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Reduza para melhorar o desempenho em máquinas mais simples.
        </p>
        <div className="mt-3 flex gap-2">
          {(["low", "medium", "high"] as const).map((q) => (
            <Button
              key={q}
              size="sm"
              variant={quality === q ? "default" : "outline"}
              onClick={() => update.mutate({ graphicsQuality: q })}
            >
              {q === "low" ? "Baixa" : q === "medium" ? "Média" : "Alta"}
            </Button>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Nome do planeta</h3>
        <div className="mt-3 flex gap-2">
          <Input value={planetName} maxLength={20} onChange={(e) => setPlanetName(e.target.value)} />
          <Button disabled={update.isPending} onClick={() => update.mutate({ planetName })}>
            Salvar
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Todo o progresso é salvo automaticamente no servidor a cada ação.
        </p>
      </div>
    </div>
  );
}

export type { StateProp };
