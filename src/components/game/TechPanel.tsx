/** Estrutura da árvore tecnológica planejada. Nada é clicável: ainda não implementado. */
const BRANCHES = [
  {
    name: "Engenharia",
    color: "#9fb6c9",
    nodes: [
      "Mineração avançada — +10% de metal por nível",
      "Refino de cristal — +10% de cristal por nível",
      "Compressão de gás — +10% de gás por nível",
      "Reatores de fusão — +15% de energia",
    ],
  },
  {
    name: "Militar",
    color: "#ff7a59",
    nodes: [
      "Balística — +5% de ataque da frota",
      "Blindagem reativa — +5% de casco",
      "Escudos de deflexão — +5% de defesa",
      "Doutrina de esquadrão — mais naves por frota",
    ],
  },
  {
    name: "Exploração",
    color: "#b78bff",
    nodes: [
      "Motores de impulso — viagens mais rápidas",
      "Sensores de longo alcance — revela novos corpos",
      "Colonização — ocupar luas e planetas neutros",
      "Estações orbitais — reparo e reabastecimento",
    ],
  },
];

export default function TechPanel() {
  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Tecnologia</h3>
          <span className="rounded border border-warning/60 bg-warning/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-warning">
            Em desenvolvimento
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A pesquisa entra na Fase 3. Abaixo está a estrutura já planejada — nenhuma dessas
          tecnologias está ativa no jogo neste momento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((b) => (
          <article key={b.name} className="panel p-5 opacity-80">
            <h4 className="font-display text-sm uppercase tracking-[0.15em]" style={{ color: b.color }}>
              {b.name}
            </h4>
            <ol className="mt-3 space-y-2">
              {b.nodes.map((n, i) => (
                <li key={n} className="flex gap-2 text-xs text-muted-foreground">
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full border"
                    style={{ borderColor: b.color }}
                  />
                  <span>
                    <span className="font-display text-[10px] uppercase tracking-widest">Nível {i + 1}</span>
                    <br />
                    {n}
                  </span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}
