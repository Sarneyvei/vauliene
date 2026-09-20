import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  buildShips,
  claimMission,
  createCommanderProfile,
  createFleet,
  disbandFleet,
  getGameState,
  recallFleet,
  sendFleet,
  upgradeBuilding,
  updateSettings,
  type GameState,
} from "@/lib/game.functions";

export const GAME_KEY = ["game-state"] as const;

export function useGameState() {
  const fetchState = useServerFn(getGameState);
  return useQuery<GameState>({
    queryKey: GAME_KEY,
    queryFn: () => fetchState({} as never) as Promise<GameState>,
    refetchInterval: 20000,
    staleTime: 5000,
  });
}

/** Mutação de jogo: o servidor devolve o estado completo, que substitui o cache. */
function useGameAction<TArgs>(fn: unknown, successMessage?: string) {
  const call = useServerFn(fn as never) as unknown as (opts: { data: TArgs }) => Promise<GameState>;
  const qc = useQueryClient();
  return useMutation<GameState, Error, TArgs>({
    mutationFn: (data: TArgs) => call({ data }),
    onSuccess: (state) => {
      qc.setQueryData(GAME_KEY, state);
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => toast.error(error.message || "Ação recusada pelo servidor"),
  });
}

export const useCreateProfile = () =>
  useGameAction<{ commanderName: string; planetName: string }>(
    createCommanderProfile,
    "Colônia fundada!",
  );
export const useUpgradeBuilding = () =>
  useGameAction<{ buildingKey: string }>(upgradeBuilding, "Obra iniciada");
export const useBuildShips = () =>
  useGameAction<{ shipType: string; quantity: number }>(buildShips, "Naves na fila do estaleiro");
export const useCreateFleet = () =>
  useGameAction<{ name: string; commanderId: string; ships: Record<string, number> }>(
    createFleet,
    "Frota formada",
  );
export const useDisbandFleet = () =>
  useGameAction<{ fleetId: string }>(disbandFleet, "Frota desfeita");
export const useSendFleet = () => useGameAction<{ fleetId: string; bodyId: string }>(sendFleet, "Frota em rota");
export const useRecallFleet = () => useGameAction<{ fleetId: string }>(recallFleet, "Frota retornando");
export const useClaimMission = () =>
  useGameAction<{ missionKey: string }>(claimMission, "Recompensa recebida");
export const useUpdateSettings = () =>
  useGameAction<{ graphicsQuality?: string; planetName?: string }>(updateSettings, "Preferências salvas");

/** Relógio local para contagens regressivas suaves. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatNumber(value: number) {
  return Math.floor(value).toLocaleString("pt-BR");
}
