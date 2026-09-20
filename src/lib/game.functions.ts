// Núcleo de regras do jogo — executado apenas no servidor.
// Toda alteração de estado passa por aqui: o cliente nunca decide custos,
// tempos ou resultados de batalha.

import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as C from "@/game/config";
import { simulateBattle, totalShips, type ShipCounts } from "@/game/battle";

type Db = SupabaseClient<any, "public", any>;
type Row = any;

const RES: C.ResourceKey[] = ["metal", "crystal", "gas", "energy"];

function levelsOf(buildings: Row[]): Record<string, number> {
  const levels: Record<string, number> = {};
  for (const def of C.BUILDINGS) levels[def.key] = 0;
  for (const b of buildings) levels[b.type] = b.level;
  return levels;
}

export function productionOf(levels: Record<string, number>) {
  let energyOut = 0;
  let energyUse = 0;
  const base: Record<C.ResourceKey, number> = { metal: 0, crystal: 0, gas: 0, energy: 0 };
  for (const def of C.BUILDINGS) {
    const lvl = levels[def.key] ?? 0;
    if (lvl <= 0) continue;
    if (def.energyUse) energyUse += def.energyUse * lvl;
    if (def.produces) {
      if (def.produces.resource === "energy") energyOut += def.produces.perHour * lvl;
      else base[def.produces.resource] += def.produces.perHour * lvl;
    }
  }
  const netEnergy = energyOut - energyUse;
  const efficiency = netEnergy < 0 ? 0.5 : 1;
  return {
    metal: Math.round(base.metal * efficiency),
    crystal: Math.round(base.crystal * efficiency),
    gas: Math.round(base.gas * efficiency),
    energy: netEnergy,
    energyOut,
    energyUse,
    efficiency,
  };
}

function addResources(planet: Row, levels: Record<string, number>, hours: number) {
  if (hours <= 0) return;
  const prod = productionOf(levels);
  const cap = C.storageCapacity(levels["command_center"] ?? 0);
  for (const key of RES) {
    const gain = (prod[key] ?? 0) * hours;
    planet[key] = Math.max(0, Math.min(cap, Number(planet[key]) + gain));
  }
}

