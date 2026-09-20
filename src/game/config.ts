// Galaxy Online IV — catálogo de conteúdo do jogo.
// Módulo puro (sem dependências): usado pelo servidor e pela interface.
// Para expandir o jogo, adicione novas entradas aqui — o núcleo não muda.

export type ResourceKey = "metal" | "crystal" | "gas" | "energy";

export const RESOURCES: { key: ResourceKey; label: string; color: string }[] = [
  { key: "metal", label: "Metal", color: "#9fb6c9" },
  { key: "crystal", label: "Cristal", color: "#7ad7ff" },
  { key: "gas", label: "Gás", color: "#8affc1" },
  { key: "energy", label: "Energia", color: "#ffd166" },
];

export type Cost = { metal: number; crystal: number; gas: number };

export type BuildingDef = {
  key: string;
  name: string;
  description: string;
  baseCost: Cost;
  costFactor: number;
  baseSeconds: number;
  timeFactor: number;
  /** produção por hora por nível */
  produces?: { resource: ResourceKey; perHour: number };
  /** consumo de energia por hora por nível */
  energyUse?: number;
  maxLevel: number;
};

export const BUILDINGS: BuildingDef[] = [
  {
    key: "command_center",
    name: "Centro de Comando",
    description: "Sede da colônia. Aumenta a capacidade de armazenamento e libera novas estruturas.",
    baseCost: { metal: 1000, crystal: 500, gas: 100 },
    costFactor: 1.6,
    baseSeconds: 30,
    timeFactor: 1.5,
    maxLevel: 30,
  },
  {
    key: "metal_mine",
    name: "Mina de Metal",
    description: "Extrai metal do subsolo do planeta.",
    baseCost: { metal: 400, crystal: 120, gas: 0 },
    costFactor: 1.5,
    baseSeconds: 25,
    timeFactor: 1.45,
    produces: { resource: "metal", perHour: 250 },
    energyUse: 20,
    maxLevel: 30,
  },
  {
    key: "crystal_mine",
    name: "Mina de Cristal",
    description: "Refina cristais usados em eletrônica e armamento.",
    baseCost: { metal: 600, crystal: 240, gas: 0 },
    costFactor: 1.5,
    baseSeconds: 35,
    timeFactor: 1.45,
    produces: { resource: "crystal", perHour: 140 },
    energyUse: 25,
    maxLevel: 30,
  },
  {
    key: "gas_extractor",
    name: "Extrator de Gás",
    description: "Coleta gás da atmosfera para propulsão de naves.",
    baseCost: { metal: 800, crystal: 400, gas: 0 },
    costFactor: 1.55,
    baseSeconds: 45,
    timeFactor: 1.45,
    produces: { resource: "gas", perHour: 70 },
    energyUse: 30,
    maxLevel: 30,
  },
  {
    key: "power_plant",
    name: "Usina de Energia",
    description: "Alimenta minas e instalações. Sem energia a produção cai pela metade.",
    baseCost: { metal: 500, crystal: 300, gas: 0 },
    costFactor: 1.5,
    baseSeconds: 30,
    timeFactor: 1.4,
    produces: { resource: "energy", perHour: 220 },
    maxLevel: 30,
  },
  {
    key: "shipyard",
    name: "Estaleiro",
    description: "Constrói naves de guerra. Níveis maiores reduzem o tempo de construção.",
    baseCost: { metal: 1500, crystal: 800, gas: 200 },
    costFactor: 1.6,
    baseSeconds: 60,
    timeFactor: 1.5,
    energyUse: 15,
    maxLevel: 30,
  },
];

export const BUILDING_MAP: Record<string, BuildingDef> = Object.fromEntries(
  BUILDINGS.map((b) => [b.key, b]),
);

export type ShipDef = {
  key: string;
  name: string;
  description: string;
  cost: Cost;
  seconds: number;
  attack: number;
  defense: number;
  hp: number;
  speed: number;
  capacity: number;
};

export const SHIPS: ShipDef[] = [
  {
    key: "fighter",
    name: "Caça",
    description: "Rápido e barato. Ideal em grandes números.",
    cost: { metal: 300, crystal: 100, gas: 0 },
    seconds: 20,
    attack: 8,
    defense: 4,
    hp: 22,
    speed: 120,
    capacity: 20,
  },
  {
    key: "frigate",
    name: "Fragata",
    description: "Equilibrada entre ataque, defesa e carga.",
    cost: { metal: 900, crystal: 400, gas: 100 },
    seconds: 45,
    attack: 20,
    defense: 14,
    hp: 65,
    speed: 90,
    capacity: 80,
  },
  {
    key: "cruiser",
    name: "Cruzador",
    description: "Lento, caro e devastador. Espinha dorsal da frota.",
    cost: { metal: 2500, crystal: 1200, gas: 400 },
    seconds: 90,
    attack: 55,
    defense: 40,
    hp: 190,
    speed: 60,
    capacity: 200,
  },
];

export const SHIP_MAP: Record<string, ShipDef> = Object.fromEntries(SHIPS.map((s) => [s.key, s]));

export type CommanderDef = {
  key: string;
  name: string;
  skillName: string;
  skillDescription: string;
  attack: number;
  defense: number;
  command: number;
  engineering: number;
  exploration: number;
  accent: string;
};

