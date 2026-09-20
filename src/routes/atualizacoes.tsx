import { createFileRoute, Link } from "@tanstack/react-router";

import { CATEGORY_LABEL, useNews } from "@/components/game/NewsPanel";

export const Route = createFileRoute("/atualizacoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atualizações — Galaxy Online IV" },
      {
        name: "description",
        content:
          "Versões, novos comandantes, planetas, eventos, correções e avisos de manutenção de Galaxy Online IV.",
      },
      { property: "og:title", content: "Atualizações — Galaxy Online IV" },
      {
        property: "og:description",
        content: "Todas as versões e mudanças aplicadas ao jogo, por categoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UpdatesPage,
});

const ORDER = ["update", "commander", "planet", "event", "fix", "maintenance"];

function UpdatesPage() {
  const { data, isLoading, error } = useNews();
  const items = data ?? [];
  const latest = items[0];

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        ← Galaxy Online IV
      </Link>
      <h1 className="holo-title mt-4 text-3xl">Atualizações</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Histórico de versões do jogo: novidades, comandantes, planetas, eventos, correções e
        manutenção.
      </p>

      {latest && (
        <div className="panel-glow mt-6 p-5">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-primary">
            Versão atual · v{latest.version}
          </p>
          <h2 className="mt-2 text-lg">{latest.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{latest.body}</p>
        </div>
      )}

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>}
      {error && (
        <p className="mt-6 text-sm text-destructive">Não foi possível carregar as atualizações agora.</p>
      )}
      {!isLoading && !error && items.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Nenhuma atualização publicada ainda.</p>
      )}

      <div className="mt-8 space-y-8">
        {ORDER.map((cat) => {
          const group = items.filter((n) => n.category === cat);
          if (!group.length) return null;
          return (
            <section key={cat}>
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">
                {CATEGORY_LABEL[cat] ?? cat}
              </h2>
              <div className="mt-3 space-y-3">
                {group.map((n) => (
                  <article key={n.id} className="panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-sm uppercase tracking-[0.15em]">{n.title}</h3>
                      <span className="rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        v{n.version} · {new Date(n.published_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{n.body}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
        {items.some((n) => !ORDER.includes(n.category)) && (
          <section>
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">Outros</h2>
            <div className="mt-3 space-y-3">
              {items
                .filter((n) => !ORDER.includes(n.category))
                .map((n) => (
                  <article key={n.id} className="panel p-5">
                    <h3 className="font-display text-sm uppercase tracking-[0.15em]">{n.title}</h3>
                    <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{n.body}</p>
                  </article>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
