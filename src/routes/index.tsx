import { createFileRoute, Link } from "@tanstack/react-router";

import { Planet3D } from "@/components/game/Scene3D";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Galaxy Online IV — Estratégia Espacial 3D no Navegador" },
      {
        name: "description",
        content:
          "Funde sua colônia, extraia recursos, construa frotas e conquiste o sistema estelar em Galaxy Online IV, um jogo de estratégia espacial 3D jogável direto no navegador.",
      },
      { property: "og:title", content: "Galaxy Online IV — Estratégia Espacial 3D" },
      {
        property: "og:description",
        content: "Construa sua colônia, forme frotas e domine o sistema estelar direto no navegador.",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  { title: "Colônia viva", text: "Minas, usinas e estaleiros produzem em tempo real, mesmo offline." },
  { title: "Frotas e comandantes", text: "Monte esquadrões, escolha comandantes e explore o sistema." },
  { title: "Combate resolvido no servidor", text: "Batalhas rodada a rodada, com relatório e espólio reais." },
];

function Landing() {
  return (
    <main className="relative min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="holo-title text-lg">GALAXY ONLINE IV</span>
        <nav className="flex items-center gap-4 text-xs uppercase tracking-widest">
          <Link to="/novidades" className="text-muted-foreground hover:text-foreground">
            Novidades
          </Link>
          <Link to="/auth">
            <Button size="sm" className="font-display tracking-widest">
              Jogar
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-2">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-primary">
            Estratégia espacial · Navegador · 3D
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
            Comande uma colônia entre as estrelas.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Uma nova interpretação dos clássicos jogos de estratégia espacial de navegador: produção
            contínua de recursos, construção de estruturas, estaleiro, frotas com comandantes, mapa
            galáctico navegável e batalhas com relatório detalhado.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="font-display tracking-widest">
                Fundar minha colônia
              </Button>
            </Link>
            <Link to="/novidades">
              <Button size="lg" variant="outline">
                Ver atualizações
              </Button>
            </Link>
          </div>
        </div>

        <div className="panel h-[340px] overflow-hidden sm:h-[420px]">
          <Planet3D name="Nova Terra" color="#5fb8ff" structures={14} quality="high" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <article key={p.title} className="panel p-5">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