/** Aplica todo o tempo decorrido (produção, obras, naves, viagens). */
async function advance(db: Db, userId: string) {
  const { data: profile } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!profile) return null;
  const { data: planet } = await db
    .from("planets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!planet) return null;

  const buildings = (await db.from("buildings").select("*").eq("planet_id", planet.id)).data ?? [];
  const now = Date.now();
  const levels = levelsOf(buildings);

  // 1) Produção em segmentos, respeitando obras concluídas no meio do período.
  const finished = buildings
    .filter((b: Row) => b.upgrade_finishes_at && Date.parse(b.upgrade_finishes_at) <= now)
    .sort((a: Row, b: Row) => Date.parse(a.upgrade_finishes_at) - Date.parse(b.upgrade_finishes_at));

  let cursor = Date.parse(planet.last_tick);
  for (const ev of finished) {
    const t = Date.parse(ev.upgrade_finishes_at);
    addResources(planet, levels, Math.max(0, (t - cursor) / 3600000));
    levels[ev.type] = (levels[ev.type] ?? 0) + 1;
    cursor = t;
  }
  addResources(planet, levels, Math.max(0, (now - cursor) / 3600000));
  planet.last_tick = new Date(now).toISOString();

  for (const ev of finished) {
    await db
      .from("buildings")
      .update({ level: ev.level + 1, upgrade_finishes_at: null })
      .eq("id", ev.id);
  }

  // 2) Naves concluídas no estaleiro.
  const queue = (await db.from("ship_queue").select("*").eq("user_id", userId)).data ?? [];
  for (const q of queue) {
    if (Date.parse(q.finishes_at) > now) continue;
    const { data: slot } = await db
      .from("hangar")
      .select("*")
      .eq("planet_id", planet.id)
      .eq("ship_type", q.ship_type)
      .maybeSingle();
    if (slot) {
      await db
        .from("hangar")
        .update({ quantity: slot.quantity + q.quantity })
        .eq("id", slot.id);
    } else {
      await db.from("hangar").insert({
        user_id: userId,
        planet_id: planet.id,
        ship_type: q.ship_type,
        quantity: q.quantity,
      });
    }
    await db.from("ship_queue").delete().eq("id", q.id);
  }

  // 3) Frotas em viagem.
  const fleets = (await db.from("fleets").select("*").eq("user_id", userId)).data ?? [];
  let xpGainTotal = 0;
  for (const fleet of fleets) {
    if (!fleet.arrives_at || Date.parse(fleet.arrives_at) > now) continue;
    if (fleet.status === "returning") {
      await db.from("fleets").update({ status: "idle", arrives_at: null, target_body_id: null }).eq("id", fleet.id);
      continue;
    }
    if (fleet.status !== "traveling" || !fleet.target_body_id) continue;

    const { data: body } = await db.from("map_bodies").select("*").eq("id", fleet.target_body_id).maybeSingle();
    const ships = (await db.from("fleet_ships").select("*").eq("fleet_id", fleet.id)).data ?? [];
    const counts: ShipCounts = {};
    for (const s of ships) counts[s.ship_type] = s.quantity;
    const commander = fleet.commander_id
      ? (await db.from("commanders").select("*").eq("id", fleet.commander_id).maybeSingle()).data
      : null;

    if (body) {
      const enemy: ShipCounts = (body.defense ?? {}) as ShipCounts;
      const hostile = body.owner_type === "enemy" && !body.cleared && totalShips(enemy) > 0;
      const cap = C.storageCapacity(levels["command_center"] ?? 0);
      const capacity = Object.entries(counts).reduce(
        (sum, [k, q]) => sum + (C.SHIP_MAP[k]?.capacity ?? 0) * q,
        0,
      );

      if (hostile) {
        const result = simulateBattle(counts, enemy, {
          attack: commander ? commander.attack / 200 : 0,
          defense: commander ? commander.defense / 200 : 0,
        });
        for (const s of ships) {
          const left = result.survivors[s.ship_type] ?? 0;
          if (left <= 0) await db.from("fleet_ships").delete().eq("id", s.id);
          else if (left !== s.quantity) await db.from("fleet_ships").update({ quantity: left }).eq("id", s.id);
        }
        const loot = result.victory
          ? {
              metal: Math.min(body.loot?.metal ?? 0, capacity),
              crystal: Math.min(body.loot?.crystal ?? 0, capacity),
              gas: Math.min(body.loot?.gas ?? 0, capacity),
            }
          : { metal: 0, crystal: 0, gas: 0 };
        if (result.victory) {
          planet.metal = Math.min(cap, Number(planet.metal) + loot.metal);
          planet.crystal = Math.min(cap, Number(planet.crystal) + loot.crystal);
          planet.gas = Math.min(cap, Number(planet.gas) + loot.gas);
          await db.from("map_bodies").update({ cleared: true }).eq("id", body.id);
        }
        const xp = result.victory ? 250 : 60;
        xpGainTotal += xp;
        if (commander) {
          const cxp = commander.xp + xp;
          await db
            .from("commanders")
            .update({ xp: cxp, level: C.levelFromXp(cxp) })
            .eq("id", commander.id);
        }
        await db.from("battles").insert({
          user_id: userId,
          target_name: body.name,
          victory: result.victory,
          ships_sent: counts,
          ships_lost: result.attackerLosses,
          enemy_ships: enemy,
          xp_gained: xp,
          loot,
        });
      } else {
        // Exploração / coleta em planeta neutro (ou já conquistado).
        const bonus = 1 + (commander ? commander.exploration / 100 : 0);
        const factor = body.cleared ? 0.25 : 1;
        const loot = {
          metal: Math.round(Math.min((body.loot?.metal ?? 0) * bonus * factor, capacity)),
          crystal: Math.round(Math.min((body.loot?.crystal ?? 0) * bonus * factor, capacity)),
          gas: Math.round(Math.min((body.loot?.gas ?? 0) * bonus * factor, capacity)),
        };
        planet.metal = Math.min(cap, Number(planet.metal) + loot.metal);
        planet.crystal = Math.min(cap, Number(planet.crystal) + loot.crystal);
        planet.gas = Math.min(cap, Number(planet.gas) + loot.gas);
        const xp = 80;
        xpGainTotal += xp;
        if (commander) {
          const cxp = commander.xp + xp;
          await db
            .from("commanders")
            .update({ xp: cxp, level: C.levelFromXp(cxp) })
            .eq("id", commander.id);
        }
        await db.from("battles").insert({
          user_id: userId,
          target_name: body.name,
          victory: true,
          ships_sent: counts,
          ships_lost: {},
          enemy_ships: {},
          xp_gained: xp,
          loot,
        });
        if (!body.cleared && body.owner_type === "neutral") {
          await db.from("map_bodies").update({ cleared: true }).eq("id", body.id);
        }
      }

      const back = C.travelSeconds(
        body.distance,
        counts,
        commander ? commander.exploration / 130 : 0,
      );
      await db
        .from("fleets")
        .update({ status: "returning", arrives_at: new Date(now + back * 1000).toISOString() })
        .eq("id", fleet.id);
    } else {
      await db.from("fleets").update({ status: "idle", arrives_at: null, target_body_id: null }).eq("id", fleet.id);
    }
  }

  await db
    .from("planets")
    .update({
      metal: planet.metal,
      crystal: planet.crystal,
      gas: planet.gas,
      energy: planet.energy,
      last_tick: planet.last_tick,
    })
    .eq("id", planet.id);

  if (xpGainTotal > 0) {
    const xp = profile.xp + xpGainTotal;
    await db.from("profiles").update({ xp, level: C.levelFromXp(xp) }).eq("id", userId);
  }

  return { planetId: planet.id };
}