export const COMMANDERS: CommanderDef[] = [
  {
    key: "orion",
    name: "Comandante Orion",
    skillName: "Salva Precisa",
    skillDescription: "+12% de ataque da frota em combate.",
    attack: 24,
    defense: 12,
    command: 16,
    engineering: 8,
    exploration: 10,
    accent: "#ff7a59",
  },
  {
    key: "vega",
    name: "Comandante Vega",
    skillName: "Escudo Coeso",
    skillDescription: "+12% de defesa da frota em combate.",
    attack: 12,
    defense: 24,
    command: 14,
    engineering: 14,
    exploration: 8,
    accent: "#7ad7ff",
  },
  {
    key: "lyra",
    name: "Comandante Lyra",
    skillName: "Rota Otimizada",
    skillDescription: "Viagens 20% mais rápidas e mais recursos em exploração.",
    attack: 14,
    defense: 12,
    command: 12,
    engineering: 10,
    exploration: 26,
    accent: "#b78bff",
  },
];

export type MissionDef = {
  key: string;
  name: string;
  description: string;
  goal: number;
  reward: Cost & { xp: number };
};

export const MISSIONS: MissionDef[] = [
  {
    key: "first_steps",
    name: "Primeiros Passos",
    description: "Construa o Centro de Comando.",
    goal: 1,
    reward: { metal: 500, crystal: 250, gas: 50, xp: 50 },
  },
  {
    key: "expansion",
    name: "Expansão",
    description: "Construa uma Mina de Metal.",
    goal: 1,
    reward: { metal: 800, crystal: 300, gas: 80, xp: 75 },
  },
  {
    key: "first_fleet",
    name: "Primeira Frota",
    description: "Construa 5 Caças.",
    goal: 5,
    reward: { metal: 1200, crystal: 600, gas: 150, xp: 120 },
  },
  {
    key: "exploration",
    name: "Exploração",
    description: "Envie uma frota a um planeta neutro.",
    goal: 1,
    reward: { metal: 1500, crystal: 700, gas: 200, xp: 150 },
  },
  {
    key: "first_combat",
    name: "Primeiro Combate",
    description: "Vença sua primeira batalha.",
    goal: 1,
    reward: { metal: 2500, crystal: 1200, gas: 400, xp: 300 },
  },
];

export type MapBodySeed = {
  key: string;
  name: string;
  kind: string;
  owner_type: "player" | "neutral" | "enemy";
  distance: number;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  color: string;
  defense: Record<string, number>;
  loot: { metal: number; crystal: number; gas: number };
};

/** Sistema inicial: 1 planeta do jogador, 2 neutros, 1 inimigo. */
export const STARTING_SYSTEM: MapBodySeed[] = [
  {
    key: "home",
    name: "Nova Terra",
    kind: "planet",
    owner_type: "player",
    distance: 0,
    pos_x: 0,
    pos_y: 0,
    pos_z: 0,
    color: "#5fb8ff",
    defense: {},
    loot: { metal: 0, crystal: 0, gas: 0 },
  },
  {
    key: "kepler_minor",
    name: "Kepler Menor",
    kind: "planet",
    owner_type: "neutral",
    distance: 120,
    pos_x: 6,
    pos_y: 0.6,
    pos_z: -3,
    color: "#8affc1",
    defense: {},
    loot: { metal: 1200, crystal: 500, gas: 150 },
  },
  {
    key: "arcadia_ii",
    name: "Arcádia II",
    kind: "planet",
    owner_type: "neutral",
    distance: 210,
    pos_x: -7,
    pos_y: -1,
    pos_z: 4,
    color: "#ffd166",
    defense: {},
    loot: { metal: 2000, crystal: 900, gas: 300 },
  },
  {
    key: "kraven_prime",
    name: "Kraven Prime",
    kind: "planet",
    owner_type: "enemy",
    distance: 340,
    pos_x: 3,
    pos_y: 1.4,
    pos_z: 9,
    color: "#ff5f6d",
    defense: { fighter: 14, frigate: 4, cruiser: 1 },
    loot: { metal: 4000, crystal: 2000, gas: 700 },
  },
];

// ——— Fórmulas ———

export function buildingCost(def: BuildingDef, nextLevel: number): Cost {
  const f = Math.pow(def.costFactor, Math.max(0, nextLevel - 1));
  return {
    metal: Math.round(def.baseCost.metal * f),
    crystal: Math.round(def.baseCost.crystal * f),
    gas: Math.round(def.baseCost.gas * f),
  };
}

export function buildingSeconds(def: BuildingDef, nextLevel: number): number {
  return Math.round(def.baseSeconds * Math.pow(def.timeFactor, Math.max(0, nextLevel - 1)));
}

export function storageCapacity(commandCenterLevel: number): number {
  return 25000 + 25000 * commandCenterLevel;
}

export function shipSeconds(shipKey: string, shipyardLevel: number): number {
  const def = SHIP_MAP[shipKey];
  if (!def) return 30;
  return Math.max(3, Math.round(def.seconds / (1 + 0.15 * Math.max(0, shipyardLevel - 1))));
}

export function fleetSpeed(ships: Record<string, number>): number {
  const entries = Object.entries(ships).filter(([, q]) => q > 0);
  if (!entries.length) return 100;
  return Math.min(...entries.map(([k]) => SHIP_MAP[k]?.speed ?? 100));
}

/** Tempo de viagem em segundos (ida). */
export function travelSeconds(
  distance: number,
  ships: Record<string, number>,
  explorationBonus = 0,
): number {
  const speed = fleetSpeed(ships);
  const raw = (distance / speed) * 60;
  return Math.max(10, Math.round(raw * (1 - Math.min(0.35, explorationBonus))));
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}
