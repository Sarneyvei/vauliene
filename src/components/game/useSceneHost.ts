import { useCallback, useState } from "react";

/**
 * Garante que a cena 3D só seja criada depois que o elemento hospedeiro existir
 * no DOM. Sem isso o react-three-fiber tenta conectar os eventos de ponteiro a
 * um elemento nulo durante trocas rápidas de aba e lança uma exceção.
 */
export function useSceneHost() {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const ref = useCallback((node: HTMLDivElement | null) => setHost(node), []);
  return { ref, host };
}