async function syncMissions(db: Db, userId: string, planetId: string) {
  const [buildings, hangar, fleetShips, battles, missionRows] = await Promise.all([
    db.from("buildings").select("type, level").eq("planet_id", planetId),
    db.from("hangar").select("ship_type, quantity").eq("planet_id", planetId),
    db.from("fleet_ships").select("ship_type, quantity").eq("user_id", userId),
    db.from("battles").select("victory, enemy_ships").eq("user_id", userId),
    db.from("player_missions").select("*").eq("user_id", userId),
  ]);

  const levels = levelsOf(buildings.data ?? []);
  let fighters = 0;
  for (const h of hangar.data ?? []) if (h.ship_type === "fighter") fighters += h.quantity;
  for (const f of fleetShips.data ?? []) if (f.ship_type === "fighter") fighters += f.quantity;
  const explored = (battles.data ?? []).filter((b: Row) => totalShips(b.enemy_ships ?? {}) === 0).length;
  const wins = (battles.data ?? []).filter(
    (b: Row) => b.victory && totalShips(b.enemy_ships ?? {}) > 0,
  ).length;

  const progress: Record<string, number> = {
    first_steps: Math.min(1, levels["command_center"] ?? 0),
    expansion: Math.min(1, levels["metal_mine"] ?? 0),
    first_fleet: fighters,
    exploration: explored,
    first_combat: wins,
  };

  const existing = new Map((missionRows.data ?? []).map((m: Row) => [m.mission_key, m]));
  for (const def of C.MISSIONS) {
    const value = Math.min(progress[def.key] ?? 0, def.goal);
    const completed = value >= def.goal;
    const row = existing.get(def.key);
    if (!row) {
      await db
        .from("player_missions")
        .insert({ user_id: userId, mission_key: def.key, progress: value, completed });
    } else if (row.progress !== value || row.completed !== completed) {
      await db.from("player_missions").update({ progress: value, completed }).eq("id", row.id);
    }
  }
}

export type GameStateReady = {
  initialized: true;
  serverTime: string;
  profile: Row;
  planet: Row;
  buildings: Row[];
  hangar: Row[];
  commanders: Row[];
  fleets: Row[];
  fleetShips: Row[];
  bodies: Row[];
  missions: Row[];
  battles: Row[];
  shipQueue: Row[];
  production: ReturnType<typeof productionOf>;
  capacity: number;
};

async function readState(
  db: Db,
  userId: string,
): Promise<{ initialized: false } | GameStateReady> {
  const { data: profile } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!profile) return { initialized: false as const };

  const { data: planet } = await db
    .from("planets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!planet) return { initialized: false as const };

  const [buildings, hangar, commanders, fleets, fleetShips, bodies, missions, battles, queue] =
    await Promise.all([
      db.from("buildings").select("*").eq("planet_id", planet.id),
      db.from("hangar").select("*").eq("planet_id", planet.id),
      db.from("commanders").select("*").eq("user_id", userId).order("key"),
      db.from("fleets").select("*").eq("user_id", userId).order("created_at"),
      db.from("fleet_ships").select("*").eq("user_id", userId),
      db.from("map_bodies").select("*").eq("user_id", userId).order("distance"),
      db.from("player_missions").select("*").eq("user_id", userId),
      db.from("battles").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      db.from("ship_queue").select("*").eq("user_id", userId).order("finishes_at"),
    ]);

  const levels = levelsOf(buildings.data ?? []);
  return {
    initialized: true as const,
    serverTime: new Date().toISOString(),
    profile,
    planet,
    buildings: buildings.data ?? [],
    hangar: hangar.data ?? [],
    commanders: commanders.data ?? [],
    fleets: fleets.data ?? [],
    fleetShips: fleetShips.data ?? [],
    bodies: bodies.data ?? [],
    missions: missions.data ?? [],
    battles: battles.data ?? [],
    shipQueue: queue.data ?? [],
    production: productionOf(levels),
    capacity: C.storageCapacity(levels["command_center"] ?? 0),
  };
}

