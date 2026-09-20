import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import * as C from "@/game/config";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o jogo — Galaxy Online IV" },
      {
        name: "description",
        content:
          "Entenda como funciona Galaxy Online IV: recursos em tempo real, construções, estaleiro, frotas com comandantes, mapa estelar e batalhas resolvidas no servidor.",
      },
      { property: "og:title", content: "Sobre o jogo — Galaxy Online IV" },
      {
        property: "og:description",
        content: "O ciclo de jogo, os recursos, as naves e os requisitos de Galaxy Online IV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const CYCLE = [
  "Entrar no comando",
  "Explorar o planeta",
  "Construir estruturas",
  "Produzir recursos",
  "Fabricar naves",
  "Formar frota",
  "Enviar frota",
  "Batalhar",
  "Receber recompensa",
  "Evoluir",
];

function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        ← Galaxy Online IV
      </Link>
      <h1 className="holo-title mt-4 text-3xl">Sobre o jogo</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Galaxy Online IV é um jogo de estratégia espacial em 3D que roda direto no navegador, sem
        instalação. Você comanda uma colônia planetária, desenvolve sua economia, monta uma frota e
        disputa o sistema estelar. É uma obra independente, inspirada apenas no gênero dos clássicos
        jogos de estratégia espacial de navegador.
      </p>

      <section className="panel mt-8 p-5">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Ciclo de jogo</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CYCLE.map((step, i) => (
            <span
              key={step}
              className="rounded border border-border/70 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              {i + 1}. {step}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="panel p-5">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Recursos</h2>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {C.RESOURCES.map((r) => (
              <li key={r.key} style={{ color: r.color }}>
                {r.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Cada recurso tem quantidade atual, capacidade máxima, produção e consumo por hora. A
            produção continua correndo enquanto você está fora — ao voltar, o tempo decorrido é
            calculado no servidor.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Estruturas</h2>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {C.BUILDINGS.map((b) => (
              <li key={b.key}>{b.name}</li>
            ))}
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Naves</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {C.SHIPS.map((s) => (
              <li key={s.key}>
                <span className="text-foreground">{s.name}</span> — ataque {s.attack}, defesa {s.defense},
                casco {s.hp}, velocidade {s.speed}, carga {s.capacity}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Comandantes</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {C.COMMANDERS.map((c) => (
              <li key={c.key}>
                <span style={{ color: c.accent }}>{c.name}</span> — {c.skillName}: {c.skillDescription}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel mt-4 p-5">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">
          Onde dá para jogar
        </h2>
        <p className="mt-3 text-xs text-muted-foreground">
          Computador (Windows, macOS, Linux), Android e iPhone/iPad, em qualquer navegador moderno com
          suporte a 3D. A interface se adapta a monitor, notebook, tablet e celular, e há uma opção de
          qualidade gráfica (Baixa, Média e Alta) para aparelhos mais simples. Todo o progresso fica
          salvo no servidor, na sua conta.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/auth">
          <Button size="lg" className="font-display tracking-widest">
            Criar conta e jogar
          </Button>
        </Link>
        <Link to="/atualizacoes">
          <Button size="lg" variant="outline">
            Atualizações
          </Button>
        </Link>
      </div>
    </main>
  );
}