export type GameState = Awaited<ReturnType<typeof readState>>;

export const getGameState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase as unknown as Db;
    const advanced = await advance(db, context.userId);
    if (advanced) await syncMissions(db, context.userId, advanced.planetId);
    return readState(db, context.userId);
  });

export const createCommanderProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { commanderName: string; planetName: string }) =>
    z
      .object({
        commanderName: z.string().trim().min(3).max(20),
        planetName: z.string().trim().min(3).max(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    const { data: existing } = await db.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (existing) return readState(db, userId);

    await db.from("profiles").insert({ id: userId, commander_name: data.commanderName });
    await db.from("user_roles").insert({ user_id: userId, role: "player" });
    const { data: planet } = await db
      .from("planets")
      .insert({ user_id: userId, name: data.planetName })
      .select()
      .single();

    await db.from("buildings").insert(
      C.BUILDINGS.map((b) => ({
        user_id: userId,
        planet_id: planet!.id,
        type: b.key,
        level: b.key === "command_center" ? 1 : 0,
      })),
    );
    await db.from("commanders").insert(
      C.COMMANDERS.map((c) => ({
        user_id: userId,
        key: c.key,
        name: c.name,
        attack: c.attack,
        defense: c.defense,
        command: c.command,
        engineering: c.engineering,
        exploration: c.exploration,
        skill_name: c.skillName,
        skill_description: c.skillDescription,
      })),
    );
    await db.from("map_bodies").insert(
      C.STARTING_SYSTEM.map((b) => ({
        user_id: userId,
        key: b.key,
        name: b.key === "home" ? data.planetName : b.name,
        kind: b.kind,
        owner_type: b.owner_type,
        distance: b.distance,
        pos_x: b.pos_x,
        pos_y: b.pos_y,
        pos_z: b.pos_z,
        color: b.color,
        defense: b.defense,
        loot: b.loot,
      })),
    );
    await syncMissions(db, userId, planet!.id);
    return readState(db, userId);
  });

export const upgradeBuilding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { buildingKey: string }) =>
    z.object({ buildingKey: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    await advance(db, userId);
    const def = C.BUILDING_MAP[data.buildingKey];
    if (!def) throw new Error("Estrutura desconhecida");

    const { data: planet } = await db.from("planets").select("*").eq("user_id", userId).limit(1).maybeSingle();
    if (!planet) throw new Error("Planeta não encontrado");
    const { data: building } = await db
      .from("buildings")
      .select("*")
      .eq("planet_id", planet.id)
      .eq("type", def.key)
      .maybeSingle();
    if (!building) throw new Error("Estrutura não encontrada");
    if (building.upgrade_finishes_at) throw new Error("Esta estrutura já está em obras");
    if (building.level >= def.maxLevel) throw new Error("Nível máximo alcançado");

    const next = building.level + 1;
    const cost = C.buildingCost(def, next);
    if (
      Number(planet.metal) < cost.metal ||
      Number(planet.crystal) < cost.crystal ||
      Number(planet.gas) < cost.gas
    ) {
      throw new Error("Recursos insuficientes");
    }
    const seconds = C.buildingSeconds(def, next);
    await db
      .from("planets")
      .update({
        metal: Number(planet.metal) - cost.metal,
        crystal: Number(planet.crystal) - cost.crystal,
        gas: Number(planet.gas) - cost.gas,
      })
      .eq("id", planet.id);
    await db
      .from("buildings")
      .update({ upgrade_finishes_at: new Date(Date.now() + seconds * 1000).toISOString() })
      .eq("id", building.id);
    await syncMissions(db, userId, planet.id);
    return readState(db, userId);
  });

export const buildShips = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { shipType: string; quantity: number }) =>
    z.object({ shipType: z.string(), quantity: z.number().int().min(1).max(100) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    await advance(db, userId);
    const def = C.SHIP_MAP[data.shipType];
    if (!def) throw new Error("Nave desconhecida");

    const { data: planet } = await db.from("planets").select("*").eq("user_id", userId).limit(1).maybeSingle();
    if (!planet) throw new Error("Planeta não encontrado");
    const { data: shipyard } = await db
      .from("buildings")
      .select("*")
      .eq("planet_id", planet.id)
      .eq("type", "shipyard")
      .maybeSingle();
    if (!shipyard || shipyard.level < 1) throw new Error("Construa o Estaleiro primeiro");

    const cost = {
      metal: def.cost.metal * data.quantity,
      crystal: def.cost.crystal * data.quantity,
      gas: def.cost.gas * data.quantity,
    };
    if (
      Number(planet.metal) < cost.metal ||
      Number(planet.crystal) < cost.crystal ||
      Number(planet.gas) < cost.gas
    ) {
      throw new Error("Recursos insuficientes");
    }

    const { data: queue } = await db
      .from("ship_queue")
      .select("finishes_at")
      .eq("user_id", userId)
      .order("finishes_at", { ascending: false })
      .limit(1);
    const lastEnd = queue?.[0] ? Date.parse(queue[0].finishes_at) : Date.now();
    const start = Math.max(Date.now(), lastEnd);
    const seconds = C.shipSeconds(def.key, shipyard.level) * data.quantity;

    await db
      .from("planets")
      .update({
        metal: Number(planet.metal) - cost.metal,
        crystal: Number(planet.crystal) - cost.crystal,
        gas: Number(planet.gas) - cost.gas,
      })
      .eq("id", planet.id);
    await db.from("ship_queue").insert({
      user_id: userId,
      planet_id: planet.id,
      ship_type: def.key,
      quantity: data.quantity,
      finishes_at: new Date(start + seconds * 1000).toISOString(),
    });
    return readState(db, userId);
  });

export const createFleet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; commanderId: string; ships: Record<string, number> }) =>
    z
      .object({
        name: z.string().trim().min(2).max(24),
        commanderId: z.string().uuid(),
        ships: z.record(z.string(), z.number().int().min(0)),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    await advance(db, userId);
    const { data: planet } = await db.from("planets").select("*").eq("user_id", userId).limit(1).maybeSingle();
    if (!planet) throw new Error("Planeta não encontrado");

    const requested = Object.entries(data.ships).filter(([, q]) => q > 0);
    if (!requested.length) throw new Error("Selecione ao menos uma nave");

    const { data: hangar } = await db.from("hangar").select("*").eq("planet_id", planet.id);
    for (const [type, qty] of requested) {
      const slot = (hangar ?? []).find((h: Row) => h.ship_type === type);
      if (!slot || slot.quantity < qty) throw new Error("Naves insuficientes no hangar");
    }

    const { data: fleet } = await db
      .from("fleets")
      .insert({ user_id: userId, name: data.name, commander_id: data.commanderId })
      .select()
      .single();

    for (const [type, qty] of requested) {
      const slot = (hangar ?? []).find((h: Row) => h.ship_type === type)!;
      await db.from("hangar").update({ quantity: slot.quantity - qty }).eq("id", slot.id);
      await db
        .from("fleet_ships")
        .insert({ user_id: userId, fleet_id: fleet!.id, ship_type: type, quantity: qty });
    }
    await syncMissions(db, userId, planet.id);
    return readState(db, userId);
  });

export const disbandFleet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fleetId: string }) => z.object({ fleetId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    await advance(db, userId);
    const { data: fleet } = await db.from("fleets").select("*").eq("id", data.fleetId).maybeSingle();
    if (!fleet) throw new Error("Frota não encontrada");
    if (fleet.status !== "idle") throw new Error("A frota precisa estar na base");
    const { data: planet } = await db.from("planets").select("*").eq("user_id", userId).limit(1).maybeSingle();
    const ships = (await db.from("fleet_ships").select("*").eq("fleet_id", fleet.id)).data ?? [];
    for (const s of ships) {
      const { data: slot } = await db
        .from("hangar")
        .select("*")
        .eq("planet_id", planet!.id)
        .eq("ship_type", s.ship_type)
        .maybeSingle();
      if (slot) await db.from("hangar").update({ quantity: slot.quantity + s.quantity }).eq("id", slot.id);
      else
        await db
          .from("hangar")
          .insert({ user_id: userId, planet_id: planet!.id, ship_type: s.ship_type, quantity: s.quantity });
    }
    await db.from("fleets").delete().eq("id", fleet.id);
    return readState(db, userId);
  });

export const sendFleet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fleetId: string; bodyId: string }) =>
    z.object({ fleetId: z.string().uuid(), bodyId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    await advance(db, userId);
    const { data: fleet } = await db.from("fleets").select("*").eq("id", data.fleetId).maybeSingle();
    if (!fleet) throw new Error("Frota não encontrada");
    if (fleet.status !== "idle") throw new Error("Esta frota já está em missão");
    const { data: body } = await db.from("map_bodies").select("*").eq("id", data.bodyId).maybeSingle();
    if (!body) throw new Error("Destino inválido");
    if (body.owner_type === "player") throw new Error("A frota já está neste planeta");

    const ships = (await db.from("fleet_ships").select("*").eq("fleet_id", fleet.id)).data ?? [];
    const counts: ShipCounts = {};
    for (const s of ships) counts[s.ship_type] = s.quantity;
    if (totalShips(counts) === 0) throw new Error("Frota sem naves");

    const commander = fleet.commander_id
      ? (await db.from("commanders").select("*").eq("id", fleet.commander_id).maybeSingle()).data
      : null;
    const seconds = C.travelSeconds(
      body.distance,
      counts,
      commander ? commander.exploration / 130 : 0,
    );
    await db
      .from("fleets")
      .update({
        status: "traveling",
        target_body_id: body.id,
        arrives_at: new Date(Date.now() + seconds * 1000).toISOString(),
      })
      .eq("id", fleet.id);
    return readState(db, userId);
  });

export const recallFleet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fleetId: string }) => z.object({ fleetId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    await advance(db, userId);
    const { data: fleet } = await db.from("fleets").select("*").eq("id", data.fleetId).maybeSingle();
    if (!fleet) throw new Error("Frota não encontrada");
    if (fleet.status === "idle") throw new Error("A frota já está na base");
    const elapsedTarget =
      fleet.status === "traveling"
        ? Date.now() + Math.max(5000, Date.parse(fleet.arrives_at) - Date.now())
        : Date.parse(fleet.arrives_at);
    await db
      .from("fleets")
      .update({
        status: "returning",
        target_body_id: null,
        arrives_at: new Date(elapsedTarget).toISOString(),
      })
      .eq("id", fleet.id);
    return readState(db, userId);
  });

export const claimMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { missionKey: string }) => z.object({ missionKey: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    const advanced = await advance(db, userId);
    if (advanced) await syncMissions(db, userId, advanced.planetId);

    const def = C.MISSIONS.find((m) => m.key === data.missionKey);
    if (!def) throw new Error("Missão desconhecida");
    const { data: row } = await db
      .from("player_missions")
      .select("*")
      .eq("user_id", userId)
      .eq("mission_key", def.key)
      .maybeSingle();
    if (!row || !row.completed) throw new Error("Missão ainda não concluída");
    if (row.claimed) throw new Error("Recompensa já recebida");

    const { data: planet } = await db.from("planets").select("*").eq("user_id", userId).limit(1).maybeSingle();
    const { data: buildings } = await db.from("buildings").select("type, level").eq("planet_id", planet!.id);
    const cap = C.storageCapacity(levelsOf(buildings ?? [])["command_center"] ?? 0);
    await db
      .from("planets")
      .update({
        metal: Math.min(cap, Number(planet!.metal) + def.reward.metal),
        crystal: Math.min(cap, Number(planet!.crystal) + def.reward.crystal),
        gas: Math.min(cap, Number(planet!.gas) + def.reward.gas),
      })
      .eq("id", planet!.id);
    await db.from("player_missions").update({ claimed: true }).eq("id", row.id);
    const { data: profile } = await db.from("profiles").select("xp").eq("id", userId).maybeSingle();
    const xp = (profile?.xp ?? 0) + def.reward.xp;
    await db.from("profiles").update({ xp, level: C.levelFromXp(xp) }).eq("id", userId);
    return readState(db, userId);
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { graphicsQuality?: string; planetName?: string }) =>
    z
      .object({
        graphicsQuality: z.enum(["low", "medium", "high"]).optional(),
        planetName: z.string().trim().min(3).max(20).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as Db;
    const userId = context.userId;
    if (data.graphicsQuality) {
      await db.from("profiles").update({ graphics_quality: data.graphicsQuality }).eq("id", userId);
    }
    if (data.planetName) {
      const { data: planet } = await db
        .from("planets")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (planet) {
        await db.from("planets").update({ name: data.planetName }).eq("id", planet.id);
        await db
          .from("map_bodies")
          .update({ name: data.planetName })
          .eq("user_id", userId)
          .eq("key", "home");
      }
    }
    return readState(db, userId);
  });
